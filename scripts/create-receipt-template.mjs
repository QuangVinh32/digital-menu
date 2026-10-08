import { readFile, writeFile } from 'node:fs/promises'
import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'

const border = { style: BorderStyle.SINGLE, size: 1, color: 'DDE3D5' }
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const cardBorder = { style: BorderStyle.SINGLE, size: 8, color: 'AAB99A' }

function textCell(text, width, { bold = false, align = AlignmentType.LEFT } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 90, bottom: 90, left: 55, right: 55 },
    borders: { top: border, bottom: border, left: noBorder, right: noBorder },
    children: [
      new Paragraph({
        alignment: align,
        children: [new TextRun({ text, bold, size: 16, color: '30382B' })],
      }),
    ],
  })
}

const itemWidths = [260, 1370, 400, 950, 950]
const itemTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  columnWidths: itemWidths,
  borders: {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
    insideHorizontal: border,
    insideVertical: noBorder,
  },
  rows: [
    new TableRow({
      tableHeader: true,
      children: [
        textCell('{itemNumberLabel}', itemWidths[0], { bold: true }),
        textCell('{itemNameLabel}', itemWidths[1], { bold: true }),
        textCell('{quantityLabel}', itemWidths[2], { bold: true, align: AlignmentType.CENTER }),
        textCell('{unitPriceLabel}', itemWidths[3], { bold: true, align: AlignmentType.RIGHT }),
        textCell('{lineTotalLabel}', itemWidths[4], { bold: true, align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      cantSplit: true,
      children: [
        textCell('{#items}{number}', itemWidths[0]),
        textCell('{name}', itemWidths[1]),
        textCell('{quantity}', itemWidths[2], { align: AlignmentType.CENTER }),
        textCell('{unitPrice}', itemWidths[3], { align: AlignmentType.RIGHT }),
        textCell('{lineTotal}{/items}', itemWidths[4], { align: AlignmentType.RIGHT }),
      ],
    }),
  ],
})

const qrImage = new Uint8Array(await readFile(new URL('../public/payment-qr.png', import.meta.url)))
const paymentTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  columnWidths: [3180, 750],
  rows: [
    new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: 3180, type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 120, right: 80 },
          borders: { top: border, bottom: border, left: border, right: noBorder },
          children: [
            new Paragraph({ children: [new TextRun({ text: '{paymentTitle}', bold: true, size: 18, color: '30382B' })] }),
            new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: '{scanToPay}', size: 15, color: '60656B' })] }),
            new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: '{ownerName}', size: 15 })] }),
            new Paragraph({ children: [new TextRun({ text: '{ownerAddress}', size: 14, color: '60656B' })] }),
            new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: '{zalo}', bold: true, size: 15, color: '2457A7' })] }),
          ],
        }),
        new TableCell({
          width: { size: 750, type: WidthType.DXA },
          verticalAlign: 'center',
          margins: { top: 80, bottom: 80, left: 40, right: 80 },
          borders: { top: border, bottom: border, left: noBorder, right: border },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new ImageRun({ type: 'png', data: qrImage, transformation: { width: 48, height: 48 } })],
            }),
          ],
        }),
      ],
    }),
  ],
})

const card = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  columnWidths: [4030],
  rows: [
    new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: 4030, type: WidthType.DXA },
          margins: { top: 230, bottom: 220, left: 180, right: 180 },
          borders: { top: cardBorder, bottom: cardBorder, left: cardBorder, right: cardBorder },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 30 },
              children: [new TextRun({ text: '{storeName}', bold: true, size: 32, color: '39452F' })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
              children: [
                new TextRun({ text: '{receiptTitle}', size: 18, color: '60656B' }),
                new TextRun({ text: '   {date}', size: 15, color: '60656B' }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
              children: [new TextRun({ text: '{billCode}', bold: true, size: 16, color: '39452F' })],
            }),
            itemTable,
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { before: 100, after: 150 },
              children: [
                new TextRun({ text: '{totalLabel}:  ', size: 19, bold: true }),
                new TextRun({ text: '{total}', size: 24, bold: true, color: '39452F' }),
              ],
            }),
            paymentTable,
          ],
        }),
      ],
    }),
  ],
})

const document = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 4535, height: 8500 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      },
    },
    children: [card],
  }],
})

const template = await Packer.toBuffer(document)
await writeFile(new URL('../public/receipt-template.docx', import.meta.url), template)
