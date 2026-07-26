import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Treatment } from '@prisma/client';
import { CreateTreatmentDto } from '../dto/create-treatment.dto';
import { UpdateTreatmentDto } from '../dto/update-treatment.dto';
import { TreatmentResponseDto } from '../dto/treatment-response.dto';
import { TreatmentsRepository } from '../repositories/treatments.repository';

@Injectable()
export class TreatmentsService {
  constructor(private readonly treatmentsRepository: TreatmentsRepository) {}

  async create(dto: CreateTreatmentDto): Promise<TreatmentResponseDto> {
    const name = this.normalizeName(dto.name);
    await this.ensureNameIsAvailable(name);
    const treatment = await this.treatmentsRepository.create({ name });
    return this.toResponseDto(treatment);
  }

  async findAll(): Promise<TreatmentResponseDto[]> {
    const treatments = await this.treatmentsRepository.findAll();
    return treatments.map((t) => this.toResponseDto(t));
  }

  async findById(id: string): Promise<TreatmentResponseDto> {
    const treatment = await this.getOrThrow(id);
    return this.toResponseDto(treatment);
  }

  async update(
    id: string,
    dto: UpdateTreatmentDto,
  ): Promise<TreatmentResponseDto> {
    const current = await this.getOrThrow(id);

    if (dto.name === undefined) {
      throw new BadRequestException('At least one field must be provided');
    }

    const name = this.normalizeName(dto.name);

    if (name !== current.Name) {
      await this.ensureNameIsAvailable(name);
    }

    const updated = await this.treatmentsRepository.update(id, { name });
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<TreatmentResponseDto> {
    const treatment = await this.getOrThrow(id);
    const deleted = await this.treatmentsRepository.delete(treatment.Id);
    return this.toResponseDto(deleted);
  }

  private async getOrThrow(id: string): Promise<Treatment> {
    const treatment = await this.treatmentsRepository.findById(id);
    if (!treatment) {
      throw new NotFoundException(`Treatment with id ${id} was not found`);
    }
    return treatment;
  }

  private async ensureNameIsAvailable(
    name: string,
    currentId?: string,
  ): Promise<void> {
    const existing = await this.treatmentsRepository.findByName(name);
    if (existing && existing.Id !== currentId) {
      throw new ConflictException('Treatment name already exists');
    }
  }

  private normalizeName(name: string): string {
    return name.trim();
  }

  private toResponseDto(treatment: Treatment): TreatmentResponseDto {
    return {
      id: treatment.Id,
      name: treatment.Name,
    };
  }
}
