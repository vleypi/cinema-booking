import { type ClassConstructor, plainToInstance, Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsString, IsUrl, Max, Min, MinLength, validateSync } from 'class-validator';

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

const SECRET_MIN_LENGTH = 32;

const parseBoolean = (value: unknown, fallback: boolean): boolean => (value === undefined ? fallback : value === true || value === 'true');

export class DatabaseEnvironment {
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsUrl({ protocols: ['postgres', 'postgresql'], require_tld: false })
  DATABASE_URL: string;
}

export class EnvironmentVariables extends DatabaseEnvironment {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsUrl({ protocols: ['redis'], require_tld: false })
  REDIS_URL: string;

  @IsString()
  @MinLength(SECRET_MIN_LENGTH)
  JWT_ACCESS_SECRET: string;

  @Transform(({ obj }: { obj: Record<string, unknown> }) => parseBoolean(obj.COOKIE_SECURE, true))
  @IsBoolean()
  COOKIE_SECURE: boolean = true;

  @IsString()
  @IsNotEmpty()
  MEDIA_DIR: string = 'storage/media';
}

export const validateEnvironment = <T extends object>(config: Record<string, unknown>, environmentClass: ClassConstructor<T>): T => {
  const environment = plainToInstance(environmentClass, config, { enableImplicitConversion: true });
  const errors = validateSync(environment);

  if (errors.length > 0) {
    const details = errors.map((error) => `${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`);
    throw new Error(`Неверные переменные окружения:\n${details.join('\n')}`);
  }

  return environment;
};
