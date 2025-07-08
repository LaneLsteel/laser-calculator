import React from 'react';
import { materialProperties } from '../../data/materialData';

const MaterialProperties = ({ material, effectiveFluence }) => {
    const properties = materialProperties[material];

    if (!material || !properties) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Material Properties</h1>
                <p className="text-center text-gray-500">Please select a material in the 'Part Information' tab to see its properties.</p>
            </div>
        );
    }

    const damageThreshold = properties.damage_threshold;
    // We convert effective fluence from mJ/cm² to J/cm² for comparison
    const effectiveFluence_J = effectiveFluence / 1000;
    
    const fluenceRatio = damageThreshold > 0 ? (effectiveFluence_J / damageThreshold) * 100 : 0;
    
    let status = { text: 'SAFE', color: 'bg-green-500', textColor: 'text-green-800', bgColor: 'bg-green-100' };
    if (fluenceRatio > 100) {
        status = { text: 'DANGER', color: 'bg-red-500', textColor: 'text-red-800', bgColor: 'bg-red-100' };
    } else if (fluenceRatio > 75) {
        status = { text: 'CAUTION', color: 'bg-yellow-500', textColor: 'text-yellow-800', bgColor: 'bg-yellow-100' };
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-center mb-6">Properties for: <span className="text-indigo-600">{properties.name}</span></h1>
            <div className="space-y-4 max-w-2xl mx-auto">
                {/* Process Safety Margin Section */}
                <div className={`p-4 rounded-lg shadow-md ${status.bgColor}`}>
                    <h3 className={`text-lg font-semibold ${status.textColor}`}>Process Safety Margin</h3>
                    <div className="mt-3">
                        <div className="flex justify-between items-center text-sm font-medium ${status.textColor}">
                           <span>Effective Fluence: {effectiveFluence_J.toFixed(2)} J/cm²</span>
                           <span>Damage Threshold: {damageThreshold} J/cm²</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
                            <div 
                                className={`h-4 rounded-full ${status.color}`}
                                style={{ width: `${Math.min(fluenceRatio, 100)}%` }}
                            ></div>
                        </div>
                        <p className={`text-center mt-2 font-bold text-lg ${status.textColor}`}>{status.text}</p>
                    </div>
                </div>

                {/* Existing Property Sections */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800">Physical Properties</h3>
                    <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                        <li><strong>Density:</strong> {properties.density}</li>
                        <li><strong>Melting Point:</strong> {properties.melting_point}</li>
                        <li><strong>Thermal Conductivity:</strong> {properties.thermal_conductivity}</li>
                    </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-blue-800">Laser Interaction Properties (1064nm)</h3>
                     <ul className="list-disc list-inside mt-2 text-blue-700 space-y-1">
                        <li><strong>Approx. Reflectivity:</strong> {properties.reflectivity_1064nm}</li>
                    </ul>
                </div>
                 <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-yellow-800">Processing Notes</h3>
                    <p className="mt-2 text-yellow-900">{properties.notes}</p>
                </div>
            </div>
        </div>
    );
};

export default MaterialProperties;
