import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { validateEnv } from './common/config/env.validation';
import { PrismaModule } from './common/database/prisma.module';
import { HealthModule } from './common/health/health.module';
import { MailModule } from './common/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { DiagnosesModule } from './modules/diagnoses/diagnoses.module';
import { DiagnosticTestsModule } from './modules/diagnostic-tests/diagnostic-tests.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { AttemptsModule } from './modules/attempts/attempts.module';
import { CasesModule } from './modules/cases/cases.module';
import { DailyCaseModule } from './modules/daily-case/daily-case.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    HealthModule,
    MailModule,
    UsersModule,
    AuthModule,
    SpecialtiesModule,
    DiagnosesModule,
    DiagnosticTestsModule,
    TreatmentsModule,
    AttemptsModule,
    CasesModule,
    DailyCaseModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
