import { existsSync } from 'node:fs';
import PDFDocument from 'pdfkit';
import { formatKopecksToRubles } from '@/modules/payments/yookassa.util.js';
import { generateTicketQrPng, signTicketQrPayload } from '@/modules/tickets/ticket-qr.util.js';

export type TicketPdfFormat = 'a5' | 'a4' | 'receipt';

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

interface IPageLayout {
  size: 'A4' | 'A5' | [number, number];
  margin: number;
  titleSize: number;
  filmSize: number;
  bodySize: number;
  seatSize: number;
  codeSize: number;
  hintSize: number;
  qrSize: number;
  qrMoveDown: number;
}

const PAGE_LAYOUTS: Record<TicketPdfFormat, IPageLayout> = {
  a5: {
    size: 'A5',
    margin: 36,
    titleSize: 18,
    filmSize: 16,
    bodySize: 11,
    seatSize: 13,
    codeSize: 12,
    hintSize: 9,
    qrSize: 160,
    qrMoveDown: 11,
  },
  a4: {
    size: 'A4',
    margin: 48,
    titleSize: 22,
    filmSize: 20,
    bodySize: 13,
    seatSize: 15,
    codeSize: 14,
    hintSize: 10,
    qrSize: 200,
    qrMoveDown: 13,
  },
  receipt: {
    size: [226.77, 420],
    margin: 14,
    titleSize: 13,
    filmSize: 11,
    bodySize: 8.5,
    seatSize: 10,
    codeSize: 9.5,
    hintSize: 7.5,
    qrSize: 126,
    qrMoveDown: 10,
  },
};

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

export const buildOrderTicketsPdf = async (
  data: IOrderTicketsPdfData,
  qrSecret: string,
  format: TicketPdfFormat = 'a5',
): Promise<Buffer> => {
  const qrBuffers = await Promise.all(
    data.tickets.map((ticket) => generateTicketQrPng(signTicketQrPayload(ticket.code, qrSecret))),
  );

  const layout = PAGE_LAYOUTS[format];
  const regularFontPath = findFirstExistingPath(REGULAR_FONT_CANDIDATES);
  const boldFontPath = findFirstExistingPath(BOLD_FONT_CANDIDATES) ?? regularFontPath;
  const formattedTime = formatSessionDateTime(data.startsAt, data.cinemaTimezone);

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: layout.size, margin: layout.margin, autoFirstPage: false });
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

      doc.font(boldFont).fontSize(layout.titleSize).text('Кинотеатр «Луч»');
      doc.moveDown(0.2);
      doc.font(regularFont).fontSize(layout.hintSize).fillColor('#555555').text(`Электронный билет · Заказ ${data.orderNumber}`);

      doc.moveDown(0.6);
      doc.fillColor('#111111').font(boldFont).fontSize(layout.filmSize).text(`${data.filmTitle} (${data.format})`);
      doc.moveDown(0.5);

      doc.font(regularFont).fontSize(layout.bodySize);
      doc.text(`Кинотеатр: ${data.cinemaName}`);
      doc.text(`Адрес: ${data.cinemaAddress}`);
      doc.text(`Зал: ${data.hallName}`);
      doc.text(`Дата и время: ${formattedTime}`);
      doc.moveDown(0.35);

      doc.font(boldFont).fontSize(layout.seatSize).text(`Ряд ${ticket.row}, место ${ticket.number}`);
      doc.font(regularFont).fontSize(layout.bodySize).text(`Стоимость: ${formatKopecksToRubles(ticket.price)} ₽`);

      doc.moveDown(0.6);
      const qrX = (doc.page.width - layout.qrSize) / 2;
      doc.image(qrBuffers[index], qrX, doc.y, { width: layout.qrSize, height: layout.qrSize });
      doc.moveDown(layout.qrMoveDown);

      doc.font(boldFont).fontSize(layout.codeSize).text(`Код билета: ${ticket.code}`, { align: 'center' });
      doc.moveDown(0.25);
      doc.font(regularFont).fontSize(layout.hintSize).fillColor('#555555').text('Покажите этот QR-код контролеру на входе в зал.', { align: 'center' });
      doc.fillColor('#111111');
    });

    doc.end();
  });
};
