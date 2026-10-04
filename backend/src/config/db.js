import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'mandalsetu_db';

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? false : false,
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

const connectDB = async () => {
  try {
    // 1. Auto-create database if it does not exist
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();

    // 2. Authenticate Sequelize connection
    await sequelize.authenticate();
    console.log(`MySQL Database Connected: ${dbName} on ${dbHost}:${dbPort}`);

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
