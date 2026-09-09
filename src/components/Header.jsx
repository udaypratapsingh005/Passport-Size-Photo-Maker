import { Camera, LockKeyhole } from "lucide-react";

function Header() {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-icon">
          <Camera size={25} />
        </div>

        <div className="brand-text">
          <h1>Passport Photo Maker</h1>
          <p>पासपोर्ट साइज फोटो मेकर</p>
        </div>
      </div>

      <div className="header-right">
        <div className="privacy-badge">
          <LockKeyhole size={15} />
          <span>Your photos stay on your device</span>
        </div>

        <button className="back-btn" type="button">
          ← Back
        </button>
      </div>
    </header>
  );
}

export default Header;