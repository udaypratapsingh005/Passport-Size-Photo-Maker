import {
  useEffect,
  useState,
} from "react";

import Header from "./components/Header";
import StepProgress from "./components/StepProgress";
import PeopleSelector from "./components/PeopleSelector";
import PhotoUploader from "./components/PhotoUploader";
import CropEditor from "./components/CropEditor";
import PhotoPreview from "./components/PhotoPreview";
import PrintSheet from "./components/PrintSheet";
import PhotoSettings from "./components/PhotoSettings";

import "./App.css";

function App() {

  const [photoSize, setPhotoSize] =
    useState({
      id: "35x45",
      title: "35 × 45 mm",
      subtitle: "Standard passport",
      width: 35,
      height: 45,
    });

  const [selectedPeople, setSelectedPeople] =
    useState(0);

  const [photos, setPhotos] = useState([]);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [editingPhotoId, setEditingPhotoId] =
    useState(null);

  const [photosPerRow, setPhotosPerRow] =
    useState(6);


  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);


  /* ================= PEOPLE ================= */

  const handlePeopleChange = (number) => {
    setSelectedPeople(number);

    if (photos.length > number) {
      setPhotos((currentPhotos) => {
        const photosToRemove =
          currentPhotos.slice(number);

        photosToRemove.forEach((photo) => {
          URL.revokeObjectURL(
            photo.preview
          );

          if (
            photo.processedPhoto?.previewUrl
          ) {
            URL.revokeObjectURL(
              photo.processedPhoto.previewUrl
            );
          }
        });

        return currentPhotos.slice(0, number);
      });
    }

    setEditingPhotoId(null);
  };


  /* ================= EDIT ================= */

  const handleEditPhoto = (photoId) => {
    setEditingPhotoId(photoId);
  };


  const handleSaveCrop = (cropData) => {
    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) =>
        photo.id === editingPhotoId
          ? {
            ...photo,

            crop: {
              zoom: cropData.zoom,
              position:
                cropData.position,
            },

            processedPhoto:
              cropData.processedPhoto,
          }
          : photo
      )
    );

    setEditingPhotoId(null);
  };


  const handleCancelCrop = () => {
    setEditingPhotoId(null);
  };


  /* ================= PAGE NAVIGATION ================= */

  const goToAdjustPage = () => {
    if (photos.length !== selectedPeople) {
      return;
    }

    setCurrentPage(2);
  };


  const goToPreviewPage = () => {
    const allPhotosProcessed =
      photos.length > 0 &&
      photos.every(
        (photo) =>
          photo.processedPhoto?.previewUrl
      );

    if (!allPhotosProcessed) {
      alert(
        "Please adjust and generate all photos first."
      );

      return;
    }

    setCurrentPage(3);
  };


  const goBack = () => {
    if (currentPage === 2) {
      setCurrentPage(1);
      setEditingPhotoId(null);
      return;
    }

    if (currentPage === 3) {
      setCurrentPage(2);
      return;
    }
  };


  /* ================= RENDER ================= */

  return (
    <div className="app">

      <Header />


      <StepProgress
        currentStep={currentPage}
      />


      <main className="main-container">

        {/* HERO */}

        <section className="hero">

          <div className="hero-content">

            <span className="hero-tag">
              ✨ SIMPLE · FAST · PRIVATE
            </span>

            <h2>
              Create passport photos
              <br />
              in a few clicks.
            </h2>

            <p>
              Upload photos, adjust them perfectly,
              create a print-ready sheet and download
              it as JPG or PDF.
            </p>

          </div>


          <div className="hero-info">

            <span>Batch Limit</span>

            <strong>
              10 People
            </strong>

            <small>
              per batch
            </small>

          </div>

        </section>


        {/* ================= PAGE 1 ================= */}

        {currentPage === 1 && (
          <>

            <PeopleSelector
              selectedPeople={selectedPeople}
              setSelectedPeople={
                handlePeopleChange
              }
            />


            <PhotoUploader
              selectedPeople={selectedPeople}
              photos={photos}
              setPhotos={setPhotos}
              onEditPhoto={handleEditPhoto}
              onContinue={goToAdjustPage}
            />

          </>
        )}


        {/* ================= PAGE 2 ================= */}

        {currentPage === 2 && (
          <>

            <div className="page-navigation">

              <button
                type="button"
                className="back-page-button"
                onClick={goBack}
              >
                ← Back to Upload
              </button>

              <div className="page-title">

                <span>
                  STEP 2
                </span>

                <h2>
                  Adjust Your Photos
                </h2>

                <p>
                  Adjust every person's photo before
                  creating the final sheet.
                </p>

              </div>

            </div>


            {!editingPhotoId && (
              <section className="adjust-list">

                {photos.map(
                  (photo, index) => (
                    <div
                      className="adjust-row"
                      key={photo.id}
                    >

                      <div className="adjust-person">

                        <div className="adjust-number">
                          {index + 1}
                        </div>

                        <img
                          src={photo.preview}
                          alt={`Person ${index + 1
                            }`}
                        />

                        <div>
                          <strong>
                            Person {index + 1}
                          </strong>

                          <span>
                            {photo.processedPhoto
                              ? "Photo generated ✓"
                              : "Ready to adjust"}
                          </span>
                        </div>

                      </div>


                      <button
                        type="button"
                        className="adjust-button"
                        onClick={() =>
                          handleEditPhoto(
                            photo.id
                          )
                        }
                      >
                        {photo.processedPhoto
                          ? "Edit Again"
                          : "Adjust Photo"}
                      </button>

                    </div>
                  )
                )}


                <div className="adjust-footer">

                  <div>
                    <strong>
                      {generatedPhotos.length} /{" "}
                      {selectedPeople} photos ready
                    </strong>

                    <span>
                      Every photo must be generated
                      before continuing.
                    </span>
                  </div>


                  <button
                    type="button"
                    className="continue-button"
                    disabled={
                      generatedPhotos.length !==
                      selectedPeople
                    }
                    onClick={
                      goToPreviewPage
                    }
                  >
                    Continue to Preview

                    <span>→</span>
                  </button>

                </div>

              </section>
            )}


            {editingPhotoId &&
              editingPhoto && (
                <CropEditor
                  photo={editingPhoto}
                  personNumber={
                    editingPhotoIndex + 1
                  }
                  onSave={handleSaveCrop}
                  onCancel={
                    handleCancelCrop
                  }
                />
              )}

          </>
        )}


        {/* ================= PAGE 3 ================= */}

        {currentPage === 3 && (
          <>

            <div className="page-navigation">

              <button
                type="button"
                className="back-page-button"
                onClick={goBack}
              >
                ← Back to Adjust
              </button>

              <div className="page-title">

                <span>
                  STEP 3
                </span>

                <h2>
                  Preview & Download
                </h2>

                <p>
                  Check your final passport photos and
                  print sheet before downloading.
                </p>

              </div>

            </div>


            <PhotoPreview
              photos={photos}
            />


            <PrintSheet
              photos={photos}
              photosPerRow={photosPerRow}
              setPhotosPerRow={setPhotosPerRow}
              photoSize={photoSize}
              onDownloadJpg={handleDownloadJpg}
              onDownloadPdf={handleDownloadPdf}
              isDownloadingJpg={isDownloadingJpg}
              isDownloadingPdf={isDownloadingPdf}
            />

          </>
        )}

      </main>


      <footer className="footer">

        <div className="footer-brand">
          <strong>
            Passport Photo Maker
          </strong>
        </div>

        <div className="footer-links">
          <span>About</span>
          <span>Privacy</span>
          <span>How it works</span>
        </div>

        <span className="footer-copy">
          Fast · Secure · Browser Based
        </span>

      </footer>

    </div>
  );
}

export default App;