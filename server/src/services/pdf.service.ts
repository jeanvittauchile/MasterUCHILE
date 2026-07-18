import PDFDocument from 'pdfkit';
import type { Response } from 'express';

const NAVY = '#0A1F5C';
const RED = '#DA1E28';
const GREY = '#6B7599';

function startPdf(res: Response, filename: string) {
  const doc = new PDFDocument({ margin: 48 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);
  return doc;
}

function header(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
  doc.fillColor(NAVY).fontSize(20).text('Natación Máster · U. de Chile', { continued: false });
  doc.moveDown(0.2);
  doc.fillColor(RED).fontSize(16).text(title);
  doc.fillColor(GREY).fontSize(10).text(subtitle);
  doc.moveDown(1);
  doc.strokeColor('#DBE1F0').moveTo(48, doc.y).lineTo(547, doc.y).stroke();
  doc.moveDown(1);
}

export interface TournamentReportData {
  nombre: string;
  fecha: string | null;
  lugar: string | null;
  totalParticipants: number;
  totalEntries: number;
  participants: { nombre: string; categoria: string | null; pruebas: string[] }[];
}

/** Reporte por torneo. No incluye RUT ni datos de salud — solo nombre/categoría/pruebas (dato público). */
export function generateTournamentReportPdf(res: Response, data: TournamentReportData) {
  const doc = startPdf(res, `reporte-${data.nombre.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  header(doc, data.nombre, `${data.fecha ?? ''} · ${data.lugar ?? ''}`);

  doc.fillColor(NAVY).fontSize(12).text(`Participantes inscritos: ${data.totalParticipants}`);
  doc.text(`Inscripciones a pruebas: ${data.totalEntries}`);
  doc.moveDown(1);

  doc.fontSize(13).fillColor(NAVY).text('Lista de participantes', { underline: true });
  doc.moveDown(0.5);
  data.participants.forEach((p) => {
    doc
      .fontSize(11)
      .fillColor('#1c2333')
      .text(`${p.nombre}  ·  ${p.categoria ?? '—'}  ·  ${p.pruebas.join(', ') || 'Sin pruebas'}`);
  });

  doc.end();
}

export interface GeneralReportData {
  totalTournaments: number;
  totalEntries: number;
  bySwimmer: { nombre: string; count: number }[];
}

export function generateGeneralReportPdf(res: Response, data: GeneralReportData) {
  const doc = startPdf(res, 'reporte-general-torneos.pdf');
  header(doc, 'Reporte general de torneos', 'Participación acumulada del equipo');

  doc.fillColor(NAVY).fontSize(12).text(`Torneos a la fecha: ${data.totalTournaments}`);
  doc.text(`Participaciones totales: ${data.totalEntries}`);
  doc.moveDown(1);

  doc.fontSize(13).fillColor(NAVY).text('Torneos por nadador', { underline: true });
  doc.moveDown(0.5);
  data.bySwimmer
    .sort((a, b) => b.count - a.count)
    .forEach((row) => {
      doc.fontSize(11).fillColor('#1c2333').text(`${row.nombre}  ·  ${row.count} torneo(s)`);
    });

  doc.end();
}
