import { DataSource } from 'typeorm';
import { DatabaseEnvironment, validateEnvironment } from '@/config/environment.js';
import { createDatabaseOptions } from '@/database/database.options.js';

export default new DataSource(createDatabaseOptions(validateEnvironment(process.env, DatabaseEnvironment)));
