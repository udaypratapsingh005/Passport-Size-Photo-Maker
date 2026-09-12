import { Users } from "lucide-react";

function PersonSelection({ onSelect }) {
  const personOptions = Array.from({ length: 10 }, (_, index) => index + 1);

  return (
    <section className="selection-page">
      <div className="plan-badge">
        <span>●</span>
        Monthly Plan - Valid till 12 Oct 2026
      </div>

      <div className="selection-card">
        <div className="section-heading">
          <div className="step-number">1</div>

          <h2>
            Select Number of Persons{" "}
            <span>| व्यक्तियों की संख्या चुनें</span>
          </h2>
        </div>

        <div className="section-divider" />

        <div className="selection-question">
          <Users size={22} />
          <p>How many persons' photos do you want to create?</p>
        </div>

        <div className="person-options">
          {personOptions.map((number) => (
            <button
              key={number}
              className="person-option"
              onClick={() => onSelect(number)}
            >
              <strong>{number}</strong>
              <span>{number === 1 ? "Person" : "People"}</span>
            </button>
          ))}
        </div>

        <div className="selection-info">
          💡 You can create passport photos for up to{" "}
          <strong>10 people</strong> in one batch.
        </div>
      </div>
    </section>
  );
}

export default PersonSelection;