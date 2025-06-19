import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Import shared data and utility functions
import { headData, cleaningLaserModels, maxEnergyOptions_mJ, workingDistances } from '../data/SharedData';
import { parseNumericValue, parseYlpnModel, drawScanArea, drawPartGraphic, convertAndDisplay } from '../utils/SharedUtils';
import Tooltip from './Tooltip';

// A component to render the dynamic head parameter inputs for Cleaning mode.
const RenderHeadParametersInputs = ({ currentHeadParams, onHeadParamsChange }) => {
    const handleInputChange = (e) => {
        onHeadParamsChange(e);
    };

    const filteredHeadTypes = Object.keys(headData).filter(headType => {
        return headType.includes("Scanner") || headType.includes("Marker");
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


const CleaningMode = ({ goToHomeScreen }) => {
  // --- STATE for Cleaning mode ---
  const [activeTab, setActiveTab] = useState('laserInfo');
  const [laserInfo, setLaserInfo] = useState({
    laserCleaningType: '',
    laserCleaningModel: '',
    maxEnergy_mJ: NaN,
    wavelength: 1064,
    pulseDuration: 10,
    minPulseDurationLimit: NaN,
    maxPulseDurationLimit: NaN,
    repetitionRate: 150,
    maxPower: 0,
    peakPower: 0,
  });
  const [setupParameters, setSetupParameters] = useState({
    selectedHeadType: '',
    collimator: '',
    collimatorOther: '',
    focusLens: '',
    focusLensOther: '',
    fiberDiameterCleaning: 50,
    laserPowerCleaning: 1000,
    baseProducts: '',
    scanControlInterfaces: '',
    configurations: '',
  });
  const [scanInfo, setScanInfo] = useState({
    xDirection: 80,
    yDirection: 20,
    scanSpeed: 1000,
    frequency: 150000,
    fill: 0.05,
    pulseOverlap: 75,
    fillOverlap: 20,
    startFrame: '',
    endFrame: '',
  });
  const [partInfo, setPartInfo] = useState({ 
      material: '', 
      thickness: '', 
      thickness2: '',
      jointType: 'flat_plate', 
      length: '100', 
      height: '50', 
      width: '20', 
      gap: '0', 
      isMismatch: false 
    });
  const [calculatedSpotSize, setCalculatedSpotSize] = useState(0);
  const [powerDensity, setPowerDensity] = useState(0);
  const [pulseSpacing, setPulseSpacing] = useState(0);
  const [fluence, setFluence] = useState({ energyPerPulse: 0, pulsesPerPosition: 0, totalEnergyPerPosition: 0, singleSpot: 0, line: 0, effective: 0 });
  const [productivity, setProductivity] = useState({ rate: 0, robotSpeed: 0, joulesPerSecond: 0 });
  const [pictures, setPictures] = useState({ beforeProcess: null, afterProcess: null, notes: '' });
  const [grading, setGrading] = useState({ criterion1: '', result1: '', notes: '' });
  const [otherNotes, setOtherNotes] = useState('');
  const [calculatorMode, setCalculatorMode] = useState('Direct');
  const [calculatedScanInfo, setCalculatedScanInfo] = useState({
    displayPulseOverlap: '--',
    displayFillOverlap: '--',
    displayFill: '--',
    displayScanSpeed: '--',
    numberOfLoops: '--',
    scanTime: '--',
  });
  const [errors, setErrors] = useState({});
  const [justUpdated, setJustUpdated] = useState(''); // For visual feedback
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);


  const scanCanvasRef = useRef(null);
  const partCanvasRef = useRef(null);

  const cleaningTabs = [
    { id: 'laserInfo', label: 'Laser Selection' },
    { id: 'setup', label: 'Head Setup' },
    { id: 'spotSize', label: 'Spot Size & Power' },
    { id: 'scanInfo', label: 'Scan Information' },
    { id: 'partInformation', label: 'Part Information' },
    { id: 'pulseSpacing', label: 'Pulse Spacing' },
    { id: 'fluence', label: 'Energy & Fluence' },
    { id: 'productivityRate', label: 'Productivity' },
    { id: 'aiAssistant', label: 'AI Assistant' },
    { id: 'picture', label: 'Pictures' },
    { id: 'grading', label: 'Grading' },
    { id: 'save', label: 'Save & Export' },
    { id: 'other', label: 'Other' },
  ];

  // --- HANDLERS ---
  const handleLaserInfoChange = (e) => {
    const { name, value } = e.target;
    setLaserInfo(prev => {
        const newState = { ...prev, [name]: value };
        if (name === 'laserCleaningType' || name === 'maxEnergy_mJ') {
            newState.laserCleaningModel = '';
            newState.minPulseDurationLimit = NaN;
            newState.maxPulseDurationLimit = NaN;
        }
        if (name === 'laserCleaningModel' && value.startsWith('YLPN-')) {
            const { minPulse, maxPulse, maxPower } = parseYlpnModel(value);
            newState.minPulseDurationLimit = minPulse;
            newState.maxPulseDurationLimit = maxPulse;
            if(!isNaN(maxPower)) newState.maxPower = maxPower;
            if (newState.pulseDuration < minPulse || newState.pulseDuration > maxPulse) {
                newState.pulseDuration = minPulse;
            }
        }
        return newState;
    });
  };

  const handleSetupParameterChange = (e) => {
    const { name, value } = e.target;
    setSetupParameters(prev => ({...prev, [name]: value}));
  };
  
  const handleScanInfoChange = (e) => {
      const { name, value } = e.target;
      setScanInfo(prev => ({...prev, [name]: value}));
  };

  const handlePartInfoChange = (e) => {
      const { name, value, type, checked } = e.target;
      setPartInfo(prev => ({
          ...prev, 
          [name]: type === 'checkbox' ? checked : value
        }));
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

  const triggerUpdateHighlight = (section) => {
    setJustUpdated(section);
    setTimeout(() => setJustUpdated(''), 500); // Remove highlight after 500ms
  };

  // --- DERIVED DATA & LOGIC ---

  const calculateScanInfoDerived = useCallback(() => {
    const { xDirection, yDirection, scanSpeed, frequency, fill, pulseOverlap, fillOverlap, startFrame, endFrame } = scanInfo;
    const spotDiameter_mm = calculatedSpotSize / 1000;
    
    const numX = parseFloat(xDirection);
    const numY = parseFloat(yDirection);
    const numScanSpeed = parseFloat(scanSpeed);
    const numFreq = parseFloat(frequency);
    const numFill = parseFloat(fill);
    const numPulseOverlap = parseFloat(pulseOverlap);
    const numFillOverlap = parseFloat(fillOverlap);
    const numStartFrame = parseFloat(startFrame);
    const numEndFrame = parseFloat(endFrame);

    let currentDisplayPulseOverlap = '--';
    let currentDisplayFillOverlap = '--';
    let currentDisplayFill = '--';
    let currentDisplayScanSpeed = '--';

    if (calculatorMode === 'Direct') {
      if (!isNaN(numScanSpeed) && numScanSpeed > 0 && !isNaN(numFreq) && numFreq > 0 && spotDiameter_mm > 0) {
        currentDisplayPulseOverlap = (1 - (numScanSpeed / numFreq / spotDiameter_mm)) * 100;
      }
      if (!isNaN(numFill) && numFill > 0 && spotDiameter_mm > 0) {
        currentDisplayFillOverlap = (1 - (numFill / spotDiameter_mm)) * 100;
      }
      currentDisplayScanSpeed = isNaN(numScanSpeed) ? '--' : numScanSpeed;
      currentDisplayFill = isNaN(numFill) ? '--' : numFill;
    } else { // Reverse Mode
      if (!isNaN(numPulseOverlap) && !isNaN(numFreq) && numFreq > 0 && spotDiameter_mm > 0) {
        const pulseSpacing_mm = spotDiameter_mm * (1 - (numPulseOverlap / 100));
        currentDisplayScanSpeed = pulseSpacing_mm * numFreq;
      }
      if (!isNaN(numFillOverlap) && spotDiameter_mm > 0) {
        currentDisplayFill = spotDiameter_mm * (1 - (numFillOverlap / 100));
      }
      currentDisplayPulseOverlap = isNaN(numPulseOverlap) ? '--' : numPulseOverlap;
      currentDisplayFillOverlap = isNaN(numFillOverlap) ? '--' : numFillOverlap;
    }

    let totalLoops = NaN;
    const numPartLength = parseFloat(partInfo.length);
    const numPartHeight = parseFloat(partInfo.height);
    if (numPartLength > 0 && numX > 0 && numPartHeight > 0 && numY > 0) {
      totalLoops = Math.ceil(numPartLength / numX) * Math.ceil(numPartHeight / numY);
    }

    let calculatedScanTime = NaN;
    if (!isNaN(numStartFrame) && !isNaN(numEndFrame) && numStartFrame > numEndFrame) {
      calculatedScanTime = (numStartFrame - numEndFrame) * 0.0000106;
    }

    setCalculatedScanInfo({
      displayPulseOverlap: typeof currentDisplayPulseOverlap === 'number' ? currentDisplayPulseOverlap.toFixed(2) : currentDisplayPulseOverlap,
      displayFillOverlap: typeof currentDisplayFillOverlap === 'number' ? currentDisplayFillOverlap.toFixed(2) : currentDisplayFillOverlap,
      displayFill: typeof currentDisplayFill === 'number' ? currentDisplayFill.toFixed(4) : currentDisplayFill,
      displayScanSpeed: typeof currentDisplayScanSpeed === 'number' ? currentDisplayScanSpeed.toFixed(2) : currentDisplayScanSpeed,
      numberOfLoops: isNaN(totalLoops) ? '--' : totalLoops.toFixed(0),
      scanTime: isNaN(calculatedScanTime) ? '--' : calculatedScanTime.toFixed(6),
    });
    triggerUpdateHighlight('scanInfo');
  }, [scanInfo, partInfo.length, partInfo.height, calculatedSpotSize, calculatorMode]);
  
  useEffect(() => {
    calculateScanInfoDerived();
  }, [calculateScanInfoDerived]);
  
  useEffect(() => {
    const { collimator, collimatorOther, focusLens, focusLensOther, fiberDiameterCleaning, laserPowerCleaning } = setupParameters;
    const numFiber = parseFloat(fiberDiameterCleaning);
    const numPower = parseFloat(laserPowerCleaning);
    const numCol = parseNumericValue(collimator === 'Other' ? collimatorOther : collimator);
    const numFocus = parseNumericValue(focusLens === 'Other' ? focusLensOther : focusLens);
    let newSpotSize = 0;
    if (numFiber > 0 && numCol > 0 && numFocus > 0) newSpotSize = (numFiber / numCol) * numFocus;
    setCalculatedSpotSize(newSpotSize);

    let newPowerDensity = 0;
    if(newSpotSize > 0 && numPower > 0) newPowerDensity = numPower / (Math.PI * Math.pow((newSpotSize / 10000) / 2, 2));
    setPowerDensity(newPowerDensity);

    const { maxEnergy_mJ, pulseDuration, laserCleaningType, repetitionRate } = laserInfo;
    let newPeakPower = 0;
    if (['YLPN', 'YLPP', 'YLPF'].includes(laserCleaningType) && !isNaN(maxEnergy_mJ) && !isNaN(pulseDuration) && pulseDuration > 0) newPeakPower = (parseFloat(maxEnergy_mJ) * 1000) / parseFloat(pulseDuration);
    setLaserInfo(prev => ({ ...prev, peakPower: newPeakPower }));

    const numFreq = parseFloat(scanInfo.frequency);
    const numScanSpeed = parseFloat(calculatedScanInfo.displayScanSpeed);
    let newPulseSpacing = 0;
    if (numFreq > 0 && numScanSpeed > 0) newPulseSpacing = numScanSpeed / numFreq;
    setPulseSpacing(newPulseSpacing);

    const numMaxEnergy = parseFloat(maxEnergy_mJ);
    const numRepRate = parseFloat(repetitionRate);
    let pulseEnergy = !isNaN(numMaxEnergy) ? numMaxEnergy : (numPower / (numRepRate * 1000)) * 1000;
    let singleSpotFluence = 0;
    if (pulseEnergy > 0 && newSpotSize > 0) singleSpotFluence = (pulseEnergy / 1000) / (Math.PI * Math.pow((newSpotSize / 10000) / 2, 2));
    
    let lineFluence = 0;
    if (numPower >= 0 && !isNaN(numScanSpeed) && numScanSpeed > 0) {
        const scanSpeed_cm_s = numScanSpeed / 10;
        if (scanSpeed_cm_s > 0) lineFluence = numPower / scanSpeed_cm_s;
    }
    
    let effectiveFluence = 0;
    let pulsesPerPosition = 0;
    const overlap_percent = parseFloat(calculatedScanInfo.displayPulseOverlap);
    if (!isNaN(overlap_percent) && overlap_percent < 100 && overlap_percent >= 0) {
        pulsesPerPosition = 1 / (1 - (overlap_percent / 100));
        effectiveFluence = singleSpotFluence * pulsesPerPosition;
    }
    const totalEnergyPerPosition = (pulseEnergy / 1000) * pulsesPerPosition;
    setFluence({ 
      energyPerPulse: pulseEnergy / 1000, 
      pulsesPerPosition,
      totalEnergyPerPosition,
      singleSpot: singleSpotFluence, 
      line: lineFluence, 
      effective: effectiveFluence 
    });

    let productivityRate = 0;
    if(newSpotSize > 0 && numScanSpeed > 0) productivityRate = (newSpotSize / 1000) * numScanSpeed;
    
    let robotSpeed = 0;
    const actualFill = parseFloat(calculatedScanInfo.displayFill);
    if (actualFill > 0 && !isNaN(numScanSpeed) && !isNaN(scanInfo.xDirection)) {
        robotSpeed = (actualFill * numScanSpeed) / parseFloat(scanInfo.xDirection);
    }
    setProductivity({ rate: productivityRate, robotSpeed, joulesPerSecond: numPower });

    triggerUpdateHighlight('calculations');

  }, [laserInfo, setupParameters, scanInfo, calculatorMode, calculatedScanInfo.displayFill, calculatedScanInfo.displayPulseOverlap, calculatedScanInfo.displayScanSpeed]);
  
  useEffect(() => {
      if (activeTab === 'scanInfo' && scanCanvasRef.current) {
          drawScanArea(scanCanvasRef.current, scanInfo.xDirection, scanInfo.yDirection, calculatedScanInfo.displayFill, calculatedSpotSize);
      }
      if (activeTab === 'partInformation' && partCanvasRef.current) {
          drawPartGraphic(partCanvasRef.current, partInfo);
      }
  }, [scanInfo, partInfo, calculatedSpotSize, activeTab, calculatedScanInfo.displayFill]);
  
    const collectAllData = useCallback(() => {
        return {
            mode: "Cleaning", laserInfo, setupParameters, scanInfo, partInfo,
            calculatedSpotSize, powerDensity, pulseSpacing, fluence, productivity
        };
    }, [laserInfo, setupParameters, scanInfo, partInfo, calculatedSpotSize, powerDensity, pulseSpacing, fluence, productivity]);
    
    const exportToCsv = useCallback(() => {
        const data = collectAllData();
        let csvContent = "Category,Parameter,Value\n";
        for (const category in data) {
            if (typeof data[category] === 'object' && data[category] !== null) {
                for (const param in data[category]) {
                    csvContent += `"${category}","${param}","${data[category][param]}"\n`;
                }
            } else {
                 csvContent += `"${category}","Value","${data[category]}"\n`;
            }
        }
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "cleaning_parameters.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [collectAllData]);
    
    const exportToPdf = useCallback(() => {
        window.print();
    }, []);

    const submitSuggestion = useCallback(() => {
        const email = 'lsteel@ipgphotonics.com';
        const subject = encodeURIComponent('Suggestion for Laser Parameters Calculator');
        const body = encodeURIComponent(`Suggestion from Cleaning Mode:\n\n${grading.notes}`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }, [grading.notes]);

    const handleAiSubmit = useCallback(async () => {
        setAiLoading(true);
        setAiResponse('');

        const context = `
            Current laser cleaning parameters:
            - Laser Type: ${laserInfo.laserCleaningType || 'Not set'}
            - Power: ${setupParameters.laserPowerCleaning} W
            - Rep Rate: ${laserInfo.repetitionRate} kHz
            - Pulse Duration: ${laserInfo.pulseDuration} ns
            - Scan Speed: ${scanInfo.scanSpeed} mm/s
            - Part Material: ${partInfo.material || 'Not set'}
        `;

        const fullPrompt = `${context}\n\nUser Goal: "${aiPrompt}"\n\nBased on this, suggest a good starting point for Power (W), Scan Speed (mm/s), and Rep Rate (kHz). Provide a brief reason for each suggestion.`;

        try {
            const chatHistory = [{ role: "user", parts: [{ text: fullPrompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                setAiResponse(result.candidates[0].content.parts[0].text);
            } else {
                setAiResponse("Sorry, I couldn't generate a suggestion. The response was empty.");
            }

        } catch (error) {
            console.error("AI Assistant Error:", error);
            setAiResponse(`Sorry, there was an error getting a suggestion. Please check the console for details.`);
        } finally {
            setAiLoading(false);
        }
    }, [aiPrompt, laserInfo, setupParameters, scanInfo, partInfo]);

  // --- RENDER ---
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <img id="homeLogo" src="https://placehold.co/150x50/6366F1/FFFFFF?text=Cleaning&font=Inter" alt="Cleaning Mode" className="cursor-pointer rounded-md shadow-md" onClick={goToHomeScreen} />
        <div className="flex items-center space-x-2">
            <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)} className="bg-white border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {cleaningTabs.map(tab => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
            </select>
        </div>
      </div>
      <div className={`bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-xl mx-auto ${justUpdated === 'calculations' ? 'bg-green-100 transition-all duration-500' : ''}`}>
        {activeTab === 'laserInfo' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Laser Selection</h1>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="laserCleaningType" className="block text-sm font-medium text-gray-700 mb-1">Laser Type:</label>
                        <select id="laserCleaningType" name="laserCleaningType" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={laserInfo.laserCleaningType || ''} onChange={handleLaserInfoChange}>
                           <option value="">-- Select --</option>
                           {Object.keys(cleaningLaserModels).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    {['YLPN', 'YLPP', 'YLPF'].includes(laserInfo.laserCleaningType) && (
                        <div>
                            <label htmlFor="maxEnergy_mJ" className="block text-sm font-medium text-gray-700 mb-1">Max Energy (mJ):</label>
                            <select id="maxEnergy_mJ" name="maxEnergy_mJ" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={isNaN(laserInfo.maxEnergy_mJ) ? '' : laserInfo.maxEnergy_mJ} onChange={handleLaserInfoChange}>
                                <option value="">-- Select --</option>
                                {maxEnergyOptions_mJ.map(energy => <option key={energy} value={energy}>{energy}</option>)}
                            </select>
                        </div>
                    )}
                    {laserInfo.laserCleaningType && (
                        <div>
                            <label htmlFor="laserCleaningModel" className="block text-sm font-medium text-gray-700 mb-1">Model:</label>
                            <select id="laserCleaningModel" name="laserCleaningModel" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={laserInfo.laserCleaningModel || ''} onChange={handleLaserInfoChange}>
                                <option value="">-- Select --</option>
                                { laserInfo.laserCleaningType === 'YLPN' && !isNaN(laserInfo.maxEnergy_mJ) && cleaningLaserModels.YLPN[laserInfo.maxEnergy_mJ] 
                                  ? cleaningLaserModels.YLPN[laserInfo.maxEnergy_mJ].map(modelOpt => <option key={modelOpt} value={modelOpt}>{modelOpt}</option>)
                                  : (Array.isArray(cleaningLaserModels[laserInfo.laserCleaningType]) ? cleaningLaserModels[laserInfo.laserCleaningType] : cleaningLaserModels[laserInfo.laserCleaningType]?.default || []).map(modelOpt => <option key={modelOpt} value={modelOpt}>{modelOpt}</option>)
                                }
                            </select>
                        </div>
                    )}
                </div>
            </div>
        )}
        {activeTab === 'setup' && (
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
            </div>
        )}
        {activeTab === 'spotSize' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Calculated Spot Size & Power Density</h1>
                <p className="text-sm text-center text-gray-600 mb-4">Values are calculated based on your inputs in the 'Head Setup' tab.</p>
                <div className="space-y-4">
                     <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <h3 className="text-md font-semibold text-indigo-700">Calculated Spot Size:</h3>
                        <p className="text-lg text-indigo-800 font-bold">{calculatedSpotSize.toFixed(2)} µm</p>
                    </div>
                     <div className="p-3 bg-teal-50 rounded-lg text-center">
                        <h3 className="text-md font-semibold text-teal-700">Average Power Density:</h3>
                        <p className="text-lg text-teal-800 font-bold">{powerDensity.toFixed(2)} W/cm²</p>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'scanInfo' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Scan Information</h1>
                <div className="flex items-center justify-center mb-4">
                  <button onClick={() => setCalculatorMode(prev => (prev === 'Direct' ? 'Reverse' : 'Direct'))} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none text-sm">
                    Switch to {calculatorMode === 'Direct' ? 'Reverse' : 'Direct'} Calculator
                  </button>
                </div>
                <p className="text-center text-sm text-gray-600 mb-4">Current Mode: <span className="font-semibold">{calculatorMode}</span></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><label htmlFor="xDirection" className="block mb-1 font-medium">X Direction (mm):</label><input type="text" id="xDirection" name="xDirection" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.xDirection} onChange={handleScanInfoChange} /></div>
                  <div><label htmlFor="yDirection" className="block mb-1 font-medium">Y Direction (mm):</label><input type="text" id="yDirection" name="yDirection" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.yDirection} onChange={handleScanInfoChange} /></div>
                  <div><label htmlFor="frequency" className="block mb-1 font-medium">Frequency (Hz):</label><input type="text" id="frequency" name="frequency" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.frequency} onChange={handleScanInfoChange} /></div>
                  {calculatorMode === 'Direct' ? (
                    <>
                      <div><label htmlFor="scanSpeed" className="block mb-1 font-medium">Scan Speed (mm/s):</label><input type="text" id="scanSpeed" name="scanSpeed" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.scanSpeed} onChange={handleScanInfoChange} /></div>
                      <div><label htmlFor="fill" className="block mb-1 font-medium">Fill (Hatch Spacing) (mm):</label><input type="text" id="fill" name="fill" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.fill} onChange={handleScanInfoChange} /></div>
                    </>
                  ) : (
                    <>
                      <div><label htmlFor="pulseOverlap" className="block mb-1 font-medium">Pulse Overlap (%):</label><input type="text" id="pulseOverlap" name="pulseOverlap" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.pulseOverlap} onChange={handleScanInfoChange} /></div>
                      <div><label htmlFor="fillOverlap" className="block mb-1 font-medium">Fill Overlap (%):</label><input type="text" id="fillOverlap" name="fillOverlap" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.fillOverlap} onChange={handleScanInfoChange} /></div>
                    </>
                  )}
                  <div><label htmlFor="startFrame" className="block mb-1 font-medium">Start Frame:</label><input type="text" id="startFrame" name="startFrame" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.startFrame} onChange={handleScanInfoChange} /></div>
                  <div><label htmlFor="endFrame" className="block mb-1 font-medium">End Frame:</label><input type="text" id="endFrame" name="endFrame" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.endFrame} onChange={handleScanInfoChange} /></div>
                </div>
                <h2 className="text-xl font-semibold text-center text-gray-800 mt-6 mb-2">Scan Area Visualization</h2>
                <canvas ref={scanCanvasRef} width="300" height="200" className="mx-auto block border rounded-md bg-gray-50"></canvas>
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-center space-y-1 text-sm">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Calculated Scan Parameters:</h3>
                  <p><strong>{calculatorMode === 'Direct' ? 'Calc. Pulse Overlap:' : 'Input Pulse Overlap:'}</strong> {calculatedScanInfo.displayPulseOverlap} %</p>
                  <p><strong>{calculatorMode === 'Direct' ? 'Calc. Fill Overlap:' : 'Input Fill Overlap:'}</strong> {calculatedScanInfo.displayFillOverlap} %</p>
                  <p><strong>{calculatorMode === 'Direct' ? 'Input Scan Speed:' : 'Calc. Scan Speed:'}</strong> {calculatedScanInfo.displayScanSpeed} mm/s</p>
                  <p><strong>{calculatorMode === 'Direct' ? 'Input Fill:' : 'Calc. Fill Pitch:'}</strong> {calculatedScanInfo.displayFill} mm</p>
                  <p><strong>Loops Needed:</strong> {calculatedScanInfo.numberOfLoops}</p>
                  <p><strong>Scan Time:</strong> {calculatedScanInfo.scanTime} s</p>
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
                        <input type="text" id="thickness" name="thickness" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.thickness || ''} onChange={handlePartInfoChange} />
                    </div>
                    <h2 className="text-xl font-semibold text-center text-gray-800 mt-6 mb-2">Part Visualization</h2>
                    <canvas ref={partCanvasRef} width="300" height="200" className="mx-auto block border rounded-md bg-gray-50 mt-4"></canvas>
                 </div>
            </div>
        )}
        {activeTab === 'pulseSpacing' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Pulse Spacing</h1>
                <div className="space-y-3 text-sm">
                  <div><label className="block font-medium">Rep. Rate (Hz):</label><p className="p-2 bg-gray-100 rounded-md">{parseFloat(scanInfo.frequency).toLocaleString() || '--'}</p></div>
                  <div><label className="block font-medium">Scan Speed (mm/s):</label><p className="p-2 bg-gray-100 rounded-md">{!isNaN(parseFloat(calculatedScanInfo.displayScanSpeed)) ? parseFloat(calculatedScanInfo.displayScanSpeed).toFixed(2) : '--'}</p></div>
                </div>
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-center">
                  <h3 className="text-md font-semibold text-indigo-700">Calculated Pulse Spacing:</h3>
                  <p className="text-lg font-bold text-indigo-800">{pulseSpacing.toFixed(4)} mm</p>
                </div>
            </div>
        )}
        {activeTab === 'fluence' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Energy & Fluence</h1>
                <div className="space-y-3">
                    <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <h3 className="text-md font-semibold text-indigo-700">Energy per Pulse:</h3>
                        <p className="text-lg font-bold text-indigo-800">{fluence.energyPerPulse.toFixed(4)} J</p>
                    </div>
                     <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <h3 className="text-md font-semibold text-indigo-700">Peak Power:</h3>
                        <p className="text-lg font-bold text-indigo-800">{laserInfo.peakPower.toFixed(2)} kW</p>
                    </div>
                     <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <h3 className="text-md font-semibold text-indigo-700">Number of Pulses per Position:</h3>
                        <p className="text-lg font-bold text-indigo-800">{fluence.pulsesPerPosition.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <h3 className="text-md font-semibold text-indigo-700">Total Energy per Position:</h3>
                        <p className="text-lg font-bold text-indigo-800">{fluence.totalEnergyPerPosition.toFixed(4)} J</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <h3 className="text-md font-semibold text-indigo-700">Single Pulse Fluence:</h3>
                        <p className="text-lg font-bold text-indigo-800">{fluence.singleSpot.toFixed(2)} J/cm²</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <h3 className="text-md font-semibold text-indigo-700">Effective (Net) Fluence:</h3>
                        <p className="text-lg font-bold text-indigo-800">{fluence.effective.toFixed(2)} J/cm²</p>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'productivityRate' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Productivity & Deposition</h1>
                 <div className="space-y-3">
                    <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <h3 className="text-md font-semibold text-indigo-700">Average Power (Energy Deposition):</h3>
                        <p className="text-lg font-bold text-indigo-800">{productivity.joulesPerSecond.toFixed(0)} J/s (W)</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <h3 className="text-md font-semibold text-indigo-700">Productivity Rate:</h3>
                        <p className="text-lg font-bold text-indigo-800">{productivity.rate.toFixed(2)} mm²/s</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <h3 className="text-md font-semibold text-indigo-700">Robot Speed:</h3>
                        <p className="text-lg font-bold text-indigo-800">{productivity.robotSpeed.toFixed(2)} mm/s</p>
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
                        <input type="file" id="beforeProcess" name="beforeProcess" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={(e) => handlePictureUpload(e, 'beforeProcess')} />
                        {pictures.beforeProcess && <img src={pictures.beforeProcess} alt="Before" className="mt-2 rounded-md shadow-md max-h-40 object-contain mx-auto" />}
                    </div>
                    <div>
                        <label htmlFor="afterProcess" className="block text-sm font-medium text-gray-700 mb-1">After Process:</label>
                        <input type="file" id="afterProcess" name="afterProcess" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={(e) => handlePictureUpload(e, 'afterProcess')} />
                        {pictures.afterProcess && <img src={pictures.afterProcess} alt="After" className="mt-2 rounded-md shadow-md max-h-40 object-contain mx-auto" />}
                    </div>
                     <div>
                        <label htmlFor="pictureNotes" className="block text-sm font-medium text-gray-700 mb-1">Notes:</label>
                        <textarea id="pictureNotes" name="notes" rows="3" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Notes about the process..." value={pictures.notes} onChange={(e) => setPictures(prev => ({...prev, notes: e.target.value}))}></textarea>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'grading' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Grading</h1>
                <div className="space-y-4">
                  <div><label htmlFor="criterion1" className="block text-sm font-medium text-gray-700 mb-1">Criterion 1:</label><input type="text" id="criterion1" name="criterion1" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Surface Cleanliness" value={grading.criterion1} onChange={handleGradingChange} /></div>
                  <div><label htmlFor="result1" className="block text-sm font-medium text-gray-700 mb-1">Result 1:</label><input type="text" id="result1" name="result1" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., 95% clean" value={grading.result1} onChange={handleGradingChange} /></div>
                  <div>
                    <label htmlFor="gradingNotes" className="block text-sm font-medium text-gray-700 mb-1">Notes / Suggestions:</label>
                    <textarea id="gradingNotes" name="notes" rows="3" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Observations or suggestions..." value={grading.notes} onChange={handleGradingChange}></textarea>
                  </div>
                </div>
            </div>
        )}
        {activeTab === 'save' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Save & Export</h1>
                <div className="space-y-3">
                  <button onClick={exportToCsv} className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none">Export to CSV</button>
                  <button onClick={exportToPdf} className="w-full mt-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none">Save as PDF (Print)</button>
                  <button onClick={submitSuggestion} className="w-full mt-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none">Submit Suggestion</button>
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
                    placeholder="Enter any additional notes here..."
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default CleaningMode;
