const PDFDocument = require('pdfkit');

/**
 * Generates an Insurance Policy Certificate and streams it directly to an Express response stream.
 * @param {Object} policyData - Hydrated policy object from Prisma (with customer data).
 * @param {Object} res - Express Response object.
 */
function generatePolicyPDF(policyData, res) {
  // Create a new PDF Document (A4 format)
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    bufferPages: true
  });

  // Set HTTP Response Headers for streaming dynamic file download
  const filename = `Policy_Certificate_${policyData.policyNumber}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Pipe PDF output stream to response
  doc.pipe(res);

  // Colors Palette
  const PRIMARY_COLOR = '#1A365D';  // Deep Navy
  const ACCENT_COLOR = '#C59B27';   // Gold
  const TEXT_DARK = '#2D3748';      // Dark Slate
  const LIGHT_BG = '#F7FAFC';       // Off-White/Grey
  const BORDER_COLOR = '#E2E8F0';   // Light Grey

  // Outer Decorative Frame
  doc.rect(20, 20, 555, 802)
     .lineWidth(2)
     .stroke(PRIMARY_COLOR);

  doc.rect(23, 23, 549, 796)
     .lineWidth(0.5)
     .stroke(ACCENT_COLOR);

  // --- HEADER SECTION ---
  doc.fillColor(PRIMARY_COLOR)
     .fontSize(22)
     .font('Helvetica-Bold')
     .text('SHIELDGUARD INSURANCE', { align: 'center' });

  doc.fillColor('#718096')
     .fontSize(9)
     .font('Helvetica')
     .text('LICENSED FINANCIAL & UNDERWRITING ENTERPRISE', { align: 'center' });

  doc.moveDown(0.5);

  // Decorative Horizontal Line
  doc.moveTo(40, doc.y)
     .lineTo(555, doc.y)
     .lineWidth(2)
     .stroke(ACCENT_COLOR);

  doc.moveDown(0.8);

  // Certificate Title & Status Badge
  doc.fillColor(ACCENT_COLOR)
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('CERTIFICATE OF INSURANCE POLICY', { align: 'center' });

  doc.moveDown(0.3);

  doc.fillColor(TEXT_DARK)
     .fontSize(10)
     .font('Helvetica-Bold')
     .text(`Policy Ref: ${policyData.policyNumber}  |  Status: `, { align: 'center', continued: true })
     .fillColor('#03543F')
     .text(`${policyData.status}`);

  doc.moveDown(1.5);

  // --- SECTION 1: INSURED DETAILS ---
  drawSectionHeader(doc, 'POLICYHOLDER & INSURED INFORMATION', PRIMARY_COLOR, ACCENT_COLOR);

  const customerBoxTop = doc.y;
  drawBoundingBox(doc, 40, customerBoxTop, 515, 85, LIGHT_BG, BORDER_COLOR);

  doc.y = customerBoxTop + 10;
  
  // Column 1
  doc.fillColor('#718096').fontSize(8).text('INSURED NAME', 50, doc.y);
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text(policyData.customer.name, 50, doc.y + 12);

  doc.fillColor('#718096').fontSize(8).text('EMAIL ADDRESS', 50, doc.y + 10);
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text(policyData.customer.email, 50, doc.y + 12);

  // Column 2
  doc.fillColor('#718096').fontSize(8).text('CUSTOMER ID', 300, customerBoxTop + 10);
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text(policyData.customer.id.substring(0, 12), 300, customerBoxTop + 22);

  doc.fillColor('#718096').fontSize(8).text('PHONE NUMBER', 300, customerBoxTop + 42);
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text(policyData.customer.phone || 'N/A', 300, customerBoxTop + 54);

  doc.y = customerBoxTop + 95;

  // --- SECTION 2: POLICY DETAILS ---
  drawSectionHeader(doc, 'POLICY TERMS & COVERAGE SCHEDULE', PRIMARY_COLOR, ACCENT_COLOR);

  const policyBoxTop = doc.y;
  drawBoundingBox(doc, 40, policyBoxTop, 515, 85, LIGHT_BG, BORDER_COLOR);

  doc.y = policyBoxTop + 10;

  // Row 1
  doc.fillColor('#718096').fontSize(8).text('POLICY TYPE', 50, doc.y);
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text(policyData.policyType, 50, doc.y + 12);

  doc.fillColor('#718096').fontSize(8).text('EFFECTIVE START DATE', 210, policyBoxTop + 10);
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text(new Date(policyData.startDate).toLocaleDateString(), 210, policyBoxTop + 22);

  doc.fillColor('#718096').fontSize(8).text('EXPIRATION DATE', 380, policyBoxTop + 10);
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text(new Date(policyData.endDate).toLocaleDateString(), 380, policyBoxTop + 22);

  // Row 2
  doc.fillColor('#718096').fontSize(8).text('PREMIUM AMOUNT', 50, policyBoxTop + 42);
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text(`$${policyData.premiumAmount.toFixed(2)} USD`, 50, policyBoxTop + 54);

  doc.fillColor('#718096').fontSize(8).text('PAYMENT FREQUENCY', 210, policyBoxTop + 42);
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text('Annual', 210, policyBoxTop + 54);

  doc.fillColor('#718096').fontSize(8).text('COVERAGE LIMIT', 380, policyBoxTop + 42);
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text('$100,000.00 USD', 380, policyBoxTop + 54);

  doc.y = policyBoxTop + 100;

  // --- SECTION 3: COVERAGE TABLE ---
  drawSectionHeader(doc, 'SUMMARY OF COVERAGE & DEDUCTIBLES', PRIMARY_COLOR, ACCENT_COLOR);

  const tableTop = doc.y;
  const col1 = 50, col2 = 280, col3 = 430;

  // Table Header
  doc.rect(40, tableTop, 515, 20).fill(PRIMARY_COLOR);
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold');
  doc.text('BENEFIT CATEGORY', col1, tableTop + 5);
  doc.text('COVERAGE LIMIT', col2, tableTop + 5);
  doc.text('DEDUCTIBLE / COPAY', col3, tableTop + 5);

  let rowY = tableTop + 20;
  const rows = [
    { cat: 'Hospitalization & Inpatient Care', limit: '100% Covered', ded: '$250 / Admission' },
    { cat: 'Outpatient & Specialist Consultations', limit: '$5,000 / Year', ded: '$20 Co-pay' },
    { cat: 'Emergency Ambulance Services', limit: 'Full Coverage', ded: '$0 Deductible' },
    { cat: 'Prescription Medication Schedule', limit: '$2,500 / Year', ded: '10% Co-insurance' }
  ];

  rows.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.rect(40, rowY, 515, 20).fill('#F8FAFC');
    }
    doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica');
    doc.text(row.cat, col1, rowY + 5);
    doc.text(row.limit, col2, rowY + 5);
    doc.text(row.ded, col3, rowY + 5);
    
    doc.moveTo(40, rowY + 20).lineTo(555, rowY + 20).lineWidth(0.5).stroke(BORDER_COLOR);
    rowY += 20;
  });

  doc.y = rowY + 30;

  // --- SECTION 4: SIGNATURES & FOOTER ---
  const sigY = doc.y;

  // Underwriter Signature Line
  doc.moveTo(60, sigY + 30).lineTo(240, sigY + 30).lineWidth(1).stroke('#A0AEC0');
  doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica-Bold').text('Authorized Underwriter Signature', 60, sigY + 35, { width: 180, align: 'center' });

  // Official Seal Stamp Box
  doc.rect(360, sigY, 150, 45).lineWidth(1).dash(3, { space: 3 }).stroke(ACCENT_COLOR);
  doc.undash();
  doc.fillColor(ACCENT_COLOR).fontSize(8).font('Helvetica-Bold').text('OFFICIAL CORPORATE SEAL', 360, sigY + 18, { width: 150, align: 'center' });

  // Disclaimers Footer
  doc.fillColor('#A0AEC0')
     .fontSize(7)
     .font('Helvetica')
     .text(
       'This certificate is issued as a matter of official record. Coverage is subject to terms, conditions, and exclusions outlined in the master policy agreement. ShieldGuard Insurance Enterprise.',
       40, 780, { width: 515, align: 'center' }
     );

  // Finalize PDF
  doc.end();
}

// Helper: Section Heading with Left Accent Bar
function drawSectionHeader(doc, text, primaryColor, accentColor) {
  const y = doc.y;
  doc.rect(40, y, 4, 14).fill(accentColor);
  doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text(text, 50, y + 2);
  doc.y = y + 22;
}

// Helper: Rounded/Rect Bounding Box
function drawBoundingBox(doc, x, y, width, height, bgColor, borderColor) {
  doc.rect(x, y, width, height).fillAndStroke(bgColor, borderColor);
}

module.exports = { generatePolicyPDF };