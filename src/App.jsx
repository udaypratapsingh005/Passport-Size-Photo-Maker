
import { useState } from "react";

import Header from "./components/Header";
import StepProgress from "./components/StepProgress";
import ToolCategories from "./components/ToolCategories";
import ToolWorkspace from "./components/ToolWorkspace";

import PersonSelection from "./routes/PersonSelection";
import PhotoEditor from "./routes/PhotoEditor";
import PreviewPage from "./routes/PreviewPage";

import "./App.css";

function App() {
  const [step, setStep] = useState(1);
  const [numberOfPersons, setNumberOfPersons] = useState(0);
  const [people, setPeople] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);

  // Create the initial list of people
  const handlePersonsSelect = (count) => {
    const initialPeople = Array.from(
      { length: count },
      (_, index) => ({
        id: index + 1,
        photo: null,
        quantity: 4,
      })
    );

    setNumberOfPersons(count);
    setPeople(initialPeople);
    setStep(2);
  };

  // Save edited photos and move to preview
  const handlePhotoEditorNext = (updatedPeople) => {
    setPeople(updatedPeople);
    setStep(3);
  };

  // Update people data from the photo editor
  const handlePeopleUpdate = (updatedPeople) => {
    setPeople(updatedPeople);
  };

  // Navigate to the previous step
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  // Open a selected tool
  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
  };

  // Close the tool workspace
  const handleToolClose = () => {
    setSelectedTool(null);
  };

  return (
    <div className="app">
      <Header
        step={step}
        onBack={handleBack}
      />

      <StepProgress step={step} />

      <main className="app-content">
        {step === 1 && (
          <>
            <PersonSelection
              onSelect={handlePersonsSelect}
            />

            <ToolCategories
              onSelectTool={handleToolSelect}
            />
          </>
        )}

        {step === 2 && (
          <PhotoEditor
            numberOfPersons={numberOfPersons}
            people={people}
            onPeopleUpdate={handlePeopleUpdate}
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

      {/* Selected Tool Workspace */}
      {selectedTool && (
        <ToolWorkspace
          tool={selectedTool}
          onClose={handleToolClose}
        />
      )}
    </div>
  );
}

export default App;
