import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Import shared data and utility functions
import { headData, weldingLaserModels, gasProperties, wireTypes, workingDistances } from '../data/SharedData';
import { parseNumericValue, drawPartGraphic } from '../utils/SharedUtils';
import Tooltip from './Tooltip'; // Import the new Tooltip component

// A component to render the dynamic head parameter inputs.
const RenderHeadParametersInputs = ({ currentHeadParams, onHeadParamsChange }) => {
    const handleInputChange = (e) => {
        onHeadParamsChange(e);
    };

    const filteredHeadTypes = Object.keys(headData).filter(headType => {
        return headType.includes("Welding Head") || headType.includes("Wobble Head") || headType.includes("Cladding Head");
    });

    const selectedHeadKey = currentHeadParams.selectedHeadType;
    const selectedHeadTypeData = headData[selectedHeadKey] || {};

    const renderSelect = (keyName, label, optionsArray, tooltipText, allowOtherInput = false) => {
        if (!optionsArray || optionsArray.length === 0) return null;
        
        const labelElement = <label htmlFor={keyName} className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>;

        return (
            <div className="mb-4" key={`welding-${keyName}`}>
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
                         <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                             <Tooltip text="The distance from the tip of the head to the focal point of the laser.">
                                <h3 className="text-md font-semibold text-blue-700">Working Distance:</h3>
                             </Tooltip>
                            <p className="text-lg text-blue-800 font-bold">{currentWorkingDistance} mm</p>
                        </div>
                    )}
                    {renderSelect('fiberReceivers', 'Fiber Receiver', selectedHeadTypeData.fiberReceivers, "The connector type for the process fiber.")}
                    {renderSelect('beamShaperModules', 'Beam Shaper Module', selectedHeadTypeData.beamShaperModules)}
                    {renderSelect('electricalOptions', 'Electrical Option', selectedHeadTypeData.electricalOptions)}
                    {renderSelect('electronicsOptions', 'Electronics Option', selectedHeadTypeData.electronicsOptions)}
                </>
            )}
        </>
    );
};


