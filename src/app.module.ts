import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/database/prisma.module';
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
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
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
  providers: [],
})
export class AppModule {}
