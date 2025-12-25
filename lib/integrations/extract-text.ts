import fs from "fs/promises";
import * as path from "path";
import { isBinaryFile } from "isbinaryfile";
import * as chardet from "jschardet";
import iconv from "iconv-lite";
import mammoth from "mammoth";
import ExcelJS from "exceljs";

/**
 * Detect file encoding automatically
 */
export async function detectEncoding(
  fileBuffer: Buffer,
  fileExtension?: string
): Promise<string> {
  const detected = chardet.detect(fileBuffer);
  
  if (typeof detected === "string") {
    return detected;
  } else if (detected && (detected as any).encoding) {
    return (detected as any).encoding;
  } else {
    // Check if binary
    if (fileExtension) {
      const isBinary = await isBinaryFile(fileBuffer).catch(() => false);
      if (isBinary) {
        throw new Error(`Cannot read text for file type: ${fileExtension}`);
      }
    }
    return "utf8";
  }
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(filePath: string): Promise<string> {
  // Dynamically import pdf-parse to avoid Next.js bundling issues
  const pdfParse = await import("pdf-parse");
  // @ts-expect-error - pdf-parse has ESM/CJS compatibility issues
  const pdf = pdfParse.default || pdfParse;
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

/**
 * Extract text from Jupyter Notebook
 */
async function extractTextFromIPYNB(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  const encoding = await detectEncoding(fileBuffer);
  const data = iconv.decode(fileBuffer, encoding);
  const notebook = JSON.parse(data);
  let extractedText = "";

  for (const cell of notebook.cells) {
    if ((cell.cell_type === "markdown" || cell.cell_type === "code") && cell.source) {
      extractedText += cell.source.join("\n") + "\n";
    }
  }

  return extractedText;
}

/**
 * Format Excel cell value
 */
function formatCellValue(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value === null || value === undefined) {
    return "";
  }

  // Handle error values
  if (typeof value === "object" && "error" in value) {
    return `[Error: ${value.error}]`;
  }

  // Handle dates
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  // Handle rich text
  if (typeof value === "object" && "richText" in value) {
    return value.richText.map((rt: any) => rt.text).join("");
  }

  // Handle hyperlinks
  if (typeof value === "object" && "text" in value && "hyperlink" in value) {
    return `${value.text} (${value.hyperlink})`;
  }

  // Handle formulas
  if (typeof value === "object" && "formula" in value) {
    if ("result" in value && value.result !== undefined && value.result !== null) {
      return value.result.toString();
    }
    return `[Formula: ${value.formula}]`;
  }

  return value.toString();
}

/**
 * Extract text from Excel file
 */
async function extractTextFromExcel(filePath: string): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  let excelText = "";

  try {
    await workbook.xlsx.readFile(filePath);

    workbook.eachSheet((worksheet, _sheetId) => {
      // Skip hidden sheets
      if (worksheet.state === "hidden" || worksheet.state === "veryHidden") {
        return;
      }

      excelText += `--- Sheet: ${worksheet.name} ---\n`;

      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        // Limit for very large sheets
        if (rowNumber > 50000) {
          excelText += `[... truncated at row ${rowNumber} ...]\n`;
          return false;
        }

        const rowTexts: string[] = [];
        let hasContent = false;

        row.eachCell({ includeEmpty: true }, (cell, _colNumber) => {
          const cellText = formatCellValue(cell);
          if (cellText.trim()) {
            hasContent = true;
          }
          rowTexts.push(cellText);
        });

        if (hasContent) {
          excelText += rowTexts.join("\t") + "\n";
        }

        return true;
      });

      excelText += "\n";
    });

    return excelText.trim();
  } catch (error: any) {
    console.error(`Error extracting text from Excel ${filePath}:`, error);
    throw new Error(`Failed to extract text from Excel: ${error.message}`);
  }
}

/**
 * Main function to extract text from any supported file type
 * Implements Cline's 20MB file size limit
 */
export async function extractTextFromFile(filePath: string): Promise<string> {
  try {
    await fs.access(filePath);
  } catch (_error) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileExtension = path.extname(filePath).toLowerCase();

  // Handle special file formats
  switch (fileExtension) {
    case ".pdf":
      return extractTextFromPDF(filePath);
    case ".docx":
      return extractTextFromDOCX(filePath);
    case ".ipynb":
      return extractTextFromIPYNB(filePath);
    case ".xlsx":
      return extractTextFromExcel(filePath);
    default:
      // Handle regular text files with size limit
      const fileBuffer = await fs.readFile(filePath);
      
      // 20MB limit (like Cline) - decimal MB
      if (fileBuffer.byteLength > 20 * 1000 * 1024) {
        throw new Error(`File is too large to read into context (max: 20MB).`);
      }
      
      const encoding = await detectEncoding(fileBuffer, fileExtension);
      return iconv.decode(fileBuffer, encoding);
  }
}
