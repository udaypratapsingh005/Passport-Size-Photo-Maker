import { Camera, ArrowLeft, ShieldCheck } from "lucide-react";

function Header({ step, onBack }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-icon">
          <img src="./src/assets/favicon.svg" alt="Passport Photo Maker" width="28" height="28"/>
        </div>

        <div>
          <h1>Passport Photo Maker</h1>
            <p>Make passport size photos easily</p> 
        </div>
      </div>

      <div className="header-right">
        <div className="privacy-badge">
          <ShieldCheck size={15} />
          <span>Your photos stay on your device</span>
        </div>

        {step > 1 && (
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;