import React, { useState } from 'react';
import { troubleshootingData } from '../../data/maintenanceData';

const MaintenanceAndTroubleshooting = () => {
    const [logEntries, setLogEntries] = useState([]);
    const [newLog, setNewLog] = useState('');
    const [activeIssue, setActiveIssue] = useState(null);

    const handleAddLog = () => {
        if (newLog.trim() === '') return;
        const entry = {
            date: new Date().toLocaleString(),
            note: newLog.trim(),
        };
        setLogEntries([entry, ...logEntries]);
        setNewLog('');
    };

    const toggleIssue = (index) => {
        setActiveIssue(activeIssue === index ? null : index);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-center mb-6">Maintenance & Troubleshooting</h1>
            
            {/* Troubleshooting Guide Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Troubleshooting Guide</h2>
                <div className="space-y-2">
                    {troubleshootingData.map((item, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleIssue(index)}
                                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 text-left"
                            >
                                <span className="font-semibold text-gray-700">{item.issue}</span>
                                <span className={`transform transition-transform duration-200 ${activeIssue === index ? 'rotate-180' : 'rotate-0'}`}>
                                    ▼
                                </span>
                            </button>
                            {activeIssue === index && (
                                <div className="p-4 bg-white">
                                    <div className="mb-3">
                                        <h4 className="font-semibold text-red-600">Potential Causes:</h4>
                                        <ul className="list-disc list-inside pl-4 text-sm text-gray-600">
                                            {item.causes.map((cause, i) => <li key={i}>{cause}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-600">Possible Solutions:</h4>
                                        <ul className="list-disc list-inside pl-4 text-sm text-gray-600">
                                            {item.solutions.map((solution, i) => <li key={i}>{solution}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Maintenance Log Section */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Maintenance Log</h2>
                <div className="space-y-3 mb-4">
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        rows="3"
                        placeholder="Enter maintenance note... e.g., 'Cleaned cover slide.'"
                        value={newLog}
                        onChange={(e) => setNewLog(e.target.value)}
                    ></textarea>
                    <button
                        onClick={handleAddLog}
                        className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
                    >
                        Add Log Entry
                    </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {logEntries.length > 0 ? (
                        logEntries.map((entry, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-800">{entry.note}</p>
                                <p className="text-xs text-gray-500 mt-1">{entry.date}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No maintenance logs yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaintenanceAndTroubleshooting;
