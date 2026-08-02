import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { DailyCaseService } from '../services/daily-case.service';
import { CreateDailyCaseDto } from '../dto/create-daily-case.dto';
import { UpdateDailyCaseDto } from '../dto/update-daily-case.dto';
import { DailyCaseResponseDto } from '../dto/daily-case-response.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/roles.enum';

@Controller('daily-case')
export class DailyCaseController {
  constructor(private readonly dailyCaseService: DailyCaseService) {}

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() dto: CreateDailyCaseDto): Promise<DailyCaseResponseDto> {
    return this.dailyCaseService.create(dto);
  }

  @Get()
  findAll(): Promise<DailyCaseResponseDto[]> {
    return this.dailyCaseService.findAll();
  }

  @Put(':date')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  update(@Param('date') date: string, @Body() dto: UpdateDailyCaseDto): Promise<DailyCaseResponseDto> {
    return this.dailyCaseService.update(date, dto);
  }

  @Delete(':date')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('date') date: string): Promise<DailyCaseResponseDto> {
    return this.dailyCaseService.remove(date);
  }
}
