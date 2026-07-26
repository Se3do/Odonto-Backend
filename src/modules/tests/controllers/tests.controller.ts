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
import { TestsService } from '../services/tests.service';
import { CreateTestDto } from '../dto/create-test.dto';
import { UpdateTestDto } from '../dto/update-test.dto';
import { TestResponseDto } from '../dto/test-response.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/roles.enum';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  findAll(): Promise<TestResponseDto[]> {
    return this.testsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TestResponseDto> {
    return this.testsService.findById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() dto: CreateTestDto): Promise<TestResponseDto> {
    return this.testsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTestDto,
  ): Promise<TestResponseDto> {
    return this.testsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string): Promise<TestResponseDto> {
    return this.testsService.remove(id);
  }
}
