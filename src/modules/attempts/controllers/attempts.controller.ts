import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AttemptService } from '../services/attempt.service';
import { CreateAttemptDto } from '../dto/create-attempt.dto';
import { AttemptResponseDto } from '../dto/attempt-response.dto';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../../auth/services/token.service';

@Controller('attempts')
@UseGuards(AccessTokenGuard)
export class AttemptsController {
  constructor(private readonly attemptService: AttemptService) {}

  @Post()
  submit(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateAttemptDto,
  ): Promise<AttemptResponseDto> {
    return this.attemptService.submitAttempt(user.sub, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attemptService.getAttemptById(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.attemptService.getAttemptsByUserId(userId);
  }
}
