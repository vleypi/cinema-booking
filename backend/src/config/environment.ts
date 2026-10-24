import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsUrl, Max, Min, validateSync } from 'class-validator';

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsUrl({ protocols: ['postgres', 'postgresql'], require_tld: false })
  DATABASE_URL: string;
}

export const validateEnvironment = (config: Record<string, unknown>): EnvironmentVariables => {
  const environment = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(environment);

  if (errors.length > 0) {
    const details = errors.map((error) => `${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`);
    throw new Error(`Неверные переменные окружения:\n${details.join('\n')}`);
  }

  return environment;
};
