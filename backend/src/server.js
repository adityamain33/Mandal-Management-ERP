import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import apiRoutes from './routes/api.js';
import { notFound, errorHandler } from './middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();

// Connect to MySQL Database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows serving static uploads easily
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static folder for file uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('MandalSetu ERP API (MySQL) is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
