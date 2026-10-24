import { DataSource } from 'typeorm';
import { validateEnvironment } from '@/config/environment.js';
import { createDatabaseOptions } from './database.options.js';

export default new DataSource(createDatabaseOptions(validateEnvironment(process.env)));
