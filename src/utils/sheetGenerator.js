const A4_WIDTH = 2480;
const A4_HEIGHT = 3508;

const PHOTO_WIDTH = 350;
const PHOTO_HEIGHT = 450;

const PHOTOS_PER_ROW = 6;
const HORIZONTAL_GAP = 30;
const VERTICAL_GAP = 35;

const TOP_MARGIN = 140;
const SIDE_MARGIN = 115;

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;

    image.src = src;
  });
};

const createBlankCanvas = () => {
  const canvas = document.createElement("canvas");

  canvas.width = A4_WIDTH;
  canvas.height = A4_HEIGHT;

  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

  return { canvas, context };
};

export const generateA4Sheets = async (people) => {
  const photoList = [];

  people.forEach((person) => {
    if (!person.photo) return;

    for (let index = 0; index < person.quantity; index++) {
      photoList.push({
        id: `${person.id}-${index}`,
        photo: person.photo,
      });
    }
  });

  const totalPhotos = photoList.length;

  if (!totalPhotos) {
    return [];
  }

  const photosPerPage = 6 * 7;
  const totalPages = Math.ceil(totalPhotos / photosPerPage);

  const sheets = [];

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const { canvas, context } = createBlankCanvas();

    const pagePhotos = photoList.slice(
      pageIndex * photosPerPage,
      (pageIndex + 1) * photosPerPage
    );

    const loadedImages = await Promise.all(
      pagePhotos.map((item) => loadImage(item.photo))
    );

    loadedImages.forEach((image, index) => {
      const column = index % PHOTOS_PER_ROW;
      const row = Math.floor(index / PHOTOS_PER_ROW);

      const x =
        SIDE_MARGIN + column * (PHOTO_WIDTH + HORIZONTAL_GAP);

      const y =
        TOP_MARGIN + row * (PHOTO_HEIGHT + VERTICAL_GAP);

      context.drawImage(
        image,
        x,
        y,
        PHOTO_WIDTH,
        PHOTO_HEIGHT
      );
    });

    sheets.push({
      canvas,
      imageUrl: canvas.toDataURL("image/jpeg", 0.95),
      pageNumber: pageIndex + 1,
    });
  }

  return sheets;
};