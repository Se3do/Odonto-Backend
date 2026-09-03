import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CasesRepository } from '../repositories/cases.repository';
import { CaseValidationService } from './case-validation.service';
import { CreateCaseDto } from '../dto/create-case.dto';
import { UpdateCaseDto } from '../dto/update-case.dto';
import { CaseQueryDto } from '../dto/case-query.dto';
import { CaseResponseDto, CaseImageResponseDto, PaginatedCaseResponseDto } from '../dto/case-response.dto';
import { CASE_IMAGE_TYPES } from '../cases-upload.config';
import { v2 as cloudinary } from 'cloudinary';

let cloudinaryConfigured = false;
function ensureCloudinaryConfig() {
  if (cloudinaryConfigured) return;
  const url = process.env.CLOUDINARY_URL ?? '';
  const m = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (m) {
    cloudinary.config({ cloud_name: m[3], api_key: m[1], api_secret: m[2] });
  }
  cloudinaryConfigured = true;
}

@Injectable()
export class CasesService {
  constructor(
    private readonly repository: CasesRepository,
    private readonly validationService: CaseValidationService,
  ) {}

  async create(dto: CreateCaseDto): Promise<CaseResponseDto> {
    await this.validationService.validateCreate(dto);

    const caseId = await this.repository.runTransaction(async (tx) => {
      const created = await this.repository.createCase(tx, {
        title: dto.title,
        patientHistory: dto.patientHistory,
        diagnosisExplanation: dto.diagnosisExplanation,
        difficulty: dto.difficulty,
        diagnosisId: dto.diagnosisId,
        specialtyId: dto.specialtyId,
      });

      await this.repository.replaceCaseTests(tx, created.Id, dto.tests);
      await this.repository.replaceCaseTreatments(tx, created.Id, dto.treatments);

      return created.Id;
    });

    const c = await this.getOrThrow(caseId);
    return this.toResponseDto(c);
  }

  async update(id: string, dto: UpdateCaseDto): Promise<CaseResponseDto> {
    const existing = await this.getOrThrow(id);
    await this.validationService.validateUpdate(dto);

    await this.repository.runTransaction(async (tx) => {
      if (dto.title !== undefined || dto.patientHistory !== undefined || dto.diagnosisExplanation !== undefined ||
          dto.difficulty !== undefined || dto.diagnosisId !== undefined || dto.specialtyId !== undefined) {
        await this.repository.updateCase(tx, existing.Id, dto);
      }

      if (dto.tests) {
        await this.repository.deleteCaseTests(tx, existing.Id);
        await this.repository.replaceCaseTests(tx, existing.Id, dto.tests);
      }

      if (dto.treatments) {
        await this.repository.deleteCaseTreatments(tx, existing.Id);
        await this.repository.replaceCaseTreatments(tx, existing.Id, dto.treatments);
      }
    });

    const c = await this.getOrThrow(id);
    return this.toResponseDto(c);
  }

  async remove(id: string): Promise<CaseResponseDto> {
    const existing = await this.getOrThrow(id);
    await this.validationService.validateDelete(id);
    await this.repository.runTransaction(async (tx) => {
      await this.repository.deleteCaseTests(tx, existing.Id);
      await this.repository.deleteCaseTreatments(tx, existing.Id);
      await this.repository.deleteCaseImages(tx, existing.Id);
      await this.repository.deleteCase(tx, existing.Id);
    });
    return this.toResponseDto(existing);
  }

  async findById(id: string): Promise<CaseResponseDto> {
    const c = await this.getOrThrow(id);
    return this.toResponseDto(c);
  }

  async findAll(query: CaseQueryDto): Promise<PaginatedCaseResponseDto> {
    const [cases, total] = await this.repository.findMany(query);
    return {
      data: cases.map((c) => this.toResponseDto(c)),
      total,
      page: query.page!,
      limit: query.limit!,
    };
  }

  async uploadImage(
    caseId: string,
    file: Express.Multer.File,
    imageType?: string,
  ): Promise<CaseImageResponseDto> {
    await this.getOrThrow(caseId);
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    const type = this.validateImageType(imageType);
    ensureCloudinaryConfig();
    const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'odonto/cases' },
        (error, result) => (error ? reject(error) : resolve(result as { secure_url: string })),
      );
      stream.end(file.buffer);
    });
    const image = await this.repository.createImage(
      caseId,
      uploaded.secure_url,
      type,
    );
    return this.toImageDto(image);
  }

  async removeImage(imageId: string): Promise<CaseImageResponseDto> {
    const image = await this.repository.findImageById(imageId);
    if (!image) {
      throw new NotFoundException(`Image with id ${imageId} was not found`);
    }
    const publicId = this.parseCloudinaryPublicId(image.Url);
    if (publicId) {
      ensureCloudinaryConfig();
      await cloudinary.uploader.destroy(publicId);
    }
    await this.repository.deleteImage(imageId);
    return this.toImageDto(image);
  }

  private parseCloudinaryPublicId(url: string): string | null {
    const match = /\/image\/upload\/v\d+\/(.+)\.\w+$/.exec(url);
    return match ? match[1] : null;
  }

  private async getOrThrow(id: string) {
    const c = await this.repository.findById(id);
    if (!c) {
      throw new NotFoundException(`Case with id ${id} was not found`);
    }
    return c;
  }

  private toResponseDto(c: any): CaseResponseDto {
    return {
      id: c.Id,
      title: c.Title,
      patientHistory: c.PatientHistory,
      diagnosisExplanation: c.DiagnosisExplanation,
      difficulty: c.Difficulty,
      specialtyId: c.Specialty.Id,
      specialtyName: c.Specialty.Name,
      diagnosisId: c.Diagnosis.Id,
      diagnosisName: c.Diagnosis.Name,
      tests: c.CaseTests.map((ct: any) => ({
        testId: ct.Test.Id,
        testName: ct.Test.Name,
        isCorrect: ct.IsCorrect,
      })),
      treatments: c.CaseTreatments.map((ct: any) => ({
        treatmentId: ct.Treatment.Id,
        treatmentName: ct.Treatment.Name,
        isCorrect: ct.IsCorrect,
      })),
      images: c.CaseImages.map((ci: any) => this.toImageDto(ci)),
      createdAt: c.CreatedAt,
    };
  }

  private toImageDto(image: any): CaseImageResponseDto {
    return {
      id: image.Id,
      url: image.Url,
      imageType: image.ImageType,
    };
  }

  private validateImageType(value?: string): string {
    const type = value ?? 'ClinicalPhoto';
    if (!CASE_IMAGE_TYPES.includes(type as (typeof CASE_IMAGE_TYPES)[number])) {
      throw new BadRequestException(
        `Invalid image type, expected one of: ${CASE_IMAGE_TYPES.join(', ')}`,
      );
    }
    return type;
  }
}
