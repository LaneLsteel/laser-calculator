import React from 'react';

const LoadSetup = ({ savedSetups, selectedSetupToLoad, setSelectedSetupToLoad, handleLoadSetup }) => {
    return (
        <div>
            <h1 className="text-2xl font-bold text-center mb-6">Load Setup</h1>
            <div className="space-y-4 max-w-md mx-auto">
                <div>
                    <label htmlFor="loadSetupSelect" className="block text-sm font-medium text-gray-700 mb-1">Select a Preset:</label>
                    <select
                        id="loadSetupSelect"
                        value={selectedSetupToLoad}
                        onChange={(e) => setSelectedSetupToLoad(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="">-- Choose a setup --</option>
                        {savedSetups.map(setup => (
                            <option key={setup.name} value={setup.name}>{setup.name}</option>
                        ))}
                    </select>
                </div>
                <button onClick={handleLoadSetup} className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none">
                    Load Selected Setup
                </button>
            </div>
        </div>
    );
};

export default LoadSetup;
