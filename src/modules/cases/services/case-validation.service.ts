import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { CreateCaseDto } from '../dto/create-case.dto';
import { UpdateCaseDto } from '../dto/update-case.dto';
import { CasesRepository } from '../repositories/cases.repository';

@Injectable()
export class CaseValidationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly repository: CasesRepository,
  ) {}

  async validateCreate(dto: CreateCaseDto): Promise<void> {
    await this.validateReferencedEntities(
      dto.diagnosisId,
      dto.specialtyId,
      dto.tests.map((t) => t.id),
      dto.treatments.map((t) => t.id),
    );

    this.validateNoDuplicateIds(dto.tests.map((t) => t.id), 'test');
    this.validateNoDuplicateIds(dto.treatments.map((t) => t.id), 'treatment');

    this.validateAtLeastOneCorrect(dto.tests.map((t) => t.isCorrect), 'test');
    this.validateAtLeastOneCorrect(dto.treatments.map((t) => t.isCorrect), 'treatment');
  }

  async validateUpdate(dto: UpdateCaseDto): Promise<void> {
    if (dto.diagnosisId || dto.specialtyId || dto.tests || dto.treatments) {
      await this.validateReferencedEntities(
        dto.diagnosisId,
        dto.specialtyId,
        dto.tests?.map((t) => t.id),
        dto.treatments?.map((t) => t.id),
      );
    }

    if (dto.tests) {
      this.validateNoDuplicateIds(dto.tests.map((t) => t.id), 'test');
      this.validateAtLeastOneCorrect(dto.tests.map((t) => t.isCorrect), 'test');
    }
    if (dto.treatments) {
      this.validateNoDuplicateIds(dto.treatments.map((t) => t.id), 'treatment');
      this.validateAtLeastOneCorrect(dto.treatments.map((t) => t.isCorrect), 'treatment');
    }
  }

  async validateDelete(caseId: string): Promise<void> {
    const existing = await this.repository.hasAttempts(caseId);
    if (existing) {
      throw new ForbiddenException('Cannot delete a case that has student attempts');
    }
  }

  private async validateReferencedEntities(
    diagnosisId?: string,
    specialtyId?: string,
    testIds?: string[],
    treatmentIds?: string[],
  ): Promise<void> {
    if (diagnosisId) {
      const diagnosis = await this.prismaService.diagnosis.findUnique({ where: { Id: diagnosisId } });
      if (!diagnosis) throw new NotFoundException(`Diagnosis with id ${diagnosisId} was not found`);
    }

    if (specialtyId) {
      const specialty = await this.prismaService.specialty.findUnique({ where: { Id: specialtyId } });
      if (!specialty) throw new NotFoundException(`Specialty with id ${specialtyId} was not found`);
    }

    if (testIds && testIds.length > 0) {
      const found = await this.prismaService.test.findMany({ where: { Id: { in: testIds } } });
      const foundIds = new Set(found.map((t) => t.Id));
      const missing = testIds.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        throw new BadRequestException(`Tests not found: ${missing.join(', ')}`);
      }
    }

    if (treatmentIds && treatmentIds.length > 0) {
      const found = await this.prismaService.treatment.findMany({ where: { Id: { in: treatmentIds } } });
      const foundIds = new Set(found.map((t) => t.Id));
      const missing = treatmentIds.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        throw new BadRequestException(`Treatments not found: ${missing.join(', ')}`);
      }
    }
  }

  private validateNoDuplicateIds(ids: string[], label: string): void {
    if (ids && new Set(ids).size !== ids.length) {
      throw new BadRequestException(`Duplicate ${label} IDs are not allowed`);
    }
  }

  private validateAtLeastOneCorrect(results: boolean[], label: string): void {
    if (!results.some((r) => r)) {
      throw new BadRequestException(`At least one ${label} must be marked as correct`);
    }
  }
}
