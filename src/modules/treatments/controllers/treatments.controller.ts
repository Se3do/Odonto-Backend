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
import { TreatmentsService } from '../services/treatments.service';
import { CreateTreatmentDto } from '../dto/create-treatment.dto';
import { UpdateTreatmentDto } from '../dto/update-treatment.dto';
import { TreatmentResponseDto } from '../dto/treatment-response.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/roles.enum';

@Controller('treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Get()
  findAll(): Promise<TreatmentResponseDto[]> {
    return this.treatmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TreatmentResponseDto> {
    return this.treatmentsService.findById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() dto: CreateTreatmentDto): Promise<TreatmentResponseDto> {
    return this.treatmentsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTreatmentDto,
  ): Promise<TreatmentResponseDto> {
    return this.treatmentsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string): Promise<TreatmentResponseDto> {
    return this.treatmentsService.remove(id);
  }
}
