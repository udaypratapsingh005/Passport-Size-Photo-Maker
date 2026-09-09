import { useMemo } from "react";
import {
    FileImage,
    FileText,
    Printer,
    CheckCircle2,
} from "lucide-react";

function PrintSheet({
    photos,
    photosPerRow,
    setPhotosPerRow,
    onDownloadJpg,
    onDownloadPdf,
    isDownloadingJpg,
    isDownloadingPdf,
}) {
    const generatedPhotos = useMemo(
        () =>
            photos.filter(
                (photo) =>
                    photo.processedPhoto?.previewUrl
            ),
        [photos]
    );

    const totalPhotos =
        generatedPhotos.length;

    const rows = Math.ceil(
        totalPhotos / photosPerRow
    );

    /*
      A4 ratio:
      210mm × 297mm
    */

    const gap = 3;

    const photoWidth =
        (
            100 -
            ((photosPerRow - 1) * gap)
        ) /
        photosPerRow;

    return (
        <section className="print-sheet-section">

            {/* HEADER */}

            <div className="print-sheet-header">

                <div className="print-sheet-title">

                    <div className="print-sheet-icon">
                        <Printer size={18} />
                    </div>

                    <div>

                        <h2>
                            Print Sheet Preview
                        </h2>

                        <p>
                            Arrange your passport photos on
                            an A4 print sheet.
                        </p>

                    </div>

                </div>


                <div className="print-sheet-status">

                    <CheckCircle2 size={14} />

                    <span>
                        A4 Ready
                    </span>

                </div>

            </div>


            {/* SETTINGS */}

            <div className="print-settings">

                <div className="setting-heading">

                    <strong>
                        Photos per row
                    </strong>

                    <span>
                        Choose how many photos should appear
                        in each row.
                    </span>

                </div>


                <div className="row-options">

                    {[4, 5, 6].map(
                        (value) => (
                            <button
                                key={value}
                                type="button"
                                className={
                                    photosPerRow === value
                                        ? "row-option active"
                                        : "row-option"
                                }
                                onClick={() =>
                                    setPhotosPerRow(value)
                                }
                            >

                                <strong>
                                    {value}
                                </strong>

                                <span>
                                    per row
                                </span>

                            </button>
                        )
                    )}

                </div>

            </div>


            {/* A4 PREVIEW AREA */}

            <div className="a4-preview-wrapper">

                <div className="a4-preview-label">
                    A4 • PORTRAIT
                </div>


                <div className="a4-paper">

                    <div
                        className="a4-photo-grid"
                        style={{
                            gridTemplateColumns:
                                `repeat(${photosPerRow}, 1fr)`,
                            gap: `${gap}px`,
                        }}
                    >

                        {generatedPhotos.map(
                            (photo, index) => (
                                <div
                                    className="a4-photo"
                                    key={photo.id}
                                    style={{
                                        width:
                                            `${photoWidth}%`,
                                    }}
                                >

                                    <img
                                        src={
                                            photo.processedPhoto
                                                .previewUrl
                                        }
                                        alt={`Passport ${index + 1
                                            }`}
                                    />

                                </div>
                            )
                        )}

                    </div>

                </div>


                <div className="a4-preview-info">

                    <span>
                        {totalPhotos} photos
                    </span>

                    <span>
                        •
                    </span>

                    <span>
                        {rows} row
                        {rows !== 1 ? "s" : ""}
                    </span>

                    <span>
                        •
                    </span>

                    <span>
                        A4 sheet
                    </span>

                </div>

            </div>


            {/* DOWNLOAD AREA */}

            <div className="download-area">

                <div className="download-heading">

                    <strong>
                        Download your photos
                    </strong>

                    <span>
                        Choose the format you need.
                    </span>

                </div>


                <div className="download-buttons">

                    <button
                        type="button"
                        className="download-button jpg"
                        onClick={onDownloadJpg}
                        disabled={
                            isDownloadingJpg ||
                            isDownloadingPdf
                        }
                    >

                        <div className="download-button-icon">
                            <FileImage size={18} />
                        </div>

                        <div>

                            <strong>
                                {isDownloadingJpg
                                    ? "Creating JPG..."
                                    : "Download JPG"}
                            </strong>

                            <span>
                                Image print sheet
                            </span>

                        </div>

                    </button>


                    <button
                        type="button"
                        className="download-button pdf"
                        onClick={onDownloadPdf}
                        disabled={
                            isDownloadingPdf ||
                            isDownloadingJpg
                        }
                    >

                        <div className="download-button-icon">
                            <FileText size={18} />
                        </div>

                        <div>

                            <strong>
                                {isDownloadingPdf
                                    ? "Creating PDF..."
                                    : "Download PDF"}
                            </strong>

                            <span>
                                A4 printable document
                            </span>

                        </div>

                    </button>

                </div>

            </div>

        </section>
    );
}

export default PrintSheet;