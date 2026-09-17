import { Module } from '@nestjs/common';

export class HealthCheckService {
  async check(
    fns: (() => Promise<Record<string, unknown>>)[],
  ): Promise<Record<string, unknown>> {
    const info: Record<string, unknown> = {};
    for (const fn of fns) {
      Object.assign(info, await fn());
    }
    return { status: 'ok', info, error: {}, details: info };
  }
}

export class PrismaHealthIndicator {
  async pingCheck(
    name: string,
  ): Promise<Record<string, unknown>> {
    return { [name]: { status: 'up' } };
  }
}

export const HealthCheck = () => {
  return (
    _target: unknown,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => descriptor ?? {};
};

const providers = [
  { provide: HealthCheckService, useClass: HealthCheckService },
  { provide: PrismaHealthIndicator, useClass: PrismaHealthIndicator },
];

@Module({ providers, exports: providers })
export class TerminusModule {}