import { useState } from "react";

import Header from "./components/Header";
import StepProgress from "./components/StepProgress";

import PersonSelection from "./routes/PersonSelection";
import PhotoEditor from "./routes/PhotoEditor";
import PreviewPage from "./routes/PreviewPage";

import "./App.css";

function App() {
  const [step, setStep] = useState(1);
  const [numberOfPersons, setNumberOfPersons] = useState(0);
  const [people, setPeople] = useState([]);

  const handlePersonsSelect = (count) => {
    setNumberOfPersons(count);
    setStep(2);
  };

  const handlePhotoEditorNext = (updatedPeople) => {
    setPeople(updatedPeople);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(2);
    }
  };

  return (
    <div className="app">
      <Header step={step} onBack={handleBack} />

      <StepProgress step={step} />

      <main className="app-content">
        {step === 1 && (
          <PersonSelection onSelect={handlePersonsSelect} />
        )}

        {step === 2 && (
          <PhotoEditor
            numberOfPersons={numberOfPersons}
            onNext={handlePhotoEditorNext}
          />
        )}

        {step === 3 && (
          <PreviewPage
            people={people}
            numberOfPersons={numberOfPersons}
          />
        )}
      </main>
    </div>
  );
}

export default App;