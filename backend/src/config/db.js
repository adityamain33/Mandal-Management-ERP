import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbUri = process.env.DATABASE_URL || process.env.MYSQL_URL;
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT) || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'mandalsetu_db';

const isProduction = process.env.NODE_ENV === 'production';
const enableSSL = process.env.DB_SSL === 'true' || Boolean(dbUri && !dbUri.includes('localhost'));

const sslOptions = enableSSL
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  : {};

export let sequelize;

if (dbUri) {
  sequelize = new Sequelize(dbUri, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: sslOptions,
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    dialectOptions: sslOptions,
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

const connectDB = async () => {
  try {
    // 1. Auto-create database if using individual parameters and not URI
    if (!dbUri && (dbHost === 'localhost' || dbHost === '127.0.0.1')) {
      try {
        const connection = await mysql.createConnection({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await connection.end();
      } catch (err) {
        console.warn('Auto database creation skipped:', err.message);
      }
    }

    // 2. Authenticate Sequelize connection
    await sequelize.authenticate();
    console.log(`MySQL Database Connected successfully.`);

    // Import models and initialize relationships
    const { initAssociations } = await import('../models/index.js');
    initAssociations();

    // 3. Sync tables
    await sequelize.sync({ alter: true });
    console.log('MySQL Database Tables Synchronized successfully.');
  } catch (error) {
    console.error(`MySQL Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
