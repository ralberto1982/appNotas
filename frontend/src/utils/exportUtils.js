import { saveAs } from 'file-saver';

export const exportToPDF = async (title, content, canvasColor = '#ffffff') => {
  const html2pdf = (await import('html2pdf.js')).default;

  const container = document.createElement('div');
  container.style.cssText = `
    padding: 48px 56px;
    font-family: 'Georgia', serif;
    font-size: 14px;
    line-height: 1.8;
    color: #1a1a2e;
    background-color: ${canvasColor};
    max-width: 780px;
  `;

  container.innerHTML = `
    <h1 style="font-size:26px;margin:0 0 8px;font-family:'Lora',Georgia,serif;
               color:#0f1117;border-bottom:2px solid #00c9a7;padding-bottom:12px;
               font-weight:700;">${title}</h1>
    <div style="margin-top:24px">${content}</div>
  `;

  document.body.appendChild(container);

  await html2pdf()
    .set({
      margin: [12, 12, 12, 12],
      filename: `${title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: canvasColor },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(container)
    .save();

  document.body.removeChild(container);
};

export const exportToWord = (title, content) => {
  const html = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: Calibri, sans-serif; font-size: 12pt; color: #1a1a2e;
               margin: 2.5cm 3cm; line-height: 1.8; }
        h1 { font-family: Georgia,serif; font-size: 22pt; color: #0f1117;
             border-bottom: 2pt solid #00c9a7; padding-bottom: 6pt; margin-bottom:16pt; }
        h2 { font-family: Georgia,serif; font-size: 16pt; margin-top:14pt; }
        h3 { font-family: Georgia,serif; font-size: 13pt; margin-top:12pt; }
        p  { margin-bottom: 8pt; }
        blockquote { border-left:3pt solid #00c9a7; padding-left:10pt;
                     color:#555; font-style:italic; margin:10pt 0; }
        code { background:#f5f5f5; padding:2pt 4pt; font-family:Courier New; font-size:10pt; }
        ul,ol { margin-left:18pt; }
        li { margin-bottom:4pt; }
        mark { background:#fffacc; padding:1pt 3pt; }
        a { color:#00c9a7; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${content}
    </body>
    </html>`;

  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  saveAs(blob, `${title}.doc`);
};
