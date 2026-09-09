import {
  Ruler,
  Check,
} from "lucide-react";

function PhotoSettings({
  photoSize,
  setPhotoSize,
}) {
  const sizes = [
    {
      id: "35x45",
      title: "35 × 45 mm",
      subtitle: "Standard passport",
      width: 35,
      height: 45,
    },
    {
      id: "2x2",
      title: "2 × 2 inch",
      subtitle: "Square photo",
      width: 50.8,
      height: 50.8,
    },
  ];

  return (
    <div className="photo-settings">

      <div className="photo-settings-heading">

        <div className="photo-settings-icon">
          <Ruler size={16} />
        </div>

        <div>
          <strong>
            Photo Size
          </strong>

          <span>
            Select the required passport photo
            dimensions.
          </span>
        </div>

      </div>


      <div className="photo-size-options">

        {sizes.map((size) => {

          const isActive =
            photoSize.id === size.id;

          return (
            <button
              key={size.id}
              type="button"
              className={
                isActive
                  ? "photo-size-option active"
                  : "photo-size-option"
              }
              onClick={() =>
                setPhotoSize(size)
              }
            >

              <div className="size-option-top">

                <strong>
                  {size.title}
                </strong>

                {isActive && (
                  <Check size={14} />
                )}

              </div>

              <span>
                {size.subtitle}
              </span>

            </button>
          );
        })}

      </div>

    </div>
  );
}

export default PhotoSettings;