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
import { SpecialtiesService } from '../services/specialties.service';
import { CreateSpecialtyDto } from '../dto/create-specialty.dto';
import { UpdateSpecialtyDto } from '../dto/update-specialty.dto';
import { SpecialtyResponseDto } from '../dto/specialty-response.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/roles.enum';

@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Get()
  findAll(): Promise<SpecialtyResponseDto[]> {
    return this.specialtiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.findById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() dto: CreateSpecialtyDto): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.remove(id);
  }
}
