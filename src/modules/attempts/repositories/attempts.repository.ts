import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/database/prisma.service';

@Injectable()
export class AttemptsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private getPrisma(tx?: Prisma.TransactionClient) {
    return tx ?? this.prismaService;
  }

  findUserById(id: string) {
    return this.prismaService.user.findUnique({ where: { Id: id } });
  }

  findDailyCaseByDate(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.prismaService.dailyCase.findFirst({
      where: { Date: { gte: start, lte: end } },
      include: { Case: true },
    });
  }

  findCaseById(id: string) {
    return this.prismaService.case.findUnique({ where: { Id: id } });
  }

  findCaseTestsByCaseId(caseId: string) {
    return this.prismaService.caseTest.findMany({
      where: { CaseId: caseId },
      include: { Test: true },
    });
  }

  findCaseTreatmentsByCaseId(caseId: string) {
    return this.prismaService.caseTreatment.findMany({
      where: { CaseId: caseId },
      include: { Treatment: true },
    });
  }

  findDiagnosisById(id: string) {
    return this.prismaService.diagnosis.findUnique({ where: { Id: id } });
  }

  findExistingAttempt(userId: string, caseId: string) {
    return this.prismaService.userAttempt.findFirst({
      where: { UserId: userId, CaseId: caseId },
    });
  }

  findAttemptById(id: string) {
    return this.prismaService.userAttempt.findUnique({
      where: { Id: id },
      include: {
        Case: {
          select: {
            Id: true,
            Title: true,
            Difficulty: true,
            DiagnosisExplanation: true,
            Diagnosis: { select: { Id: true, Name: true } },
          },
        },
        Diagnosis: { select: { Id: true, Name: true } },
        AttemptTests: {
          include: { CaseTest: { include: { Test: true } } },
        },
        AttemptTreatments: {
          include: { CaseTreatment: { include: { Treatment: true } } },
        },
      },
    });
  }

  findAttemptsByUserId(userId: string) {
    return this.prismaService.userAttempt.findMany({
      where: { UserId: userId },
      orderBy: { CompletedAt: { sort: 'desc', nulls: 'last' } },
      select: {
        Id: true,
        Score: true,
        XpEarned: true,
        CompletedAt: true,
        Case: { select: { Title: true } },
      },
    });
  }

  runTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prismaService.$transaction(fn);
  }
}
