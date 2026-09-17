import { Body, Controller, Get, ForbiddenException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserRole } from '@prisma/client';
import { AttemptService } from '../services/attempt.service';
import { CreateAttemptDto } from '../dto/create-attempt.dto';
import { OrderTestDto } from '../dto/order-test.dto';
import { DiagnoseDto } from '../dto/diagnose.dto';
import { TreatDto } from '../dto/treat.dto';
import {
  AttemptResponseDto,
  AttemptDetailDto,
  AttemptListItemDto,
  PaginatedAttemptListDto,
  StartAttemptResponseDto,
  OrderTestResponseDto,
  DiagnoseResponseDto,
  TreatResponseDto,
} from '../dto/attempt-response.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../../auth/services/token.service';

@ApiTags('attempts')
@ApiBearerAuth()
@Controller('attempts')
@UseGuards(AccessTokenGuard)
export class AttemptsController {
  constructor(private readonly attemptService: AttemptService) {}

  @Post('start')
  start(@CurrentUser() user: AccessTokenPayload): Promise<StartAttemptResponseDto> {
    return this.attemptService.startAttempt(user.sub);
  }

  @Post(':id/order-test')
  orderTest(
    @Param('id') id: string,
    @Body() dto: OrderTestDto,
  ): Promise<OrderTestResponseDto> {
    return this.attemptService.orderTest(id, dto);
  }

  @Post(':id/diagnose')
  diagnose(
    @Param('id') id: string,
    @Body() dto: DiagnoseDto,
  ): Promise<DiagnoseResponseDto> {
    return this.attemptService.submitDiagnosis(id, dto);
  }

  @Post(':id/treat')
  treat(
    @Param('id') id: string,
    @Body() dto: TreatDto,
  ): Promise<TreatResponseDto> {
    return this.attemptService.submitTreatments(id, dto);
  }

  @Post()
  submit(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateAttemptDto,
  ): Promise<AttemptResponseDto> {
    return this.attemptService.submitAttempt(user.sub, dto);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId') userId: string,
    @CurrentUser() user: AccessTokenPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedAttemptListDto> {
    if (user.sub !== userId && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only view your own attempt history',
      );
    }
    const parsedPage = Math.max(parseInt(page ?? '1', 10) || 1, 1);
    const parsedLimit = Math.min(
      Math.max(parseInt(limit ?? '20', 10) || 20, 1),
      100,
    );
    return this.attemptService.getAttemptsByUserId(
      userId,
      parsedPage,
      parsedLimit,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AttemptDetailDto | null> {
    return this.attemptService.getAttemptById(id);
  }
}
