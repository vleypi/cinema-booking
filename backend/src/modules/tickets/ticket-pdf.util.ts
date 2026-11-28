import { existsSync } from 'node:fs';
import PDFDocument from 'pdfkit';
import { formatKopecksToRubles } from '@/modules/payments/yookassa.util.js';
import { generateTicketQrPng, signTicketQrPayload } from '@/modules/tickets/ticket-qr.util.js';

const REGULAR_FONT_CANDIDATES = [
  '/usr/share/fonts/dejavu/DejaVuSans.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  '/System/Library/Fonts/Supplemental/Arial.ttf',
];

const BOLD_FONT_CANDIDATES = [
  '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
];

export interface ITicketPdfItem {
  code: string;
  row: number;
  number: number;
  price: number;
}

export interface IOrderTicketsPdfData {
  orderNumber: string;
  filmTitle: string;
  format: string;
  cinemaName: string;
  cinemaAddress: string;
  cinemaTimezone: string;
  hallName: string;
  startsAt: Date;
  tickets: readonly ITicketPdfItem[];
}

const findFirstExistingPath = (paths: readonly string[]): string | null => paths.find((candidate) => existsSync(candidate)) ?? null;

const formatSessionDateTime = (startsAt: Date, timeZone: string): string =>
  new Intl.DateTimeFormat('ru-RU', {
    timeZone,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(startsAt);

export const buildOrderTicketsPdf = async (data: IOrderTicketsPdfData, qrSecret: string): Promise<Buffer> => {
  const qrBuffers = await Promise.all(
    data.tickets.map((ticket) => generateTicketQrPng(signTicketQrPayload(ticket.code, qrSecret))),
  );

  const regularFontPath = findFirstExistingPath(REGULAR_FONT_CANDIDATES);
  const boldFontPath = findFirstExistingPath(BOLD_FONT_CANDIDATES) ?? regularFontPath;
  const formattedTime = formatSessionDateTime(data.startsAt, data.cinemaTimezone);

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A5', margin: 36, autoFirstPage: false });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const regularFont = regularFontPath ? 'LuchRegular' : 'Helvetica';
    const boldFont = boldFontPath ? 'LuchBold' : 'Helvetica-Bold';
    if (regularFontPath) doc.registerFont(regularFont, regularFontPath);
    if (boldFontPath) doc.registerFont(boldFont, boldFontPath);

    data.tickets.forEach((ticket, index) => {
      doc.addPage();

      doc.font(boldFont).fontSize(18).text('Кинотеатр «Луч»');
      doc.moveDown(0.2);
      doc.font(regularFont).fontSize(10).fillColor('#555555').text(`Электронный билет · Заказ ${data.orderNumber}`);

      doc.moveDown(0.8);
      doc.fillColor('#111111').font(boldFont).fontSize(16).text(`${data.filmTitle} (${data.format})`);
      doc.moveDown(0.6);

      doc.font(regularFont).fontSize(11);
      doc.text(`Кинотеатр: ${data.cinemaName}`);
      doc.text(`Адрес: ${data.cinemaAddress}`);
      doc.text(`Зал: ${data.hallName}`);
      doc.text(`Дата и время: ${formattedTime}`);
      doc.moveDown(0.4);

      doc.font(boldFont).fontSize(13).text(`Ряд ${ticket.row}, место ${ticket.number}`);
      doc.font(regularFont).fontSize(11).text(`Стоимость: ${formatKopecksToRubles(ticket.price)} ₽`);

      doc.moveDown(0.8);
      const qrSize = 160;
      const qrX = (doc.page.width - qrSize) / 2;
      doc.image(qrBuffers[index], qrX, doc.y, { width: qrSize, height: qrSize });
      doc.moveDown(11);

      doc.font(boldFont).fontSize(12).text(`Код билета: ${ticket.code}`, { align: 'center' });
      doc.moveDown(0.3);
      doc.font(regularFont).fontSize(9).fillColor('#555555').text('Покажите этот QR-код контролеру на входе в зал.', { align: 'center' });
      doc.fillColor('#111111');
    });

    doc.end();
  });
};
