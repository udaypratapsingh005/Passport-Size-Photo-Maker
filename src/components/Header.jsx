import { Camera, ArrowLeft, ShieldCheck } from "lucide-react";

function Header({ step, onBack }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-icon">
          <Camera size={28} strokeWidth={2.5} />
        </div>

        <div>
          <h1>Passport Photo Maker</h1>
          <p>पासपोर्ट साइज फोटो मेकर</p>
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