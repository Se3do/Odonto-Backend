import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/database/prisma.service';
import { CaseQueryDto } from '../dto/case-query.dto';
import { UpdateCaseDto } from '../dto/update-case.dto';

interface TestItem {
  id: string;
  isCorrect: boolean;
}

interface TreatmentItem {
  id: string;
  isCorrect: boolean;
}

interface CreateCaseData {
  title: string;
  patientHistory: string;
  diagnosisExplanation: string;
  difficulty: string;
  diagnosisId: string;
  specialtyId: string;
}

@Injectable()
export class CasesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  runTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prismaService.$transaction(fn);
  }

  createCase(tx: Prisma.TransactionClient, data: CreateCaseData) {
    return tx.case.create({
      data: {
        Title: data.title,
        PatientHistory: data.patientHistory,
        DiagnosisExplanation: data.diagnosisExplanation,
        Difficulty: data.difficulty as any,
        Diagnosis: { connect: { Id: data.diagnosisId } },
        Specialty: { connect: { Id: data.specialtyId } },
      },
    });
  }

  replaceCaseTests(tx: Prisma.TransactionClient, caseId: string, items: TestItem[]) {
    return tx.caseTest.createMany({
      data: items.map((item) => ({
        CaseId: caseId,
        TestId: item.id,
        IsCorrect: item.isCorrect,
      })),
    });
  }

  replaceCaseTreatments(tx: Prisma.TransactionClient, caseId: string, items: TreatmentItem[]) {
    return tx.caseTreatment.createMany({
      data: items.map((item) => ({
        CaseId: caseId,
        TreatmentId: item.id,
        IsCorrect: item.isCorrect,
      })),
    });
  }

  deleteCaseTests(tx: Prisma.TransactionClient, caseId: string) {
    return tx.caseTest.deleteMany({ where: { CaseId: caseId } });
  }

  deleteCaseTreatments(tx: Prisma.TransactionClient, caseId: string) {
    return tx.caseTreatment.deleteMany({ where: { CaseId: caseId } });
  }

  deleteCaseImages(tx: Prisma.TransactionClient, caseId: string) {
    return tx.caseImage.deleteMany({ where: { CaseId: caseId } });
  }

  findById(id: string) {
    return this.prismaService.case.findUnique({
      where: { Id: id },
      include: {
        Specialty: { select: { Id: true, Name: true } },
        Diagnosis: { select: { Id: true, Name: true } },
        CaseTests: {
          include: { Test: { select: { Id: true, Name: true } } },
        },
        CaseTreatments: {
          include: { Treatment: { select: { Id: true, Name: true } } },
        },
      },
    });
  }

  async findMany(query: CaseQueryDto) {
    const where: Prisma.CaseWhereInput = {};

    if (query.search) {
      where.Title = { contains: query.search, mode: 'insensitive' };
    }
    if (query.difficulty) {
      where.Difficulty = query.difficulty;
    }
    if (query.specialtyId) {
      where.SpecialtyId = query.specialtyId;
    }

    const orderBy: Prisma.CaseOrderByWithRelationInput = {};
    const sortField = query.sortBy === 'title' ? 'Title' : 'CreatedAt';
    orderBy[sortField as keyof Prisma.CaseOrderByWithRelationInput] = query.sortOrder;

    const skip = (query.page! - 1) * query.limit!;
    const take = query.limit!;

    const [cases, total] = await this.prismaService.$transaction([
      this.prismaService.case.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          Specialty: { select: { Id: true, Name: true } },
          Diagnosis: { select: { Id: true, Name: true } },
          CaseTests: {
            include: { Test: { select: { Id: true, Name: true } } },
          },
          CaseTreatments: {
            include: { Treatment: { select: { Id: true, Name: true } } },
          },
        },
      }),
      this.prismaService.case.count({ where }),
    ]);

    return [cases, total] as const;
  }

  updateCase(tx: Prisma.TransactionClient, id: string, data: Omit<UpdateCaseDto, 'tests' | 'treatments'>) {
    const updateData: Prisma.CaseUpdateInput = {};
    if (data.title !== undefined) updateData.Title = data.title;
    if (data.patientHistory !== undefined) updateData.PatientHistory = data.patientHistory;
    if (data.diagnosisExplanation !== undefined) updateData.DiagnosisExplanation = data.diagnosisExplanation;
    if (data.difficulty !== undefined) updateData.Difficulty = data.difficulty as any;
    if (data.diagnosisId !== undefined) updateData.Diagnosis = { connect: { Id: data.diagnosisId } };
    if (data.specialtyId !== undefined) updateData.Specialty = { connect: { Id: data.specialtyId } };

    return tx.case.update({
      where: { Id: id },
      data: updateData,
    });
  }

  deleteCase(tx: Prisma.TransactionClient, id: string) {
    return tx.case.delete({ where: { Id: id } });
  }

  hasAttempts(caseId: string) {
    return this.prismaService.userAttempt.findFirst({ where: { CaseId: caseId } });
  }
}
