import { useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  LockKeyhole,
  Trash2,
  Upload,
  X,
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/* =========================================================
   COMMON HELPERS
========================================================= */

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getBaseName = (name = "document") =>
  name.replace(/\.[^/.]+$/, "") || "document";

const readFileBytes = async (file) =>
  new Uint8Array(await file.arrayBuffer());

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
};

const downloadPdf = async (pdfDocument, filename) => {
  const bytes = await pdfDocument.save({ useObjectStreams: true });
  downloadBlob(
    new Blob([bytes], { type: "application/pdf" }),
    filename,
  );
};

const parsePageSelection = (input, totalPages) => {
  const selectedPages = new Set();
  const parts = input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  parts.forEach((part) => {
    if (part.includes("-")) {
      const range = part.split("-");

      if (range.length !== 2) {
        throw new Error(`Invalid page range: ${part}`);
      }

      const start = Number(range[0]);
      const end = Number(range[1]);

      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < 1 ||
        end < start ||
        end > totalPages
      ) {
        throw new Error(`Invalid page range: ${part}`);
      }

      for (let page = start; page <= end; page += 1) {
        selectedPages.add(page - 1);
      }
      return;
    }

    const page = Number(part);

    if (!Number.isInteger(page) || page < 1 || page > totalPages) {
      throw new Error(`Invalid page number: ${part}`);
    }

    selectedPages.add(page - 1);
  });

  return [...selectedPages].sort((a, b) => a - b);
};

