import {
  CheckCircle2,
  Image as ImageIcon,
  Maximize2,
} from "lucide-react";

function PhotoPreview({ photos }) {
  const generatedPhotos = photos.filter(
    (photo) =>
      photo.processedPhoto?.previewUrl
  );

  if (!generatedPhotos.length) {
    return null;
  }

  return (
    <section className="photo-preview-section">

      {/* HEADER */}

      <div className="preview-section-header">

        <div className="preview-heading">

          <div className="preview-icon">
            <ImageIcon size={19} />
          </div>

          <div>
            <h2>
              Generated Photos
            </h2>

            <p>
              Review your passport photos before
              downloading the final sheet.
            </p>
          </div>

        </div>


        <div className="preview-status">

          <CheckCircle2 size={15} />

          <span>
            {generatedPhotos.length} Photos Ready
          </span>

        </div>

      </div>


      {/* PHOTO GRID */}

      <div className="generated-photo-grid">

        {generatedPhotos.map(
          (photo, index) => (
            <div
              className="generated-photo-card"
              key={photo.id}
            >

              <div className="generated-photo-number">
                {index + 1}
              </div>


              <div className="generated-image-wrapper">

                <img
                  src={
                    photo.processedPhoto
                      .previewUrl
                  }
                  alt={`Passport photo ${
                    index + 1
                  }`}
                />


                <div className="generated-image-overlay">

                  <Maximize2 size={14} />

                  <span>
                    Passport Photo
                  </span>

                </div>

              </div>


              <div className="generated-photo-info">

                <strong>
                  Person {index + 1}
                </strong>

                <span>
                  Passport size
                </span>

              </div>

            </div>
          )
        )}

      </div>


      {/* VERIFICATION NOTE */}

      <div className="preview-verification">

        <div className="verification-icon">
          <CheckCircle2 size={16} />
        </div>

        <div>

          <strong>
            Final preview looks good?
          </strong>

          <span>
            Check face position, background and
            framing before downloading your files.
          </span>

        </div>

      </div>

    </section>
  );
}

export default PhotoPreview;