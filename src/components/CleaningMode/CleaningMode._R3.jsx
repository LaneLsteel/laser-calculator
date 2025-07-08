import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Import Firebase services from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, addDoc, query } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";


// Import shared data and utility functions
import { headData, cleaningLaserModels, maxEnergyOptions_mJ, workingDistances } from '../../data/SharedData';
import { parseNumericValue, parseYlpnModel, drawScanArea, drawPartGraphic, convertAndDisplay } from '../../utils/SharedUtils';
import Tooltip from '../Tooltip';

// A component to render the dynamic head parameter inputs for Cleaning mode.
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


const CleaningMode = ({ goToHomeScreen }) => {
    // --- STATE for Cleaning mode ---
    const [activeTab, setActiveTab] = useState('loadSave');
    const [laserInfo, setLaserInfo] = useState({
        laserCleaningType: '',
        laserCleaningModel: '',
        maxEnergy_mJ: NaN,
        wavelength: 1064,
        pulseDuration: 10,
        pulseDuration_ns: '', // New state for the dropdown
        repetitionRate_kHz: 0, // New state for the slider
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
        scanSpeed: 10000,
        initialVelocity: 0,
        frequency: 0, // This will now be derived from laserInfo.repetitionRate_kHz
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
    const [motionCalculations, setMotionCalculations] = useState({});
    const [productivityUnit, setProductivityUnit] = useState('mm2_per_s');
    const [avgSpeedUnit, setAvgSpeedUnit] = useState('mm_per_s');
    const [robotSpeedUnit, setRobotSpeedUnit] = useState('mm_per_s');
    const [pictures, setPictures] = useState({ beforeProcess: null, afterProcess: null, notes: '' });
    const [grading, setGrading] = useState({ criterion1: '', result1: '', notes: '' });
    const [otherNotes, setOtherNotes] = useState('');
    const [calculatorMode, setCalculatorMode] = useState('Direct');
    // *** NEW: State to manage the input toggle in reverse mode ***
    const [reverseInputMode, setReverseInputMode] = useState('speed'); // 'speed' or 'frequency'
    const [calculatedScanInfo, setCalculatedScanInfo] = useState({
        displayPulseOverlap: '--',
        displayFillOverlap: '--',
        displayFill: '--',
        displayScanSpeed: '--',
        numberOfLoops: '--',
        scanTime: '--',
    });
    const [errors, setErrors] = useState({});
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    // Firestore State
    const [db, setDb] = useState(null);
    const [userId, setUserId] = useState(null);
    const [savedSetups, setSavedSetups] = useState([]);
    const [savedParts, setSavedParts] = useState([]);
    const [newSetupName, setNewSetupName] = useState("");
    const [newPartName, setNewPartName] = useState("");
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // Constants for nominal frequencies
    const nominalFrequencies = useMemo(() => ({
        '20': 90000,
        '25': 90000,
        '50': 40000,
        '70': 28600,
        '100': 20000,
        '150': 13300,
        '300': 20000,
        '500': 10000,
    }), []);

    const scanCanvasRef = useRef(null);
    const partCanvasRef = useRef(null);

    const cleaningTabs = [
        { id: 'loadSave', label: 'Load/Save Setups' },
        { id: 'laserInfo', label: 'Laser Selection' },
        { id: 'setup', label: 'Head Setup' },
        { id: 'scanInfo', label: 'Scan Information' },
        { id: 'partInformation', label: 'Part Information' },
        { id: 'pulseSpacing', label: 'Pulse Spacing' },
        { id: 'fluence', label: 'Energy & Fluence' },
        { id: 'productivity', label: 'Productivity & Motion' },
        { id: 'aiAssistant', label: 'AI Assistant' },
        { id: 'picture', label: 'Pictures' },
        { id: 'grading', label: 'Grading' },
        { id: 'save', label: 'Save & Export' },
        { id: 'other', label: 'Other' },
    ];

    // --- HANDLERS ---
    const handleLaserInfoChange = (e) => {
        const { name, value } = e.target;
        // In reverse mode, the slider is a display, not an input.
        if (name === 'repetitionRate_kHz' && calculatorMode === 'Reverse') {
            return;
        }

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
                if (!isNaN(maxPower)) newState.maxPower = maxPower;
                if (newState.pulseDuration < minPulse || newState.pulseDuration > maxPulse) {
                    newState.pulseDuration = minPulse;
                }
            }
            // Handle slider input
            if (name === 'repetitionRate_kHz') {
                newState.repetitionRate_kHz = parseFloat(value);
            }
            return newState;
        });
    };

    const handleSetupParameterChange = (e) => {
        const { name, value } = e.target;
        setSetupParameters(prev => ({ ...prev, [name]: value }));
    };

    const handleScanInfoChange = (e) => {
        let { name, value } = e.target;

        // *** NEW: Handle frequency input with units ***
        if (name === 'frequency') {
            let numericValue = parseFloat(value);
            if (String(value).toLowerCase().includes('khz')) {
                numericValue *= 1000;
            }
            // If just a number, assume Hz.
            if (!isNaN(numericValue)) {
                setScanInfo(prev => ({ ...prev, [name]: numericValue }));
            } else {
                setScanInfo(prev => ({ ...prev, [name]: 0 }));
            }
        } else {
            setScanInfo(prev => ({ ...prev, [name]: value }));
        }
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
        setGrading(prev => ({ ...prev, [name]: value }));
    };

    // --- DERIVED DATA & LOGIC ---

    // New useEffect to update repetition rate based on pulse duration selection (only in direct mode)
    useEffect(() => {
        if (calculatorMode === 'Direct') {
            const selectedFrequency = nominalFrequencies[laserInfo.pulseDuration_ns];
            if (selectedFrequency !== undefined) {
                setLaserInfo(prev => ({ ...prev, repetitionRate_kHz: selectedFrequency }));
            }
        }
    }, [laserInfo.pulseDuration_ns, nominalFrequencies, calculatorMode]);

    // *** UPDATED: useEffect for Direct Mode frequency sync ***
    useEffect(() => {
        if (calculatorMode === 'Direct') {
            // Convert kHz to Hz and update the scanInfo state
            const frequencyInHz = laserInfo.repetitionRate_kHz * 1000;
            setScanInfo(prev => ({ ...prev, frequency: frequencyInHz }));
        }
    }, [laserInfo.repetitionRate_kHz, calculatorMode]);


    // *** UPDATED: Combined and refactored all Reverse Mode calculations ***
    useEffect(() => {
        if (calculatorMode === 'Reverse') {
            const numPulseOverlap = parseFloat(scanInfo.pulseOverlap);
            const spotSize_mm = calculatedSpotSize / 1000;

            if (reverseInputMode === 'speed') {
                // Calculate Frequency from Scan Speed
                const numScanSpeed = parseFloat(scanInfo.scanSpeed);
                if (numScanSpeed > 0 && spotSize_mm > 0 && numPulseOverlap >= 0 && numPulseOverlap < 100) {
                    const pulseSpacing_mm = spotSize_mm * (1 - (numPulseOverlap / 100));
                    if (pulseSpacing_mm > 0) {
                        const newFrequencyHz = numScanSpeed / pulseSpacing_mm;
                        setScanInfo(prev => ({ ...prev, frequency: newFrequencyHz }));
                        setLaserInfo(prev => ({ ...prev, repetitionRate_kHz: newFrequencyHz / 1000 }));
                    }
                }
            } else { // reverseInputMode === 'frequency'
                // Calculate Scan Speed from Frequency
                const numFrequency = parseFloat(scanInfo.frequency);
                 if (numFrequency > 0 && spotSize_mm > 0 && numPulseOverlap >= 0 && numPulseOverlap < 100) {
                    const pulseSpacing_mm = spotSize_mm * (1 - (numPulseOverlap / 100));
                    const newScanSpeed = numFrequency * pulseSpacing_mm;
                    setScanInfo(prev => ({...prev, scanSpeed: newScanSpeed}));
                    // Also sync laserInfo with the user's frequency input
                    setLaserInfo(prev => ({ ...prev, repetitionRate_kHz: numFrequency / 1000 }));
                }
            }

            // *** FIX: Standalone calculation for Fill Pitch from Fill Overlap ***
            const numFillOverlap = parseFloat(scanInfo.fillOverlap);
            if (spotSize_mm > 0 && !isNaN(numFillOverlap)) {
                const fillPitch = spotSize_mm * (1 - (numFillOverlap / 100));
                setScanInfo(prev => ({ ...prev, fill: fillPitch }));
            }
        }
    }, [
        calculatorMode,
        reverseInputMode,
        scanInfo.scanSpeed,
        scanInfo.pulseOverlap,
        scanInfo.frequency,
        scanInfo.fillOverlap,
        calculatedSpotSize
    ]);


    // This large useEffect handles calculations that are common to both modes
    // and those specific to 'Direct' mode, plus the final display updates.
    useEffect(() => {
        // Basic setup calculations
        const { selectedHeadType, collimator, collimatorOther, focusLens, focusLensOther, fiberDiameterCleaning, laserPowerCleaning } = setupParameters;
        const numFiber = parseFloat(fiberDiameterCleaning);
        const numPower = parseFloat(laserPowerCleaning);
        const numCol = parseNumericValue(collimator === 'Other' ? collimatorOther : collimator);
        const numFocus = parseNumericValue(focusLens === 'Other' ? focusLensOther : focusLens);
        let newSpotSize = 0;
        if (numFiber > 0 && numCol > 0 && numFocus > 0) newSpotSize = (numFiber / numCol) * numFocus;
        setCalculatedSpotSize(newSpotSize);

        let newPowerDensity = 0;
        if (newSpotSize > 0 && numPower > 0) newPowerDensity = numPower / (Math.PI * Math.pow((newSpotSize / 10000) / 2, 2));
        setPowerDensity(newPowerDensity);

        // Laser specific calculations
        const { maxEnergy_mJ, pulseDuration, laserCleaningType } = laserInfo;
        let newPeakPower = 0;
        if (['YLPN', 'YLPP', 'YLPF'].includes(laserCleaningType) && !isNaN(maxEnergy_mJ) && !isNaN(pulseDuration) && pulseDuration > 0) newPeakPower = (parseFloat(maxEnergy_mJ) * 1000) / parseFloat(pulseDuration);
        setLaserInfo(prev => ({ ...prev, peakPower: newPeakPower }));

        // Scan related calculations
        const numFreq = parseFloat(scanInfo.frequency);
        const numScanSpeed = parseFloat(scanInfo.scanSpeed);
        const spotSize_mm = newSpotSize / 1000;

        let newPulseSpacing = 0;
        if (numFreq > 0 && numScanSpeed > 0) newPulseSpacing = numScanSpeed / numFreq;
        setPulseSpacing(newPulseSpacing);

        // --- Update display values for the output box ---
        const newCalculatedScanInfo = {};

        // For Direct Mode, calculate the overlaps
        if (calculatorMode === 'Direct') {
            if (numScanSpeed > 0 && spotSize_mm > 0 && numFreq > 0) {
                const pulseOverlap = (1 - (numScanSpeed / (spotSize_mm * numFreq))) * 100;
                newCalculatedScanInfo.displayPulseOverlap = pulseOverlap.toFixed(2);
            } else {
                newCalculatedScanInfo.displayPulseOverlap = '--';
            }

            const numFill = parseFloat(scanInfo.fill);
            if (numFill > 0 && spotSize_mm > 0) {
                const fillOverlap = (1 - (numFill / spotSize_mm)) * 100;
                newCalculatedScanInfo.displayFillOverlap = fillOverlap.toFixed(2);
            } else {
                newCalculatedScanInfo.displayFillOverlap = '--';
            }
        }
        
        // Update display for Scan Speed and Fill Pitch
        newCalculatedScanInfo.displayScanSpeed = numScanSpeed.toFixed(2);
        newCalculatedScanInfo.displayFill = parseFloat(scanInfo.fill).toFixed(4);
        
        // These are always calculated
        const hatchWidth = parseFloat(scanInfo.yDirection);
        const fillPitch = parseFloat(scanInfo.fill);
        if (hatchWidth > 0 && fillPitch > 0) {
            newCalculatedScanInfo.numberOfLoops = Math.ceil(hatchWidth / fillPitch);
        } else {
            newCalculatedScanInfo.numberOfLoops = '--';
        }
        // Simplified Scan Time for now
        // newCalculatedScanInfo.scanTime = ...

        setCalculatedScanInfo(prev => ({...prev, ...newCalculatedScanInfo}));


        // --- Motion & Productivity Calculations ---
        const headPerf = headData[selectedHeadType]?.performanceMetrics;
        const focalLength = parseNumericValue(focusLens === 'Other' ? focusLensOther : focusLens);
        const hatchLength = parseFloat(scanInfo.xDirection);
        const initialVelocity = parseFloat(scanInfo.initialVelocity);
        const maxVelocity = numScanSpeed;
        
        let calcs = {};
        let robotSpeedCalc = 0;
        let productivityRate = 0;

        if (headPerf && !isNaN(focalLength) && focalLength > 0 && !isNaN(hatchLength) && !isNaN(initialVelocity) && !isNaN(maxVelocity)) {
            const { acceleration, trackingDelay } = headPerf;
            calcs.maxAccelLinear = (acceleration * focalLength * 2);
            calcs.accelDistance = Math.min(hatchLength / 2, 0.5 * (Math.pow(maxVelocity, 2) - Math.pow(initialVelocity, 2)) / calcs.maxAccelLinear);
            calcs.coastDistance = hatchLength - 2 * calcs.accelDistance;

            if (calcs.coastDistance > 0) {
                calcs.accelTime = (maxVelocity - initialVelocity) / calcs.maxAccelLinear;
            } else {
                 if (calcs.maxAccelLinear > 0) {
                    calcs.accelTime = (-initialVelocity + Math.sqrt(Math.pow(initialVelocity, 2) + calcs.maxAccelLinear * hatchLength)) / calcs.maxAccelLinear;
                } else {
                    calcs.accelTime = 0;
                }
            }
            
            calcs.coastTime = calcs.coastDistance > 0 ? calcs.coastDistance / maxVelocity : 0;
            calcs.turnAroundDistance = calcs.maxAccelLinear > 0 ? 0.5 * Math.pow(initialVelocity, 2) / calcs.maxAccelLinear : 0;
            calcs.maxSpeed = initialVelocity + calcs.accelTime * calcs.maxAccelLinear;
            calcs.lineTime = 2 * calcs.accelTime + calcs.coastTime + 0.0003;
            calcs.turnAroundTime = calcs.maxAccelLinear > 0 ? (2 * initialVelocity / calcs.maxAccelLinear) + (2 * trackingDelay) : 0;
            calcs.totalLineTime = calcs.turnAroundTime + calcs.lineTime;
            calcs.avgSpeed = calcs.totalLineTime > 0 ? hatchLength / calcs.totalLineTime : 0;

            robotSpeedCalc = !isNaN(fillPitch) && calcs.totalLineTime > 0 ? fillPitch / calcs.totalLineTime : 0;
            
            productivityRate = (calcs.avgSpeed * fillPitch) / 100;

            const term1 = Math.sqrt(hatchLength / (2 * acceleration * focalLength));
            const term2 = 2 * trackingDelay;
            const term3 = 0.0003;
            calcs.maxAvgSpeed = (hatchLength / (2 * term1 + term2 + term3)) / 1000;
            
            setErrors(prev => ({...prev, avgSpeedWarning: calcs.avgSpeed > calcs.maxAvgSpeed ? 'Warning: Average Speed exceeds theoretical maximum.' : null}));
        }
        setMotionCalculations(calcs);
        setProductivity({ rate: productivityRate, robotSpeed: robotSpeedCalc, joulesPerSecond: numPower });

    }, [laserInfo.maxEnergy_mJ, laserInfo.pulseDuration, laserInfo.laserCleaningType, setupParameters, scanInfo, calculatorMode]);

    useEffect(() => {
        if (!partInfo.isMismatch) {
            setPartInfo(prev => ({ ...prev, thickness2: prev.thickness }));
        }
    }, [partInfo.isMismatch, partInfo.thickness]);

    useEffect(() => {
        if (activeTab === 'scanInfo' && scanCanvasRef.current) {
            drawScanArea(scanCanvasRef.current, scanInfo.xDirection, scanInfo.yDirection, scanInfo.fill, calculatedSpotSize);
        }
        if (activeTab === 'partInformation' && partCanvasRef.current) {
            drawPartGraphic(partCanvasRef.current, partInfo);
        }
    }, [scanInfo, partInfo, calculatedSpotSize, activeTab]);

    const getTabStatus = useCallback((tabId) => {
        let filled = 0;
        let total = 0;

        switch (tabId) {
            case 'laserInfo':
                total = 3; // Updated total
                if (laserInfo.laserCleaningType) filled++;
                if (laserInfo.laserCleaningModel) filled++;
                if (laserInfo.pulseDuration_ns) filled++; // Added to check
                break;
            case 'setup':
                total = 3;
                if (setupParameters.selectedHeadType) filled++;
                if (setupParameters.collimator && setupParameters.collimator !== 'Other') filled++;
                if (setupParameters.focusLens && setupParameters.focusLens !== 'Other') filled++;
                break;
            case 'scanInfo':
                total = 4;
                if (scanInfo.xDirection) filled++;
                if (scanInfo.yDirection) filled++;
                if (scanInfo.scanSpeed) filled++;
                if (scanInfo.fill) filled++;
                break;
            case 'partInformation':
                total = 2;
                if (partInfo.material) filled++;
                if (partInfo.thickness) filled++;
                break;
            default:
                return 'default';
        }

        if (filled === 0) return 'default';
        if (filled === total) return 'status-complete';
        return 'status-partial';
    }, [laserInfo, setupParameters, scanInfo, partInfo]);

    const renderMotionCalculations = () => {
        const {
            maxAccelLinear = 0, accelDistance = 0, coastDistance = 0, accelTime = 0,
            coastTime = 0, turnAroundDistance = 0, maxSpeed = 0, lineTime = 0,
            turnAroundTime = 0, totalLineTime = 0, avgSpeed = 0, maxAvgSpeed = 0
        } = motionCalculations;
        const { robotSpeed = 0, rate = 0 } = productivity;


        return (
            <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Tooltip text="Acceleration * Focal Length * 2"><p className="font-semibold text-gray-700">Max Accel (Linear):</p></Tooltip>
                        <p className="text-gray-900">{maxAccelLinear.toFixed(4)}</p>
                    </div>
                    {/* Other outputs */}
                </div>
                <div className="mt-4 space-y-3">
                    <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <div className="flex justify-center items-center">
                            <Tooltip text="Hatch Length / Total Line Time"><h3 className="text-md font-semibold text-indigo-700 mr-2">Average Speed:</h3></Tooltip>
                            <select value={avgSpeedUnit} onChange={(e) => setAvgSpeedUnit(e.target.value)} className="bg-indigo-100 border border-indigo-300 rounded-md py-1 px-2 text-sm">
                                <option value="mm_per_s">mm/s</option>
                                <option value="cm_per_s">cm/s</option>
                                <option value="in_per_s">in/s</option>
                                <option value="m_per_s">m/s</option>
                            </select>
                        </div>
                        <p className="text-lg font-bold text-indigo-800">{convertAndDisplay(avgSpeed, avgSpeedUnit, 'speed_mm_per_s', 4)}</p>
                        {errors.avgSpeedWarning && <p className="text-xs text-red-600 mt-1">{errors.avgSpeedWarning}</p>}
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                        <Tooltip text="Theoretical maximum average speed achievable."><h3 className="text-md font-semibold text-purple-700">Max Average Speed (Theoretical):</h3></Tooltip>
                        <p className="text-lg font-bold text-purple-800">{maxAvgSpeed.toFixed(2)} m/sec</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <div className="flex justify-center items-center">
                            <Tooltip text="Fill Pitch / Total Line Time"><h3 className="text-md font-semibold text-indigo-700 mr-2">Robot Speed:</h3></Tooltip>
                            <select value={robotSpeedUnit} onChange={(e) => setRobotSpeedUnit(e.target.value)} className="bg-indigo-100 border border-indigo-300 rounded-md py-1 px-2 text-sm">
                                <option value="mm_per_s">mm/s</option>
                                <option value="cm_per_s">cm/s</option>
                                <option value="in_per_s">in/s</option>
                                <option value="m_per_s">m/s</option>
                            </select>
                        </div>
                        <p className="text-lg font-bold text-indigo-800">{convertAndDisplay(robotSpeed, robotSpeedUnit, 'speed_mm_per_s', 4)}</p>
                    </div>
                    <div className="p-3 bg-teal-50 rounded-lg text-center">
                        <div className="flex justify-center items-center">
                            <Tooltip text="(Average Speed * Fill Pitch) / 100"><h3 className="text-md font-semibold text-teal-700 mr-2">Productivity:</h3></Tooltip>
                            <select value={productivityUnit} onChange={(e) => setProductivityUnit(e.target.value)} className="bg-teal-100 border border-teal-300 rounded-md py-1 px-2 text-sm">
                                <option value="mm2_per_s">mm²/s</option>
                                <option value="cm2_per_s">cm²/s</option>
                                <option value="in2_per_s">in²/s</option>
                                <option value="m2_per_s">m²/s</option>
                            </select>
                        </div>
                        <p className="text-lg font-bold text-teal-800">{convertAndDisplay(productivity.rate, productivityUnit, 'areaRate_mm2_per_s', 4)} {productivityUnit.replace('_per_', '/').replace('2', '²')}</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER ---
    const sliderMaxValue = 100000;
    const sliderPercentage = (laserInfo.repetitionRate_kHz / sliderMaxValue) * 100;
    const sliderStyle = {
        background: `linear-gradient(to right, #6366F1 ${sliderPercentage}%, #d1d5db ${sliderPercentage}%)`
    };

    return (
        <div className="flex flex-row-reverse space-x-4 space-x-reverse">
            {/* Vertical Tab Bar */}
            <div className="w-64 flex-shrink-0">
                <div className="tab-container bg-gray-50 rounded-lg shadow-md">
                    {cleaningTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${getTabStatus(tab.id)}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow bg-white p-6 md:p-8 rounded-lg shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <img id="homeLogo" src="https://placehold.co/150x50/6366F1/FFFFFF?text=Cleaning&font=Inter" alt="Cleaning Mode" className="cursor-pointer rounded-md shadow-md" onClick={goToHomeScreen} />
                </div>

                <div className="min-h-[600px]">
                    {activeTab === 'loadSave' && (
                        <div>
                            <h1 className="text-2xl font-bold text-center mb-6">Load/Save Setups</h1>
                            {/* Placeholder for Load/Save UI */}
                        </div>
                    )}
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
                                            {laserInfo.laserCleaningType === 'YLPN' && !isNaN(laserInfo.maxEnergy_mJ) && cleaningLaserModels.YLPN[laserInfo.maxEnergy_mJ]
                                                ? cleaningLaserModels.YLPN[laserInfo.maxEnergy_mJ].map(modelOpt => <option key={modelOpt} value={modelOpt}>{modelOpt}</option>)
                                                : (Array.isArray(cleaningLaserModels[laserInfo.laserCleaningType]) ? cleaningLaserModels[laserInfo.laserCleaningType] : cleaningLaserModels[laserInfo.laserCleaningType]?.default || []).map(modelOpt => <option key={modelOpt} value={modelOpt}>{modelOpt}</option>)
                                            }
                                        </select>
                                    </div>
                                )}
                                {/* New Pulse Duration Dropdown */}
                                <div>
                                    <label htmlFor="pulseDuration_ns" className="block text-sm font-medium text-gray-700 mb-1">Laser Mode (Pulse Duration):</label>
                                    <select id="pulseDuration_ns" name="pulseDuration_ns" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={laserInfo.pulseDuration_ns || ''} onChange={handleLaserInfoChange}>
                                        <option value="">-- Select --</option>
                                        {[20, 25, 50, 70, 100, 120, 150, 300, 500].map(duration => <option key={duration} value={duration}>{duration} ns</option>)}
                                    </select>
                                </div>

                                {/* Repetition Rate Slider */}
                                {laserInfo.pulseDuration_ns && (
                                    <div className="pt-4">
                                        <label htmlFor="repetitionRate_kHz" className="block text-sm font-medium text-gray-700 mb-1">Repetition Rate (kHz):</label>
                                        <div className="text-center font-semibold text-indigo-600 mb-2">
                                            Current: {laserInfo.repetitionRate_kHz.toLocaleString(undefined, {maximumFractionDigits: 2})} kHz
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="range"
                                                id="repetitionRate_kHz"
                                                name="repetitionRate_kHz"
                                                min="0"
                                                max={sliderMaxValue}
                                                value={laserInfo.repetitionRate_kHz}
                                                onChange={handleLaserInfoChange}
                                                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none range-slider ${calculatorMode === 'Reverse' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                style={sliderStyle}
                                                disabled={calculatorMode === 'Reverse'}
                                            />
                                            <div
                                                className="absolute -bottom-6 text-xs text-white bg-indigo-500 rounded px-1"
                                                style={{ left: `${sliderPercentage}%`, transform: 'translateX(-50%)' }}
                                            >
                                                {laserInfo.repetitionRate_kHz.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                                            <span>0 kHz</span>
                                            <span>{sliderMaxValue.toLocaleString()} kHz</span>
                                        </div>
                                        <div className="text-center text-sm text-gray-600 mt-8">
                                            Nominal PRR for {laserInfo.pulseDuration_ns}ns mode: <span className="font-bold">{nominalFrequencies[laserInfo.pulseDuration_ns].toLocaleString()} kHz</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'scanInfo' && (
                        <div>
                            <h1 className="text-2xl font-bold text-center mb-6">Scan Information</h1>
                            <div className="flex items-center justify-center mb-4 space-x-4">
                                <button onClick={() => setCalculatorMode(prev => (prev === 'Direct' ? 'Reverse' : 'Direct'))} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none text-sm">
                                    Switch to {calculatorMode === 'Direct' ? 'Reverse' : 'Direct'} Calculator
                                </button>
                                {calculatorMode === 'Reverse' && (
                                    <button onClick={() => setReverseInputMode(prev => (prev === 'speed' ? 'frequency' : 'speed'))} className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:bg-blue-200 focus:outline-none text-sm">
                                        Switch Input to {reverseInputMode === 'speed' ? 'Frequency' : 'Scan Speed'}
                                     </button>
                                )}
                            </div>
                            <p className="text-center text-sm text-gray-600 mb-4">Current Mode: <span className="font-semibold">{calculatorMode}</span></p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label htmlFor="xDirection" className="block mb-1 font-medium">X Direction (mm):</label>
                                    <input type="text" id="xDirection" name="xDirection" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.xDirection} onChange={handleScanInfoChange} />
                                    <p className="text-xs text-gray-500 mt-1">(parallel to travel)</p>
                                </div>
                                <div><label htmlFor="yDirection" className="block mb-1 font-medium">Y Direction (mm):</label><input type="text" id="yDirection" name="yDirection" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.yDirection} onChange={handleScanInfoChange} /></div>
                                <div><label htmlFor="initialVelocity" className="block mb-1 font-medium">Initial Velocity (mm/s):</label><input type="number" id="initialVelocity" name="initialVelocity" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.initialVelocity} onChange={handleScanInfoChange} /></div>

                                {calculatorMode === 'Direct' ? (
                                    <>
                                        <div><label htmlFor="scanSpeed" className="block mb-1 font-medium">Scan Speed (mm/s):</label><input type="text" id="scanSpeed" name="scanSpeed" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.scanSpeed} onChange={handleScanInfoChange} /></div>
                                        <div><label htmlFor="fill" className="block mb-1 font-medium">Fill (Hatch Spacing) (mm):</label><input type="text" id="fill" name="fill" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.fill} onChange={handleScanInfoChange} /></div>
                                    </>
                                ) : ( // Reverse Mode Inputs
                                    <>
                                        <div><label htmlFor="pulseOverlap" className="block mb-1 font-medium">Pulse Overlap (%):</label><input type="text" id="pulseOverlap" name="pulseOverlap" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.pulseOverlap} onChange={handleScanInfoChange} /></div>
                                        <div><label htmlFor="fillOverlap" className="block mb-1 font-medium">Fill Overlap (%):</label><input type="text" id="fillOverlap" name="fillOverlap" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.fillOverlap} onChange={handleScanInfoChange} /></div>
                                        
                                        {/* Toggled input for Scan Speed */}
                                        {reverseInputMode === 'speed' && (
                                            <div><label htmlFor="scanSpeed" className="block mb-1 font-medium">Scan Speed (mm/s):</label><input type="text" id="scanSpeed" name="scanSpeed" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.scanSpeed} onChange={handleScanInfoChange} /></div>
                                        )}

                                        {/* Toggled input for Frequency */}
                                        {reverseInputMode === 'frequency' && (
                                            <div><label htmlFor="frequency" className="block mb-1 font-medium">Frequency (Hz/kHz):</label><input type="text" id="frequency" name="frequency" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.frequency} onChange={handleScanInfoChange} /></div>
                                        )}
                                    </>
                                )}
                                
                                {/* This is now always the frequency display box */}
                                <div>
                                    <label htmlFor="frequencyDisplay" className="block mb-1 font-medium">{reverseInputMode === 'speed' && calculatorMode === 'Reverse' ? 'Calc. Frequency (Hz):' : 'Frequency (Hz):'}</label>
                                    <input
                                        type="text"
                                        id="frequencyDisplay"
                                        name="frequencyDisplay"
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                                        value={scanInfo.frequency.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                        readOnly
                                    />
                                </div>
                                 {/* This is now the conditional scan speed output box */}
                                 {calculatorMode === 'Reverse' && reverseInputMode === 'frequency' && (
                                    <div>
                                        <label htmlFor="scanSpeedDisplay" className="block mb-1 font-medium">Calc. Scan Speed (mm/s):</label>
                                        <input
                                            type="text"
                                            id="scanSpeedDisplay"
                                            name="scanSpeedDisplay"
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                                            value={parseFloat(scanInfo.scanSpeed).toFixed(2)}
                                            readOnly
                                        />
                                    </div>
                                )}
                            </div>

                            <h2 className="text-xl font-semibold text-center text-gray-800 mt-6 mb-2">Scan Area Visualization</h2>
                            <canvas ref={scanCanvasRef} width="300" height="200" className="mx-auto block border rounded-md bg-gray-50"></canvas>
                            
                            <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-center space-y-1 text-sm">
                                <h3 className="text-md font-semibold text-indigo-700 mb-2">Calculated Scan Parameters:</h3>
                                {calculatorMode === 'Direct' && (
                                    <>
                                        <p><strong>Calc. Pulse Overlap:</strong> {calculatedScanInfo.displayPulseOverlap} %</p>
                                        <p><strong>Calc. Fill Overlap:</strong> {calculatedScanInfo.displayFillOverlap} %</p>
                                    </>
                                )}
                                <p><strong>{calculatorMode === 'Direct' ? 'Input Scan Speed:' : 'Scan Speed:'}</strong> {calculatedScanInfo.displayScanSpeed} mm/s</p>
                                <p><strong>{calculatorMode === 'Direct' ? 'Input Fill:' : 'Calc. Fill Pitch:'}</strong> {calculatedScanInfo.displayFill} mm</p>
                                <p><strong>Loops Needed:</strong> {calculatedScanInfo.numberOfLoops}</p>
                                <p><strong>Scan Time:</strong> {calculatedScanInfo.scanTime || '--'} s</p>
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
                                    <label htmlFor="thickness" className="block text-sm font-medium text-gray-700 mb-1">Part Thickness 1 (mm):</label>
                                    <input type="number" id="thickness" name="thickness" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.thickness || ''} onChange={handlePartInfoChange} />
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" id="isMismatch" name="isMismatch" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" checked={partInfo.isMismatch} onChange={handlePartInfoChange} />
                                    <label htmlFor="isMismatch" className="ml-2 block text-sm text-gray-900">Part Mismatch</label>
                                </div>
                                {partInfo.isMismatch && (
                                    <div>
                                        <label htmlFor="thickness2" className="block text-sm font-medium text-gray-700 mb-1">Part Thickness 2 (mm):</label>
                                        <input type="number" id="thickness2" name="thickness2" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.thickness2 || ''} onChange={handlePartInfoChange} />
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
                                    <input type="number" id="gap" name="gap" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.gap || ''} onChange={handlePartInfoChange} />
                                </div>
                                <div>
                                    <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">Part Length (mm):</label>
                                    <input type="number" id="length" name="length" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.length || ''} onChange={handlePartInfoChange} />
                                </div>
                                <div>
                                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">Part Height (mm):</label>
                                    <input type="number" id="height" name="height" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.height || ''} onChange={handlePartInfoChange} />
                                </div>
                                <div>
                                    <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">Part Width (mm):</label>
                                    <input type="number" id="width" name="width" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={partInfo.width || ''} onChange={handlePartInfoChange} />
                                </div>
                                <canvas ref={partCanvasRef} width="300" height="200" className="mx-auto block border rounded-md bg-gray-50 mt-4"></canvas>
                            </div>
                        </div>
                    )}
                    {activeTab === 'pulseSpacing' && (
                        <div>
                            <h1 className="text-2xl font-bold text-center mb-6">Pulse Spacing</h1>
                            <div className="space-y-3 text-sm">
                                <div><label className="block font-medium">Rep. Rate (Hz):</label><p className="p-2 bg-gray-100 rounded-md">{parseFloat(scanInfo.frequency).toLocaleString() || '--'}</p></div>
                                <div><label className="block font-medium">Scan Speed (mm/s):</label><p className="p-2 bg-gray-100 rounded-md">{!isNaN(parseFloat(scanInfo.scanSpeed)) ? parseFloat(scanInfo.scanSpeed).toFixed(2) : '--'}</p></div>
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
                    {activeTab === 'productivity' && (
                        <div>
                            <h1 className="text-2xl font-bold text-center mb-6">Productivity & Motion</h1>
                            {renderMotionCalculations()}
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
                                    <textarea id="pictureNotes" name="notes" rows="3" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Notes about the process..." value={pictures.notes} onChange={(e) => setPictures(prev => ({ ...prev, notes: e.target.value }))}></textarea>
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
                                <button onClick={() => { /* Placeholder */ }} className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none">Export to CSV</button>
                                <button onClick={() => { /* Placeholder */ }} className="w-full mt-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none">Save as PDF (Print)</button>
                                <button onClick={() => { /* Placeholder */ }} className="w-full mt-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none">Submit Suggestion</button>
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
                    {activeTab === 'aiAssistant' && (
                        <div>
                            <h1 className="text-2xl font-bold text-center mb-6">AI Assistant</h1>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-700 mb-1">What is your cleaning goal?</label>
                                    <textarea id="aiPrompt" name="aiPrompt" rows="3" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Remove heavy rust from mild steel..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}></textarea>
                                </div>
                                <button onClick={() => { /* Placeholder */ }} disabled={aiLoading} className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none disabled:bg-blue-300">
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default CleaningMode;