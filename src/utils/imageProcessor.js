export const PASSPORT_WIDTH = 354;
export const PASSPORT_HEIGHT = 472;

export const createPassportPhoto = (
  image,
  crop = {}
) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");

    canvas.width = PASSPORT_WIDTH;
    canvas.height = PASSPORT_HEIGHT;

    const context = canvas.getContext("2d");

    if (!context) {
      reject(
        new Error("Canvas is not supported by your browser.")
      );
      return;
    }

    const {
      zoom = 1,
      position = {
        x: 0,
        y: 0,
      },
    } = crop;

    const outputRatio =
      PASSPORT_WIDTH / PASSPORT_HEIGHT;

    const imageRatio =
      image.naturalWidth / image.naturalHeight;

    let drawWidth;
    let drawHeight;

    if (imageRatio > outputRatio) {
      drawHeight = PASSPORT_HEIGHT;
      drawWidth =
        drawHeight * imageRatio;
    } else {
      drawWidth = PASSPORT_WIDTH;
      drawHeight =
        drawWidth / imageRatio;
    }

    drawWidth *= zoom;
    drawHeight *= zoom;

    let x =
      (PASSPORT_WIDTH - drawWidth) / 2;

    let y =
      (PASSPORT_HEIGHT - drawHeight) / 2;

    /*
      Position adjustment
    */

    x += position.x;
    y += position.y;

    /*
      White background
    */

    context.fillStyle = "#ffffff";

    context.fillRect(
      0,
      0,
      PASSPORT_WIDTH,
      PASSPORT_HEIGHT
    );

    /*
      Draw image
    */

    context.drawImage(
      image,
      x,
      y,
      drawWidth,
      drawHeight
    );

    /*
      Convert canvas to JPG
    */

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "Unable to create passport photo."
            )
          );

          return;
        }

        const previewUrl =
          URL.createObjectURL(blob);

        resolve({
          blob,
          previewUrl,
          width: PASSPORT_WIDTH,
          height: PASSPORT_HEIGHT,
        });
      },
      "image/jpeg",
      0.92
    );
  });
};


/*
  Download a single JPG
*/

export const downloadBlob = (
  blob,
  fileName
) => {
  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};


/*
  Download individual generated photo
*/

export const downloadPassportPhoto = (
  photo,
  index
) => {
  if (!photo?.processedPhoto?.blob) {
    return;
  }

  downloadBlob(
    photo.processedPhoto.blob,
    `passport-photo-${index + 1}.jpg`
  );
};


/*
  Create a combined JPG print sheet
*/

export const createPrintSheet = async (
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
    A4 at approximately 150 DPI

    794 × 1123
  */

  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  const PADDING = 40;
  const GAP = 14;

  const availableWidth =
    A4_WIDTH -
    PADDING * 2 -
    GAP * (photosPerRow - 1);

  const photoWidth =
    availableWidth / photosPerRow;

  const photoHeight =
    photoWidth *
    (PASSPORT_HEIGHT / PASSPORT_WIDTH);

  const rows = Math.ceil(
    generatedPhotos.length /
      photosPerRow
  );

  const requiredHeight =
    PADDING * 2 +
    rows * photoHeight +
    (rows - 1) * GAP;

  const canvas =
    document.createElement("canvas");

  canvas.width = A4_WIDTH;

  canvas.height = Math.max(
    A4_HEIGHT,
    Math.ceil(requiredHeight)
  );

  const context =
    canvas.getContext("2d");

  context.fillStyle = "#ffffff";

  context.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /*
    Draw every passport photo
  */

  for (
    let i = 0;
    i < generatedPhotos.length;
    i++
  ) {
    const photo =
      generatedPhotos[i];

    const image =
      await loadImage(
        photo.processedPhoto.previewUrl
      );

    const row =
      Math.floor(
        i / photosPerRow
      );

    const column =
      i % photosPerRow;

    const x =
      PADDING +
      column *
        (photoWidth + GAP);

    const y =
      PADDING +
      row *
        (photoHeight + GAP);

    context.drawImage(
      image,
      x,
      y,
      photoWidth,
      photoHeight
    );
  }

  return new Promise(
    (resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Unable to create print sheet."
              )
            );

            return;
          }

          resolve({
            blob,
            width: canvas.width,
            height: canvas.height,
          });
        },
        "image/jpeg",
        0.95
      );
    }
  );
};


/*
  Load image helper
*/

const loadImage = (src) => {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      image.onload = () => {
        resolve(image);
      };

      image.onerror = () => {
        reject(
          new Error(
            "Unable to load image."
          )
        );
      };

      image.src = src;
    }
  );
};