import { Injectable } from '@nestjs/common';
import { Diagnosis, Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/database/prisma.service';

export interface CreateDiagnosisData {
  name: string;
}

export interface UpdateDiagnosisData {
  name?: string;
}

@Injectable()
export class DiagnosesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: CreateDiagnosisData): Promise<Diagnosis> {
    return this.prismaService.diagnosis.create({
      data: { Name: data.name },
    });
  }

  findById(id: string): Promise<Diagnosis | null> {
    return this.prismaService.diagnosis.findUnique({
      where: { Id: id },
    });
  }

  findAll(): Promise<Diagnosis[]> {
    return this.prismaService.diagnosis.findMany();
  }

  findByName(name: string): Promise<Diagnosis | null> {
    return this.prismaService.diagnosis.findUnique({
      where: { Name: name },
    });
  }

  update(id: string, data: UpdateDiagnosisData): Promise<Diagnosis> {
    const updateData: Prisma.DiagnosisUpdateInput = {};

    if (data.name !== undefined) {
      updateData.Name = data.name;
    }

    return this.prismaService.diagnosis.update({
      where: { Id: id },
      data: updateData,
    });
  }

  delete(id: string): Promise<Diagnosis> {
    return this.prismaService.diagnosis.delete({
      where: { Id: id },
    });
  }
}
