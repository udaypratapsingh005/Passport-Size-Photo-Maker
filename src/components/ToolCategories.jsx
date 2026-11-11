
import { useState } from "react";
import {
  ArrowRight,
  FileImage,
  FileText,
  Image as ImageIcon,
  Minimize2,
  ArrowLeftRight,
  Images,
  GitMerge,
  Scissors,
  RotateCw,
  LockKeyhole,
  Unlock,
  Maximize,
  Crop,
  UserRound,
  ScanText,
  FileDown,
  QrCode,
  Calculator,
  Percent,
  CaseSensitive,
  AlignLeft,
  Hash,
  Ruler,
  FileOutput,
  ShieldCheck,
  RefreshCw,
  FileType,
  Trash2,
  ListOrdered,
  Droplet,
  Type,
  Barcode,
  CalendarDays,
  Search,
  FilePlus,
  FileMinus,
  Stamp,
} from "lucide-react";

/* =========================================
   TOOL CATEGORY DATA
========================================= */

const categories = [
  {
    id: "pdf",
    title: "PDF Tools",
    description: "Convert, compress, merge, split and more.",
    icon: FileText,
    theme: "pdf",

    preview: [
      ["Compress PDF", Minimize2],
      ["PDF to JPG", FileImage],
      ["JPG to PDF", Images],
      ["Merge PDF", GitMerge],
      ["Split PDF", Scissors],
      ["Rotate PDF", RotateCw],
      ["Protect PDF", LockKeyhole],
      ["Unlock PDF", Unlock],
    ],

    tools: [
      "PDF Size Reducer",
      "PDF to JPG",
      "PDF to PNG",
      "JPG to PDF",
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
    ],
  },

  {
    id: "image",
    title: "Image Tools",
    description: "Resize, compress, convert and edit images.",
    icon: ImageIcon,
    theme: "image",

    preview: [
      ["Compress Image", Minimize2],
      ["Resize Image", Maximize],
      ["Crop Image", Crop],
      ["JPG to PNG", ArrowLeftRight],
      ["PNG to JPG", ArrowLeftRight],
      ["Remove Background", UserRound],
      ["Image to Text (OCR)", ScanText],
      ["Rotate Image", RefreshCw],
    ],

    tools: [
      "Image Size Reducer",
      "Image Resizer",
      "Image Cropper",
      "JPG to PNG",
      "PNG to JPG",
      "WebP Converter",
      "Image to PDF",
      "Image Compressor",
      "Image Background Remover",
      "Image to Text (OCR)",
      "Image Rotator",
      "Image DPI Checker",
      "Passport Photo Maker",
    ],
  },

  {
    id: "word",
    title: "Word Tools",
    description: "Convert, edit and manage Word documents.",
    icon: FileText,
    theme: "word",

    preview: [
      ["Word to PDF", FileOutput],
      ["PDF to Word", FileType],
      ["DOCX to TXT", FileDown],
      ["Text to Word", FileText],
      ["Word Counter", Hash],
      ["Character Counter", Ruler],
      ["Text Case Converter", CaseSensitive],
      ["Text Formatter", AlignLeft],
    ],

    tools: [
      "Word to PDF",
      "PDF to Word",
      "DOC to DOCX",
      "DOCX to TXT",
      "Text to Word",
      "Word Counter",
      "Character Counter",
      "Text Case Converter",
      "Remove Extra Spaces",
      "Find & Replace",
      "Word Frequency Counter",
      "Text Formatter",
    ],
  },

  {
    id: "other",
    title: "Other Useful Tools",
    description: "Document, text, QR, calculator and more.",
    icon: FileImage,
    theme: "other",

    preview: [
      ["QR Code Generator", QrCode],
      ["Age Calculator", CalendarDays],
      ["Percentage Calculator", Percent],
      ["Word Counter", CaseSensitive],
      ["Text Case Converter", Type],
      ["Unit Converter", ArrowLeftRight],
      ["File Size Converter", FileDown],
      ["Image DPI Checker", Ruler],
    ],

    tools: [
      "QR Code Generator",
      "QR Code Scanner",
      "Barcode Generator",
      "Age Calculator",
      "Percentage Calculator",
      "File Size Converter",
      "Unit Converter",
      "Image DPI Checker",
    ],
  },
];

/* =========================================
   ALL TOOL NAMES
========================================= */

export const allToolNames = [
  ...new Set(categories.flatMap((category) => category.tools)),
];

/* =========================================
   TOOL ICON MAPPING
========================================= */

