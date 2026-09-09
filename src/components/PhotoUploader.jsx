import { useRef } from "react";
import {
  ImagePlus,
  Upload,
  X,
  ArrowRight,
} from "lucide-react";

function PhotoUploader({
  selectedPeople,
  photos,
  setPhotos,
  onEditPhoto,
  onContinue,
}) {
  const fileInputRef = useRef(null);

  const remainingSlots =
    selectedPeople - photos.length;

  const handleFiles = (event) => {
    const selectedFiles = Array.from(
      event.target.files
    );

    if (!selectedFiles.length) {
      return;
    }

    const filesToAdd = selectedFiles
      .slice(0, remainingSlots)
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        crop: {
          zoom: 1,
          position: {
            x: 0,
            y: 0,
          },
        },
      }));

    setPhotos((currentPhotos) => [
      ...currentPhotos,
      ...filesToAdd,
    ]);

    event.target.value = "";
  };

  const handleUploadClick = () => {
    if (photos.length < selectedPeople) {
      fileInputRef.current?.click();
    }
  };

  const removePhoto = (photoId) => {
    setPhotos((currentPhotos) => {
      const photoToRemove = currentPhotos.find(
        (photo) => photo.id === photoId
      );

      if (photoToRemove) {
        URL.revokeObjectURL(
          photoToRemove.preview
        );

        if (
          photoToRemove.processedPhoto?.previewUrl
        ) {
          URL.revokeObjectURL(
            photoToRemove.processedPhoto.previewUrl
          );
        }
      }

      return currentPhotos.filter(
        (photo) => photo.id !== photoId
      );
    });
  };

  const handleContinue = () => {
    if (photos.length !== selectedPeople) {
      return;
    }

    onContinue();
  };

  if (selectedPeople === 0) {
    return null;
  }

  return (
    <section className="uploader-card">

      <div className="uploader-header">

        <div className="uploader-title">

          <div className="uploader-icon">
            <ImagePlus size={20} />
          </div>

          <div>
            <h2>Upload Photos</h2>

            <p>
              Upload one photo for each person.
            </p>
          </div>

        </div>

        <div className="upload-count">
          {photos.length} / {selectedPeople} Uploaded
        </div>

      </div>


      {/* Upload Area */}

      {photos.length < selectedPeople && (
        <div className="upload-area">

          <div className="upload-icon">
            <Upload size={26} />
          </div>

          <h3>
            Upload your photos
          </h3>

          <p>
            Select up to {remainingSlots} more{" "}
            {remainingSlots === 1
              ? "photo"
              : "photos"}
          </p>

          <span className="upload-format">
            JPG, JPEG or PNG
          </span>

          <button
            type="button"
            className="upload-button"
            onClick={handleUploadClick}
          >
            <Upload size={17} />
            Choose Photos
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            multiple
            hidden
            onChange={handleFiles}
          />

        </div>
      )}


      {/* Uploaded Photos */}

      {photos.length > 0 && (
        <div className="uploaded-section">

          <div className="uploaded-heading">

            <h3>
              Uploaded Photos
            </h3>

            <span>
              {photos.length} of {selectedPeople}
            </span>

          </div>


          <div className="uploaded-grid">

            {photos.map((photo, index) => (
              <div
                className="photo-card"
                key={photo.id}
              >

                <div className="photo-number">
                  Person {index + 1}
                </div>

                <div
                  className="photo-preview"
                  onClick={() =>
                    onEditPhoto(photo.id)
                  }
                >

                  <img
                    src={photo.preview}
                    alt={`Person ${index + 1}`}
                  />

                  <div className="edit-overlay">
                    Adjust Photo
                  </div>

                </div>


                <button
                  type="button"
                  className="remove-photo"
                  onClick={() =>
                    removePhoto(photo.id)
                  }
                  aria-label={`Remove person ${index + 1}`}
                >
                  <X size={16} />
                </button>


                <button
                  type="button"
                  className="edit-photo-button"
                  onClick={() =>
                    onEditPhoto(photo.id)
                  }
                >
                  Adjust Photo
                </button>

              </div>
            ))}


            {photos.length < selectedPeople && (
              <button
                type="button"
                className="add-photo-card"
                onClick={handleUploadClick}
              >
                <ImagePlus size={25} />

                <span>
                  Add Photo
                </span>

                <small>
                  {remainingSlots} slot
                  {remainingSlots > 1
                    ? "s"
                    : ""}{" "}
                  remaining
                </small>
              </button>
            )}

          </div>


          {/* Continue */}

          <div className="continue-container">

            <div>
              <strong>
                {photos.length === selectedPeople
                  ? "All photos uploaded"
                  : `${remainingSlots} photo${
                      remainingSlots > 1
                        ? "s"
                        : ""
                    } remaining`}
              </strong>

              <span>
                Adjust each photo on the next step.
              </span>
            </div>

            <button
              type="button"
              className="continue-button"
              disabled={
                photos.length !== selectedPeople
              }
              onClick={handleContinue}
            >
              Continue to Adjust

              <ArrowRight size={17} />
            </button>

          </div>

        </div>
      )}

    </section>
  );
}

export default PhotoUploader;