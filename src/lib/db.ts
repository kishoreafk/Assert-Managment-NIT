import mysql, { type Pool } from 'mysql2/promise';

declare global {
  var __mysqlPool: Pool | undefined;
}

const pool =
  globalThis.__mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

globalThis.__mysqlPool = pool;

export default pool;