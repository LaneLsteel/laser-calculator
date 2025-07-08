import React from 'react';
import { headData, workingDistances } from '../../data/SharedData';
import Tooltip from '../Tooltip';

// This sub-component can stay inside HeadSetup.jsx as it's only used here.
const RenderHeadParametersInputs = ({ currentHeadParams, onHeadParamsChange }) => {
    const handleInputChange = (e) => {
        onHeadParamsChange(e);
    };

    const filteredHeadTypes = Object.keys(headData).filter(headType => {
        return headType.includes("Scanner") || headType.includes("Marker") || headType.includes("Wobble Head");
    });

    const selectedHeadKey = currentHeadParams.selectedHeadType;
    const selectedHeadTypeData = headData[selectedHeadKey] || {};

    const renderSelect = (keyName, label, optionsArray, tooltipText, allowOtherInput = false) => {
        if (!optionsArray || optionsArray.length === 0) return null;

        const labelElement = <label htmlFor={keyName} className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>;

        return (
            <div className="mb-4" key={`cleaning-${keyName}`}>
                {tooltipText ? (
                    <Tooltip text={tooltipText}>
                        {labelElement}
                    </Tooltip>
                ) : (
                    labelElement
                )}
                <select
                    id={keyName}
                    name={keyName}
                    value={currentHeadParams[keyName] || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                    <option value="">-- Select {label} --</option>
                    {optionsArray.map((option) => (
                        <option key={String(option)} value={String(option)}>{String(option)}</option>
                    ))}
                </select>
                {allowOtherInput && currentHeadParams[keyName] === 'Other' && (
                    <input
                        type="number"
                        name={`${keyName}Other`}
                        value={currentHeadParams[`${keyName}Other`] || ''}
                        onChange={handleInputChange}
                        placeholder={`Enter custom ${label.toLowerCase()} (mm)`}
                        className="mt-2 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    />
                )}
            </div>
        );
    };

    const currentWorkingDistance = (selectedHeadKey && currentHeadParams.focusLens && workingDistances[selectedHeadKey]) ?
        workingDistances[selectedHeadKey][currentHeadParams.focusLens] : 'N/A';

    return (
        <>
            {renderSelect('selectedHeadType', 'Type of Head', filteredHeadTypes, "Select the type of process head being used.")}
            {selectedHeadKey && (
                <>
                    {renderSelect('collimator', 'Collimator', selectedHeadTypeData.collimators, "The lens that collimates the beam from the fiber.", true)}
                    {renderSelect('focusLens', 'Focus Lens', selectedHeadTypeData.focusLenses, "The lens that focuses the beam onto the workpiece.", true)}
                    {currentWorkingDistance !== 'N/A' && (
                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-center">
                            <Tooltip text="The distance from the tip of the head to the focal point of the laser.">
                                <h3 className="text-md font-semibold text-indigo-700">Working Distance:</h3>
                            </Tooltip>
                            <p className="text-lg text-indigo-800 font-bold">{currentWorkingDistance} mm</p>
                        </div>
                    )}
                    {renderSelect('baseProducts', 'Base Product', selectedHeadTypeData.baseProducts, "The base product number for the selected head.")}
                    {renderSelect('scanControlInterfaces', 'Scan Control Interface', selectedHeadTypeData.scanControlInterfaces, "The type of interface for controlling the scanner.")}
                    {renderSelect('configurations', 'Configuration', selectedHeadTypeData.configurations, "The physical orientation or setup of the head.")}
                </>
            )}
        </>
    );
};


const HeadSetup = ({ setupParameters, handleSetupParameterChange, calculatedSpotSize }) => {
    return (
        <div>
            <h1 className="text-2xl font-bold text-center mb-6">Head & Process Setup</h1>
            <RenderHeadParametersInputs currentHeadParams={setupParameters} onHeadParamsChange={handleSetupParameterChange} />
            <div className="mt-4">
                <label htmlFor="fiberDiameterCleaning" className="block text-sm font-medium text-gray-700 mb-1">Fiber Diameter (µm):</label>
                <input type="number" id="fiberDiameterCleaning" name="fiberDiameterCleaning" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={setupParameters.fiberDiameterCleaning} onChange={handleSetupParameterChange} />
            </div>
            <div className="mt-4">
                <label htmlFor="laserPowerCleaning" className="block text-sm font-medium text-gray-700 mb-1">Laser Power (W):</label>
                <input type="number" id="laserPowerCleaning" name="laserPowerCleaning" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={setupParameters.laserPowerCleaning} onChange={handleSetupParameterChange} />
            </div>
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-center">
                <Tooltip text="Calculated as (Fiber Diameter / Collimator) * Focus Lens">
                    <h3 className="text-md font-semibold text-indigo-700">Calculated Spot Size:</h3>
                </Tooltip>
                <p className="text-lg text-indigo-800 font-bold">{calculatedSpotSize.toFixed(2)} µm</p>
            </div>
        </div>
    );
};

export default HeadSetup;
