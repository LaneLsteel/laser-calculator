import React from 'react';

const SaveAndExport = ({ 
    newSetupName, 
    setNewSetupName, 
    handleSaveSetup, 
    exportToCsv, 
    exportToPdf, 
    submitSuggestion 
}) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Save & Export</h1>
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Save Current Setup as Preset</h2>
          <div className="space-y-2">
            <label htmlFor="newSetupName" className="block text-sm font-medium text-gray-700">New Preset Name:</label>
            <input
              type="text"
              id="newSetupName"
              value={newSetupName}
              onChange={(e) => setNewSetupName(e.target.value)}
              placeholder="e.g., Aggressive Steel Cleaning"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <button onClick={handleSaveSetup} className="w-full mt-3 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none">
            Save Setup
          </button>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Export Options</h2>
          <div className="space-y-3">
            <button onClick={exportToCsv} className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none">Export to CSV</button>
            <button onClick={exportToPdf} className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none">Save as PDF (Print)</button>
            <button onClick={submitSuggestion} className="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none">Submit Suggestion</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveAndExport;
