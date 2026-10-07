# React + TypeScript + Vite + Tailwind CSS

## Requirements

- Node.js 20+ recommended
- npm

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

## Languages

The menu interface is available in Vietnamese, English, and Japanese. Use the language selector in the header; Vietnamese is selected by default.

The receipt dialog can fill the DOCX template at `public/receipt-template.docx` directly in the browser. The template uses `{storeName}`, `{date}`, `{total}` and an `{#items}` / `{/items}` row loop. Download the blank template from the receipt dialog to edit it in Word. Recreate it after changing the source template generator with `npm run create:receipt-template`. The “Export PDF from DOCX” button renders the filled DOCX in the browser and opens the print dialog; choose “Save as PDF” to download the PDF without a backend.

## Production build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```
