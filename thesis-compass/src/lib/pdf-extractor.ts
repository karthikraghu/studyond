/**
 * PDF Text Extraction — Extracts text from PDF files using pdfjs-dist
 * Server-side only - do not import this in frontend code!
 */

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

/**
 * Extract text from a PDF buffer
 * @param buffer - PDF file as Buffer or Uint8Array
 * @returns Extracted text content
 */
export async function extractPdfText(buffer: Buffer | Uint8Array): Promise<string> {
  // Convert Buffer to a clean Uint8Array
  // pdfjs-dist requires a true Uint8Array, not a Node Buffer subclass
  let uint8: Uint8Array;
  if (Buffer.isBuffer(buffer)) {
    uint8 = new Uint8Array(buffer);
  } else {
    uint8 = buffer;
  }
  
  // Use legacy build which doesn't require worker in Node.js
  const doc = await getDocument({ 
    data: uint8,
    useSystemFonts: true,
    disableFontFace: true,
    standardFontDataUrl: undefined,
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise;
  
  let text = '';
  
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    
    const pageText = content.items
      .filter((item): item is TextItem => 'str' in item)
      .map(item => item.str)
      .join(' ');
    
    text += pageText + '\n';
  }
  
  return text.trim();
}

/**
 * Extract text from a plain text or markdown file
 * @param buffer - File as Buffer
 * @returns Text content
 */
export function extractTextFile(buffer: Buffer): string {
  return buffer.toString('utf-8').trim();
}

/**
 * Extract text from any supported file type
 * @param buffer - File content as Buffer
 * @param extension - File extension (e.g., '.pdf', '.txt', '.md')
 * @returns Extracted text content
 */
export async function extractText(buffer: Buffer, extension: string): Promise<string> {
  const ext = extension.toLowerCase();
  
  switch (ext) {
    case '.pdf':
      return extractPdfText(buffer);
    case '.txt':
    case '.md':
      return extractTextFile(buffer);
    default:
      throw new Error(`Unsupported file type: ${ext}. Accepted: .pdf, .txt, .md`);
  }
}

/**
 * Maximum text length to process (50,000 characters)
 */
export const MAX_TEXT_LENGTH = 50_000;

/**
 * Maximum file size (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Truncate text to maximum length if needed
 */
export function truncateText(text: string, maxLength: number = MAX_TEXT_LENGTH): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength);
}
