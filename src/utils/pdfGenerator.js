import { jsPDF } from "jspdf";

export const createPassportPDF = async (
  photos,
  photosPerRow = 6
) => {
  const generatedPhotos = photos.filter(
    (photo) =>
      photo.processedPhoto?.previewUrl
  );

  if (!generatedPhotos.length) {
    throw new Error(
      "No generated photos available."
    );
  }

  /*
    A4 page

    jsPDF uses millimeters.
  */

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;

  const MARGIN = 10;
  const GAP = 3;

  /*
    Passport photo ratio = 3:4
  */

  const availableWidth =
    PAGE_WIDTH -
    MARGIN * 2 -
    GAP * (photosPerRow - 1);

  const photoWidth =
    availableWidth / photosPerRow;

  const photoHeight =
    photoWidth * (4 / 3);

  const rows = Math.ceil(
    generatedPhotos.length /
      photosPerRow
  );

  const totalHeight =
    rows * photoHeight +
    (rows - 1) * GAP;

  /*
    Center vertically when possible
  */

  let startY =
    (PAGE_HEIGHT - totalHeight) / 2;

  if (startY < MARGIN) {
    startY = MARGIN;
  }

  /*
    Create A4 PDF
  */

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  /*
    Add photos
  */

  for (
    let i = 0;
    i < generatedPhotos.length;
    i++
  ) {
    const photo =
      generatedPhotos[i];

    const row =
      Math.floor(
        i / photosPerRow
      );

    const column =
      i % photosPerRow;

    const x =
      MARGIN +
      column *
        (photoWidth + GAP);

    const y =
      startY +
      row *
        (photoHeight + GAP);

    pdf.addImage(
      photo.processedPhoto.previewUrl,
      "JPEG",
      x,
      y,
      photoWidth,
      photoHeight,
      undefined,
      "MEDIUM"
    );
  }

  /*
    Download
  */

  pdf.save(
    "passport-photo-sheet.pdf"
  );
};