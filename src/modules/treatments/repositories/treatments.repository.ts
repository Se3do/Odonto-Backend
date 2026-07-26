import { Injectable } from '@nestjs/common';
import { Prisma, Treatment } from '@prisma/client';
import { PrismaService } from '../../../common/database/prisma.service';

export interface CreateTreatmentData {
  name: string;
}

export interface UpdateTreatmentData {
  name?: string;
}

@Injectable()
export class TreatmentsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: CreateTreatmentData): Promise<Treatment> {
    return this.prismaService.treatment.create({
      data: { Name: data.name },
    });
  }

  findById(id: string): Promise<Treatment | null> {
    return this.prismaService.treatment.findUnique({
      where: { Id: id },
    });
  }

  findAll(): Promise<Treatment[]> {
    return this.prismaService.treatment.findMany();
  }

  findByName(name: string): Promise<Treatment | null> {
    return this.prismaService.treatment.findUnique({
      where: { Name: name },
    });
  }

  update(id: string, data: UpdateTreatmentData): Promise<Treatment> {
    const updateData: Prisma.TreatmentUpdateInput = {};

    if (data.name !== undefined) {
      updateData.Name = data.name;
    }

    return this.prismaService.treatment.update({
      where: { Id: id },
      data: updateData,
    });
  }

  delete(id: string): Promise<Treatment> {
    return this.prismaService.treatment.delete({
      where: { Id: id },
    });
  }
}
