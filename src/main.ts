import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

function isAllowedOrigin(
  origin: string,
  allowedOrigins: string[],
): boolean {
  for (const allowed of allowedOrigins) {
    if (allowed === origin) {
      return true;
    }
    const wildcardIndex = allowed.indexOf('*.');
    if (wildcardIndex === -1) {
      continue;
    }
    const prefix = allowed.slice(0, wildcardIndex);
    const suffix = allowed.slice(wildcardIndex + 1);
    if (origin.startsWith(prefix) && origin.endsWith(suffix)) {
      return true;
    }
  }
  return false;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableShutdownHooks();

  const allowedOrigins = [
    ...DEFAULT_ALLOWED_ORIGINS,
    ...(config.get<string>('CORS_ORIGIN') ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  ];

  app.use(helmet());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin, allowedOrigins)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
