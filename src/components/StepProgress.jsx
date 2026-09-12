import { Upload, SlidersHorizontal, Download } from "lucide-react";

function StepProgress({ step }) {
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
    <div className="step-progress">
      {steps.map((item, index) => {
        const Icon = item.icon;
        const isActive = step === item.number;
        const isCompleted = step > item.number;

        return (
          <div className="progress-item-wrapper" key={item.number}>
            <div
              className={`progress-item ${
                isActive ? "active" : ""
              } ${isCompleted ? "completed" : ""}`}
            >
              <div className="progress-icon">
                <Icon size={16} />
              </div>

              <div className="progress-text">
                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`progress-line ${
                  step > item.number ? "filled" : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StepProgress;