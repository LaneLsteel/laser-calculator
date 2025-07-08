import React from 'react';

const Grading = ({ grading, handleGradingChange }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Grading</h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="criterion1" className="block text-sm font-medium text-gray-700 mb-1">Criterion 1:</label>
          <input type="text" id="criterion1" name="criterion1" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Surface Cleanliness" value={grading.criterion1} onChange={handleGradingChange} />
        </div>
        <div>
          <label htmlFor="result1" className="block text-sm font-medium text-gray-700 mb-1">Result 1:</label>
          <input type="text" id="result1" name="result1" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., 95% clean" value={grading.result1} onChange={handleGradingChange} />
        </div>
        <div>
          <label htmlFor="gradingNotes" className="block text-sm font-medium text-gray-700 mb-1">Notes / Suggestions:</label>
          <textarea id="gradingNotes" name="notes" rows="3" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Observations or suggestions..." value={grading.notes} onChange={handleGradingChange}></textarea>
        </div>
      </div>
    </div>
  );
};

export default Grading;
