import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@prisma/client';
import { CreateDiagnosticTestDto } from '../dto/create-diagnostic-test.dto';
import { UpdateDiagnosticTestDto } from '../dto/update-diagnostic-test.dto';
import { DiagnosticTestResponseDto } from '../dto/diagnostic-test-response.dto';
import { DiagnosticTestsRepository } from '../repositories/diagnostic-tests.repository';

@Injectable()
export class DiagnosticTestsService {
  constructor(
    private readonly diagnosticTestsRepository: DiagnosticTestsRepository,
  ) {}

  async create(
    dto: CreateDiagnosticTestDto,
  ): Promise<DiagnosticTestResponseDto> {
    const name = this.normalizeName(dto.name);
    await this.ensureNameIsAvailable(name);
    const test = await this.diagnosticTestsRepository.create({ name });
    return this.toResponseDto(test);
  }

  async findAll(): Promise<DiagnosticTestResponseDto[]> {
    const tests = await this.diagnosticTestsRepository.findAll();
    return tests.map((t) => this.toResponseDto(t));
  }

  async findById(id: string): Promise<DiagnosticTestResponseDto> {
    const test = await this.getOrThrow(id);
    return this.toResponseDto(test);
  }

  async update(
    id: string,
    dto: UpdateDiagnosticTestDto,
  ): Promise<DiagnosticTestResponseDto> {
    const current = await this.getOrThrow(id);

    if (dto.name === undefined) {
      throw new BadRequestException('At least one field must be provided');
    }

    const name = this.normalizeName(dto.name);

    if (name !== current.Name) {
      await this.ensureNameIsAvailable(name);
    }

    const updated = await this.diagnosticTestsRepository.update(id, { name });
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<DiagnosticTestResponseDto> {
    const test = await this.getOrThrow(id);
    const deleted = await this.diagnosticTestsRepository.delete(test.Id);
    return this.toResponseDto(deleted);
  }

  private async getOrThrow(id: string): Promise<Test> {
    const test = await this.diagnosticTestsRepository.findById(id);
    if (!test) {
      throw new NotFoundException(
        `Diagnostic test with id ${id} was not found`,
      );
    }
    return test;
  }

  private async ensureNameIsAvailable(
    name: string,
    currentId?: string,
  ): Promise<void> {
    const existing = await this.diagnosticTestsRepository.findByName(name);
    if (existing && existing.Id !== currentId) {
      throw new ConflictException('Diagnostic test name already exists');
    }
  }

  private normalizeName(name: string): string {
    return name.trim();
  }

  private toResponseDto(test: Test): DiagnosticTestResponseDto {
    return {
      id: test.Id,
      name: test.Name,
    };
  }
}
