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
import { DiagnosticTestsService } from '../services/diagnostic-tests.service';
import { CreateDiagnosticTestDto } from '../dto/create-diagnostic-test.dto';
import { UpdateDiagnosticTestDto } from '../dto/update-diagnostic-test.dto';
import { DiagnosticTestResponseDto } from '../dto/diagnostic-test-response.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/roles.enum';

@Controller('diagnostic-tests')
export class DiagnosticTestsController {
  constructor(
    private readonly diagnosticTestsService: DiagnosticTestsService,
  ) {}

  @Get()
  findAll(): Promise<DiagnosticTestResponseDto[]> {
    return this.diagnosticTestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DiagnosticTestResponseDto> {
    return this.diagnosticTestsService.findById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  create(
    @Body() dto: CreateDiagnosticTestDto,
  ): Promise<DiagnosticTestResponseDto> {
    return this.diagnosticTestsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiagnosticTestDto,
  ): Promise<DiagnosticTestResponseDto> {
    return this.diagnosticTestsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string): Promise<DiagnosticTestResponseDto> {
    return this.diagnosticTestsService.remove(id);
  }
}
