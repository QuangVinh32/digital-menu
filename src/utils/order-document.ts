import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'

export type OrderDocumentLine = {
  number: number
  name: string
  quantity: number
  unitPrice: string
  lineTotal: string
}

export type OrderDocumentData = {
  storeName: string
  receiptTitle: string
  date: string
  itemNumberLabel: string
  itemNameLabel: string
  quantityLabel: string
  unitPriceLabel: string
  lineTotalLabel: string
  totalLabel: string
  total: string
  paymentTitle: string
  scanToPay: string
  ownerName: string
  ownerAddress: string
  zalo: string
  items: OrderDocumentLine[]
}

export async function fillOrderDocumentTemplate(data: OrderDocumentData): Promise<Blob> {
  const response = await fetch('/receipt-template.docx')
  if (!response.ok) {
    throw new Error(`Unable to load DOCX template (${response.status})`)
  }

  const template = await response.arrayBuffer()
  const zip = new PizZip(template)
  const document = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })
  document.render(data)

  return document.toBlob()
}

export async function printOrderDocumentAsPdf(
  data: OrderDocumentData,
  printWindow: Window,
  fileName: string,
): Promise<void> {
  const [documentBlob, { renderAsync }] = await Promise.all([
    fillOrderDocumentTemplate(data),
    import('docx-preview'),
  ])
  const printDocument = printWindow.document
  printDocument.open()
  printDocument.write(`<!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8">
        <title>${fileName}</title>
        <style>
          @page { size: 80mm 150mm; margin: 0; }
          html, body { margin: 0; padding: 0; background: #fff; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .docx { margin: 0 auto !important; box-shadow: none !important; }
          @media print {
            html, body { width: 80mm; margin: 0 !important; padding: 0 !important; }
            .docx { margin: 0 auto !important; }
          }
        </style>
      </head>
      <body><main id="docx-content"></main></body>
    </html>`)
  printDocument.close()
  const content = printDocument.getElementById('docx-content')
  if (!content) {
    throw new Error('Could not create the DOCX print document')
  }
  await renderAsync(documentBlob, content, printDocument.head, {
    inWrapper: false,
    breakPages: true,
    useBase64URL: true,
  })
  await printDocument.fonts.ready
  printWindow.addEventListener('afterprint', () => {
    printWindow.frameElement?.remove()
  }, { once: true })
  printWindow.focus()
  printWindow.print()
}
