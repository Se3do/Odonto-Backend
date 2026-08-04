import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CasesService } from '../services/cases.service';
import { CreateCaseDto } from '../dto/create-case.dto';
import { UpdateCaseDto } from '../dto/update-case.dto';
import { CaseQueryDto } from '../dto/case-query.dto';
import { CaseResponseDto, CaseImageResponseDto, PaginatedCaseResponseDto } from '../dto/case-response.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/roles.enum';
import { imageUploadOptions } from '../cases-upload.config';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  findAll(@Query() query: CaseQueryDto): Promise<PaginatedCaseResponseDto> {
    return this.casesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CaseResponseDto> {
    return this.casesService.findById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() dto: CreateCaseDto): Promise<CaseResponseDto> {
    return this.casesService.create(dto);
  }

  @Post(':id/images')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('imageType') imageType?: string,
  ): Promise<CaseImageResponseDto> {
    return this.casesService.uploadImage(id, file, imageType);
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() dto: UpdateCaseDto): Promise<CaseResponseDto> {
    return this.casesService.update(id, dto);
  }

  @Delete('images/:imageId')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  removeImage(@Param('imageId') imageId: string): Promise<CaseImageResponseDto> {
    return this.casesService.removeImage(imageId);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string): Promise<CaseResponseDto> {
    return this.casesService.remove(id);
  }
}
