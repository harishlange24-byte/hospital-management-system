import { jsPDF } from 'jspdf'

export function generatePrescriptionPDF({ patientName, doctorName, diagnosis, medicines = [], advice, date }) {
  const doc = new jsPDF()
  const d = date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()

  doc.setFontSize(18)
  doc.text('MediCare HMS — Prescription', 20, 20)
  doc.setFontSize(11)
  doc.text(`Date: ${d}`, 20, 32)
  doc.text(`Patient: ${patientName || '—'}`, 20, 42)
  doc.text(`Doctor: ${doctorName || '—'}`, 20, 52)
  if (diagnosis) doc.text(`Diagnosis: ${diagnosis}`, 20, 62)

  doc.setFontSize(12)
  doc.text('Medicines:', 20, 74)
  let y = 84
  medicines.forEach((med, i) => {
    doc.setFontSize(10)
    const line = `${i + 1}. ${med.name}${med.dosage ? ` — ${med.dosage}` : ''}${med.frequency ? ` (${med.frequency})` : ''}`
    doc.text(line, 25, y)
    y += 8
  })

  if (advice) {
    y += 4
    doc.setFontSize(11)
    doc.text(`Advice: ${advice}`, 20, y)
  }

  return doc
}

export function generateInvoicePDF({ invoiceNumber, patientName, items = [], subtotal, tax, totalAmount, date }) {
  const doc = new jsPDF()
  const d = date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()

  doc.setFontSize(18)
  doc.text('MediCare HMS — Invoice', 20, 20)
  doc.setFontSize(11)
  doc.text(`Invoice #: ${invoiceNumber || '—'}`, 20, 32)
  doc.text(`Date: ${d}`, 20, 42)
  doc.text(`Patient: ${patientName || '—'}`, 20, 52)

  doc.setFontSize(12)
  doc.text('Items:', 20, 66)
  let y = 76
  items.forEach((item, i) => {
    doc.setFontSize(10)
    doc.text(
      `${i + 1}. ${item.description} x${item.quantity} — ₹${item.total}`,
      25,
      y
    )
    y += 8
  })

  y += 6
  doc.text(`Subtotal: ₹${subtotal || 0}`, 20, y)
  doc.text(`Tax: ₹${tax || 0}`, 20, y + 8)
  doc.setFontSize(12)
  doc.text(`Total: ₹${totalAmount || 0}`, 20, y + 18)

  return doc
}

export function downloadPDF(doc, filename = 'document.pdf') {
  doc.save(filename)
}
