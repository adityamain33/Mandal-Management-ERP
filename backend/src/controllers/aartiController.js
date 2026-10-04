import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { Aarti, User } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage for Aarti PDFs
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'aartis');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.pdf';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `aarti_${cleanName}_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('फक्त PDF फाईल (.pdf) अपलोड करता येईल.'), false);
  }
};

export const aartiUploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
}).single('pdf');

// @desc    Get all Aarti PDFs for active mandal
// @route   GET /api/v1/aartis
// @access  Private (All Mandal Members & Admins)
export const getAartis = async (req, res, next) => {
  try {
    const mandalId = req.mandalId || req.user?.activeMandalId;
    if (!mandalId) {
      return res.status(400).json({ success: false, message: 'सक्रिय मंडळ सापडले नाही.' });
    }

    const aartis = await Aarti.findAll({
      where: { mandalId },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      count: aartis.length,
      data: aartis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload & Save new Aarti PDF for Mandal
// @route   POST /api/v1/aartis
// @access  Private (Admin / Authorized Members)
export const createAarti = async (req, res, next) => {
  try {
    const mandalId = req.mandalId || req.user?.activeMandalId;
    if (!mandalId) {
      return res.status(400).json({ success: false, message: 'सक्रिय मंडळ सापडले नाही.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'कृपया PDF फाईल निवडा.' });
    }

    const {
      title,
      category,
      categoryLabel,
      deity,
      description,
      pagesCount,
    } = req.body;

    const fileSizeFormatted = (req.file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const relativeFilePath = `/uploads/aartis/${req.file.filename}`;

    const newAarti = await Aarti.create({
      mandalId,
      uploadedById: req.user.id,
      title: title || req.file.originalname.replace('.pdf', ''),
      fileName: req.file.originalname,
      filePath: relativeFilePath,
      fileSize: fileSizeFormatted,
      category: category || 'all',
      categoryLabel: categoryLabel || 'मंडळ PDF',
      deity: deity || 'सर्व देवता',
      description: description || 'मंडळासाठी अपलोड केलेली विशेष आरती व भजन PDF पुस्तिका.',
      pagesCount: pagesCount || 'PDF',
    });

    const fullRecord = await Aarti.findByPk(newAarti.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'आरती PDF यशस्वीरित्या सेव्ह करण्यात आली. आता मंडळाच्या सर्व सदस्यांना ती दिसेल.',
      data: fullRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Aarti PDF
// @route   DELETE /api/v1/aartis/:id
// @access  Private (Admin)
export const deleteAarti = async (req, res, next) => {
  try {
    const mandalId = req.mandalId || req.user?.activeMandalId;
    const aarti = await Aarti.findOne({
      where: { id: req.params.id, mandalId },
    });

    if (!aarti) {
      return res.status(404).json({ success: false, message: 'आरती PDF सापडली नाही.' });
    }

    // Attempt to unlink file if exists
    if (aarti.filePath) {
      const fullPath = path.join(__dirname, '..', '..', aarti.filePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (e) {
          console.error('Error unlinking PDF file:', e);
        }
      }
    }

    await aarti.destroy();

    res.json({
      success: true,
      message: 'आरती PDF हटवण्यात आली.',
    });
  } catch (error) {
    next(error);
  }
};
