const A4_WIDTH = 2480;
const A4_HEIGHT = 3508;

// Compact passport photo dimensions
const PHOTO_WIDTH = 385;
const PHOTO_HEIGHT = 480;

// 6 photos in one row
const COLUMNS = 6;

// Compact spacing
const COLUMN_GAP = 25;
const ROW_GAP = 8;

// Very small outer margins
const SIDE_MARGIN = 20;
const TOP_MARGIN = 15;

// 6 rows per A4 page
const ROWS = 6;
const PHOTOS_PER_PAGE = COLUMNS * ROWS;

// Black border
const BORDER_SIZE = 5;

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Image loading failed"));

    image.src = src;
  });
};

const createA4Canvas = () => {
  const canvas = document.createElement("canvas");

  canvas.width = A4_WIDTH;
  canvas.height = A4_HEIGHT;

  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(
    0,
    0,
    A4_WIDTH,
    A4_HEIGHT
  );

  return {
    canvas,
    context,
  };
};

const drawPassportPhoto = (
  context,
  image,
  x,
  y
) => {
  // Outer black border
  context.fillStyle = "#000000";

  context.fillRect(
    x,
    y,
    PHOTO_WIDTH,
    PHOTO_HEIGHT
  );

  // Image inside border
  context.drawImage(
    image,
    x + BORDER_SIZE,
    y + BORDER_SIZE,
    PHOTO_WIDTH - BORDER_SIZE * 2,
    PHOTO_HEIGHT - BORDER_SIZE * 2
  );
};

export const generateA4Sheets = async (people) => {
  const photoList = [];

  people.forEach((person) => {
    if (!person.photo) return;

    for (
      let index = 0;
      index < person.quantity;
      index++
    ) {
      photoList.push({
        personId: person.id,
        photo: person.photo,
      });
    }
  });

  if (photoList.length === 0) {
    return [];
  }

  const totalPages = Math.ceil(
    photoList.length / PHOTOS_PER_PAGE
  );

  const sheets = [];

  for (
    let pageIndex = 0;
    pageIndex < totalPages;
    pageIndex++
  ) {
    const { canvas, context } =
      createA4Canvas();

    const pagePhotos = photoList.slice(
      pageIndex * PHOTOS_PER_PAGE,
      (pageIndex + 1) * PHOTOS_PER_PAGE
    );

    const loadedImages = await Promise.all(
      pagePhotos.map((item) =>
        loadImage(item.photo)
      )
    );

    loadedImages.forEach((image, index) => {
      const column = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);

      const x =
        SIDE_MARGIN +
        column * (PHOTO_WIDTH + COLUMN_GAP);

      const y =
        TOP_MARGIN +
        row * (PHOTO_HEIGHT + ROW_GAP);

      drawPassportPhoto(
        context,
        image,
        x,
        y
      );
    });

    sheets.push({
      canvas,
      imageUrl: canvas.toDataURL(
        "image/jpeg",
        0.98
      ),
      pageNumber: pageIndex + 1,
    });
  }

  return sheets;
};