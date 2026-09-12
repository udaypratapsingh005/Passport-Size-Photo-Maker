import { useEffect, useRef, useState } from "react";
import { Check, Move, RotateCcw, X, ZoomIn } from "lucide-react";

function CropModal({ image, onApply, onCancel }) {
  const imageRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

  useEffect(() => {
    setZoom(1);
    setPositionX(0);
    setPositionY(0);
  }, [image]);

  if (!image) return null;

  const handleReset = () => {
    setZoom(1);
    setPositionX(0);
    setPositionY(0);
  };

  const handleApply = () => {
    const img = imageRef.current;

    if (!img) return;

    const canvas = document.createElement("canvas");

    // Passport photo ratio: 35 x 45
    canvas.width = 350;
    canvas.height = 450;

    const context = canvas.getContext("2d");

    const sourceWidth = img.naturalWidth;
    const sourceHeight = img.naturalHeight;

    const cropRatio = canvas.width / canvas.height;
    const imageRatio = sourceWidth / sourceHeight;

    let baseWidth;
    let baseHeight;

    if (imageRatio > cropRatio) {
      baseHeight = canvas.height;
      baseWidth = baseHeight * imageRatio;
    } else {
      baseWidth = canvas.width;
      baseHeight = baseWidth / imageRatio;
    }

    const scaledWidth = baseWidth * zoom;
    const scaledHeight = baseHeight * zoom;

    const offsetX =
      (canvas.width - scaledWidth) / 2 +
      (positionX / 100) * canvas.width;

    const offsetY =
      (canvas.height - scaledHeight) / 2 +
      (positionY / 100) * canvas.height;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.drawImage(
      img,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight
    );

    const croppedImage = canvas.toDataURL("image/jpeg", 0.92);

    onApply(croppedImage);
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal">
        <div className="crop-modal-header">
          <div>
            <h2>Adjust Your Photo</h2>
            <p>Position the face properly inside the passport frame</p>
          </div>

          <button
            type="button"
            className="crop-close-button"
            onClick={onCancel}
          >
            <X size={19} />
          </button>
        </div>

        <div className="crop-modal-content">
          <div className="crop-preview-area">
            <div className="crop-frame">
              <img
                ref={imageRef}
                src={image}
                alt="Crop preview"
                className="crop-preview-image"
                style={{
                  transform: `translate(${positionX}px, ${positionY}px) scale(${zoom})`,
                }}
              />

              <div className="crop-overlay-frame" />
            </div>

            <p className="crop-helper-text">
              Keep your face centered and clearly visible
            </p>
          </div>

          <div className="crop-controls">
            <div className="crop-control-heading">
              <Move size={17} />
              <strong>Photo Adjustments</strong>
            </div>

            <label className="range-control">
              <div>
                <span>Horizontal Position</span>
                <strong>{positionX}</strong>
              </div>

              <input
                type="range"
                min="-80"
                max="80"
                value={positionX}
                onChange={(event) =>
                  setPositionX(Number(event.target.value))
                }
              />
            </label>

            <label className="range-control">
              <div>
                <span>Vertical Position</span>
                <strong>{positionY}</strong>
              </div>

              <input
                type="range"
                min="-80"
                max="80"
                value={positionY}
                onChange={(event) =>
                  setPositionY(Number(event.target.value))
                }
              />
            </label>

            <label className="range-control">
              <div>
                <span className="range-title">
                  <ZoomIn size={15} />
                  Zoom
                </span>
                <strong>{zoom.toFixed(1)}x</strong>
              </div>

              <input
                type="range"
                min="1"
                max="2.5"
                step="0.1"
                value={zoom}
                onChange={(event) =>
                  setZoom(Number(event.target.value))
                }
              />
            </label>

            <button
              type="button"
              className="reset-crop-button"
              onClick={handleReset}
            >
              <RotateCcw size={15} />
              Reset Adjustments
            </button>
          </div>
        </div>

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
            onClick={handleApply}
          >
            <Check size={17} />
            Apply Photo
          </button>
        </div>
      </div>
    </div>
  );
}

export default CropModal;