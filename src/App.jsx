import React, { useState } from 'react';

// FIX #1: Import the main stylesheet for Tailwind CSS to work.
// This assumes your index.css is in the src/ folder with App.jsx
import './index.css'; 

// FIX #2: Update all component imports to use the .jsx extension.
// Note the updated path for CleaningMode if you used the recommended folder structure.
import LightWeldMode from './components/LightWeldMode.jsx';
import WeldingMode from './components/WeldingMode.jsx';
import CleaningMode from './components/CleaningMode.jsx'; 
import CuttingMode from './components/CuttingMode.jsx';

const App = () => {
  // This state determines which mode is currently active.
  // 'null' means the initial selection screen is shown.
  const [currentMode, setCurrentMode] = useState(null);

  // Sets the current mode based on user selection.
  const handleModeSelection = (mode) => {
    setCurrentMode(mode);
  };

  // Resets the app to the initial mode selection screen.
  const goToHomeScreen = () => {
    setCurrentMode(null);
  };

  // This function returns the component corresponding to the active mode.
  const renderCurrentMode = () => {
    switch (currentMode) {
      case 'lightWelding':
        return <LightWeldMode goToHomeScreen={goToHomeScreen} />;
      case 'welding':
        return <WeldingMode goToHomeScreen={goToHomeScreen} />;
      case 'cleaning':
        return <CleaningMode goToHomeScreen={goToHomeScreen} />;
      case 'cutting':
        return <CuttingMode goToHomeScreen={goToHomeScreen} />;
      default:
        // If no mode is selected, render the initial selection screen.
        return (
            <div id="introSection" className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg text-center mx-auto mt-10">
              <h1 className="text-4xl font-bold text-gray-800 mb-6">Laser Parameter Calculator</h1>
              <p className="text-xl text-gray-600 mb-8">Select an application mode to begin:</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {['welding', 'lightWelding', 'cleaning', 'cutting'].map((modeName) => (
                  <button
                    key={modeName}
                    className={`p-4 rounded-lg shadow-md text-lg font-semibold transition-all duration-200 ease-in-out transform hover:scale-105
                                ${modeName === 'welding' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}
                                ${modeName === 'lightWelding' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                                ${modeName === 'cleaning' ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : ''}
                                ${modeName === 'cutting' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                    onClick={() => handleModeSelection(modeName)}
                  >
                    {modeName.charAt(0).toUpperCase() + modeName.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                  </button>
                ))}
              </div>
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      <div className="container mx-auto">
          {renderCurrentMode()}
      </div>
    </div>
  );
};

export default App;