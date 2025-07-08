import React from 'react';
import { contaminantData } from '../../data/contaminantData';

const ContaminantInfo = ({ contaminant }) => {
    const properties = contaminantData[contaminant];

    if (!contaminant || !properties) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Contaminant Information</h1>
                <p className="text-center text-gray-500">Please select a contaminant in the 'Part Information' tab to see its properties and cleaning recommendations.</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-center mb-6">Information for: <span className="text-indigo-600">{properties.name}</span></h1>
            <div className="space-y-4 max-w-2xl mx-auto">
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800">Description</h3>
                    <p className="mt-1 text-gray-700">{properties.description}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-blue-800">Laser Processing Properties</h3>
                    <ul className="list-disc list-inside mt-2 text-blue-700 space-y-1">
                        <li><strong>Typical Ablation Threshold:</strong> {properties.ablation_threshold}</li>
                        <li><strong>Vaporization/Decomposition Temp:</strong> {properties.vaporization_temp}</li>
                    </ul>
                </div>
                 <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-green-800">Recommended Approach</h3>
                    <p className="mt-1 text-green-900">{properties.recommended_approach}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-red-800">Fume & Safety Concerns</h3>
                    <p className="mt-1 text-red-900">{properties.fume_concerns}</p>
                </div>
            </div>
        </div>
    );
};

export default ContaminantInfo;
