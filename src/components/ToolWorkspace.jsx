import PDFToolWorkspace from "./PDFToolWorkspace";
import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  X,
  Upload,
  Download,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  RotateCw,
  Crop,
  Maximize,
  Minimize2,
  FileText,
  Copy,
  Trash2,
} from "lucide-react";


/* =========================================
   TOOL CONFIGURATION
========================================= */

const imageTools = new Set([
  "Image Size Reducer",
  "Image Resizer",
  "Image Cropper",
  "Crop Image",
  "Compress Image",
  "JPG to PNG",
  "PNG to JPG",
  "WebP Converter",
  "Image Compressor",
  "Image Rotator",
  "Rotate Image",
  "Image DPI Checker",
]);

const textTools = new Set([
  "Word Counter",
  "Character Counter",
  "Text Case Converter",
  "Remove Extra Spaces",
  "Find & Replace",
  "Word Frequency Counter",
  "Text Formatter",
]);

const pdfCreationTools = new Set([
  "JPG to PDF",
  "Image to PDF",
  "Word to PDF",
  "Text to PDF",
]);

const unsupportedTools = new Set([
  "PDF Size Reducer",
  "PDF to JPG",
  "PDF to PNG",
  "Merge PDF",
  "Split PDF",
  "Compress PDF",
  "Rotate PDF",
  "Delete PDF Pages",
  "Reorder PDF Pages",
  "Extract PDF Pages",
  "Add Watermark",
  "Add Page Numbers",
  "Protect PDF",
  "Unlock PDF",
  "PDF to Word",
  "DOC to DOCX",
  "DOCX to TXT",
  "Image Background Remover",
  "Remove Background",
  "Image to Text (OCR)",
  "QR Code Scanner",
  "Barcode Generator",
  "Passport Photo Maker",
]);

