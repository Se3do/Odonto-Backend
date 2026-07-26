import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@prisma/client';
import { CreateTestDto } from '../dto/create-test.dto';
import { UpdateTestDto } from '../dto/update-test.dto';
import { TestResponseDto } from '../dto/test-response.dto';
import { TestsRepository } from '../repositories/tests.repository';

@Injectable()
export class TestsService {
  constructor(private readonly testsRepository: TestsRepository) {}

  async create(dto: CreateTestDto): Promise<TestResponseDto> {
    const name = this.normalizeName(dto.name);
    await this.ensureNameIsAvailable(name);
    const test = await this.testsRepository.create({ name });
    return this.toResponseDto(test);
  }

  async findAll(): Promise<TestResponseDto[]> {
    const tests = await this.testsRepository.findAll();
    return tests.map((t) => this.toResponseDto(t));
  }

  async findById(id: string): Promise<TestResponseDto> {
    const test = await this.getOrThrow(id);
    return this.toResponseDto(test);
  }

  async update(id: string, dto: UpdateTestDto): Promise<TestResponseDto> {
    const current = await this.getOrThrow(id);

    if (dto.name === undefined) {
      throw new BadRequestException('At least one field must be provided');
    }

    const name = this.normalizeName(dto.name);

    if (name !== current.Name) {
      await this.ensureNameIsAvailable(name);
    }

    const updated = await this.testsRepository.update(id, { name });
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<TestResponseDto> {
    const test = await this.getOrThrow(id);
    const deleted = await this.testsRepository.delete(test.Id);
    return this.toResponseDto(deleted);
  }

  private async getOrThrow(id: string): Promise<Test> {
    const test = await this.testsRepository.findById(id);
    if (!test) {
      throw new NotFoundException(`Test with id ${id} was not found`);
    }
    return test;
  }

  private async ensureNameIsAvailable(
    name: string,
    currentId?: string,
  ): Promise<void> {
    const existing = await this.testsRepository.findByName(name);
    if (existing && existing.Id !== currentId) {
      throw new ConflictException('Test name already exists');
    }
  }

  private normalizeName(name: string): string {
    return name.trim();
  }

  private toResponseDto(test: Test): TestResponseDto {
    return {
      id: test.Id,
      name: test.Name,
    };
  }
}
