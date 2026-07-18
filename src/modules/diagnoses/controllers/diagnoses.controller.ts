import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DiagnosesService } from '../services/diagnoses.service';
import { CreateDiagnosisDto } from '../dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from '../dto/update-diagnosis.dto';
import { DiagnosisResponseDto } from '../dto/diagnosis-response.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/roles.enum';

@Controller('diagnoses')
export class DiagnosesController {
  constructor(private readonly diagnosesService: DiagnosesService) {}

  @Get()
  findAll(): Promise<DiagnosisResponseDto[]> {
    return this.diagnosesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DiagnosisResponseDto> {
    return this.diagnosesService.findById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() dto: CreateDiagnosisDto): Promise<DiagnosisResponseDto> {
    return this.diagnosesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiagnosisDto,
  ): Promise<DiagnosisResponseDto> {
    return this.diagnosesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string): Promise<DiagnosisResponseDto> {
    return this.diagnosesService.remove(id);
  }
}
