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

export async function createOrderPdf(data: OrderDocumentData): Promise<Blob> {
  const [documentBlob, { renderAsync }, html2canvasModule, jspdfModule] = await Promise.all([
    fillOrderDocumentTemplate(data),
    import('docx-preview'),
    import('html2canvas'),
    import('jspdf'),
  ])
  const renderFrame = document.createElement('iframe')
  renderFrame.title = 'DOCX PDF rendering'
  renderFrame.style.cssText = 'position:fixed;left:-10000px;top:0;width:80mm;height:150mm;border:0'
  document.body.append(renderFrame)

  try {
    const renderDocument = renderFrame.contentDocument
    const renderWindow = renderFrame.contentWindow
    if (!renderDocument || !renderWindow) {
      throw new Error('Could not create an isolated DOCX rendering document')
    }

    renderDocument.open()
    renderDocument.write('<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#fff;color:#222"></body></html>')
    renderDocument.close()
    const renderHost = renderDocument.createElement('main')
    renderHost.style.cssText = 'width:80mm;background:#fff;color:#222'
    renderDocument.body.append(renderHost)

    await renderAsync(documentBlob, renderHost, renderDocument.head, {
      inWrapper: false,
      breakPages: true,
      useBase64URL: true,
    })
    await renderDocument.fonts.ready
    await Promise.all(
      Array.from(renderHost.querySelectorAll('img'), (image) => image.decode()),
    )
    const content = renderHost.firstElementChild
    if (!content || content.nodeType !== 1) {
      throw new Error('Could not render the DOCX document')
    }
    const renderedContent = content as HTMLElement

    const canvas = await html2canvasModule.default(renderedContent, {
      backgroundColor: '#ffffff',
      scale: Math.min(renderWindow.devicePixelRatio || 1, 2),
      useCORS: true,
      logging: false,
      windowWidth: renderedContent.scrollWidth,
    })
    const pageHeight = Math.max(1, (canvas.height / canvas.width) * 80)
    const pdf = new jspdfModule.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, pageHeight],
      compress: true,
    })
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', 0, 0, 80, pageHeight)
    return pdf.output('blob')
  } finally {
    renderFrame.remove()
  }
}
