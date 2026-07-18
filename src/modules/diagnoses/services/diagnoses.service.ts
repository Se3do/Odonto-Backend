import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Diagnosis } from '@prisma/client';
import { CreateDiagnosisDto } from '../dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from '../dto/update-diagnosis.dto';
import { DiagnosisResponseDto } from '../dto/diagnosis-response.dto';
import { DiagnosesRepository } from '../repositories/diagnoses.repository';

@Injectable()
export class DiagnosesService {
  constructor(private readonly diagnosesRepository: DiagnosesRepository) {}

  async create(dto: CreateDiagnosisDto): Promise<DiagnosisResponseDto> {
    const name = this.normalizeName(dto.name);
    await this.ensureNameIsAvailable(name);
    const diagnosis = await this.diagnosesRepository.create({ name });
    return this.toResponseDto(diagnosis);
  }

  async findAll(): Promise<DiagnosisResponseDto[]> {
    const diagnoses = await this.diagnosesRepository.findAll();
    return diagnoses.map((d) => this.toResponseDto(d));
  }

  async findById(id: string): Promise<DiagnosisResponseDto> {
    const diagnosis = await this.getOrThrow(id);
    return this.toResponseDto(diagnosis);
  }

  async update(
    id: string,
    dto: UpdateDiagnosisDto,
  ): Promise<DiagnosisResponseDto> {
    const current = await this.getOrThrow(id);

    if (dto.name === undefined) {
      throw new BadRequestException('At least one field must be provided');
    }

    const name = this.normalizeName(dto.name);

    if (name !== current.Name) {
      await this.ensureNameIsAvailable(name);
    }

    const updated = await this.diagnosesRepository.update(id, { name });
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<DiagnosisResponseDto> {
    const diagnosis = await this.getOrThrow(id);
    const deleted = await this.diagnosesRepository.delete(diagnosis.Id);
    return this.toResponseDto(deleted);
  }

  private async getOrThrow(id: string): Promise<Diagnosis> {
    const diagnosis = await this.diagnosesRepository.findById(id);
    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with id ${id} was not found`);
    }
    return diagnosis;
  }

  private async ensureNameIsAvailable(
    name: string,
    currentId?: string,
  ): Promise<void> {
    const existing = await this.diagnosesRepository.findByName(name);
    if (existing && existing.Id !== currentId) {
      throw new ConflictException('Diagnosis name already exists');
    }
  }

  private normalizeName(name: string): string {
    return name.trim();
  }

  private toResponseDto(diagnosis: Diagnosis): DiagnosisResponseDto {
    return {
      id: diagnosis.Id,
      name: diagnosis.Name,
    };
  }
}
