import React, { useState } from 'react';

// Import the components for each mode.
// This assumes they are located in a 'components' folder.
import LightWeldMode from './components/LightWeldMode';
import WeldingMode from './components/WeldingMode';
import CleaningMode from './components/CleaningMode';
import CuttingMode from './components/CuttingMode';

const App = () => {
  // This state determines which mode is currently active.
  // 'null' means the initial selection screen is shown.
  const [currentMode, setCurrentMode] = useState(null);

  // Sets the current mode based on user selection.
  const handleModeSelection = (mode) => {
    console.log("Button clicked, selected mode:", mode); 
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
        // If no mode is selected, render nothing. The intro screen will be shown instead.
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      {/* Intro Section (Mode Selection) */}
      {!currentMode && (
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
                {modeName.charAt(0).toUpperCase() + modeName.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Render the selected mode's component */}
      {currentMode && renderCurrentMode()}
    </div>
  );
};

export default App;