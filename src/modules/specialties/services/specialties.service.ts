import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Specialty } from '@prisma/client';
import { CreateSpecialtyDto } from '../dto/create-specialty.dto';
import { UpdateSpecialtyDto } from '../dto/update-specialty.dto';
import { SpecialtyResponseDto } from '../dto/specialty-response.dto';
import { SpecialtiesRepository } from '../repositories/specialties.repository';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly specialtiesRepository: SpecialtiesRepository) {}

  async create(dto: CreateSpecialtyDto): Promise<SpecialtyResponseDto> {
    const name = this.normalizeName(dto.name);
    await this.ensureNameIsAvailable(name);
    const specialty = await this.specialtiesRepository.create({ name });
    return this.toResponseDto(specialty);
  }

  async findAll(): Promise<SpecialtyResponseDto[]> {
    const specialties = await this.specialtiesRepository.findAll();
    return specialties.map((s) => this.toResponseDto(s));
  }

  async findById(id: string): Promise<SpecialtyResponseDto> {
    const specialty = await this.getOrThrow(id);
    return this.toResponseDto(specialty);
  }

  async update(
    id: string,
    dto: UpdateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    const current = await this.getOrThrow(id);

    if (dto.name === undefined) {
      throw new BadRequestException('At least one field must be provided');
    }

    const name = this.normalizeName(dto.name);

    if (name !== current.Name) {
      await this.ensureNameIsAvailable(name);
    }

    const updated = await this.specialtiesRepository.update(id, { name });
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<SpecialtyResponseDto> {
    const specialty = await this.getOrThrow(id);
    const deleted = await this.specialtiesRepository.delete(specialty.Id);
    return this.toResponseDto(deleted);
  }

  private async getOrThrow(id: string): Promise<Specialty> {
    const specialty = await this.specialtiesRepository.findById(id);
    if (!specialty) {
      throw new NotFoundException(`Specialty with id ${id} was not found`);
    }
    return specialty;
  }

  private async ensureNameIsAvailable(
    name: string,
    currentId?: string,
  ): Promise<void> {
    const existing = await this.specialtiesRepository.findByName(name);
    if (existing && existing.Id !== currentId) {
      throw new ConflictException('Specialty name already exists');
    }
  }

  private normalizeName(name: string): string {
    return name.trim();
  }

  private toResponseDto(specialty: Specialty): SpecialtyResponseDto {
    return {
      id: specialty.Id,
      name: specialty.Name,
    };
  }
}
