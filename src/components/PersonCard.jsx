import { ImagePlus, Minus, Plus, X } from "lucide-react";

function PersonCard({
  personNumber,
  photo,
  quantity,
  minQuantity,
  maxQuantity,
  onUpload,
  onRemove,
  onQuantityChange,
}) {
  const handleDecrease = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="person-card">
      <div className="person-card-header">
        <div>
          <h3>Person {personNumber}</h3>
          <p>
            {photo
              ? "Photo uploaded successfully"
              : "Upload passport size photo"}
          </p>
        </div>

        {photo && (
          <button
            className="remove-photo-button"
            onClick={onRemove}
            type="button"
            aria-label={`Remove photo for person ${personNumber}`}
          >
            <X size={17} />
          </button>
        )}
      </div>

      <div className="person-card-body">
        {photo ? (
          <div className="uploaded-photo-wrapper">
            <img
              src={photo}
              alt={`Person ${personNumber}`}
              className="uploaded-photo"
            />
          </div>
        ) : (
          <button
            className="upload-photo-box"
            onClick={onUpload}
            type="button"
          >
            <ImagePlus size={30} />
            <strong>Upload Photo</strong>
            <span>JPG, PNG supported</span>
          </button>
        )}

        {photo && (
          <div className="quantity-section">
            <div>
              <strong>Number of copies</strong>
              <span>
                Select between {minQuantity}–{maxQuantity} copies
              </span>
            </div>

            <div className="quantity-control">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={quantity <= minQuantity}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>

              <strong>{quantity}</strong>

              <button
                type="button"
                onClick={handleIncrease}
                disabled={quantity >= maxQuantity}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonCard;