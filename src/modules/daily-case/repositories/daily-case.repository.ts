import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';

@Injectable()
export class DailyCaseRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private dayRange(date: Date): { start: Date; end: Date } {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  findByDay(date: Date) {
    const { start, end } = this.dayRange(date);
    return this.prismaService.dailyCase.findFirst({
      where: { Date: { gte: start, lte: end } },
      include: { Case: { select: { Id: true, Title: true, Difficulty: true } } },
    });
  }

  findAll() {
    return this.prismaService.dailyCase.findMany({
      orderBy: { Date: 'desc' },
      include: { Case: { select: { Id: true, Title: true, Difficulty: true } } },
    });
  }

  create(date: Date, caseId: string) {
    return this.prismaService.dailyCase.create({
      data: { Date: date, CaseId: caseId },
      include: { Case: { select: { Id: true, Title: true, Difficulty: true } } },
    });
  }

  update(id: string, caseId: string) {
    return this.prismaService.dailyCase.update({
      where: { Id: id },
      data: { CaseId: caseId },
      include: { Case: { select: { Id: true, Title: true, Difficulty: true } } },
    });
  }

  delete(id: string) {
    return this.prismaService.dailyCase.delete({ where: { Id: id } });
  }

  findCaseById(caseId: string) {
    return this.prismaService.case.findUnique({ where: { Id: caseId } });
  }

  hasCaseAssignment(caseId: string) {
    return this.prismaService.dailyCase.findFirst({ where: { CaseId: caseId } });
  }
}
