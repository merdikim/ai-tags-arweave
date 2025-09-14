import * as pdfjsLib from "pdfjs-dist";
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import mammoth from "mammoth"; // for DOCX files

// Tell PDF.js where the worker is
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export const readDocument = async(file:File) => {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    alert("File type not allowed!");
    return;
  }

    let text = "";

  if (extension === ".pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items
        .map(item => 'str' in item ? item.str : "")
        .join(" ") + "\n";
    }
  } else if (extension === ".docx") {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    text = result.value;
  } else if (extension === ".doc") {
    alert(".doc reading in browser is very limited. You might need server-side conversion.");
  } else if (extension === ".md" || extension === ".markdown") {
    text = await file.text();
  }

  return text
}



export const allowedExtensions = [".pdf", ".doc", ".docx", ".md", ".markdown"];