import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AttemptService } from '../services/attempt.service';
import { CreateAttemptDto } from '../dto/create-attempt.dto';
import { OrderTestDto } from '../dto/order-test.dto';
import { DiagnoseDto } from '../dto/diagnose.dto';
import { TreatDto } from '../dto/treat.dto';
import {
  AttemptResponseDto,
  AttemptDetailDto,
  AttemptListItemDto,
  StartAttemptResponseDto,
  OrderTestResponseDto,
  DiagnoseResponseDto,
  TreatResponseDto,
} from '../dto/attempt-response.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../../auth/services/token.service';

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
  findByUser(@Param('userId') userId: string): Promise<AttemptListItemDto[]> {
    return this.attemptService.getAttemptsByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AttemptDetailDto | null> {
    return this.attemptService.getAttemptById(id);
  }
}
