import { Injectable } from '@nestjs/common';
import { Prisma, Test } from '@prisma/client';
import { PrismaService } from '../../../common/database/prisma.service';

export interface CreateTestData {
  name: string;
}

export interface UpdateTestData {
  name?: string;
}

@Injectable()
export class TestsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: CreateTestData): Promise<Test> {
    return this.prismaService.test.create({
      data: { Name: data.name },
    });
  }

  findById(id: string): Promise<Test | null> {
    return this.prismaService.test.findUnique({
      where: { Id: id },
    });
  }

  findAll(): Promise<Test[]> {
    return this.prismaService.test.findMany();
  }

  findByName(name: string): Promise<Test | null> {
    return this.prismaService.test.findUnique({
      where: { Name: name },
    });
  }

  update(id: string, data: UpdateTestData): Promise<Test> {
    const updateData: Prisma.TestUpdateInput = {};

    if (data.name !== undefined) {
      updateData.Name = data.name;
    }

    return this.prismaService.test.update({
      where: { Id: id },
      data: updateData,
    });
  }

  delete(id: string): Promise<Test> {
    return this.prismaService.test.delete({
      where: { Id: id },
    });
  }
}
