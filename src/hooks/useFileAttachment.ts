"use client";

import { useState, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════
 * Types
 * ═══════════════════════════════════════════ */

export interface AttachedFile {
  id: string;
  name: string;
  type: "pdf" | "word" | "image" | "text";
  /** Extracted text content (for PDF, Word, text files) */
  textContent: string;
  /** Data URL for image preview */
  previewUrl?: string;
  /** Original file size in bytes */
  size: number;
}

type FileType = "pdf" | "word" | "image" | "text";

/* ═══════════════════════════════════════════
 * File Type Detection
 * ═══════════════════════════════════════════ */

function detectFileType(file: File): FileType | null {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const mime = file.type.toLowerCase();

  // PDF
  if (ext === "pdf" || mime === "application/pdf") return "pdf";

  // Word
  if (
    ext === "docx" || ext === "doc" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword"
  ) return "word";

  // Images
  if (
    ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext) ||
    mime.startsWith("image/")
  ) return "image";

  // Text-based
  if (
    ["txt", "md", "csv", "json", "xml", "html", "htm", "css", "js", "ts",
     "tsx", "jsx", "py", "java", "c", "cpp", "h", "yml", "yaml", "toml",
     "ini", "cfg", "log", "sql", "sh", "bat", "ps1", "env"].includes(ext) ||
    mime.startsWith("text/")
  ) return "text";

  return null;
}

/* ═══════════════════════════════════════════
 * File Readers
 * ═══════════════════════════════════════════ */

async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Error leyendo archivo de texto"));
    reader.readAsText(file);
  });
}

async function readPdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // pdfjs-dist v5 — dynamic import with worker disabled
    // Worker is disabled to avoid CSP/bundling issues in Next.js client
    const pdfjsLib = await import("pdfjs-dist");

    // Disable worker — run parsing on main thread (fine for typical doc sizes)
    pdfjsLib.GlobalWorkerOptions.workerSrc = "";

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;

    if (totalPages === 0) {
      return "(PDF vacío — sin páginas)";
    }

    const textParts: string[] = [];
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const strings = content.items.map((item: any) => {
        if ("str" in item) return item.str;
        return "";
      });
      const pageText = strings.join(" ").trim();
      if (pageText) {
        textParts.push(`--- Página ${i} de ${totalPages} ---\n${pageText}`);
      }
    }

    if (textParts.length === 0) {
      return "(PDF sin texto extraíble — puede contener solo imágenes escaneadas)";
    }

    return textParts.join("\n\n");
  } catch (err) {
    console.error("[Aeon] PDF read error:", err);
    // Fallback: try reading as raw text (some simple PDFs have embedded text)
    try {
      const text = await file.text();
      // Extract readable strings from raw PDF data
      const readable = text
        .split(/[^\x20-\x7E\xC0-\xFF]+/)
        .filter((s) => s.length > 3)
        .join(" ")
        .slice(0, 8000);
      if (readable.length > 50) {
        return `(Extracción parcial del PDF)\n${readable}`;
      }
    } catch { /* ignore fallback error */ }
    return "(Error al extraer texto del PDF — intenta con otro archivo)";
  }
}

async function readWordFile(file: File): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || "(Documento Word vacío)";
  } catch {
    return "(Error al extraer texto del documento Word)";
  }
}

async function readImageFile(file: File): Promise<{ text: string; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      resolve({
        text: `[Imagen adjunta: ${file.name}, ${formatSize(file.size)}]`,
        previewUrl: url,
      });
    };
    reader.onerror = () => reject(new Error("Error leyendo imagen"));
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ═══════════════════════════════════════════
 * Main Hook
 * ═══════════════════════════════════════════ */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function useFileAttachment() {
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File): Promise<AttachedFile | null> => {
    const fileType = detectFileType(file);
    if (!fileType) {
      setError(`Tipo de archivo no soportado: ${file.name}`);
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`Archivo demasiado grande (máx 10 MB): ${file.name}`);
      return null;
    }

    const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    let textContent = "";
    let previewUrl: string | undefined;

    switch (fileType) {
      case "text":
        textContent = await readTextFile(file);
        break;
      case "pdf":
        textContent = await readPdfFile(file);
        break;
      case "word":
        textContent = await readWordFile(file);
        break;
      case "image": {
        const result = await readImageFile(file);
        textContent = result.text;
        previewUrl = result.previewUrl;
        break;
      }
    }

    return { id, name: file.name, type: fileType, textContent, previewUrl, size: file.size };
  }, []);

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    setIsProcessing(true);
    setError(null);

    const newFiles: AttachedFile[] = [];
    for (const file of Array.from(fileList)) {
      try {
        const processed = await processFile(file);
        if (processed) newFiles.push(processed);
      } catch {
        setError(`Error procesando: ${file.name}`);
      }
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
    setIsProcessing(false);
  }, [processFile]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  /**
   * Build the context string to prepend to the user's message.
   * After sending, caller should call clearFiles().
   */
  const buildFileContext = useCallback((): string => {
    if (files.length === 0) return "";

    const parts = files.map((f) => {
      const label = f.type === "image"
        ? `📷 Imagen: ${f.name}`
        : f.type === "pdf"
          ? `📄 PDF: ${f.name}`
          : f.type === "word"
            ? `📝 Word: ${f.name}`
            : `📎 Archivo: ${f.name}`;

      return `${label}\n${f.textContent}`;
    });

    return `[Archivos adjuntos]\n${parts.join("\n\n")}\n\n[Mensaje del usuario]\n`;
  }, [files]);

  const openFilePicker = useCallback((accept?: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept || "*/*";
      fileInputRef.current.click();
    }
  }, []);

  return {
    files,
    isProcessing,
    error,
    fileInputRef,
    addFiles,
    removeFile,
    clearFiles,
    buildFileContext,
    openFilePicker,
    formatSize,
  };
}
