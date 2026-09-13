import { Download, FileImage, FileText, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { generateA4Sheets } from "../utils/sheetGenerator";

function PreviewPage({ people }) {
  const [sheets, setSheets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const createSheets = async () => {
      setIsGenerating(true);

      const generatedSheets = await generateA4Sheets(people);

      setSheets(generatedSheets);
      setIsGenerating(false);
    };

    createSheets();
  }, [people]);

  const downloadJpg = (sheet, index) => {
    const link = document.createElement("a");

    link.href = sheet.imageUrl;
    link.download = `passport-sheet-page-${index + 1}.jpg`;

    link.click();
  };

  const downloadPdf = async () => {
    const jsPDFModule = await import("jspdf");
    const { jsPDF } = jsPDFModule;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    sheets.forEach((sheet, index) => {
      if (index > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        sheet.imageUrl,
        "JPEG",
        0,
        0,
        210,
        297
      );
    });

    pdf.save("passport-photo-sheets.pdf");
  };

  if (isGenerating) {
    return (
      <section className="preview-page loading-preview">
        <LoaderCircle className="loading-icon" size={35} />
        <h2>Generating A4 Sheet...</h2>
        <p>Please wait while your passport photo sheet is prepared.</p>
      </section>
    );
  }

  return (
    <section className="preview-page">
      <div className="preview-heading">
        <div>
          <h2>Preview & Download</h2>
          <p>Your passport photo sheet is ready.</p>
        </div>

        <div className="sheet-count">
          {sheets.length} {sheets.length === 1 ? "A4 Page" : "A4 Pages"}
        </div>
      </div>

      <div className="preview-info">
        <FileImage size={18} />
        <span>
          Photos are arranged in 6 columns per row on an A4 sheet.
        </span>
      </div>

      <div className="sheets-preview-list">
        {sheets.map((sheet, index) => (
          <div className="sheet-preview-card" key={sheet.pageNumber}>
            <div className="sheet-preview-header">
              <strong>Page {sheet.pageNumber}</strong>
            </div>

            <div className="sheet-image-container">
              <img
                src={sheet.imageUrl}
                alt={`A4 passport sheet page ${sheet.pageNumber}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="download-panel">
        <div>
          <h3>Download Your Files</h3>
          <p>Save your passport photo sheet in your preferred format.</p>
        </div>

        <div className="download-buttons">
          <button
            type="button"
            className="download-jpg-button"
            onClick={() => sheets.forEach(downloadJpg)}
          >
            <FileImage size={18} />
            Download JPG
          </button>

          <button
            type="button"
            className="download-pdf-button"
            onClick={downloadPdf}
          >
            <FileText size={18} />
            Download PDF
          </button>
        </div>
      </div>
    </section>
  );
}

export default PreviewPage;