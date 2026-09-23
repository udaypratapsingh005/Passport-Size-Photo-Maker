import { useEffect, useRef, useState } from "react";
import {
  Check,
  Contrast,
  Crop,
  Minus,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Sun,
  X,
  ZoomIn,
} from "lucide-react";

const OUTPUT_WIDTH = 350;
const OUTPUT_HEIGHT = 450;

const CROP_RATIO =
  OUTPUT_WIDTH / OUTPUT_HEIGHT;

const MIN_CROP_SIZE = 70;

const MIN_ADJUSTMENT = 0.5;
const MAX_ADJUSTMENT = 1.5;
const DEFAULT_ADJUSTMENT = 1;

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const DEFAULT_ZOOM = 1;
const ZOOM_STEP = 0.01;

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function CropModal({
  image,
  onApply,
  onCancel,
}) {
  const imageRef = useRef(null);
  const cropFrameRef = useRef(null);

  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
  });

  const [crop, setCrop] = useState(null);

  const [interaction, setInteraction] =
    useState(null);

  const [brightness, setBrightness] =
    useState(DEFAULT_ADJUSTMENT);

  const [contrast, setContrast] =
    useState(DEFAULT_ADJUSTMENT);

  const [zoom, setZoom] =
    useState(DEFAULT_ZOOM);

  /*
   * Reset when a new image is opened.
   */
  useEffect(() => {
    setCrop(null);
    setInteraction(null);

    setBrightness(
      DEFAULT_ADJUSTMENT
    );

    setContrast(
      DEFAULT_ADJUSTMENT
    );

    setZoom(DEFAULT_ZOOM);
  }, [image]);

  if (!image) {
    return null;
  }

  /*
   * Get mouse position relative
   * to the crop frame.
   */
  const getPointerPosition = (event) => {
    const frame =
      cropFrameRef.current;

    if (!frame) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect =
      frame.getBoundingClientRect();

    return {
      x: clamp(
        event.clientX - rect.left,
        0,
        rect.width
      ),

      y: clamp(
        event.clientY - rect.top,
        0,
        rect.height
      ),
    };
  };

  /*
   * Image loaded.
   */
  const handleImageLoad = () => {
    const img = imageRef.current;

    if (!img) {
      return;
    }

    const rect = img.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    setImageSize({
      width,
      height,
    });

    /*
     * ==========================================
     * DEFAULT PASSPORT CROP
     * ==========================================
     *
     * Passport ratio:
     * 35 : 45
     *
     * Default crop is intentionally smaller
     * than the complete uploaded image.
     *
     * User can resize it later as required.
     */

    const DEFAULT_CROP_WIDTH =
      width * 0.42;

    const DEFAULT_CROP_HEIGHT =
      DEFAULT_CROP_WIDTH /
      CROP_RATIO;

    /*
     * Safety:
     * Crop should always remain
     * completely inside the image.
     */

    const cropWidth = Math.min(
      DEFAULT_CROP_WIDTH,
      width
    );

    const cropHeight =
      cropWidth / CROP_RATIO;

    /*
     * If calculated height is bigger
     * than image height, resize again.
     */

    let finalWidth = cropWidth;
    let finalHeight = cropHeight;

    if (
      finalHeight > height
    ) {
      finalHeight = height;

      finalWidth =
        finalHeight *
        CROP_RATIO;
    }

    /*
     * Center the passport frame.
     */

    const cropX =
      (width - finalWidth) / 2;

    const cropY =
      (height - finalHeight) / 2;

    setCrop({
      x: cropX,
      y: cropY,

      width: finalWidth,
      height: finalHeight,
    });
  };
  /*
   * --------------------------------
   * ZOOM
   * --------------------------------
   */

  const updateZoom = (value) => {
    const nextZoom = clamp(
      Number(value),
      MIN_ZOOM,
      MAX_ZOOM
    );

    setZoom(nextZoom);
  };

  const handleZoomIn = () => {
    updateZoom(
      zoom + ZOOM_STEP
    );
  };

  const handleZoomOut = () => {
    updateZoom(
      zoom - ZOOM_STEP
    );
  };

  /*
   * Mouse wheel zoom.
   *
   * Scroll up   = zoom in
   * Scroll down = zoom out
   */
  const handleWheelZoom = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const direction =
      event.deltaY < 0
        ? 1
        : -1;

    /*
     * 0.05 per wheel movement.
     * Still smooth and avoids
     * extremely slow wheel response.
     */
    updateZoom(
      zoom +
      direction * 0.05
    );
  };

  /*
   * --------------------------------
   * CROP CREATE
   * --------------------------------
   */

  const handleCropStart = (event) => {
    if (event.button !== 0) {
      return;
    }

    const point =
      getPointerPosition(event);

    setInteraction({
      type: "create",

      startX: point.x,
      startY: point.y,
    });

    event.currentTarget.setPointerCapture?.(
      event.pointerId
    );
  };

  /*
   * --------------------------------
   * CROP MOVE
   * --------------------------------
   */

  const handleMoveStart = (event) => {
    event.stopPropagation();

    if (!crop) {
      return;
    }

    const point =
      getPointerPosition(event);

    setInteraction({
      type: "move",

      startX: point.x,
      startY: point.y,

      originalCrop: {
        ...crop,
      },
    });

    event.currentTarget.setPointerCapture?.(
      event.pointerId
    );
  };

  /*
   * --------------------------------
   * CROP RESIZE
   * --------------------------------
   */

  const handleResizeStart = (
    event,
    corner
  ) => {
    event.stopPropagation();

    if (!crop) {
      return;
    }

    const point =
      getPointerPosition(event);

    setInteraction({
      type: "resize",

      corner,

      startX: point.x,
      startY: point.y,

      originalCrop: {
        ...crop,
      },
    });

    event.currentTarget.setPointerCapture?.(
      event.pointerId
    );
  };

  /*
   * --------------------------------
   * POINTER MOVE
   * --------------------------------
   */

  const handlePointerMove = (event) => {
    if (
      !interaction ||
      !imageSize.width ||
      !imageSize.height
    ) {
      return;
    }

    const point =
      getPointerPosition(event);

    /*
     * CREATE
     */
    if (
      interaction.type ===
      "create"
    ) {
      const startX =
        interaction.startX;

      const startY =
        interaction.startY;

      const deltaX =
        point.x - startX;

      const deltaY =
        point.y - startY;

      const directionX =
        deltaX >= 0 ? 1 : -1;

      const directionY =
        deltaY >= 0 ? 1 : -1;

      let width =
        Math.abs(deltaX);

      let height =
        Math.abs(deltaY);

      /*
       * Keep 35:45 ratio.
       */
      if (
        width / CROP_RATIO >
        height
      ) {
        height =
          width / CROP_RATIO;
      } else {
        width =
          height * CROP_RATIO;
      }

      width = Math.min(
        width,
        imageSize.width
      );

      height =
        width / CROP_RATIO;

      if (
        height > imageSize.height
      ) {
        height =
          imageSize.height;

        width =
          height * CROP_RATIO;
      }

      let x =
        directionX === 1
          ? startX
          : startX - width;

      let y =
        directionY === 1
          ? startY
          : startY - height;

      x = clamp(
        x,
        0,
        imageSize.width - width
      );

      y = clamp(
        y,
        0,
        imageSize.height - height
      );

      if (
        width >= MIN_CROP_SIZE &&
        height >= MIN_CROP_SIZE
      ) {
        setCrop({
          x,
          y,
          width,
          height,
        });
      }

      return;
    }

    /*
     * MOVE
     */
    if (
      interaction.type ===
      "move"
    ) {
      const {
        startX,
        startY,
        originalCrop,
      } = interaction;

      const deltaX =
        point.x - startX;

      const deltaY =
        point.y - startY;

      const x = clamp(
        originalCrop.x +
        deltaX,

        0,

        imageSize.width -
        originalCrop.width
      );

      const y = clamp(
        originalCrop.y +
        deltaY,

        0,

        imageSize.height -
        originalCrop.height
      );

      setCrop({
        ...originalCrop,

        x,
        y,
      });

      return;
    }

    /*
     * RESIZE
     */
    if (
      interaction.type ===
      "resize"
    ) {
      const {
        corner,
        startX,
        startY,
        originalCrop,
      } = interaction;

      const deltaX =
        point.x - startX;

      const deltaY =
        point.y - startY;

      let newWidth =
        originalCrop.width;

      let newHeight =
        originalCrop.height;

      let newX =
        originalCrop.x;

      let newY =
        originalCrop.y;

      /*
       * TOP LEFT
       */
      if (
        corner ===
        "top-left"
      ) {
        const widthFromX =
          originalCrop.width -
          deltaX;

        const heightFromY =
          originalCrop.height -
          deltaY;

        if (
          widthFromX /
          CROP_RATIO >
          heightFromY
        ) {
          newWidth =
            widthFromX;

          newHeight =
            newWidth /
            CROP_RATIO;
        } else {
          newHeight =
            heightFromY;

          newWidth =
            newHeight *
            CROP_RATIO;
        }

        newX =
          originalCrop.x +
          originalCrop.width -
          newWidth;

        newY =
          originalCrop.y +
          originalCrop.height -
          newHeight;
      }

      /*
       * TOP RIGHT
       */
      if (
        corner ===
        "top-right"
      ) {
        const widthFromX =
          originalCrop.width +
          deltaX;

        const heightFromY =
          originalCrop.height -
          deltaY;

        if (
          widthFromX /
          CROP_RATIO >
          heightFromY
        ) {
          newWidth =
            widthFromX;

          newHeight =
            newWidth /
            CROP_RATIO;
        } else {
          newHeight =
            heightFromY;

          newWidth =
            newHeight *
            CROP_RATIO;
        }

        newY =
          originalCrop.y +
          originalCrop.height -
          newHeight;
      }

      /*
       * BOTTOM LEFT
       */
      if (
        corner ===
        "bottom-left"
      ) {
        const widthFromX =
          originalCrop.width -
          deltaX;

        const heightFromY =
          originalCrop.height +
          deltaY;

        if (
          widthFromX /
          CROP_RATIO >
          heightFromY
        ) {
          newWidth =
            widthFromX;

          newHeight =
            newWidth /
            CROP_RATIO;
        } else {
          newHeight =
            heightFromY;

          newWidth =
            newHeight *
            CROP_RATIO;
        }

        newX =
          originalCrop.x +
          originalCrop.width -
          newWidth;
      }

      /*
       * BOTTOM RIGHT
       */
      if (
        corner ===
        "bottom-right"
      ) {
        const widthFromX =
          originalCrop.width +
          deltaX;

        const heightFromY =
          originalCrop.height +
          deltaY;

        if (
          widthFromX /
          CROP_RATIO >
          heightFromY
        ) {
          newWidth =
            widthFromX;

          newHeight =
            newWidth /
            CROP_RATIO;
        } else {
          newHeight =
            heightFromY;

          newWidth =
            newHeight *
            CROP_RATIO;
        }
      }

      /*
       * Minimum crop.
       */
      if (
        newWidth <
        MIN_CROP_SIZE ||
        newHeight <
        MIN_CROP_SIZE
      ) {
        return;
      }

      /*
       * Boundaries.
       */
      if (newX < 0) {
        newX = 0;

        newWidth =
          originalCrop.x +
          originalCrop.width;

        newHeight =
          newWidth /
          CROP_RATIO;
      }

      if (newY < 0) {
        newY = 0;

        newHeight =
          originalCrop.y +
          originalCrop.height;

        newWidth =
          newHeight *
          CROP_RATIO;
      }

      if (
        newX + newWidth >
        imageSize.width
      ) {
        newWidth =
          imageSize.width -
          newX;

        newHeight =
          newWidth /
          CROP_RATIO;
      }

      if (
        newY + newHeight >
        imageSize.height
      ) {
        newHeight =
          imageSize.height -
          newY;

        newWidth =
          newHeight *
          CROP_RATIO;
      }

      if (
        newWidth <
        MIN_CROP_SIZE ||
        newHeight <
        MIN_CROP_SIZE
      ) {
        return;
      }

      setCrop({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const handlePointerEnd = () => {
    setInteraction(null);
  };

  /*
   * --------------------------------
   * RESET CROP
   * --------------------------------
   */

  const handleResetCrop = () => {
    if (
      !imageSize.width ||
      !imageSize.height
    ) {
      return;
    }

    const resetWidth =
      Math.min(
        imageSize.width * 0.65,
        imageSize.height *
        CROP_RATIO *
        0.75
      );

    const resetHeight =
      resetWidth /
      CROP_RATIO;

    setCrop({
      x:
        (imageSize.width -
          resetWidth) /
        2,

      y:
        (imageSize.height -
          resetHeight) /
        2,

      width: resetWidth,

      height: resetHeight,
    });
  };

  /*
   * --------------------------------
   * RESET ADJUSTMENTS
   * --------------------------------
   */

  const handleResetAdjustments =
    () => {
      setBrightness(
        DEFAULT_ADJUSTMENT
      );

      setContrast(
        DEFAULT_ADJUSTMENT
      );

      setZoom(
        DEFAULT_ZOOM
      );
    };

  /*
   * --------------------------------
   * APPLY
   * --------------------------------
   */

  const handleApply = () => {
    const img =
      imageRef.current;

    if (
      !img ||
      !crop ||
      !imageSize.width ||
      !imageSize.height
    ) {
      return;
    }

    /*
     * Base displayed image dimensions.
     */
    const displayWidth =
      imageSize.width;

    const displayHeight =
      imageSize.height;

    /*
     * Zoomed image dimensions.
     */
    const zoomedWidth =
      displayWidth * zoom;

    const zoomedHeight =
      displayHeight * zoom;

    /*
     * Zoomed image is centered.
     */
    const imageOffsetX =
      (displayWidth -
        zoomedWidth) /
      2;

    const imageOffsetY =
      (displayHeight -
        zoomedHeight) /
      2;

    /*
     * Convert crop area into
     * zoomed image coordinates.
     */
    const sourceDisplayX =
      (crop.x -
        imageOffsetX) /
      zoom;

    const sourceDisplayY =
      (crop.y -
        imageOffsetY) /
      zoom;

    const sourceDisplayWidth =
      crop.width / zoom;

    const sourceDisplayHeight =
      crop.height / zoom;

    /*
     * Convert to original pixels.
     */
    const scaleX =
      img.naturalWidth /
      displayWidth;

    const scaleY =
      img.naturalHeight /
      displayHeight;

    const sourceX =
      sourceDisplayX * scaleX;

    const sourceY =
      sourceDisplayY * scaleY;

    const sourceWidth =
      sourceDisplayWidth * scaleX;

    const sourceHeight =
      sourceDisplayHeight * scaleY;

    /*
     * Temporary canvas.
     */
    const tempCanvas =
      document.createElement(
        "canvas"
      );

    tempCanvas.width =
      OUTPUT_WIDTH;

    tempCanvas.height =
      OUTPUT_HEIGHT;

    const tempContext =
      tempCanvas.getContext(
        "2d"
      );

    if (!tempContext) {
      return;
    }

    /*
     * White background.
     */
    tempContext.fillStyle =
      "#ffffff";

    tempContext.fillRect(
      0,
      0,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT
    );

    /*
     * Draw zoom-aware crop.
     */
    tempContext.drawImage(
      img,

      sourceX,
      sourceY,

      sourceWidth,
      sourceHeight,

      0,
      0,

      OUTPUT_WIDTH,
      OUTPUT_HEIGHT
    );

    /*
     * Pixel processing.
     */
    const imageData =
      tempContext.getImageData(
        0,
        0,
        OUTPUT_WIDTH,
        OUTPUT_HEIGHT
      );

    const pixels =
      imageData.data;

    /*
     * Correct contrast calculation.
     *
     * 1.00 = original contrast.
     */
    const contrastAmount =
      (contrast - 1) * 255;

    const contrastFactor =
      (259 *
        (contrastAmount + 255)) /
      (255 *
        (259 -
          contrastAmount));

    /*
     * Apply brightness
     * and contrast.
     */
    for (
      let index = 0;
      index < pixels.length;
      index += 4
    ) {
      let red =
        pixels[index];

      let green =
        pixels[index + 1];

      let blue =
        pixels[index + 2];

      /*
       * Brightness.
       */
      red *= brightness;
      green *= brightness;
      blue *= brightness;

      /*
       * Contrast.
       */
      red =
        contrastFactor *
        (red - 128) +
        128;

      green =
        contrastFactor *
        (green - 128) +
        128;

      blue =
        contrastFactor *
        (blue - 128) +
        128;

      /*
       * Clamp.
       */
      pixels[index] =
        clamp(red, 0, 255);

      pixels[index + 1] =
        clamp(green, 0, 255);

      pixels[index + 2] =
        clamp(blue, 0, 255);
    }

    tempContext.putImageData(
      imageData,
      0,
      0
    );

    /*
     * Final canvas.
     */
    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      OUTPUT_WIDTH;

    canvas.height =
      OUTPUT_HEIGHT;

    const context =
      canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.fillStyle =
      "#ffffff";

    context.fillRect(
      0,
      0,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT
    );

    context.drawImage(
      tempCanvas,
      0,
      0
    );

    /*
     * Final image.
     */
    const croppedImage =
      canvas.toDataURL(
        "image/jpeg",
        0.92
      );

    onApply(croppedImage);
  };

  /*
   * Live preview.
   */
  const imageFilter = `
    brightness(${brightness})
    contrast(${contrast})
  `;

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal">
        {/* HEADER */}

        <div className="crop-modal-header">
          <div>
            <h2>
              Crop Your Photo
            </h2>

            <p>
              Drag on the photo to
              select the passport
              photo area.
            </p>
          </div>

          <button
            type="button"
            className="crop-close-button"
            onClick={onCancel}
          >
            <X size={19} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="crop-modal-content">
          {/* PREVIEW */}

          <div className="crop-preview-area">
            <div
              ref={cropFrameRef}
              className="crop-frame"
              style={{
                position:
                  "relative",

                display:
                  "inline-block",

                maxWidth:
                  "100%",

                maxHeight:
                  "62vh",

                overflow:
                  "hidden",

                lineHeight: 0,

                cursor:
                  interaction
                    ? "grabbing"
                    : "crosshair",

                touchAction:
                  "none",

                userSelect:
                  "none",
              }}
              onPointerDown={
                handleCropStart
              }
              onPointerMove={
                handlePointerMove
              }
              onPointerUp={
                handlePointerEnd
              }
              onPointerCancel={
                handlePointerEnd
              }
              onWheel={
                handleWheelZoom
              }
            >
              <img
                ref={imageRef}
                src={image}
                alt="Crop preview"
                onLoad={
                  handleImageLoad
                }
                draggable={false}
                className="crop-preview-image"
                style={{
                  display:
                    "block",

                  maxWidth:
                    "100%",

                  maxHeight:
                    "62vh",

                  width:
                    "auto",

                  height:
                    "auto",

                  objectFit:
                    "contain",

                  pointerEvents:
                    "none",

                  userSelect:
                    "none",

                  filter:
                    imageFilter,

                  transform:
                    `scale(${zoom})`,

                  transformOrigin:
                    "center center",

                  transition:
                    interaction
                      ? "none"
                      : "transform 0.03s linear",
                }}
              />

              {crop && (
                <>
                  {/* DARK OVERLAY */}

                  <div
                    style={{
                      position:
                        "absolute",

                      inset: 0,

                      pointerEvents:
                        "none",

                      background:
                        "rgba(0, 0, 0, 0.48)",

                      clipPath: `polygon(
                        0 0,
                        100% 0,
                        100% 100%,
                        0 100%,
                        0 0,
                        ${crop.x}px ${crop.y}px,
                        ${crop.x}px ${crop.y +
                        crop.height
                        }px,
                        ${crop.x +
                        crop.width
                        }px ${crop.y +
                        crop.height
                        }px,
                        ${crop.x +
                        crop.width
                        }px ${crop.y}px,
                        ${crop.x}px ${crop.y}px
                      )`,
                    }}
                  />

                  {/* CROP BOX */}

                  <div
                    style={{
                      position:
                        "absolute",

                      left:
                        crop.x,

                      top:
                        crop.y,

                      width:
                        crop.width,

                      height:
                        crop.height,

                      border:
                        "2px solid #ffffff",

                      boxSizing:
                        "border-box",

                      cursor:
                        "move",

                      touchAction:
                        "none",
                    }}
                    onPointerDown={
                      handleMoveStart
                    }
                  >
                    {/* GRID */}

                    <div
                      style={{
                        position:
                          "absolute",

                        inset: 0,

                        pointerEvents:
                          "none",

                        background: `
                          linear-gradient(
                            to right,
                            transparent 33.33%,
                            rgba(255,255,255,0.35) 33.33%,
                            rgba(255,255,255,0.35) 33.6%,
                            transparent 33.6%,
                            transparent 66.66%,
                            rgba(255,255,255,0.35) 66.66%,
                            rgba(255,255,255,0.35) 67%,
                            transparent 67%
                          ),

                          linear-gradient(
                            to bottom,
                            transparent 33.33%,
                            rgba(255,255,255,0.35) 33.33%,
                            rgba(255,255,255,0.35) 33.6%,
                            transparent 33.6%,
                            transparent 66.66%,
                            rgba(255,255,255,0.35) 66.66%,
                            rgba(255,255,255,0.35) 67%,
                            transparent 67%
                          )
                        `,
                      }}
                    />

                    <CropHandle
                      position="top-left"
                      cursor="nwse-resize"
                      onPointerDown={(
                        event
                      ) =>
                        handleResizeStart(
                          event,
                          "top-left"
                        )
                      }
                    />

                    <CropHandle
                      position="top-right"
                      cursor="nesw-resize"
                      onPointerDown={(
                        event
                      ) =>
                        handleResizeStart(
                          event,
                          "top-right"
                        )
                      }
                    />

                    <CropHandle
                      position="bottom-left"
                      cursor="nesw-resize"
                      onPointerDown={(
                        event
                      ) =>
                        handleResizeStart(
                          event,
                          "bottom-left"
                        )
                      }
                    />

                    <CropHandle
                      position="bottom-right"
                      cursor="nwse-resize"
                      onPointerDown={(
                        event
                      ) =>
                        handleResizeStart(
                          event,
                          "bottom-right"
                        )
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <p className="crop-helper-text">
              Drag to select • Move
              the box • Drag corners
              to resize • Scroll to
              zoom
            </p>
          </div>

          {/* CONTROLS */}

          <div className="crop-controls">
            {/* IMAGE ADJUSTMENTS */}

            <div
              className="crop-control-heading"
              style={{
                marginTop:
                  "-15px",
              }}
            >
              <SlidersHorizontal
                size={18}
              />

              <strong>
                Image Adjustments
              </strong>
            </div>

            <p
              style={{
                margin:
                  "-6px 0 4px",

                fontSize:
                  "13px",

                opacity:
                  0.7,
              }}
            >
              Adjust your photo
              before applying.
            </p>

            {/* BRIGHTNESS */}

            <label className="range-control">
              <div>
                <span className="range-title">
                  <Sun size={15} />

                  Brightness
                </span>

                <strong>
                  {brightness.toFixed(
                    2
                  )}
                </strong>
              </div>

              <input
                type="range"
                min={
                  MIN_ADJUSTMENT
                }
                max={
                  MAX_ADJUSTMENT
                }
                step="0.01"
                value={
                  brightness
                }
                onChange={(
                  event
                ) =>
                  setBrightness(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
              />

              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  fontSize:
                    "11px",

                  opacity:
                    0.6,

                  marginTop:
                    "3px",
                }}
              >
                <span>
                  0.50
                </span>

                <span>
                  1.00
                </span>

                <span>
                  1.50
                </span>
              </div>
            </label>

            {/* CONTRAST */}

            <label className="range-control">
              <div>
                <span className="range-title">
                  <Contrast
                    size={15}
                  />

                  Contrast
                </span>

                <strong>
                  {contrast.toFixed(
                    2
                  )}
                </strong>
              </div>

              <input
                type="range"
                min={
                  MIN_ADJUSTMENT
                }
                max={
                  MAX_ADJUSTMENT
                }
                step="0.01"
                value={
                  contrast
                }
                onChange={(
                  event
                ) =>
                  setContrast(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
              />

              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  fontSize:
                    "11px",

                  opacity:
                    0.6,

                  marginTop:
                    "3px",
                }}
              >
                <span>
                  0.50
                </span>

                <span>
                  1.00
                </span>

                <span>
                  1.50
                </span>
              </div>
            </label>

            {/* ZOOM */}

            <div className="range-control">
              <div>
                <span className="range-title">
                  <ZoomIn
                    size={15}
                  />

                  Zoom
                </span>

                <strong>
                  {zoom.toFixed(2)}×
                </strong>
              </div>

              <div
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap: "8px",

                  width: "100%",
                }}
              >
                <button
                  type="button"
                  onClick={
                    handleZoomOut
                  }
                  disabled={
                    zoom <=
                    MIN_ZOOM
                  }
                  aria-label="Zoom out"
                  style={{
                    width:
                      "32px",

                    height:
                      "32px",

                    minWidth:
                      "32px",

                    border:
                      "1px solid rgba(127,127,127,0.2)",

                    borderRadius:
                      "8px",

                    background:
                      "transparent",

                    display:
                      "grid",

                    placeItems:
                      "center",

                    cursor:
                      zoom <=
                        MIN_ZOOM
                        ? "not-allowed"
                        : "pointer",

                    opacity:
                      zoom <=
                        MIN_ZOOM
                        ? 0.4
                        : 1,
                  }}
                >
                  <Minus
                    size={15}
                  />
                </button>

                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={
                    ZOOM_STEP
                  }
                  value={zoom}
                  onChange={(
                    event
                  ) =>
                    updateZoom(
                      event.target
                        .value
                    )
                  }
                  style={{
                    flex: 1,
                  }}
                />

                <button
                  type="button"
                  onClick={
                    handleZoomIn
                  }
                  disabled={
                    zoom >=
                    MAX_ZOOM
                  }
                  aria-label="Zoom in"
                  style={{
                    width:
                      "32px",

                    height:
                      "32px",

                    minWidth:
                      "32px",

                    border:
                      "1px solid rgba(127,127,127,0.2)",

                    borderRadius:
                      "8px",

                    background:
                      "transparent",

                    display:
                      "grid",

                    placeItems:
                      "center",

                    cursor:
                      zoom >=
                        MAX_ZOOM
                        ? "not-allowed"
                        : "pointer",

                    opacity:
                      zoom >=
                        MAX_ZOOM
                        ? 0.4
                        : 1,
                  }}
                >
                  <Plus
                    size={15}
                  />
                </button>
              </div>

              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  fontSize:
                    "11px",

                  opacity:
                    0.6,

                  marginTop:
                    "3px",
                }}
              >
                <span>
                  1.00×
                </span>

                <span>
                  2.00×
                </span>

                <span>
                  3.00×
                </span>
              </div>

              <p
                style={{
                  margin:
                    "6px 0 0",

                  fontSize:
                    "11px",

                  opacity:
                    0.6,
                }}
              >
                Tip: Scroll your
                mouse wheel over the
                photo to zoom.
              </p>
            </div>

            {/* RESET */}

            <button
              type="button"
              className="reset-crop-button"
              onClick={
                handleResetAdjustments
              }
            >
              <RotateCcw
                size={15}
              />

              Reset Adjustments
            </button>
          </div>
        </div>

        {/* FOOTER */}

        <div className="crop-modal-footer">
          <button
            type="button"
            className="secondary-action-button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="apply-crop-button"
            onClick={
              handleApply
            }
            disabled={!crop}
          >
            <Check size={17} />

            Apply Photo
          </button>
        </div>
      </div>
    </div>
  );
}

/*
 * Reusable crop resize handle.
 */
function CropHandle({
  position,
  cursor,
  onPointerDown,
}) {
  const positionStyles = {
    "top-left": {
      top: "-6px",
      left: "-6px",
    },

    "top-right": {
      top: "-6px",
      right: "-6px",
    },

    "bottom-left": {
      bottom: "-6px",
      left: "-6px",
    },

    "bottom-right": {
      bottom: "-6px",
      right: "-6px",
    },
  };

  return (
    <span
      onPointerDown={
        onPointerDown
      }
      style={{
        position:
          "absolute",

        width: "12px",

        height: "12px",

        borderRadius:
          "50%",

        background:
          "#ffffff",

        border:
          "2px solid #111111",

        boxSizing:
          "border-box",

        cursor,

        touchAction:
          "none",

        zIndex: 5,

        ...positionStyles[
        position
        ],
      }}
    />
  );
}

export default CropModal;