const loadPdf = async (file) => {
  if (!file) throw new Error("Please select a PDF file first.");

  try {
    return await PDFDocument.load(await readFileBytes(file));
  } catch {
    throw new Error(
      "Could not open this PDF. It may be damaged, encrypted, or password-protected.",
    );
  }
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PDFToolWorkspace({ tool, onClose }) {
  /* ---------- File State ---------- */
  const [files, setFiles] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const inputRef = useRef(null);
  const fileSelectionId = useRef(0);

  /* ---------- Tool Settings ---------- */
  const [pageInput, setPageInput] = useState("");
  const [rotation, setRotation] = useState(90);
  const [watermark, setWatermark] = useState("CONFIDENTIAL");

  /* ---------- UI State ---------- */
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  /* ---------- Tool Detection ---------- */
  const isImageToPdf = ["JPG to PDF", "Image to PDF"].includes(tool);
  const isMerge = tool === "Merge PDF";
  const isSingleFileTool = !isImageToPdf && !isMerge;

  const needsPageInput = [
    "Split PDF",
    "Extract PDF Pages",
    "Delete PDF Pages",
    "Reorder PDF Pages",
    "Rotate PDF",
  ].includes(tool);

  const needsRotation = tool === "Rotate PDF";
  const needsWatermark = tool === "Add Watermark";

  const acceptedTypes = isImageToPdf
    ? "image/jpeg,image/png,image/webp"
    : "application/pdf,.pdf";

  const pageInputLabel = useMemo(() => {
    if (tool === "Reorder PDF Pages") {
      return "New page order (enter every page once)";
    }
    if (tool === "Rotate PDF") {
      return "Pages to rotate (leave blank to rotate all pages)";
    }
    if (tool === "Split PDF") {
      return "Pages to split into separate PDF files";
    }
    return "Pages to select (example: 1,3-5)";
  }, [tool]);

  /* =========================================================
     MESSAGE HANDLER
  ========================================================= */

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  /* =========================================================
     FILE SELECTION
  ========================================================= */

  const handleFiles = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (!selectedFiles.length) return;

    const validFiles = selectedFiles.filter((file) => {
      if (isImageToPdf) return file.type.startsWith("image/");
      return (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      );
    });

    if (!validFiles.length) {
      showMessage(
        isImageToPdf
          ? "Please select JPG, PNG, or WebP images."
          : "Please select a valid PDF file.",
        "error",
      );
      return;
    }

    if (isSingleFileTool && validFiles.length > 1) {
      showMessage("This tool accepts one PDF file at a time.", "error");
      return;
    }

    const nextFiles =
      isMerge || isImageToPdf
        ? [...files, ...validFiles]
        : [validFiles[0]];

    setFiles(nextFiles);
    setPageCount(0);
    setPageInput("");
    setMessage("");

    if (!isImageToPdf && nextFiles.length === 1) {
      const currentSelection = ++fileSelectionId.current;

      try {
        const pdf = await loadPdf(nextFiles[0]);

        if (currentSelection === fileSelectionId.current) {
          setPageCount(pdf.getPageCount());
        }
      } catch (error) {
        if (currentSelection === fileSelectionId.current) {
          showMessage(error.message, "error");
        }
      }
    }
  };

  const removeFile = async (indexToRemove) => {
    const nextFiles = files.filter((_, index) => index !== indexToRemove);

    setFiles(nextFiles);
    setPageCount(0);
    setMessage("");

    if (!isImageToPdf && nextFiles.length === 1) {
      const currentSelection = ++fileSelectionId.current;

      try {
        const pdf = await loadPdf(nextFiles[0]);

        if (currentSelection === fileSelectionId.current) {
          setPageCount(pdf.getPageCount());
        }
      } catch (error) {
        if (currentSelection === fileSelectionId.current) {
          showMessage(error.message, "error");
        }
      }
    }
  };

  const clearFiles = () => {
    fileSelectionId.current += 1;
    setFiles([]);
    setPageCount(0);
    setPageInput("");
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  /* =========================================================
     PDF OPERATIONS
  ========================================================= */

  const getSelectedPages = (totalPages, allowBlank = false) => {
    if (!pageInput.trim() && allowBlank) {
      return Array.from({ length: totalPages }, (_, index) => index);
    }

    if (!pageInput.trim()) {
      throw new Error("Please enter the page number(s).");
    }

    const pages = parsePageSelection(pageInput, totalPages);

    if (!pages.length) {
      throw new Error("Please enter valid page number(s).");
    }

    return pages;
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      throw new Error("Select at least two PDF files to merge.");
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const sourcePdf = await loadPdf(file);
      const copiedPages = await mergedPdf.copyPages(
        sourcePdf,
        sourcePdf.getPageIndices(),
      );
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    await downloadPdf(mergedPdf, "merged-document.pdf");
    showMessage("PDF files merged successfully.");
  };

  const splitPdf = async () => {
    const sourcePdf = await loadPdf(files[0]);
    const selectedPages = getSelectedPages(sourcePdf.getPageCount());

    for (const pageIndex of selectedPages) {
      const outputPdf = await PDFDocument.create();
      const [copiedPage] = await outputPdf.copyPages(sourcePdf, [pageIndex]);
      outputPdf.addPage(copiedPage);

      await downloadPdf(
        outputPdf,
        `${getBaseName(files[0].name)}-page-${pageIndex + 1}.pdf`,
      );
    }

    showMessage(
      `${selectedPages.length} separate PDF file(s) created and downloaded.`,
    );
  };

  const extractPages = async () => {
    const sourcePdf = await loadPdf(files[0]);
    const selectedPages = getSelectedPages(sourcePdf.getPageCount());
    const outputPdf = await PDFDocument.create();

    const copiedPages = await outputPdf.copyPages(sourcePdf, selectedPages);
    copiedPages.forEach((page) => outputPdf.addPage(page));

    await downloadPdf(
      outputPdf,
      `${getBaseName(files[0].name)}-extracted.pdf`,
    );
    showMessage("Selected pages extracted successfully.");
  };

  const deletePages = async () => {
    const sourcePdf = await loadPdf(files[0]);
    const selectedPages = getSelectedPages(sourcePdf.getPageCount());

    if (selectedPages.length === sourcePdf.getPageCount()) {
      throw new Error("You cannot delete every page from a PDF.");
    }

    [...selectedPages]
      .sort((a, b) => b - a)
      .forEach((pageIndex) => sourcePdf.removePage(pageIndex));

    await downloadPdf(
      sourcePdf,
      `${getBaseName(files[0].name)}-pages-deleted.pdf`,
    );
    showMessage("Selected pages deleted successfully.");
  };

  const reorderPages = async () => {
    const sourcePdf = await loadPdf(files[0]);
    const totalPages = sourcePdf.getPageCount();
    const order = pageInput.split(",").map((value) => Number(value.trim()));

    if (
      order.length !== totalPages ||
      order.some(
        (page) =>
          !Number.isInteger(page) || page < 1 || page > totalPages,
      ) ||
      new Set(order).size !== totalPages
    ) {
      throw new Error(
        `Enter every page exactly once. Example: 2,1,3 (this PDF has ${totalPages} pages).`,
      );
    }

    const outputPdf = await PDFDocument.create();
    const copiedPages = await outputPdf.copyPages(
      sourcePdf,
      order.map((page) => page - 1),
    );

    copiedPages.forEach((page) => outputPdf.addPage(page));

    await downloadPdf(
      outputPdf,
      `${getBaseName(files[0].name)}-reordered.pdf`,
    );
    showMessage("PDF pages reordered successfully.");
  };

  const rotatePdf = async () => {
    const sourcePdf = await loadPdf(files[0]);
    const selectedPages = getSelectedPages(
      sourcePdf.getPageCount(),
      true,
    );

    selectedPages.forEach((pageIndex) => {
      const page = sourcePdf.getPage(pageIndex);
      const currentAngle = page.getRotation().angle;
      page.setRotation(degrees((currentAngle + rotation) % 360));
    });

    await downloadPdf(
      sourcePdf,
      `${getBaseName(files[0].name)}-rotated.pdf`,
    );
    showMessage("PDF rotation applied successfully.");
  };

  const addWatermark = async () => {
    const sourcePdf = await loadPdf(files[0]);

    if (!watermark.trim()) {
      throw new Error("Please enter watermark text.");
    }

    const font = await sourcePdf.embedFont(StandardFonts.HelveticaBold);

    sourcePdf.getPages().forEach((page) => {
      const { width, height } = page.getSize();
      const fontSize = Math.max(22, Math.min(width, height) * 0.065);
      const textWidth = font.widthOfTextAtSize(watermark.trim(), fontSize);

      page.drawText(watermark.trim(), {
        x: Math.max(12, (width - textWidth) / 2),
        y: height / 2,
        size: fontSize,
        font,
        color: rgb(0.78, 0.78, 0.78),
        rotate: degrees(-35),
      });
    });

    await downloadPdf(
      sourcePdf,
      `${getBaseName(files[0].name)}-watermarked.pdf`,
    );
    showMessage("Watermark added successfully.");
  };

  const addPageNumbers = async () => {
    const sourcePdf = await loadPdf(files[0]);
    const font = await sourcePdf.embedFont(StandardFonts.Helvetica);

    sourcePdf.getPages().forEach((page, index) => {
      const { width } = page.getSize();
      const label = `${index + 1}`;
      const fontSize = 10;
      const labelWidth = font.widthOfTextAtSize(label, fontSize);

      page.drawText(label, {
        x: (width - labelWidth) / 2,
        y: 18,
        size: fontSize,
        font,
        color: rgb(0.25, 0.25, 0.25),
      });
    });

    await downloadPdf(
      sourcePdf,
      `${getBaseName(files[0].name)}-numbered.pdf`,
    );
    showMessage("Page numbers added successfully.");
  };

  /* =========================================================
     PDF TO IMAGE
  ========================================================= */

  const convertPdfToImages = async () => {
    const data = await readFileBytes(files[0]);
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    const isPng = tool === "PDF to PNG";
    const mimeType = isPng ? "image/png" : "image/jpeg";
    const extension = isPng ? "png" : "jpg";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Your browser does not support canvas rendering.");
      }

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      await page.render({ canvasContext: context, viewport }).promise;

      const blob = await new Promise((resolve) => {
        canvas.toBlob(
          resolve,
          mimeType,
          isPng ? undefined : 0.92,
        );
      });

      canvas.width = 0;
      canvas.height = 0;

      if (!blob) {
        throw new Error(`Could not convert PDF page ${pageNumber}.`);
      }

      downloadBlob(
        blob,
        `${getBaseName(files[0].name)}-page-${pageNumber}.${extension}`,
      );
    }

    await pdf.destroy();
    showMessage(`${pdf.numPages} page image(s) downloaded.`);
  };

  /* =========================================================
     IMAGE TO PDF
  ========================================================= */

  const convertImagesToPdf = async () => {
    const outputPdf = await PDFDocument.create();

    for (const file of files) {
      const bytes = await readFileBytes(file);
      let embeddedImage;

      if (file.type === "image/png") {
        embeddedImage = await outputPdf.embedPng(bytes);
      } else if (file.type === "image/jpeg") {
        embeddedImage = await outputPdf.embedJpg(bytes);
      } else {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;

        const context = canvas.getContext("2d");

        if (!context) {
          bitmap.close();
          throw new Error("Your browser does not support canvas.");
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bitmap, 0, 0);
        bitmap.close();

        const jpegBlob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/jpeg", 0.92);
        });

        canvas.width = 0;
        canvas.height = 0;

        if (!jpegBlob) {
          throw new Error(`Could not process image: ${file.name}`);
        }

        embeddedImage = await outputPdf.embedJpg(
          await readFileBytes(jpegBlob),
        );
      }

      const page = outputPdf.addPage([595.28, 841.89]);
      const margin = 28;
      const maxWidth = page.getWidth() - margin * 2;
      const maxHeight = page.getHeight() - margin * 2;
      const scale = Math.min(
        maxWidth / embeddedImage.width,
        maxHeight / embeddedImage.height,
      );

      const width = embeddedImage.width * scale;
      const height = embeddedImage.height * scale;

      page.drawImage(embeddedImage, {
        x: (page.getWidth() - width) / 2,
        y: (page.getHeight() - height) / 2,
        width,
        height,
      });
    }

    await downloadPdf(outputPdf, "images-to-pdf.pdf");
    showMessage(`${files.length} image(s) converted into one PDF.`);
  };

  /* =========================================================
     PDF OPTIMIZATION
  ========================================================= */

  const optimizePdf = async () => {
    const sourcePdf = await loadPdf(files[0]);
    const originalSize = files[0].size;
    const bytes = await sourcePdf.save({ useObjectStreams: true });

    downloadBlob(
      new Blob([bytes], { type: "application/pdf" }),
      `${getBaseName(files[0].name)}-optimized.pdf`,
    );

    const change = originalSize
      ? ((originalSize - bytes.length) / originalSize) * 100
      : 0;

    showMessage(
      `PDF re-saved. Size change: ${change.toFixed(1)}%. This does not guarantee smaller file size because embedded images are not recompressed.`,
    );
  };

  /* =========================================================
     MAIN PROCESS HANDLER
  ========================================================= */

  const handleProcess = async () => {
    if (!files.length) {
      showMessage(
        isImageToPdf ? "Please select image files first." : "Please select a PDF file first.",
        "error",
      );
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      switch (tool) {
        case "Merge PDF":
          await mergePdfs();
          break;

        case "Split PDF":
          await splitPdf();
          break;

        case "Extract PDF Pages":
          await extractPages();
          break;

        case "Delete PDF Pages":
          await deletePages();
          break;

        case "Reorder PDF Pages":
          await reorderPages();
          break;

        case "Rotate PDF":
          await rotatePdf();
          break;

        case "Add Watermark":
          await addWatermark();
          break;

        case "Add Page Numbers":
          await addPageNumbers();
          break;

        case "PDF to JPG":
        case "PDF to PNG":
          await convertPdfToImages();
          break;

        case "JPG to PDF":
        case "Image to PDF":
          await convertImagesToPdf();
          break;

        case "Compress PDF":
        case "PDF Size Reducer":
          await optimizePdf();
          break;

        case "Protect PDF":
        case "Unlock PDF":
          throw new Error(
            "Password protection/removal is not implemented in this browser version. No output file was created.",
          );

        default:
          throw new Error("This PDF tool is not connected yet.");
      }
    } catch (error) {
      showMessage(error?.message || "PDF processing failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      fileSelectionId.current += 1;
    };
  }, []);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="tool-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose?.();
        }
      }}
    >
      <section
        className="tool-workspace"
        role="dialog"
        aria-modal="true"
        aria-label={tool || "PDF Tool"}
      >
        {/* ---------- Header ---------- */}
        <header className="tool-workspace-header">
          <div>
            <span className="tool-workspace-kicker">PDF WORKSPACE</span>
            <h2>{tool}</h2>
          </div>

          <button
            type="button"
            className="tool-close-button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close PDF tool"
          >
            <X />
          </button>
        </header>

        {/* ---------- Workspace Body ---------- */}
        <div className="tool-workspace-body">
          <p className="tool-help-text">
            Select your file(s), configure the options, and process them.
            Files are processed locally in your browser.
          </p>

          {/* ---------- Upload ---------- */}
          <label className="tool-upload-box">
            <Upload size={30} />

            <strong>
              {files.length
                ? `${files.length} file(s) selected`
                : isImageToPdf
                  ? "Choose image file(s)"
                  : isMerge
                    ? "Choose two or more PDF files"
                    : "Choose a PDF file"}
            </strong>

            <span>
              {isImageToPdf ? "JPG, PNG, WebP supported" : "PDF format supported"}
            </span>

            <input
              ref={inputRef}
              type="file"
              accept={acceptedTypes}
              multiple={isMerge || isImageToPdf}
              onChange={handleFiles}
              disabled={busy}
            />
          </label>

          {/* ---------- Selected Files ---------- */}
          {files.length > 0 && (
            <div className="pdf-selected-files">
              {files.map((file, index) => (
                <div
                  className="pdf-file-item"
                  key={`${file.name}-${file.size}-${index}`}
                >
                  <div className="pdf-file-info">
                    {isImageToPdf ? (
                      <ImageIcon size={18} />
                    ) : (
                      <FileText size={18} />
                    )}

                    <div>
                      <strong>{file.name}</strong>
                      <small>{formatBytes(file.size)}</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={busy}
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {!isImageToPdf && pageCount > 0 && files.length === 1 && (
                <p className="tool-result">
                  Total pages: <strong>{pageCount}</strong>
                </p>
              )}

              <button
                type="button"
                className="pdf-clear-files"
                onClick={clearFiles}
                disabled={busy}
              >
                Clear selected files
              </button>
            </div>
          )}

          {/* ---------- Page Selection ---------- */}
          {needsPageInput && (
            <label className="pdf-setting-field">
              {pageInputLabel}

              <input
                type="text"
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value)}
                placeholder={
                  tool === "Reorder PDF Pages"
                    ? "Example: 2,1,3"
                    : tool === "Rotate PDF"
                      ? "Example: 1,3-5 (or leave blank)"
                      : "Example: 1,3-5"
                }
                disabled={busy}
              />

              {tool === "Reorder PDF Pages" && (
                <small>
                  Example: for a 3-page PDF, enter 2,1,3 to move page 2 first.
                </small>
              )}
            </label>
          )}

          {/* ---------- Rotation ---------- */}
          {needsRotation && (
            <label className="pdf-setting-field">
              Rotation angle

              <select
                value={rotation}
                onChange={(event) => setRotation(Number(event.target.value))}
                disabled={busy}
              >
                <option value={90}>90° clockwise</option>
                <option value={180}>180°</option>
                <option value={270}>270° clockwise</option>
              </select>
            </label>
          )}

          {/* ---------- Watermark ---------- */}
          {needsWatermark && (
            <label className="pdf-setting-field">
              Watermark text

              <input
                type="text"
                value={watermark}
                onChange={(event) => setWatermark(event.target.value)}
                maxLength={60}
                placeholder="Enter watermark text"
                disabled={busy}
              />
            </label>
          )}

          {/* ---------- Compression Notice ---------- */}
          {["Compress PDF", "PDF Size Reducer"].includes(tool) && (
            <div className="tool-notice">
              <AlertCircle size={22} />

              <div>
                <strong>Compression limitation</strong>
                <p>
                  This version re-saves the PDF and may optimize its structure.
                  It does not recompress embedded images, so the resulting file
                  may not be smaller.
                </p>
              </div>
            </div>
          )}

          {/* ---------- Password Notice ---------- */}
          {["Protect PDF", "Unlock PDF"].includes(tool) && (
            <div className="tool-notice">
              <LockKeyhole size={22} />

              <div>
                <strong>Password engine not connected</strong>
                <p>
                  PDF password protection and password removal are not
                  supported by this implementation. No fake output will be
                  generated.
                </p>
              </div>
            </div>
          )}

          {/* ---------- Process Button ---------- */}
          <button
            type="button"
            className="tool-primary-button"
            onClick={handleProcess}
            disabled={!files.length || busy}
          >
            {busy ? "Processing..." : "Process"}
          </button>

          {/* ---------- Status ---------- */}
          {message && (
            <p
              className="tool-status"
              role="status"
              data-status={messageType}
            >
              {messageType === "error" ? (
                <AlertCircle size={16} />
              ) : (
                <CheckCircle2 size={16} />
              )}
              <span>{message}</span>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