/* =========================================
   COMMON HELPERS
========================================= */

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / 1048576).toFixed(2)} MB`;
};

const getBaseName = (name = "file") => {
  return name.replace(/\.[^/.]+$/, "");
};

const escapeHtml = (value) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
};

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));

    image.src = src;
  });
};

/* =========================================
   MAIN COMPONENT
========================================= */

export default function ToolWorkspace({ tool, onClose }) {
  /* ---------- File States ---------- */

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [output, setOutput] = useState("");
  const [outputName, setOutputName] = useState("");

  /* ---------- Image Settings ---------- */

  const [quality, setQuality] = useState(0.75);
  const [maxWidth, setMaxWidth] = useState(1200);
  const [maxHeight, setMaxHeight] = useState(1200);
  const [format, setFormat] = useState("image/jpeg");
  const [rotation, setRotation] = useState(0);
  const [cropRatio, setCropRatio] = useState("free");

  /* ---------- Text States ---------- */

  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");

  /* ---------- Calculator States ---------- */

  const [birth, setBirth] = useState("");
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("10");
  const [unit, setUnit] = useState("cm");

  /* ---------- General States ---------- */

  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  /* =========================================
     TOOL TYPE DETECTION
  ========================================= */

  const isImage = imageTools.has(tool);
  const isText = textTools.has(tool);
  const isPdfCreation = pdfCreationTools.has(tool);

  const isUtility = [
    "Age Calculator",
    "Percentage Calculator",
    "File Size Converter",
    "Unit Converter",
  ].includes(tool);

  const isUnsupported = unsupportedTools.has(tool);

  /* =========================================
     TEXT STATISTICS
  ========================================= */

  const stats = useMemo(() => {
    const words = text.trim().match(/\S+/g) || [];

    return {
      words: words.length,
      chars: text.length,
      charsNoSpace: text.replace(/\s/g, "").length,
      lines: text ? text.split(/\r?\n/).length : 0,
    };
  }, [text]);

  const frequency = useMemo(() => {
    const words = text.toLowerCase().match(/[\p{L}\p{N}']+/gu) || [];

    const counts = {};

    words.forEach((word) => {
      counts[word] = (counts[word] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [text]);

  /* =========================================
     CLEANUP
  ========================================= */

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (output) URL.revokeObjectURL(output);
    };
  }, [preview, output]);

  /* =========================================
     FILE SELECTION
  ========================================= */

  const pickFile = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    if (output) URL.revokeObjectURL(output);

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setOutput("");
    setOutputName("");
    setMessage("");

    event.target.value = "";
  };

  /* =========================================
     IMAGE PROCESSING
  ========================================= */

  const processImage = async () => {
    if (!file || !preview) {
      setMessage("Please select an image first.");
      return;
    }

    const widthLimit = Number(maxWidth);
    const heightLimit = Number(maxHeight);

    if (
      !Number.isFinite(widthLimit) ||
      !Number.isFinite(heightLimit) ||
      widthLimit < 1 ||
      heightLimit < 1
    ) {
      setMessage("Please enter valid image dimensions.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const image = await loadImage(preview);

      let sourceWidth = image.naturalWidth;
      let sourceHeight = image.naturalHeight;

      let sx = 0;
      let sy = 0;
      let sw = sourceWidth;
      let sh = sourceHeight;

      /* ---------- Crop ---------- */

      if (tool === "Image Cropper" || tool === "Crop Image") {
        if (cropRatio !== "free") {
          const [ratioW, ratioH] = cropRatio.split(":").map(Number);
          const targetRatio = ratioW / ratioH;
          const imageRatio = sourceWidth / sourceHeight;

          if (imageRatio > targetRatio) {
            sw = sourceHeight * targetRatio;
            sx = (sourceWidth - sw) / 2;
          } else {
            sh = sourceWidth / targetRatio;
            sy = (sourceHeight - sh) / 2;
          }
        }
      }

      /* ---------- Resize ---------- */

      const scale = Math.min(
        1,
        widthLimit / sw,
        heightLimit / sh
      );

      let width = Math.max(1, Math.round(sw * scale));
      let height = Math.max(1, Math.round(sh * scale));

      const angle = ((rotation % 360) + 360) % 360;
      const rotated = angle === 90 || angle === 270;

      const canvas = document.createElement("canvas");

      canvas.width = rotated ? height : width;
      canvas.height = rotated ? width : height;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas is not supported by this browser.");
      }

      /* ---------- JPG Background ---------- */

      if (format === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      /* ---------- Rotation ---------- */

      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate((angle * Math.PI) / 180);

      context.drawImage(
        image,
        sx,
        sy,
        sw,
        sh,
        -width / 2,
        -height / 2,
        width,
        height
      );

      /* ---------- Export ---------- */

      const blob = await new Promise((resolve) => {
        canvas.toBlob(
          resolve,
          format,
          format === "image/png" ? undefined : Number(quality)
        );
      });

      if (!blob) {
        throw new Error("Image export failed.");
      }

      const extension = format.split("/")[1];

      const resultUrl = URL.createObjectURL(blob);

      setOutput((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return resultUrl;
      });

      setOutputName(`${getBaseName(file.name)}-processed.${extension}`);

      const reduction = file.size
        ? ((file.size - blob.size) / file.size) * 100
        : 0;

      setMessage(
        `Processing complete. Original: ${formatBytes(file.size)} | New: ${formatBytes(blob.size)} | ${reduction >= 0
          ? `${reduction.toFixed(1)}% smaller`
          : `${Math.abs(reduction).toFixed(1)}% larger`
        }`
      );
    } catch (error) {
      setMessage(error.message || "Image processing failed.");
    } finally {
      setBusy(false);
    }
  };

  /* =========================================
     IMAGE DPI INFORMATION
  ========================================= */

  const imageDpiInfo = async () => {
    if (!file || !preview) {
      setMessage("Please select an image first.");
      return;
    }

    try {
      const image = await loadImage(preview);

      setMessage(
        `Image dimensions: ${image.naturalWidth} × ${image.naturalHeight} pixels. File size: ${formatBytes(file.size)}. Browser image decoding does not reliably expose the original DPI metadata.`
      );
    } catch {
      setMessage("Unable to read image information.");
    }
  };

  /* =========================================
     TEXT PROCESSING
  ========================================= */

  const changeCase = (type) => {
    setText((value) => {
      if (type === "upper") return value.toUpperCase();
      if (type === "lower") return value.toLowerCase();

      if (type === "title") {
        return value
          .toLowerCase()
          .replace(/\b\p{L}/gu, (char) => char.toUpperCase());
      }

      if (type === "sentence") {
        return value
          .toLowerCase()
          .replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (char) =>
            char.toUpperCase()
          );
      }

      return value;
    });
  };

  const removeExtraSpaces = () => {
    setText((value) =>
      value
        .replace(/[ \t]+/g, " ")
        .replace(/\s*\n\s*/g, "\n")
        .trim()
    );

    setMessage("Extra spaces removed.");
  };

  const replaceText = () => {
    if (!find) {
      setMessage("Enter text to find.");
      return;
    }

    setText((value) => value.split(find).join(replace));
    setMessage("Text replacement complete.");
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Text copied to clipboard.");
    } catch {
      setMessage("Clipboard access is unavailable.");
    }
  };

  /* =========================================
     TEXT DOWNLOAD
  ========================================= */

  const saveTxt = () => {
    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    downloadBlob(blob, "document.txt");
    setMessage("TXT file downloaded.");
  };

  const saveWord = () => {
    const safeText = escapeHtml(text);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Document</title>
        </head>
        <body>
          <pre style="font-family:Arial;white-space:pre-wrap;">${safeText}</pre>
        </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });

    downloadBlob(blob, "document.doc");

    setMessage(
      "Word-compatible DOC file downloaded. This is not a native DOCX file."
    );
  };

  const saveTextPdf = () => {
    if (!text.trim()) {
      setMessage("Please enter some text first.");
      return;
    }

    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(text, 180);

    let y = 20;

    lines.forEach((line) => {
      if (y > 275) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(line, 15, y);
      y += 7;
    });

    pdf.save("document.pdf");
    setMessage("PDF downloaded.");
  };

  /* =========================================
     IMAGE TO PDF
  ========================================= */

  const readImage = (selectedFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("File reading failed."));

      reader.readAsDataURL(selectedFile);
    });
  };

  const processImagePdf = async () => {
    if (!file) {
      setMessage("Please select an image first.");
      return;
    }

    try {
      setBusy(true);

      const imageData = await readImage(file);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const properties = pdf.getImageProperties(imageData);

      const ratio = Math.min(
        190 / properties.width,
        277 / properties.height
      );

      const width = properties.width * ratio;
      const height = properties.height * ratio;

      const x = (210 - width) / 2;
      const y = (297 - height) / 2;

      const imageFormat = file.type.includes("png") ? "PNG" : "JPEG";

      pdf.addImage(imageData, imageFormat, x, y, width, height);

      pdf.save(`${getBaseName(file.name)}.pdf`);

      setMessage("Image converted into A4 PDF successfully.");
    } catch {
      setMessage("Could not create PDF from this image.");
    } finally {
      setBusy(false);
    }
  };

  /* =========================================
     TEXT TO PDF
  ========================================= */

  const processTextPdf = () => {
    if (!text.trim()) {
      setMessage("Please enter document text first.");
      return;
    }

    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(text, 180);

    let y = 20;

    lines.forEach((line) => {
      if (y > 275) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(line, 15, y);
      y += 7;
    });

    pdf.save("document.pdf");
    setMessage("PDF document created.");
  };

  /* =========================================
     AGE CALCULATOR
  ========================================= */

  const calculateAge = () => {
    if (!birth) return "Select date of birth";

    const birthDate = new Date(`${birth}T00:00:00`);
    const today = new Date();

    if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
      return "Invalid date of birth";
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const previousMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      );

      days += previousMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} years, ${months} months, ${days} days`;
  };

  /* =========================================
     CALCULATOR RESULTS
  ========================================= */

  const percentageResult =
    (Number(amount) * Number(rate)) / 100;

  const fileSizeResult = formatBytes(Number(amount) || 0);

  const unitResult =
    unit === "cm"
      ? `${(Number(amount) * 0.393701).toFixed(3)} inches`
      : `${(Number(amount) / 2.54).toFixed(3)} cm`;

  /* =========================================
     CLOSE WORKSPACE
  ========================================= */

  const closeWorkspace = () => {
    onClose?.();
  };

  /* =========================================
     MAIN UI
  ========================================= */

    const pdfToolNames = [
      "PDF Size Reducer",
      "PDF to JPG",
      "PDF to PNG",
      "JPG to PDF",
      "Image to PDF",
      "Merge PDF",
      "Split PDF",
      "Compress PDF",
      "Rotate PDF",
      "Delete PDF Pages",
      "Reorder PDF Pages",
      "Extract PDF Pages",
      "Add Watermark",
      "Add Page Numbers",
      "Protect PDF",
      "Unlock PDF",
    ];

    if (pdfToolNames.includes(tool)) {
      return (
        <PDFToolWorkspace
          tool={tool}
          onClose={onClose}
        />
      );
    }
  return (
    <div
      className="tool-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeWorkspace();
        }
      }}
    >
      <section
        className="tool-workspace"
        role="dialog"
        aria-modal="true"
        aria-label={tool}
      >
        {/* ---------- Header ---------- */}

        <header className="tool-workspace-header">
          <div>
            <span className="tool-workspace-kicker">
              ONLINE TOOL
            </span>

            <h2>{tool}</h2>
          </div>

          <button
            type="button"
            className="tool-close-button"
            onClick={closeWorkspace}
            aria-label="Close tool"
          >
            <X />
          </button>
        </header>

        {/* ---------- Body ---------- */}

        <div className="tool-workspace-body">

          {/* =================================
              IMAGE TOOLS
          ================================= */}

          {isImage && (
            <>
              <p className="tool-help-text">
                Upload your image, adjust the settings and download
                your processed result. Processing happens in your browser.
              </p>

              <label className="tool-upload-box">
                <Upload size={30} />

                <strong>
                  {file ? file.name : "Choose an image"}
                </strong>

                <span>JPG, PNG, WebP supported</span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={pickFile}
                />
              </label>

              {preview && (
                <img
                  className="tool-image-preview"
                  src={preview}
                  alt="Selected image preview"
                />
              )}

              {file && (
                <div className="tool-result">
                  Original size: {formatBytes(file.size)}
                </div>
              )}

              <div className="tool-controls">

                <label>
                  Output format

                  <select
                    value={format}
                    onChange={(event) => setFormat(event.target.value)}
                  >
                    <option value="image/jpeg">JPG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                  </select>
                </label>

                <label>
                  Maximum width (px)

                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={maxWidth}
                    onChange={(event) => setMaxWidth(event.target.value)}
                  />
                </label>

                <label>
                  Maximum height (px)

                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={maxHeight}
                    onChange={(event) => setMaxHeight(event.target.value)}
                  />
                </label>

                <label>
                  Quality: {Math.round(quality * 100)}%

                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(event) =>
                      setQuality(Number(event.target.value))
                    }
                  />
                </label>

                {(tool === "Image Cropper" || tool === "Crop Image") && (
                  <label>
                    Crop ratio

                    <select
                      value={cropRatio}
                      onChange={(event) => setCropRatio(event.target.value)}
                    >
                      <option value="free">Original ratio</option>
                      <option value="1:1">Square (1:1)</option>
                      <option value="4:5">Portrait (4:5)</option>
                      <option value="3:4">Portrait (3:4)</option>
                      <option value="16:9">Landscape (16:9)</option>
                      <option value="35:45">Passport (35:45)</option>
                    </select>
                  </label>
                )}

              </div>

              <div className="tool-action-row">
                <button
                  type="button"
                  onClick={() => setRotation((value) => (value + 90) % 360)}
                >
                  <RotateCw size={14} /> Rotate 90°
                </button>

                <button
                  type="button"
                  onClick={() => setRotation(0)}
                >
                  Reset rotation
                </button>
              </div>

              {tool === "Image DPI Checker" ? (
                <button
                  className="tool-primary-button"
                  type="button"
                  disabled={!file}
                  onClick={imageDpiInfo}
                >
                  Check Image Information
                </button>
              ) : (
                <button
                  className="tool-primary-button"
                  type="button"
                  disabled={!file || busy}
                  onClick={processImage}
                >
                  {busy ? "Processing..." : "Process Image"}
                </button>
              )}

              {output && (
                <>
                  <img
                    className="tool-image-preview"
                    src={output}
                    alt="Processed image"
                  />

                  <a
                    className="tool-download-button"
                    href={output}
                    download={outputName}
                  >
                    <Download size={17} />
                    Download Processed Image
                  </a>
                </>
              )}
            </>
          )}

          {/* =================================
              PDF CREATION TOOLS
          ================================= */}

          {isPdfCreation && (
            <>
              <p className="tool-help-text">
                Create an A4 PDF from an image or text.
              </p>

              {(tool === "JPG to PDF" || tool === "Image to PDF") && (
                <>
                  <label className="tool-upload-box">
                    <Upload />

                    <strong>
                      {file ? file.name : "Choose JPG or PNG image"}
                    </strong>

                    <span>Image is processed locally</span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={pickFile}
                    />
                  </label>

                  {preview && (
                    <img
                      className="tool-image-preview"
                      src={preview}
                      alt="PDF source preview"
                    />
                  )}

                  <button
                    type="button"
                    className="tool-primary-button"
                    disabled={!file || busy}
                    onClick={processImagePdf}
                  >
                    {busy ? "Creating PDF..." : "Convert Image to PDF"}
                  </button>
                </>
              )}

              {(tool === "Word to PDF" || tool === "Text to PDF") && (
                <>
                  <textarea
                    className="tool-textarea"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Paste your document text here..."
                  />

                  <button
                    type="button"
                    className="tool-primary-button"
                    disabled={!text.trim()}
                    onClick={processTextPdf}
                  >
                    Create PDF
                  </button>
                </>
              )}
            </>
          )}

          {/* =================================
              TEXT TOOLS
          ================================= */}

          {isText && (
            <>
              <p className="tool-help-text">
                Type or paste text. Statistics update automatically.
              </p>

              <textarea
                className="tool-textarea"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Type or paste your text here..."
              />

              <div className="text-tool-stats">
                <span>
                  <b>{stats.words}</b>
                  Words
                </span>

                <span>
                  <b>{stats.chars}</b>
                  Characters
                </span>

                <span>
                  <b>{stats.charsNoSpace}</b>
                  No spaces
                </span>

                <span>
                  <b>{stats.lines}</b>
                  Lines
                </span>
              </div>

              {tool === "Text Case Converter" && (
                <div className="tool-action-row">
                  <button onClick={() => changeCase("upper")}>
                    UPPERCASE
                  </button>

                  <button onClick={() => changeCase("lower")}>
                    lowercase
                  </button>

                  <button onClick={() => changeCase("title")}>
                    Title Case
                  </button>

                  <button onClick={() => changeCase("sentence")}>
                    Sentence case
                  </button>
                </div>
              )}

              {tool === "Remove Extra Spaces" && (
                <button
                  className="tool-primary-button"
                  onClick={removeExtraSpaces}
                >
                  Remove Extra Spaces
                </button>
              )}

              {tool === "Find & Replace" && (
                <div className="tool-controls">
                  <label>
                    Find

                    <input
                      value={find}
                      onChange={(event) => setFind(event.target.value)}
                    />
                  </label>

                  <label>
                    Replace with

                    <input
                      value={replace}
                      onChange={(event) => setReplace(event.target.value)}
                    />
                  </label>

                  <button
                    className="tool-primary-button"
                    disabled={!find}
                    onClick={replaceText}
                  >
                    Replace All
                  </button>
                </div>
              )}

              {tool === "Word Frequency Counter" && (
                <div className="frequency-list">
                  {frequency.map(([word, count]) => (
                    <span key={word}>
                      {word} <b>{count}</b>
                    </span>
                  ))}
                </div>
              )}

              {tool === "Text Formatter" && (
                <div className="tool-action-row">
                  <button
                    onClick={() =>
                      setText((value) =>
                        value
                          .split(/\r?\n/)
                          .map((line) => line.trim())
                          .filter(Boolean)
                          .join("\n")
                      )
                    }
                  >
                    Clean paragraphs
                  </button>

                  <button onClick={removeExtraSpaces}>
                    Remove extra spaces
                  </button>
                </div>
              )}

              <div className="tool-action-row">
                <button onClick={copyText}>
                  <Copy size={14} /> Copy Text
                </button>

                <button onClick={saveTxt}>
                  <Download size={14} /> Download TXT
                </button>

                <button onClick={() => setText("")}>
                  <Trash2 size={14} /> Clear
                </button>
              </div>
            </>
          )}

          {/* =================================
              TEXT TO WORD
          ================================= */}

          {tool === "Text to Word" && (
            <>
              <p className="tool-help-text">
                Create a Word-compatible document from your text.
              </p>

              <textarea
                className="tool-textarea"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Type or paste document text..."
              />

              <button
                className="tool-primary-button"
                disabled={!text.trim()}
                onClick={saveWord}
              >
                Download Word-Compatible DOC
              </button>
            </>
          )}

          {/* =================================
              AGE CALCULATOR
          ================================= */}

          {tool === "Age Calculator" && (
            <div className="tool-controls">
              <label>
                Date of birth

                <input
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={birth}
                  onChange={(event) => setBirth(event.target.value)}
                />
              </label>

              <div className="tool-result">
                {calculateAge()}
              </div>
            </div>
          )}

          {/* =================================
              PERCENTAGE CALCULATOR
          ================================= */}

          {tool === "Percentage Calculator" && (
            <div className="tool-controls">
              <label>
                Amount

                <input
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>

              <label>
                Percentage (%)

                <input
                  type="number"
                  value={rate}
                  onChange={(event) => setRate(event.target.value)}
                />
              </label>

              <div className="tool-result">
                Result: {Number.isFinite(percentageResult)
                  ? percentageResult.toLocaleString()
                  : "Invalid input"}
              </div>
            </div>
          )}

          {/* =================================
              FILE SIZE CONVERTER
          ================================= */}

          {tool === "File Size Converter" && (
            <div className="tool-controls">
              <label>
                Size in bytes

                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>

              <div className="tool-result">
                {fileSizeResult}
              </div>
            </div>
          )}

          {/* =================================
              UNIT CONVERTER
          ================================= */}

          {tool === "Unit Converter" && (
            <div className="tool-controls">
              <label>
                Conversion type

                <select
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                >
                  <option value="cm">Centimeters to Inches</option>
                  <option value="inch">Inches to Centimeters</option>
                </select>
              </label>

              <label>
                Value ({unit === "cm" ? "cm" : "inches"})

                <input
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>

              <div className="tool-result">
                {unitResult}
              </div>
            </div>
          )}

          {/* =================================
              TOOLS NEEDING AN ENGINE
          ================================= */}

          {isUnsupported && (
            <div className="tool-notice">
              <AlertCircle size={25} />

              <div>
                <strong>Processing engine required</strong>

                <p>
                  This tool needs a dedicated library or processing
                  service. It is not enabled in this browser-only
                  workspace yet.
                </p>

                <small>
                  Your original file has not been modified.
                  No fake conversion or download is being generated.
                </small>
              </div>
            </div>
          )}

          {/* =================================
              UNKNOWN TOOL
          ================================= */}

          {!isImage &&
            !isText &&
            !isPdfCreation &&
            !isUtility &&
            !isUnsupported &&
            tool !== "Text to Word" && (
              <div className="tool-notice">
                <FileText size={25} />

                <div>
                  <strong>Tool not connected</strong>

                  <p>
                    This tool name has no processing component connected yet.
                  </p>
                </div>
              </div>
            )}

          {/* =================================
              STATUS MESSAGE
          ================================= */}

          {message && (
            <p className="tool-status" role="status">
              <CheckCircle2 size={16} />
              {message}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
