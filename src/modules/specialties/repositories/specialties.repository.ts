import { Injectable } from '@nestjs/common';
import { Prisma, Specialty } from '@prisma/client';
import { PrismaService } from '../../../common/database/prisma.service';

export interface CreateSpecialtyData {
  name: string;
}

export interface UpdateSpecialtyData {
  name?: string;
}

@Injectable()
export class SpecialtiesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: CreateSpecialtyData): Promise<Specialty> {
    return this.prismaService.specialty.create({
      data: {
        Name: data.name,
      },
    });
  }

  findById(id: string): Promise<Specialty | null> {
    return this.prismaService.specialty.findUnique({
      where: { Id: id },
    });
  }

  findAll(): Promise<Specialty[]> {
    return this.prismaService.specialty.findMany();
  }

  findByName(name: string): Promise<Specialty | null> {
    return this.prismaService.specialty.findUnique({
      where: { Name: name },
    });
  }

  update(id: string, data: UpdateSpecialtyData): Promise<Specialty> {
    const updateData: Prisma.SpecialtyUpdateInput = {};

    if (data.name !== undefined) {
      updateData.Name = data.name;
    }

    return this.prismaService.specialty.update({
      where: { Id: id },
      data: updateData,
    });
  }

  delete(id: string): Promise<Specialty> {
    return this.prismaService.specialty.delete({
      where: { Id: id },
    });
  }
}
