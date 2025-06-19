import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Import shared data and utility functions
import { headData, gasProperties, workingDistances } from '../data/SharedData';
import { parseNumericValue, drawScanArea, drawPartGraphic } from '../utils/SharedUtils';

// A component to render the dynamic head parameter inputs for Cutting mode.
const RenderHeadParametersInputs = ({ currentHeadParams, onHeadParamsChange, mode }) => {
    const handleInputChange = (e) => {
        onHeadParamsChange(e);
    };

    const filteredHeadTypes = Object.keys(headData).filter(headType => {
        return headType.includes("Cutting Head");
    });

    const selectedHeadKey = currentHeadParams.selectedHeadType;
    const selectedHeadTypeData = headData[selectedHeadKey] || {};

    const renderSelect = (keyName, label, optionsArray, allowOtherInput = false) => {
        if (!optionsArray || optionsArray.length === 0) return null;
        return (
            <div className="mb-4" key={`${mode}-${keyName}`}>
                <label htmlFor={keyName} className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>
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
            {renderSelect('selectedHeadType', 'Type of Head', filteredHeadTypes)}
            {selectedHeadKey && (
                <>
                    {renderSelect('collimator', 'Collimator', selectedHeadTypeData.collimators, true)}
                    {renderSelect('focusLens', 'Focus Lens', selectedHeadTypeData.focusLenses, true)}
                    {currentWorkingDistance !== 'N/A' && (
                         <div className="mt-4 p-3 bg-red-50 rounded-lg text-center">
                            <h3 className="text-md font-semibold text-red-700">Working Distance:</h3>
                            <p className="text-lg text-red-800 font-bold">{currentWorkingDistance} mm</p>
                        </div>
                    )}
                    {renderSelect('fiberReceivers', 'Fiber Receiver', selectedHeadTypeData.fiberReceivers)}
                    {renderSelect('longFiber', 'Long Fiber', selectedHeadTypeData.longFiber)}
                    
                    {/* Special handling for nozzleTips */}
                    {selectedHeadTypeData.nozzleTips && typeof selectedHeadTypeData.nozzleTips === 'object' && !Array.isArray(selectedHeadTypeData.nozzleTips) ? (
                      <div>
                        <label htmlFor="nozzleTipType" className="block text-sm font-medium text-gray-700 mb-1">Nozzle Tip Type:</label>
                        <select id="nozzleTipType" name="nozzleTipType" value={currentHeadParams.nozzleTipType || ''} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                          <option value="">-- Select Type --</option>
                          {Object.keys(selectedHeadTypeData.nozzleTips).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        {currentHeadParams.nozzleTipType && (
                           <div className="mt-4">
                             <label htmlFor="nozzleTip" className="block text-sm font-medium text-gray-700 mb-1">Nozzle Tip Size:</label>
                             <select id="nozzleTip" name="nozzleTip" value={currentHeadParams.nozzleTip || ''} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                                <option value="">-- Select Size --</option>
                                {selectedHeadTypeData.nozzleTips[currentHeadParams.nozzleTipType].map(tip => <option key={tip} value={tip}>{tip}</option>)}
                             </select>
                           </div>
                        )}
                      </div>
                    ) : renderSelect('nozzleTip', 'Nozzle Tip', selectedHeadTypeData.nozzleTips)}
                </>
            )}
        </>
    );
};


const CuttingMode = ({ goToHomeScreen }) => {
  // --- STATE for Cutting mode ---
  const [activeTab, setActiveTab] = useState('laserInfo');
  const [laserInfo, setLaserInfo] = useState({ maxPower: 3000 }); // Default power for cutting
  const [setupParameters, setSetupParameters] = useState({
    selectedHeadType: '',
    collimator: '',
    collimatorOther: '',
    focusLens: '',
    focusLensOther: '',
    fiberReceivers: '',
    longFiber: '',
    nozzleTip: '',
    nozzleTipType: '',
  });
  const [partInfo, setPartInfo] = useState({ material: '', thickness: NaN, jointType: '' });
  const [processGas, setProcessGas] = useState({ selectedGas: '' });
  const [spotSize, setSpotSize] = useState({ fiberDiameter: 50, calculatedSize: 0 });
  const [scanInfo, setScanInfo] = useState({ xDirection: 80, yDirection: 20, scanSpeed: 1000, frequency: 5000 });
  const [pictures, setPictures] = useState({ beforeProcess: null, afterProcess: null, notes: '' });
  const [grading, setGrading] = useState({ criterion1: '', result1: '', notes: '' });
  
  // --- TABS for this mode ---
  const cuttingTabs = [
    { id: 'laserInfo', label: 'Laser Parameters' },
    { id: 'setup', label: 'Head Setup' },
    { id: 'spotSize', label: 'Spot Size Calculator' },
    { id: 'partInformation', label: 'Part Information' },
    { id: 'processGas', label: 'Process Gas' },
    { id: 'scanInfo', label: 'Scan Information' },
    { id: 'picture', label: 'Pictures' },
    { id: 'grading', label: 'Grading' },
    { id: 'save', label: 'Save & Export' },
  ];

  // --- HANDLERS ---
  const handleLaserInfoChange = (e) => {
    const { name, value } = e.target;
    setLaserInfo(prev => ({ ...prev, [name]: parseFloat(value) }));
  };
  
  const handleSetupParameterChange = (e) => {
    const { name, value } = e.target;
    setSetupParameters(prev => {
        const newState = {...prev, [name]: value};
        if (name === 'nozzleTipType') newState.nozzleTip = '';
        return newState;
    });
  };

  const handlePartInfoChange = (e) => {
    const { name, value } = e.target;
    setPartInfo(prev => ({...prev, [name]: value }));
  };

  const handleProcessGasChange = (e) => {
    setProcessGas({ selectedGas: e.target.value });
  };
  
  const handleSpotSizeChange = (e) => {
      const { name, value } = e.target;
      setSpotSize(prev => ({...prev, [name]: parseFloat(value)}));
  };

  const handleScanInfoChange = (e) => {
      const { name, value } = e.target;
      setScanInfo(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handlePictureUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setPictures(prev => ({ ...prev, [type]: event.target.result }));
    reader.readAsDataURL(file);
  };
  
  const handleGradingChange = (e) => {
    const { name, value } = e.target;
    setGrading(prev => ({...prev, [name]: value}));
  };

  // --- DERIVED DATA & LOGIC ---

  useEffect(() => {
    const { fiberDiameter } = spotSize;
    const { collimator, collimatorOther, focusLens, focusLensOther } = setupParameters;
    const actualCollimator = collimator === 'Other' ? collimatorOther : collimator;
    const actualFocusLens = focusLens === 'Other' ? focusLensOther : focusLens;
    
    const numFiber = parseFloat(fiberDiameter);
    const numCol = parseNumericValue(actualCollimator);
    const numFocus = parseNumericValue(actualFocusLens);

    if (numFiber > 0 && numCol > 0 && numFocus > 0) {
        setSpotSize(prev => ({ ...prev, calculatedSize: (numFiber / numCol) * numFocus }));
    } else {
        setSpotSize(prev => ({ ...prev, calculatedSize: 0 }));
    }
  }, [spotSize.fiberDiameter, setupParameters]);

  const gasDescription = useMemo(() => {
    if (!processGas.selectedGas || !partInfo.material) {
      return { advantages: "Select a gas and part material.", disadvantages: "" };
    }
    const gasInfo = gasProperties[processGas.selectedGas];
    return gasInfo?.[partInfo.material] || gasInfo?.default || {};
  }, [processGas.selectedGas, partInfo.material]);

  useEffect(() => {
      if (activeTab === 'scanInfo') {
          drawScanArea('scanCanvasCutting', scanInfo.xDirection, scanInfo.yDirection, 0.5, spotSize.calculatedSize);
      }
      if (activeTab === 'partInformation') {
          drawPartGraphic('partCanvasCutting', partInfo);
      }
  }, [scanInfo, partInfo, spotSize.calculatedSize, activeTab]);

  // --- RENDER ---
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <img id="homeLogo" src="https://placehold.co/150x50/EF4444/FFFFFF?text=Cutting&font=Inter" alt="Cutting Mode" className="cursor-pointer rounded-md shadow-md" onClick={goToHomeScreen} />
        <div className="flex items-center space-x-2">
            <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)} className="bg-white border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {cuttingTabs.map(tab => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
            </select>
        </div>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-xl mx-auto">
        {activeTab === 'laserInfo' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Laser Parameters</h1>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="maxPower" className="block text-sm font-medium text-gray-700 mb-1">Max Power (W):</label>
                        <input type="number" id="maxPower" name="maxPower" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={laserInfo.maxPower} onChange={handleLaserInfoChange} />
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'setup' && (
             <div>
                <h1 className="text-2xl font-bold text-center mb-6">Head Setup</h1>
                <RenderHeadParametersInputs currentHeadParams={setupParameters} onHeadParamsChange={handleSetupParameterChange} mode="cutting" />
            </div>
        )}
        {activeTab === 'spotSize' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Spot Size Calculator</h1>
                <p className="text-sm text-center text-gray-600 mb-4">Collimator and Focus Lens values are auto-filled from the 'Head Setup' tab.</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="fiberDiameter" className="block text-sm font-medium text-gray-700 mb-1">Fiber Diameter (MFD) (µm):</label>
                        <input type="number" id="fiberDiameter" name="fiberDiameter" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={spotSize.fiberDiameter} onChange={handleSpotSizeChange} />
                    </div>
                     <div className="mt-4 p-3 bg-red-50 rounded-lg text-center">
                        <h3 className="text-md font-semibold text-red-700">Calculated Spot Size:</h3>
                        <p className="text-lg text-red-800 font-bold">{spotSize.calculatedSize.toFixed(2)} µm</p>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'partInformation' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Part Information</h1>
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">Part Material:</label>
                        <select id="material" name="material" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.material || ''} onChange={handlePartInfoChange}>
                            <option value="">-- Select --</option>
                            <option value="stainless_steel">Stainless Steel</option>
                            <option value="mild_carbon_steel">Mild Carbon Steel</option>
                            <option value="aluminum">Aluminum</option>
                            <option value="copper">Copper</option>
                            <option value="titanium">Titanium</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="thickness" className="block text-sm font-medium text-gray-700 mb-1">Part Thickness (mm):</label>
                        <input type="number" id="thickness" name="thickness" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.thickness || ''} onChange={handlePartInfoChange} />
                    </div>
                    <canvas id="partCanvasCutting" width="300" height="200" className="mx-auto block border rounded-md bg-gray-50 mt-4"></canvas>
                 </div>
            </div>
        )}
        {activeTab === 'processGas' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Process Gas</h1>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="selectedGas" className="block text-sm font-medium text-gray-700 mb-1">Select Gas:</label>
                        <select id="selectedGas" name="selectedGas" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={processGas.selectedGas || ''} onChange={handleProcessGasChange}>
                             <option value="">-- Select --</option>
                             {Object.keys(gasProperties).map(gas => <option key={gas} value={gas}>{gas.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                        </select>
                    </div>
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <h3 className="text-md font-semibold text-red-700 mb-1">Properties for {partInfo.material.replace(/_/g, ' ')}:</h3>
                        <p><strong>Advantages:</strong> {gasDescription.advantages}</p>
                        <p><strong>Disadvantages:</strong> {gasDescription.disadvantages}</p>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'scanInfo' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Scan Information</h1>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="xDirection" className="block text-sm font-medium text-gray-700 mb-1">X Direction (mm):</label>
                        <input type="number" id="xDirection" name="xDirection" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.xDirection} onChange={handleScanInfoChange} />
                    </div>
                    <div>
                        <label htmlFor="yDirection" className="block text-sm font-medium text-gray-700 mb-1">Y Direction (mm):</label>
                        <input type="number" id="yDirection" name="yDirection" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.yDirection} onChange={handleScanInfoChange} />
                    </div>
                    <div>
                        <label htmlFor="scanSpeed" className="block text-sm font-medium text-gray-700 mb-1">Scan Speed (mm/s):</label>
                        <input type="number" id="scanSpeed" name="scanSpeed" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.scanSpeed} onChange={handleScanInfoChange} />
                    </div>
                </div>
                <h2 className="text-xl font-semibold text-center text-gray-800 mt-6 mb-2">Scan Area Visualization</h2>
                <canvas id="scanCanvasCutting" width="300" height="200" className="mx-auto block border rounded-md bg-gray-50"></canvas>
            </div>
        )}
        {activeTab === 'picture' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Process Pictures</h1>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="beforeProcess" className="block text-sm font-medium text-gray-700 mb-1">Before Process:</label>
                        <input type="file" id="beforeProcess" name="beforeProcess" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" onChange={(e) => handlePictureUpload(e, 'beforeProcess')} />
                        {pictures.beforeProcess && <img src={pictures.beforeProcess} alt="Before" className="mt-2 rounded-md shadow-md max-h-40 object-contain mx-auto" />}
                    </div>
                    <div>
                        <label htmlFor="afterProcess" className="block text-sm font-medium text-gray-700 mb-1">After Process:</label>
                        <input type="file" id="afterProcess" name="afterProcess" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" onChange={(e) => handlePictureUpload(e, 'afterProcess')} />
                        {pictures.afterProcess && <img src={pictures.afterProcess} alt="After" className="mt-2 rounded-md shadow-md max-h-40 object-contain mx-auto" />}
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'grading' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Grading</h1>
                <div className="space-y-4">
                  <div><label htmlFor="criterion1" className="block text-sm font-medium text-gray-700 mb-1">Criterion 1:</label><input type="text" id="criterion1" name="criterion1" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Cut Quality" value={grading.criterion1} onChange={handleGradingChange} /></div>
                  <div><label htmlFor="result1" className="block text-sm font-medium text-gray-700 mb-1">Result 1:</label><input type="text" id="result1" name="result1" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Clean, Dross" value={grading.result1} onChange={handleGradingChange} /></div>
                </div>
            </div>
        )}
        {activeTab === 'save' && (
            <div><h1 className="text-2xl font-bold text-center mb-6">Save & Export</h1><p className="text-center">UI for Save & Export goes here...</p></div>
        )}
      </div>
    </div>
  );
};

export default CuttingMode;
