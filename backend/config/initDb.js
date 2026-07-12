const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

function connectionConfig() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      isHosted: true,
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      multipleStatements: true
    };
  }
  return {
    isHosted: false,
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };
}

async function columnExists(connection, database, table, column) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [database, table, column]
  );
  return rows[0].cnt > 0;
}

async function migrate(connection, database) {
  if (!(await columnExists(connection, database, 'lessons', 'playground_langs'))) {
    console.log('Migrating: adding lessons.playground_langs column...');
    await connection.query(
      `ALTER TABLE lessons ADD COLUMN playground_langs JSON DEFAULT (JSON_ARRAY('html', 'css', 'js'))`
    );
  }
}

async function init() {
  const config = connectionConfig();
  const rawSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  let database;
  let connection;

  if (config.isHosted) {
    database = config.database;
    connection = await mysql.createConnection({ ...config, database });
    const tableSql = rawSql
      .replace(/CREATE DATABASE[^;]+;/i, '')
      .replace(/USE\s+\w+;/i, '');
    console.log(`Running schema against hosted database "${database}"...`);
    await connection.query(tableSql);
  } else {
    database = process.env.DB_NAME || 'learnhub';
    connection = await mysql.createConnection(config);
    console.log('Running schema.sql against local MySQL...');
    await connection.query(rawSql);
    await connection.query(`USE ${database}`);
  }

  await migrate(connection, database);

  console.log(`Database "${database}" is up to date.`);
  await connection.end();
}

init().catch((err) => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});
