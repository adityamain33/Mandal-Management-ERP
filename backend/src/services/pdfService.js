import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { numberToWords } from '../utils/numberToWords.js';
import Setting from '../models/Setting.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to convert base64 image data URL to a Buffer
const getBufferFromBase64 = (base64String) => {
  if (!base64String) return null;
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return Buffer.from(matches[2], 'base64');
  }
  try {
    return Buffer.from(base64String, 'base64');
  } catch (e) {
    return null;
  }
};

export const generateReceiptPDF = (receipt, donation, donor, mandal, collectorName) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch settings for logos/signatures
      let settings = null;
      try {
        settings = await Setting.findOne({ mandalId: mandal._id || receipt.mandalId });
      } catch (err) {
        console.error('Error fetching settings for receipt PDF:', err);
      }

      // Create uploads directory if not exists
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'receipts');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `receipt_${receipt.receiptNo.replace(/\//g, '_')}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      const doc = new PDFDocument({
        size: 'A5',
        layout: 'landscape',
        margin: 30,
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Register and set Mukta font if available (supports both Latin and Devanagari)
      const fontPath = path.join(__dirname, '..', 'assets', 'fonts', 'Mukta-Regular.ttf');
      if (fs.existsSync(fontPath)) {
        doc.registerFont('Bilingual', fontPath);
        doc.font('Bilingual');
      }

      // Draw border
      doc.rect(15, 15, doc.page.width - 30, doc.page.height - 30).stroke('#6366f1');
      doc.rect(18, 18, doc.page.width - 36, doc.page.height - 36).stroke('#ea580c');

      // Draw Mandal Logo if configured
      const logoBuffer = getBufferFromBase64(settings?.mandalLogo);
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, 35, 25, { fit: [45, 45] });
        } catch (err) {
          console.error("PDF logo drawing failed:", err);
        }
      }

      // Title & Header
      doc.fillColor('#ea580c').fontSize(16).text(mandal.name, { align: 'center' });
      if (mandal.registrationDetails) {
        doc.fillColor('#4b5563').fontSize(8).text(`Reg. No: ${mandal.registrationDetails}`, { align: 'center' });
      }
      doc.fontSize(8).text(mandal.address || '', { align: 'center' });
      doc.moveDown(0.5);

      // Horizontal Line
      doc.moveTo(25, 80).lineTo(doc.page.width - 25, 80).stroke('#e5e7eb');

      // Receipt Title Block
      doc.fillColor('#6366f1').fontSize(12).text('DONATION RECEIPT (देणगी पावती)', 30, 90, { align: 'center' });

      // Receipt Metadata
      doc.fillColor('#1f2937').fontSize(10);
      doc.text(`Receipt No: ${receipt.receiptNo}`, 30, 115);
      doc.text(`Date: ${new Date(donation.createdAt).toLocaleDateString()}`, doc.page.width - 150, 115);

      // Donor details
      doc.text(`Received with thanks from:`, 30, 140);
      doc.fillColor('#ea580c').fontSize(11).text(donor.name, 180, 140);
      
      doc.fillColor('#1f2937').fontSize(10);
      doc.text(`Mobile: ${donor.mobile}`, 30, 160);
      if (donor.email) {
        doc.text(`Email: ${donor.email}`, doc.page.width - 220, 160);
      }

      doc.text(`The sum of Rupees:`, 30, 180);
      doc.fillColor('#1f2937').fontSize(10).text(numberToWords(donation.amount), 180, 180);

      doc.fillColor('#1f2937').fontSize(10);
      doc.text(`Purpose / वर्गणी:`, 30, 200);
      doc.fillColor('#ea580c').text(donation.purpose, 180, 200);

      doc.fillColor('#1f2937');
      doc.text(`Payment Mode: ${donation.paymentMode}`, 30, 220);

      // Amount Box
      doc.rect(30, 240, 150, 30).fill('#6366f1').stroke();
      doc.fillColor('#ffffff').fontSize(12).text(`Rs. ${donation.amount}/-`, 40, 248, { width: 130, align: 'center' });

      // Draw Signature if configured
      const sigBuffer = getBufferFromBase64(settings?.authorizedSignature);
      if (sigBuffer) {
        try {
          doc.image(sigBuffer, doc.page.width - 145, 212, { fit: [100, 40] });
        } catch (err) {
          console.error("PDF signature drawing failed:", err);
        }
      }

      // Signatures
      doc.fillColor('#4b5563').fontSize(9);
      doc.text(`Collector: ${collectorName}`, 30, 280);

      doc.text('Authorized Signature', doc.page.width - 150, 260);
      doc.moveTo(doc.page.width - 160, 255).lineTo(doc.page.width - 30, 255).stroke('#4b5563');
      doc.fontSize(8).text('Thank you for your generous contribution!', doc.page.width - 210, 280, { align: 'right' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
