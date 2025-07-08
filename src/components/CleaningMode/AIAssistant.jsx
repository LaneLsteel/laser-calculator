import React from 'react';

const AIAssistant = ({ aiPrompt, setAiPrompt, handleAiSubmit, aiLoading, aiResponse }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">AI Assistant</h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-700 mb-1">What is your cleaning goal?</label>
          <textarea id="aiPrompt" name="aiPrompt" rows="3" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Remove heavy rust from mild steel..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}></textarea>
        </div>
        <button onClick={handleAiSubmit} disabled={aiLoading} className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none disabled:bg-blue-300">
          {aiLoading ? 'Getting Suggestion...' : 'Get Suggestion'}
        </button>
        {aiResponse && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Suggestion:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