const toolIcons = {
  "PDF Size Reducer": Minimize2,
  "PDF to JPG": FileImage,
  "PDF to PNG": FileImage,
  "JPG to PDF": Images,
  "Merge PDF": GitMerge,
  "Split PDF": Scissors,
  "Compress PDF": Minimize2,
  "Rotate PDF": RotateCw,
  "Delete PDF Pages": Trash2,
  "Reorder PDF Pages": ListOrdered,
  "Extract PDF Pages": FileOutput,
  "Add Watermark": Stamp,
  "Add Page Numbers": Hash,
  "Protect PDF": LockKeyhole,
  "Unlock PDF": Unlock,

  "Image Size Reducer": Minimize2,
  "Image Resizer": Maximize,
  "Image Cropper": Crop,
  "JPG to PNG": ArrowLeftRight,
  "PNG to JPG": ArrowLeftRight,
  "WebP Converter": RefreshCw,
  "Image to PDF": FileOutput,
  "Image Compressor": Minimize2,
  "Image Background Remover": UserRound,
  "Image to Text (OCR)": ScanText,
  "Image Rotator": RotateCw,
  "Image DPI Checker": Ruler,
  "Passport Photo Maker": UserRound,

  "Word to PDF": FileOutput,
  "PDF to Word": FileType,
  "DOC to DOCX": FilePlus,
  "DOCX to TXT": FileDown,
  "Text to Word": FileText,
  "Word Counter": Hash,
  "Character Counter": Ruler,
  "Text Case Converter": CaseSensitive,
  "Remove Extra Spaces": AlignLeft,
  "Find & Replace": Search,
  "Word Frequency Counter": Hash,
  "Text Formatter": AlignLeft,

  "QR Code Generator": QrCode,
  "QR Code Scanner": ScanText,
  "Barcode Generator": Barcode,
  "Age Calculator": CalendarDays,
  "Percentage Calculator": Percent,
  "File Size Converter": FileDown,
  "Unit Converter": ArrowLeftRight,
};

/* =========================================
   TOOL PREVIEW
========================================= */

function ToolPreview({ tools, onSelectTool }) {
  return (
    <div className="tool-preview-grid">
      {tools.map(([label, Icon]) => (
        <button
          className="tool-preview-item"
          type="button"
          key={label}
          onClick={() => onSelectTool(label)}
        >
          <Icon size={27} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

/* =========================================
   ALL TOOLS LIST
========================================= */

function AllToolsList({ category, onSelectTool }) {
  return (
    <div className="all-tools-list">
      <h4>All {category.title}</h4>

      <div className="all-tools-tags">
        {category.tools.map((tool) => {
          const Icon = toolIcons[tool] || ShieldCheck;

          return (
            <button
              type="button"
              key={tool}
              onClick={() => onSelectTool(tool)}
            >
              <Icon size={13} />
              {tool}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================
   CATEGORY CARD
========================================= */

function ToolCategoryCard({ category, onSelectTool }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const CategoryIcon = category.icon;

  const buttonText = isExpanded
    ? "Show Less"
    : `View All ${category.id === "other"
      ? "Useful"
      : category.title.split(" ")[0]
    } Tools`;

  return (
    <article className={`tool-category-card ${category.theme}`}>
      <div className="tool-category-header">
        <div className="tool-category-icon">
          <CategoryIcon size={31} />
        </div>

        <div className="tool-category-title">
          <h3>{category.title}</h3>
          <p>{category.description}</p>
        </div>
      </div>

      <ToolPreview
        tools={category.preview}
        onSelectTool={onSelectTool}
      />

      {isExpanded && (
        <AllToolsList
          category={category}
          onSelectTool={onSelectTool}
        />
      )}

      <button
        className="view-tools-button"
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((previous) => !previous)}
      >
        {buttonText}

        <ArrowRight
          size={17}
          className={isExpanded ? "arrow-rotated" : ""}
        />
      </button>
    </article>
  );
}

/* =========================================
   MAIN TOOL CATEGORIES
========================================= */

export default function ToolCategories({ onSelectTool }) {
  return (
    <section
      className="tools-section"
      aria-labelledby="tools-section-title"
    >
      <div className="tools-section-heading">
        <span className="tools-heading-line" />

        <div className="tools-heading-copy">
          <div className="tools-heading-title-row">
            <Images size={29} />

            <h2 id="tools-section-title">
              More Tools for Your Daily Needs
            </h2>
          </div>

          <p>
            All essential PDF, Image, Word and document tools
            in one place.
          </p>
        </div>

        <span className="tools-heading-line" />
      </div>

      <div className="tool-category-grid">
        {categories.map((category) => (
          <ToolCategoryCard
            key={category.id}
            category={category}
            onSelectTool={onSelectTool}
          />
        ))}
      </div>
    </section>
  );
}
