import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity.{ts,js}'],
  migrationsTableName: 'migrations',
  migrations: [__dirname + '/migrations/**/*.ts'],
  ssl: { rejectUnauthorized: false },
});

// host: 'localhost',
// port: 5433,
// username: 'postgres',
// database: 'postgres',
// password: 'pass123',
