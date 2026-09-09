import {
  Upload,
  SlidersHorizontal,
  Download,
  Check,
} from "lucide-react";

function StepProgress({ currentStep }) {
  const steps = [
    {
      number: 1,
      title: "Upload",
      subtitle: "Choose photos",
      icon: Upload,
    },
    {
      number: 2,
      title: "Adjust",
      subtitle: "Position photos",
      icon: SlidersHorizontal,
    },
    {
      number: 3,
      title: "Download",
      subtitle: "Get your photos",
      icon: Download,
    },
  ];

  return (
    <div className="step-progress-wrapper">
      <div className="step-progress">

        {steps.map((step, index) => {
          const Icon = step.icon;

          const isCompleted =
            currentStep > step.number;

          const isCurrent =
            currentStep === step.number;

          const isUpcoming =
            currentStep < step.number;

          return (
            <div
              className="step-item-wrapper"
              key={step.number}
            >

              <div
                className={[
                  "step-item",
                  isCompleted
                    ? "completed"
                    : "",
                  isCurrent
                    ? "current"
                    : "",
                  isUpcoming
                    ? "upcoming"
                    : "",
                ].join(" ")}
              >

                <div className="step-circle">

                  {isCompleted ? (
                    <Check size={15} />
                  ) : (
                    <Icon size={15} />
                  )}

                </div>

                <div className="step-text">

                  <strong>
                    {step.title}
                  </strong>

                  <span>
                    {step.subtitle}
                  </span>

                </div>

              </div>


              {index < steps.length - 1 && (
                <div
                  className={
                    currentStep >
                    step.number
                      ? "step-line completed"
                      : "step-line"
                  }
                />
              )}

            </div>
          );
        })}

      </div>
    </div>
  );
}

export default StepProgress;