const WeldingMode = ({ goToHomeScreen }) => {
  // --- STATE for Welding mode ---
  const [activeTab, setActiveTab] = useState('laserInfo');
  const [laserInfo, setLaserInfo] = useState({ laserType: '', model: '', maxPower: 0 });
  const [setupParameters, setSetupParameters] = useState({
    selectedHeadType: '',
    collimator: '',
    collimatorOther: '',
    focusLens: '',
    focusLensOther: '',
    fiberReceivers: '',
    beamShaperModules: '',
    electricalOptions: '',
    electronicsOptions: '',
  });
  const [partInfo, setPartInfo] = useState({ 
    material: '', 
    thickness: '', 
    thickness2: '',
    isMismatch: false,
    length: '100', 
    height: '50', 
    width: '20', 
    gap: '0', 
    jointType: 'butt'
  });
  const [processGas, setProcessGas] = useState({ selectedGas: '' });
  const [wireInfo, setWireInfo] = useState({ feedSpeed: 100, diameter: 0.8, type: '', otherType: '' });
  const [spotSize, setSpotSize] = useState({ fiberDiameter: 50, calculatedSize: 0 });
  const [pictures, setPictures] = useState({ beforeProcess: null, afterProcess: null, notes: '' });
  const [grading, setGrading] = useState({ criterion1: '', result1: '', notes: '' });
  const [otherNotes, setOtherNotes] = useState('');
  const [errors, setErrors] = useState({});
  
  const partCanvasRef = useRef(null);

  // --- TABS for this mode ---
  const weldingTabs = [
    { id: 'laserInfo', label: 'Laser Selection' },
    { id: 'setup', label: 'Head Setup' },
    { id: 'spotSize', label: 'Spot Size Calculator' },
    { id: 'partInformation', label: 'Part Information' },
    { id: 'processGas', label: 'Process Gas' },
    { id: 'wire', label: 'Wire Info' },
    { id: 'picture', label: 'Pictures' },
    { id: 'grading', label: 'Grading' },
    { id: 'other', label: 'Other' },
  ];

  // --- HANDLERS ---
  const handleLaserInfoChange = (e) => {
    const { name, value } = e.target;
    setLaserInfo(prev => {
        const newState = { ...prev, [name]: value };
        if (name === 'laserType') {
            newState.model = ''; // Reset model when type changes
            newState.maxPower = 0;
        }
        if (name === 'model' && value) {
            const numbersInModel = value.match(/\d+/g);
            if (numbersInModel?.length > 0) {
                newState.maxPower = Math.max(...numbersInModel.map(Number));
            }
        }
        return newState;
    });
  };
  
  const handleSetupParameterChange = (e) => {
    const { name, value } = e.target;
    setSetupParameters(prev => ({...prev, [name]: value }));
  };

  const handlePartInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    const isNumericField = ['thickness', 'thickness2', 'length', 'height', 'width', 'gap'].includes(name);

    if (isNumericField && value !== '' && isNaN(value)) {
      setErrors(prev => ({...prev, [name]: "Please enter a valid number."}));
    } else if (isNumericField && parseFloat(value) < 0) {
      setErrors(prev => ({...prev, [name]: "Value cannot be negative."}));
    } else {
      setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[name];
          return newErrors;
      });
    }

    setPartInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProcessGasChange = (e) => {
    setProcessGas({ selectedGas: e.target.value });
  };
  
  const handleWireInfoChange = (e) => {
      const { name, value } = e.target;
      setWireInfo(prev => ({...prev, [name]: value}));
  };
  
  const handleSpotSizeChange = (e) => {
      const { name, value } = e.target;
      setSpotSize(prev => ({...prev, [name]: parseFloat(value)}));
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

  // Calculate Spot Size
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

  // Sync thickness2 with thickness1 if mismatch is unchecked
  useEffect(() => {
    if (!partInfo.isMismatch) {
        setPartInfo(prev => ({...prev, thickness2: prev.thickness}));
    }
  }, [partInfo.isMismatch, partInfo.thickness]);


  const gasDescription = useMemo(() => {
    if (!processGas.selectedGas || !partInfo.material) {
      return { advantages: "Select a gas and part material.", disadvantages: "" };
    }
    const gasInfo = gasProperties[processGas.selectedGas];
    return gasInfo?.[partInfo.material] || gasInfo?.default || {};
  }, [processGas.selectedGas, partInfo.material]);
  
  const wireTypeOptions = useMemo(() => {
      const applicableWires = wireTypes[partInfo.material] || [];
      return (
          <>
            <option value="">-- Select --</option>
            {applicableWires.map(wire => <option key={wire.value} value={wire.value}>{wire.text}</option>)}
            <option value="other">Other</option>
          </>
      );
  }, [partInfo.material]);

  // Draw part visualization when tab is active or relevant info changes
  useEffect(() => {
      if (activeTab === 'partInformation' && partCanvasRef.current) {
          drawPartGraphic(partCanvasRef.current, partInfo);
      }
  }, [partInfo, activeTab]);

  // --- RENDER ---
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <img id="homeLogo" src="https://placehold.co/150x50/3B82F6/FFFFFF?text=Welding&font=Inter" alt="Welding Mode" className="cursor-pointer rounded-md shadow-md" onClick={goToHomeScreen} />
        <div className="flex items-center space-x-2">
            <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)} className="bg-white border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {weldingTabs.map(tab => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
            </select>
        </div>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-xl mx-auto">
        {activeTab === 'laserInfo' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Laser Selection</h1>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="laserType" className="block text-sm font-medium text-gray-700 mb-1">Laser Type:</label>
                        <select id="laserType" name="laserType" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={laserInfo.laserType || ''} onChange={handleLaserInfoChange}>
                            <option value="">-- Select --</option>
                            {Object.keys(weldingLaserModels).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    {laserInfo.laserType && (
                        <div>
                            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model:</label>
                            <select id="model" name="model" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={laserInfo.model || ''} onChange={handleLaserInfoChange}>
                                <option value="">-- Select --</option>
                                {weldingLaserModels[laserInfo.laserType].map(modelOpt => <option key={modelOpt} value={modelOpt}>{modelOpt}</option>)}
                            </select>
                        </div>
                    )}
                    {laserInfo.maxPower > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                            <h3 className="text-md font-semibold text-blue-700">Estimated Max Power:</h3>
                            <p className="text-lg text-blue-800 font-bold">{laserInfo.maxPower} W</p>
                        </div>
                    )}
                </div>
            </div>
        )}
        {activeTab === 'setup' && (
             <div>
                <h1 className="text-2xl font-bold text-center mb-6">Head Setup</h1>
                <RenderHeadParametersInputs currentHeadParams={setupParameters} onHeadParamsChange={handleSetupParameterChange} />
            </div>
        )}
        {activeTab === 'spotSize' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Spot Size Calculator</h1>
                <p className="text-sm text-center text-gray-600 mb-4">Collimator and Focus Lens values are auto-filled from the 'Head Setup' tab.</p>
                <div className="space-y-4">
                    <div>
                        <Tooltip text="The Mode Field Diameter (MFD) of the process fiber core.">
                            <label htmlFor="fiberDiameter" className="block text-sm font-medium text-gray-700 mb-1">Fiber Diameter (MFD) (µm):</label>
                        </Tooltip>
                        <input type="number" id="fiberDiameter" name="fiberDiameter" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={spotSize.fiberDiameter} onChange={handleSpotSizeChange} />
                    </div>
                     <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                        <Tooltip text="Calculated using the formula: (Fiber Diameter / Collimator Focal Length) * Focus Lens Focal Length">
                            <h3 className="text-md font-semibold text-blue-700">Calculated Spot Size:</h3>
                        </Tooltip>
                        <p className="text-lg text-blue-800 font-bold">{spotSize.calculatedSize.toFixed(2)} µm</p>
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
                            {Object.keys(wireTypes).map(mat => <option key={mat} value={mat}>{mat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="thickness" className="block text-sm font-medium text-gray-700 mb-1">Part Thickness 1 (mm):</label>
                        <input type="number" id="thickness" name="thickness" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.thickness || ''} onChange={handlePartInfoChange} />
                        {errors.thickness && <span className="text-red-500 text-xs">{errors.thickness}</span>}
                    </div>
                     <div className="flex items-center">
                        <input type="checkbox" id="isMismatch" name="isMismatch" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" checked={partInfo.isMismatch} onChange={handlePartInfoChange} />
                        <label htmlFor="isMismatch" className="ml-2 block text-sm text-gray-900">Part Mismatch</label>
                    </div>
                    {partInfo.isMismatch && (
                         <div>
                            <label htmlFor="thickness2" className="block text-sm font-medium text-gray-700 mb-1">Part Thickness 2 (mm):</label>
                            <input type="number" id="thickness2" name="thickness2" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.thickness2 || ''} onChange={handlePartInfoChange} />
                            {errors.thickness2 && <span className="text-red-500 text-xs">{errors.thickness2}</span>}
                        </div>
                    )}
                    <div>
                        <label htmlFor="jointType" className="block text-sm font-medium text-gray-700 mb-1">Joint Type:</label>
                        <select id="jointType" name="jointType" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.jointType || ''} onChange={handlePartInfoChange}>
                           <option value="butt">Butt Joint</option>
                           <option value="lap">Lap Joint</option>
                           <option value="corner">Corner Joint</option>
                           <option value="tee">Tee Joint</option>
                           <option value="edge">Edge Joint</option>
                           <option value="flat_plate">Flat Plate</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="gap" className="block text-sm font-medium text-gray-700 mb-1">Gap (mm):</label>
                        <input type="number" id="gap" name="gap" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.gap || ''} onChange={handlePartInfoChange} />
                         {errors.gap && <span className="text-red-500 text-xs">{errors.gap}</span>}
                    </div>
                    <div>
                        <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">Part Length (mm):</label>
                        <input type="number" id="length" name="length" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.length || ''} onChange={handlePartInfoChange} />
                    </div>
                    <div>
                        <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">Part Height (mm):</label>
                        <input type="number" id="height" name="height" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.height || ''} onChange={handlePartInfoChange} />
                    </div>
                    <canvas ref={partCanvasRef} width="300" height="200" className="mx-auto block border rounded-md bg-gray-50 mt-4"></canvas>
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
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h3 className="text-md font-semibold text-blue-700 mb-1">Properties for {partInfo.material.replace(/_/g, ' ')}:</h3>
                        <p><strong>Advantages:</strong> {gasDescription.advantages}</p>
                        <p><strong>Disadvantages:</strong> {gasDescription.disadvantages}</p>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'wire' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Wire Information</h1>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="feedSpeed" className="block text-sm font-medium text-gray-700 mb-1">Wire Feed Speed (mm/s):</label>
                        <input type="number" id="feedSpeed" name="feedSpeed" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={wireInfo.feedSpeed} onChange={handleWireInfoChange} />
                    </div>
                    <div>
                        <label htmlFor="diameter" className="block text-sm font-medium text-gray-700 mb-1">Wire Diameter (mm):</label>
                        <input type="number" id="diameter" name="diameter" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={wireInfo.diameter} onChange={handleWireInfoChange} />
                    </div>
                     <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Wire Type:</label>
                        <select id="type" name="type" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={wireInfo.type || ''} onChange={handleWireInfoChange}>
                            {wireTypeOptions}
                        </select>
                        {wireInfo.type === 'other' && (
                             <input type="text" name="otherType" className="mt-2 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Specify other wire type" value={wireInfo.otherType} onChange={handleWireInfoChange} />
                        )}
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'picture' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Process Pictures</h1>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="beforeProcess" className="block text-sm font-medium text-gray-700 mb-1">Before Process:</label>
                        <input type="file" id="beforeProcess" name="beforeProcess" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={(e) => handlePictureUpload(e, 'beforeProcess')} />
                        {pictures.beforeProcess && <img src={pictures.beforeProcess} alt="Before" className="mt-2 rounded-md shadow-md max-h-40 object-contain mx-auto" />}
                    </div>
                    <div>
                        <label htmlFor="afterProcess" className="block text-sm font-medium text-gray-700 mb-1">After Process:</label>
                        <input type="file" id="afterProcess" name="afterProcess" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={(e) => handlePictureUpload(e, 'afterProcess')} />
                        {pictures.afterProcess && <img src={pictures.afterProcess} alt="After" className="mt-2 rounded-md shadow-md max-h-40 object-contain mx-auto" />}
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'grading' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Grading</h1>
                <div className="space-y-4">
                  <div><label htmlFor="criterion1" className="block text-sm font-medium text-gray-700 mb-1">Criterion 1:</label><input type="text" id="criterion1" name="criterion1" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Weld Penetration" value={grading.criterion1} onChange={handleGradingChange} /></div>
                  <div><label htmlFor="result1" className="block text-sm font-medium text-gray-700 mb-1">Result 1:</label><input type="text" id="result1" name="result1" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Full Penetration" value={grading.result1} onChange={handleGradingChange} /></div>
                  <div>
                    <label htmlFor="gradingNotes" className="block text-sm font-medium text-gray-700 mb-1">Notes / Suggestions:</label>
                    <textarea id="gradingNotes" name="notes" rows="3" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Observations or suggestions..." value={grading.notes} onChange={handleGradingChange}></textarea>
                  </div>
                </div>
            </div>
        )}
        {activeTab === 'other' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Other Notes</h1>
                <textarea 
                    value={otherNotes} 
                    onChange={(e) => setOtherNotes(e.target.value)} 
                    className="w-full h-40 p-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="Enter any additional notes for this welding setup..."
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default WeldingMode;
