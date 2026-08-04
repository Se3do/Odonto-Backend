import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DailyCaseRepository } from '../repositories/daily-case.repository';
import { CreateDailyCaseDto } from '../dto/create-daily-case.dto';
import { UpdateDailyCaseDto } from '../dto/update-daily-case.dto';
import { DailyCaseResponseDto, TodayDailyCaseResponseDto } from '../dto/daily-case-response.dto';

@Injectable()
export class DailyCaseService {
  constructor(private readonly repository: DailyCaseRepository) {}

  async create(dto: CreateDailyCaseDto): Promise<DailyCaseResponseDto> {
    const date = this.parseDate(dto.date);
    const existing = await this.repository.findByDay(date);
    if (existing) {
      throw new ConflictException('A daily case is already assigned for this date');
    }
    await this.ensureCaseExists(dto.caseId);
    const dailyCase = await this.repository.create(date, dto.caseId);
    return this.toResponseDto(dailyCase);
  }

  async findAll(): Promise<DailyCaseResponseDto[]> {
    const list = await this.repository.findAll();
    return list.map((d) => this.toResponseDto(d));
  }

  async getToday(): Promise<TodayDailyCaseResponseDto> {
    const dailyCase = await this.repository.findToday(new Date());
    if (!dailyCase) {
      throw new NotFoundException('No daily case assigned for today');
    }
    return {
      id: dailyCase.Id,
      date: dailyCase.Date.toISOString(),
      case: {
        id: dailyCase.Case.Id,
        title: dailyCase.Case.Title,
        difficulty: dailyCase.Case.Difficulty,
        patientHistory: dailyCase.Case.PatientHistory,
        specialtyId: dailyCase.Case.Specialty.Id,
        specialtyName: dailyCase.Case.Specialty.Name,
        tests: dailyCase.Case.CaseTests.map((ct) => ({
          testId: ct.Test.Id,
          testName: ct.Test.Name,
        })),
        treatments: dailyCase.Case.CaseTreatments.map((ct) => ({
          treatmentId: ct.Treatment.Id,
          treatmentName: ct.Treatment.Name,
        })),
      },
    };
  }

  async update(dateParam: string, dto: UpdateDailyCaseDto): Promise<DailyCaseResponseDto> {
    const date = this.parseDate(dateParam);
    const existing = await this.repository.findByDay(date);
    if (!existing) {
      throw new NotFoundException(`No daily case assigned for ${dateParam}`);
    }
    await this.ensureCaseExists(dto.caseId);
    const updated = await this.repository.update(existing.Id, dto.caseId);
    return this.toResponseDto(updated);
  }

  async remove(dateParam: string): Promise<DailyCaseResponseDto> {
    const date = this.parseDate(dateParam);
    const existing = await this.repository.findByDay(date);
    if (!existing) {
      throw new NotFoundException(`No daily case assigned for ${dateParam}`);
    }
    await this.repository.delete(existing.Id);
    return this.toResponseDto(existing);
  }

  private async ensureCaseExists(caseId: string): Promise<void> {
    const c = await this.repository.findCaseById(caseId);
    if (!c) {
      throw new NotFoundException(`Case with id ${caseId} was not found`);
    }
  }

  private parseDate(value: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      throw new BadRequestException('Invalid date format, expected YYYY-MM-DD');
    }
    const y = Number(match[1]);
    const m = Number(match[2]);
    const d = Number(match[3]);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
      throw new BadRequestException(`Invalid date: ${value}`);
    }
    return date;
  }

  private toResponseDto(d: any): DailyCaseResponseDto {
    return {
      id: d.Id,
      date: d.Date.toISOString(),
      caseId: d.CaseId,
      case: {
        id: d.Case.Id,
        title: d.Case.Title,
        difficulty: d.Case.Difficulty,
      },
    };
  }
}
