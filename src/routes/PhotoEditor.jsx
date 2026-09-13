import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Info } from "lucide-react";

import PersonCard from "../components/PersonCard";
import CropModal from "../components/CropModal";

function PhotoEditor({
  numberOfPersons,
  people,
  onPeopleUpdate,
  onNext,
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  const maxQuantity = numberOfPersons === 1 ? 42 : 6;
  const minQuantity = 4;

  const uploadedCount = useMemo(
    () => people.filter((person) => person.photo).length,
    [people]
  );

  const updatePerson = (personId, updates) => {
    const updatedPeople = people.map((person) =>
      person.id === personId
        ? {
            ...person,
            ...updates,
          }
        : person
    );

    onPeopleUpdate(updatedPeople);
  };

  const handleUpload = (personId) => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/jpeg,image/png,image/jpg";

    input.onchange = (event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }

      const imageUrl = URL.createObjectURL(file);

      setSelectedPersonId(personId);
      setSelectedImage(imageUrl);
    };

    input.click();
  };

  const handleApplyCrop = (croppedImage) => {
    updatePerson(selectedPersonId, {
      photo: croppedImage,
    });

    setSelectedImage(null);
    setSelectedPersonId(null);
  };

  const handleCancelCrop = () => {
    setSelectedImage(null);
    setSelectedPersonId(null);
  };

  const handleRemove = (personId) => {
    updatePerson(personId, {
      photo: null,
      quantity: minQuantity,
    });
  };

  const handleQuantityChange = (personId, quantity) => {
    updatePerson(personId, {
      quantity,
    });
  };

  const handleContinue = () => {
    if (uploadedCount !== numberOfPersons) return;

    onNext(people);
  };

  return (
    <>
      <section className="photo-editor-page">
        <div className="editor-topbar">
          <div>
            <h2>Add Photos</h2>
            <p>
              Upload and adjust photos for each person before generating the
              sheet.
            </p>
          </div>

          <div className="upload-status">
            <CheckCircle2 size={17} />
            <span>
              {uploadedCount}/{numberOfPersons} uploaded
            </span>
          </div>
        </div>

        <div className="editor-info">
          <Info size={18} />
          <p>
            {numberOfPersons === 1
              ? "Single person mode: You can select between 4 and 42 copies."
              : "Multiple person mode: Each person can select between 4 and 6 copies."}
          </p>
        </div>

        <div className="person-cards-grid">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              personNumber={person.id}
              photo={person.photo}
              quantity={person.quantity}
              minQuantity={minQuantity}
              maxQuantity={maxQuantity}
              onUpload={() => handleUpload(person.id)}
              onRemove={() => handleRemove(person.id)}
              onQuantityChange={(quantity) =>
                handleQuantityChange(person.id, quantity)
              }
            />
          ))}
        </div>

        <div className="editor-footer">
          <div>
            <strong>
              {uploadedCount === numberOfPersons
                ? "All photos uploaded"
                : "Upload all photos to continue"}
            </strong>

            <span>
              {numberOfPersons}{" "}
              {numberOfPersons === 1 ? "person" : "people"} selected
            </span>
          </div>

          <button
            className="primary-action-button"
            onClick={handleContinue}
            disabled={uploadedCount !== numberOfPersons}
            type="button"
          >
            Continue to Preview
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {selectedImage && (
        <CropModal
          image={selectedImage}
          onApply={handleApplyCrop}
          onCancel={handleCancelCrop}
        />
      )}
    </>
  );
}

export default PhotoEditor;