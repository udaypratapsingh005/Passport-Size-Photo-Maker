import { useEffect, useRef, useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Move,
  Maximize,
} from "lucide-react";

import { createPassportPhoto } from "../utils/imageProcessor";

function CropEditor({
  photo,
  personNumber,
  onSave,
  onCancel,
}) {
  const imageRef = useRef(null);

  const frameRef = useRef(null);

  const [zoom, setZoom] = useState(
    photo.crop?.zoom || 1
  );

  const [position, setPosition] = useState(
    photo.crop?.position || {
      x: 0,
      y: 0,
    }
  );

  const [isDragging, setIsDragging] =
    useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const dragStart = useRef({
    x: 0,
    y: 0,
  });

  const startPosition = useRef({
    x: 0,
    y: 0,
  });


  /*
    ------------------------------------------------
    Calculate maximum allowed movement
    ------------------------------------------------
  */

  const getBoundedPosition = (
    nextX,
    nextY,
    nextZoom = zoom
  ) => {
    const frame =
      frameRef.current;

    const image =
      imageRef.current;

    if (!frame || !image) {
      return {
        x: nextX,
        y: nextY,
      };
    }

    const frameWidth =
      frame.clientWidth;

    const frameHeight =
      frame.clientHeight;

    const imageWidth =
      image.naturalWidth;

    const imageHeight =
      image.naturalHeight;

    if (
      !imageWidth ||
      !imageHeight
    ) {
      return {
        x: nextX,
        y: nextY,
      };
    }

    const frameRatio =
      frameWidth / frameHeight;

    const imageRatio =
      imageWidth / imageHeight;

    let baseWidth;
    let baseHeight;

    /*
      Same cover calculation
      used by imageProcessor.js
    */

    if (imageRatio > frameRatio) {
      baseHeight = frameHeight;

      baseWidth =
        baseHeight * imageRatio;
    } else {
      baseWidth = frameWidth;

      baseHeight =
        baseWidth / imageRatio;
    }

    const scaledWidth =
      baseWidth * nextZoom;

    const scaledHeight =
      baseHeight * nextZoom;

    /*
      Maximum movement

      Image must always cover
      the complete frame.
    */

    const maxX =
      Math.max(
        0,
        (scaledWidth -
          frameWidth) /
          2
      );

    const maxY =
      Math.max(
        0,
        (scaledHeight -
          frameHeight) /
          2
      );

    return {
      x: Math.min(
        maxX,
        Math.max(-maxX, nextX)
      ),

      y: Math.min(
        maxY,
        Math.max(-maxY, nextY)
      ),
    };
  };


  /*
    Keep current position valid
    when zoom changes.
  */

  useEffect(() => {
    setPosition(
      getBoundedPosition(
        position.x,
        position.y,
        zoom
      )
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);


  /*
    Reset
  */

  const handleReset = () => {
    setZoom(1);

    setPosition({
      x: 0,
      y: 0,
    });
  };


  /*
    Auto Fit
  */

  const handleAutoFit = () => {
    setZoom(1);

    setPosition({
      x: 0,
      y: 0,
    });
  };


  /*
    Mouse Start
  */

  const handleMouseDown = (
    event
  ) => {
    event.preventDefault();

    setIsDragging(true);

    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
    };

    startPosition.current = {
      ...position,
    };
  };


  /*
    Mouse Move
  */

  useEffect(() => {
    const handleMouseMove = (
      event
    ) => {
      if (!isDragging) {
        return;
      }

      const deltaX =
        event.clientX -
        dragStart.current.x;

      const deltaY =
        event.clientY -
        dragStart.current.y;

      const nextPosition =
        getBoundedPosition(
          startPosition.current.x +
            deltaX,

          startPosition.current.y +
            deltaY,

          zoom
        );

      setPosition(
        nextPosition
      );
    };


    const handleMouseUp = () => {
      setIsDragging(false);
    };


    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mouseup",
      handleMouseUp
    );


    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseup",
        handleMouseUp
      );
    };
  }, [
    isDragging,
    zoom,
  ]);


  /*
    Touch Start
  */

  const handleTouchStart = (
    event
  ) => {
    const touch =
      event.touches[0];

    setIsDragging(true);

    dragStart.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    startPosition.current = {
      ...position,
    };
  };


  /*
    Touch Move
  */

  const handleTouchMove = (
    event
  ) => {
    if (!isDragging) {
      return;
    }

    const touch =
      event.touches[0];

    const deltaX =
      touch.clientX -
      dragStart.current.x;

    const deltaY =
      touch.clientY -
      dragStart.current.y;

    const nextPosition =
      getBoundedPosition(
        startPosition.current.x +
          deltaX,

        startPosition.current.y +
          deltaY,

        zoom
      );

    setPosition(
      nextPosition
    );
  };


  const handleTouchEnd = () => {
    setIsDragging(false);
  };


  /*
    Generate
  */

  const handleGenerate = async () => {
    if (!imageRef.current) {
      return;
    }

    try {
      setIsGenerating(true);

      const processedPhoto =
        await createPassportPhoto(
          imageRef.current,
          {
            zoom,
            position,
          }
        );

      onSave({
        zoom,
        position,
        processedPhoto,
      });
    } catch (error) {
      console.error(
        "Photo generation failed:",
        error
      );

      alert(
        "Unable to generate photo. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <section className="crop-editor">

      {/* HEADER */}

      <div className="crop-editor-header">

        <div>

          <span className="editor-step">
            PERSON {personNumber}
          </span>

          <h2>
            Adjust Photo
          </h2>

          <p>
            Position the face inside the
            guide and adjust the zoom.
          </p>

        </div>


        <div className="editor-header-actions">

          <button
            type="button"
            className="reset-button"
            onClick={handleAutoFit}
          >
            <Maximize size={14} />
            Auto Fit
          </button>

          <button
            type="button"
            className="reset-button"
            onClick={handleReset}
          >
            <RotateCcw size={14} />
            Reset
          </button>

        </div>

      </div>


      {/* WORKSPACE */}

      <div className="editor-workspace">

        <div
          ref={frameRef}
          className={
            isDragging
              ? "editor-frame dragging"
              : "editor-frame"
          }
          onMouseDown={
            handleMouseDown
          }
          onTouchStart={
            handleTouchStart
          }
          onTouchMove={
            handleTouchMove
          }
          onTouchEnd={
            handleTouchEnd
          }
        >

          <img
            ref={imageRef}
            src={photo.preview}
            alt={`Person ${personNumber}`}
            draggable="false"
            style={{
              transform: `
                translate(
                  ${position.x}px,
                  ${position.y}px
                )
                scale(${zoom})
              `,
            }}
          />


          {/* FACE GUIDE */}

          <div className="passport-guide">

            <div className="head-guide" />

            <div className="shoulder-guide" />

            <div className="guide-label">
              FACE AREA
            </div>

          </div>


          {/* CENTER */}

          <div className="center-guide" />


          {/* DRAG HINT */}

          {!isDragging && (
            <div className="drag-hint">

              <Move size={14} />

              Drag to position

            </div>
          )}

        </div>


        {/* CONTROLS */}

        <div className="editor-controls">

          <div className="editor-instruction">

            <div className="instruction-icon">
              <Move size={15} />
            </div>

            <div>

              <strong>
                Position your photo
              </strong>

              <span>
                Drag the image until the face
                fits naturally inside the guide.
              </span>

            </div>

          </div>


          {/* ZOOM */}

          <div className="zoom-control">

            <button
              type="button"
              onClick={() =>
                setZoom(
                  Math.max(
                    1,
                    Number(
                      (
                        zoom -
                        0.1
                      ).toFixed(1)
                    )
                  )
                )
              }
              disabled={zoom <= 1}
            >
              <ZoomOut size={16} />
            </button>


            <div className="zoom-slider-wrapper">

              <div className="zoom-label">

                <span>
                  Zoom
                </span>

                <strong>
                  {Math.round(
                    zoom * 100
                  )}
                  %
                </strong>

              </div>


              <input
                type="range"
                min="1"
                max="2.5"
                step="0.1"
                value={zoom}
                onChange={(event) =>
                  setZoom(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
              />

            </div>


            <button
              type="button"
              onClick={() =>
                setZoom(
                  Math.min(
                    2.5,
                    Number(
                      (
                        zoom +
                        0.1
                      ).toFixed(1)
                    )
                  )
                )
              }
              disabled={
                zoom >= 2.5
              }
            >
              <ZoomIn size={16} />
            </button>

          </div>


          {/* ACTIONS */}

          <div className="editor-actions">

            <button
              type="button"
              className="editor-cancel"
              onClick={onCancel}
              disabled={
                isGenerating
              }
            >
              Cancel
            </button>


            <button
              type="button"
              className="editor-generate"
              onClick={
                handleGenerate
              }
              disabled={
                isGenerating
              }
            >

              {isGenerating ? (
                "Generating..."
              ) : (
                <>
                  <Check size={16} />
                  Generate Photo
                </>
              )}

            </button>

          </div>

        </div>

      </div>


      {/* TIP */}

      <div className="editor-tip">

        <strong>
          Passport photo tip:
        </strong>

        Keep your face straight,
        eyes visible, head centered,
        and shoulders naturally visible.

      </div>

    </section>
  );
}

export default CropEditor;