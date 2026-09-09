import { Users } from "lucide-react";

function PeopleSelector({
  selectedPeople,
  setSelectedPeople,
}) {
  const peopleOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <section className="people-card">
      <div className="people-header">
        <div className="people-title">
          <div className="people-icon">
            <Users size={20} />
          </div>

          <div>
            <h2>Select Number of People</h2>

            <p>
              Choose how many people's photos you want
              to create.
            </p>
          </div>
        </div>

        <div className="selected-count">
          {selectedPeople} / 10 Selected
        </div>
      </div>

      <div className="people-grid">
        {peopleOptions.map((number) => {
          const isSelected =
            selectedPeople === number;

          return (
            <button
              key={number}
              type="button"
              className={
                isSelected
                  ? "person-option selected"
                  : "person-option"
              }
              onClick={() =>
                setSelectedPeople(number)
              }
            >
              <span className="person-number">
                {number}
              </span>

              <span className="person-label">
                {number === 1 ? "Person" : "People"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="people-info">
        <span>💡</span>

        <p>
          You can create passport photos for up to
          <strong> 10 people </strong>
          in one batch.
        </p>
      </div>
    </section>
  );
}

export default PeopleSelector;