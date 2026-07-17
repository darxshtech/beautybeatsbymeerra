const PDFDocument = require('pdfkit');
const cloudinary = require('../../utils/cloudinary');

/**
 * Generates an invoice PDF and uploads it to Cloudinary.
 * Returns the secure Cloudinary URL.
 */
class InvoicePdfService {
  generateInvoicePDFBuffer(bill) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header Title
        const brandName = bill.branch === 'CLINIC' ? 'BEAUTYBEATS CLINIC' : 'BEAUTYBEATS';
        doc.fillColor('#FF3B30').fontSize(24).font('Helvetica-Bold').text(brandName, { align: 'center' });
        doc.fillColor('#444444').fontSize(10).font('Helvetica').text('Premium Salon & Clinic Management', { align: 'center' }).moveDown(2);

        // Invoice metadata
        doc.fillColor('#000000').fontSize(16).font('Helvetica-Bold').text('INVOICE / RECEIPT', { underline: true });
        doc.moveDown(0.5);

        const invId = bill._id.toString().substring(0, 8).toUpperCase();
        doc.fontSize(10).font('Helvetica');
        doc.text(`Invoice ID: INV-${invId}`);
        doc.text(`Date: ${new Date(bill.createdAt || Date.now()).toLocaleDateString('en-IN')}`);
        doc.text(`Customer Name: ${bill.customer?.name || 'Happy Client'}`);
        doc.text(`Customer Phone: ${bill.customer?.phone || 'N/A'}`);
        doc.text(`Branch: ${bill.branch}`);
        doc.moveDown(1.5);

        // Table Header
        const tableTop = 200;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Item / Service', 50, tableTop);
        doc.text('Quantity', 300, tableTop);
        doc.text('Price', 400, tableTop, { align: 'right' });
        doc.text('Amount', 480, tableTop, { align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
        doc.font('Helvetica');

        let y = tableTop + 25;
        bill.items.forEach(item => {
          doc.text(item.name, 50, y, { width: 230 });
          doc.text(String(item.quantity || 1), 300, y);
          doc.text(`₹${item.price}`, 400, y, { align: 'right' });
          doc.text(`₹${item.price * (item.quantity || 1)}`, 480, y, { align: 'right' });
          y += 20;
        });

        doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
        y += 15;

        // Totals
        doc.font('Helvetica-Bold');
        doc.text('Subtotal:', 350, y);
        doc.text(`₹${bill.subtotal}`, 480, y, { align: 'right' });
        y += 15;

        if (bill.discount > 0) {
          doc.text('Discount:', 350, y);
          doc.text(`-₹${bill.discount}`, 480, y, { align: 'right' });
          y += 15;
        }

        doc.fillColor('#FF3B30');
        doc.text('Total Paid:', 350, y);
        doc.text(`₹${bill.total}`, 480, y, { align: 'right' });
        y += 20;

        doc.fillColor('#000000').font('Helvetica');
        doc.text(`Payment Method: ${bill.paymentMethod || 'CASH'}`, 50, y);

        // Footer
        doc.fontSize(8).fillColor('#888888').text(`Thank you for choosing ${brandName}! See you again soon.`, 50, doc.page.height - 50, { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  uploadPdfToCloudinary(buffer, billId) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'beauty_beats_invoices', public_id: `invoice_${billId}.pdf` },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
  }

  async generateAndUploadInvoice(bill) {
    try {
      console.log(`[INVOICE-PDF] Generating PDF for Bill ${bill._id}...`);
      const buffer = await this.generateInvoicePDFBuffer(bill);
      console.log(`[INVOICE-PDF] Uploading PDF for Bill ${bill._id} to Cloudinary...`);
      const uploadResult = await this.uploadPdfToCloudinary(buffer, bill._id);
      console.log(`[INVOICE-PDF] Uploaded successfully: ${uploadResult.secure_url}`);
      return uploadResult.secure_url;
    } catch (err) {
      console.error('[INVOICE-PDF] Failed to generate/upload invoice PDF:', err);
      throw err;
    }
  }
}

module.exports = new InvoicePdfService();
