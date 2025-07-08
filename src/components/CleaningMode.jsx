import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Import shared data and utility functions
import { headData, cleaningLaserModels, maxEnergyOptions_mJ, workingDistances } from '../data/SharedData';
import { parseNumericValue, parseYlpnModel, drawScanArea, drawPartGraphic, convertAndDisplay } from '../utils/SharedUtils';

// Import the new modular components for each tab
import LaserSelection from './CleaningMode/LaserSelection';
import HeadSetup from './CleaningMode/HeadSetup';
import ScanInfoTab from './CleaningMode/ScanInfoTab';
import PartInfo from './CleaningMode/PartInfo';
import MaterialProperties from './CleaningMode/MaterialProperties';
import ContaminantInfo from './CleaningMode/ContaminantInfo';
import ProcessWindowChart from './CleaningMode/ProcessWindowChart';
import MaintenanceAndTroubleshooting from './CleaningMode/MaintenanceAndTroubleshooting';
import PulseSpacing from './CleaningMode/PulseSpacing';
import EnergyAndFluence from './CleaningMode/Energy&Fluence';
import ProductivityAndMotion from './CleaningMode/Productivity&Motion';
import AIAssistant from './CleaningMode/AIAssistant';
import Pictures from './CleaningMode/Pictures';
import Grading from './CleaningMode/Grading';
import SaveAndExport from './CleaningMode/Save&Export';
import LoadSetup from './CleaningMode/LoadSetup';
import Other from './CleaningMode/Other';

const CleaningMode = ({ goToHomeScreen }) => {
    // --- STATE MANAGEMENT ---
    // All state definitions remain here in the parent component.
    const [activeTab, setActiveTab] = useState('laserInfo');
    const [laserInfo, setLaserInfo] = useState({
        laserCleaningType: 'YLPN',
        laserCleaningModel: 'YLPN-1-1-50-20-20',
        maxEnergy_mJ: '20',
        pulseDuration_ns: '100',
        repetitionRate_kHz: 20000,
        minPulseDurationLimit: NaN,
        maxPulseDurationLimit: NaN,
        maxPower: 0,
        peakPower: 0,
    });
    const [setupParameters, setSetupParameters] = useState({
        selectedHeadType: 'Scanner 2D',
        collimator: '100',
        collimatorOther: '',
        focusLens: '420',
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
        frequency: 20000,
        fill: 0.05,
        pulseOverlap: 75,
        fillOverlap: 20,
    });
    const [partInfo, setPartInfo] = useState({
        material: '',
        contaminant: '', // New state for selected contaminant
        thickness: '',
        thickness2: '',
        isMismatch: false,
    });
    const [numberOfPasses, setNumberOfPasses] = useState(1);
    const [pictures, setPictures] = useState({ beforeProcess: null, afterProcess: null, notes: '' });
    const [grading, setGrading] = useState({ criterion1: '', result1: '', notes: '' });
    const [otherNotes, setOtherNotes] = useState('');
    
    // --- CALCULATOR AND UI STATE ---
    const [calculatorMode, setCalculatorMode] = useState('Direct');
    const [reverseInputMode, setReverseInputMode] = useState('speed');
    const [errors, setErrors] = useState({});
    const [productivityUnit, setProductivityUnit] = useState('mm2_per_s');
    const [avgSpeedUnit, setAvgSpeedUnit] = useState('mm_per_s');
    const [robotSpeedUnit, setRobotSpeedUnit] = useState('mm_per_s');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    // --- CALCULATED VALUES STATE ---
    const [calculatedSpotSize, setCalculatedSpotSize] = useState(0);
    const [pulseSpacing, setPulseSpacing] = useState(0);
    const [fluence, setFluence] = useState({ energyPerPulse: 0, pulsesPerPosition: 0, totalEnergyPerPosition: 0, singleSpot: 0, effective: 0 });
    const [productivity, setProductivity] = useState({ rate: 0, robotSpeed: 0 });
    const [motionCalculations, setMotionCalculations] = useState({});
    const [calculatedScanInfo, setCalculatedScanInfo] = useState({
        displayPulseOverlap: '--',
        displayFillOverlap: '--',
        displayFill: '--',
        displayScanSpeed: '--',
    });

    // --- State for Load/Save Functionality ---
    const [newSetupName, setNewSetupName] = useState("");
    const [selectedSetupToLoad, setSelectedSetupToLoad] = useState('');
    const [savedSetups, setSavedSetups] = useState([
        { name: 'Default Rust Removal', data: { laserInfo: { laserCleaningType: 'YLPN', laserCleaningModel: 'YLPN-1-1-50-20-20', maxEnergy_mJ: '20', pulseDuration_ns: '100', repetitionRate_kHz: 20000, peakPower: 0 }, setupParameters: { selectedHeadType: 'Scanner 2D', collimator: '100', focusLens: '420', fiberDiameterCleaning: 50, laserPowerCleaning: 1000 }, scanInfo: { xDirection: 100, yDirection: 10, scanSpeed: 15000, frequency: 20000, fill: 0.08, pulseOverlap: 75, fillOverlap: 20, initialVelocity: 0 }, partInfo: { material: 'mild_carbon_steel', contaminant: 'light_rust' }}},
        { name: 'Gentle Paint Stripping', data: { laserInfo: { laserCleaningType: 'YLPN', laserCleaningModel: 'YLPN-1-1-50-20-20', maxEnergy_mJ: '20', pulseDuration_ns: '250', repetitionRate_kHz: 13300, peakPower: 0 }, setupParameters: { selectedHeadType: 'Wobble Head', collimator: '70', focusLens: '254', fiberDiameterCleaning: 100, laserPowerCleaning: 500 }, scanInfo: { xDirection: 50, yDirection: 50, scanSpeed: 5000, frequency: 13300, fill: 0.1, pulseOverlap: 80, fillOverlap: 30, initialVelocity: 0 }, partInfo: { material: 'aluminum', contaminant: 'epoxy_paint' }}}
    ]);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    
    // --- CONSTANTS & REFS ---
    const nominalFrequencies = useMemo(() => ({ '20': 90000, '25': 90000, '50': 40000, '70': 28600, '100': 20000, '150': 13300, '300': 20000, '500': 10000 }), []);
    const scanCanvasRef = useRef(null);
    const partCanvasRef = useRef(null);

    const cleaningTabs = [
        { id: 'laserInfo', label: 'Laser Selection' },
        { id: 'setup', label: 'Head Setup' },
        { id: 'scanInfo', label: 'Scan Information' },
        { id: 'partInformation', label: 'Part Information' },
        { id: 'materialProperties', label: 'Material Properties' },
        { id: 'contaminantInfo', label: 'Contaminant Info' },
        { id: 'processWindow', label: 'Process Window' },
        { id: 'pulseSpacing', label: 'Pulse Spacing' },
        { id: 'fluence', label: 'Energy & Fluence' },
        { id: 'productivity', label: 'Productivity & Motion' },
        { id: 'maintenance', label: 'Maintenance' },
        { id: 'aiAssistant', label: 'AI Assistant' },
        { id: 'picture', label: 'Pictures' },
        { id: 'grading', label: 'Grading' },
        { id: 'save', label: 'Save & Export' },
        { id: 'loadSave', label: 'Load Setup' },
        { id: 'other', label: 'Other' },
    ];

    // --- EVENT HANDLERS ---
    const handleLaserInfoChange = (e) => {
        const { name, value } = e.target;
        if (name === 'repetitionRate_kHz' && calculatorMode === 'Reverse') return;
        if (name === 'laserCleaningType') setLaserInfo(prev => ({ ...prev, laserCleaningType: value, laserCleaningModel: '', maxEnergy_mJ: NaN }));
        else if (name === 'maxEnergy_mJ') setLaserInfo(prev => ({ ...prev, maxEnergy_mJ: value, laserCleaningModel: '' }));
        else setLaserInfo(prev => ({ ...prev, [name]: value }));
    };
    const handleSetupParameterChange = (e) => {
        const { name, value } = e.target;
        setSetupParameters(prev => ({ ...prev, [name]: value }));
    };
    const handleScanInfoChange = (e) => {
        let { name, value } = e.target;
        if (name === 'frequency') {
            let numericValue = parseFloat(value);
            if (String(value).toLowerCase().includes('khz')) numericValue *= 1000;
            setScanInfo(prev => ({ ...prev, [name]: isNaN(numericValue) ? 0 : numericValue }));
        } else {
            setScanInfo(prev => ({ ...prev, [name]: value }));
        }
    };
    const handlePartInfoChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPartInfo(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleSaveSetup = () => {
        if (!newSetupName.trim()) return showNotification('Please enter a name for the setup.', 'error');
        if (savedSetups.some(setup => setup.name.toLowerCase() === newSetupName.trim().toLowerCase())) return showNotification('A setup with this name already exists.', 'error');
        
        const newSetup = {
            name: newSetupName.trim(),
            data: { laserInfo: { ...laserInfo }, setupParameters: { ...setupParameters }, scanInfo: { ...scanInfo }, partInfo: { ...partInfo } }
        };

        setSavedSetups(prevSetups => [...prevSetups, newSetup]);
        setNewSetupName('');
        showNotification(`Setup "${newSetup.name}" saved successfully!`);
    };

    const handleLoadSetup = () => {
        if (!selectedSetupToLoad) return showNotification('Please select a setup to load.', 'error');
        const setupToLoad = savedSetups.find(s => s.name === selectedSetupToLoad);
        if (setupToLoad) {
            setLaserInfo(setupToLoad.data.laserInfo);
            setSetupParameters(setupToLoad.data.setupParameters);
            setScanInfo(setupToLoad.data.scanInfo);
            setPartInfo(setupToLoad.data.partInfo || partInfo); // Handle legacy saves
            showNotification(`Loaded setup: "${setupToLoad.name}"`, 'info');
        }
    };
    
    // --- CALCULATION LOGIC (useEffect Hooks) ---
    useEffect(() => {
        if (laserInfo.laserCleaningModel.startsWith('YLPN-')) {
            const { minPulse, maxPulse, maxPower } = parseYlpnModel(laserInfo.laserCleaningModel);
            setLaserInfo(prev => {
                const updated = { ...prev, minPulseDurationLimit: minPulse, maxPulseDurationLimit: maxPower };
                if (!isNaN(maxPower)) updated.maxPower = maxPower;
                if (prev.pulseDuration_ns < minPulse || prev.pulseDuration_ns > maxPulse) updated.pulseDuration_ns = String(minPulse);
                return updated;
            });
        }
    }, [laserInfo.laserCleaningModel]);
    
    useEffect(() => {
        if (laserInfo.maxPower > 0) {
            setSetupParameters(prev => ({ ...prev, laserPowerCleaning: laserInfo.maxPower }));
        }
    }, [laserInfo.maxPower]);

    useEffect(() => {
        const { collimator, collimatorOther, focusLens, focusLensOther, fiberDiameterCleaning } = setupParameters;
        const numFiber = parseFloat(fiberDiameterCleaning);
        const numCol = parseNumericValue(collimator === 'Other' ? collimatorOther : collimator);
        const numFocus = parseNumericValue(focusLens === 'Other' ? focusLensOther : focusLens);
        let newSpotSize = 0;
        if (numFiber > 0 && numCol > 0 && numFocus > 0) {
            newSpotSize = (numFiber / numCol) * numFocus;
        }
        setCalculatedSpotSize(newSpotSize);
    }, [setupParameters]);

    useEffect(() => {
        if (calculatorMode === 'Direct') {
            const selectedFrequency = nominalFrequencies[laserInfo.pulseDuration_ns];
            if (selectedFrequency !== undefined) {
                setScanInfo(prev => ({ ...prev, frequency: selectedFrequency * 1000 }));
            }
        }
        setLaserInfo(prev => ({ ...prev, repetitionRate_kHz: scanInfo.frequency / 1000 }));
    }, [laserInfo.pulseDuration_ns, scanInfo.frequency, calculatorMode, nominalFrequencies]);
    

    useEffect(() => {
        if (calculatorMode !== 'Reverse') return;
        const numPulseOverlap = parseFloat(scanInfo.pulseOverlap);
        const numFillOverlap = parseFloat(scanInfo.fillOverlap);
        const spotSize_mm = calculatedSpotSize / 1000;
        if (spotSize_mm <= 0) return;
        if (reverseInputMode === 'speed') {
            const numScanSpeed = parseFloat(scanInfo.scanSpeed);
            if (numScanSpeed > 0 && !isNaN(numPulseOverlap)) {
                const pulseSpacing_mm = spotSize_mm * (1 - (numPulseOverlap / 100));
                if (pulseSpacing_mm > 0) {
                    const newFrequencyHz = numScanSpeed / pulseSpacing_mm;
                    setScanInfo(prev => ({ ...prev, frequency: newFrequencyHz }));
                }
            }
        } else { // 'frequency'
            const numFrequency = parseFloat(scanInfo.frequency);
            if (numFrequency > 0 && !isNaN(numPulseOverlap)) {
                const pulseSpacing_mm = spotSize_mm * (1 - (numPulseOverlap / 100));
                const newScanSpeed = numFrequency * pulseSpacing_mm;
                setScanInfo(prev => ({ ...prev, scanSpeed: newScanSpeed }));
            }
        }
        if (!isNaN(numFillOverlap)) {
            const fillPitch = spotSize_mm * (1 - (numFillOverlap / 100));
            setScanInfo(prev => ({ ...prev, fill: fillPitch }));
        }
    }, [scanInfo.scanSpeed, scanInfo.pulseOverlap, scanInfo.frequency, scanInfo.fillOverlap, calculatedSpotSize, calculatorMode, reverseInputMode]);

    useEffect(() => {
        const numFreq = parseFloat(scanInfo.frequency);
        const numScanSpeed = parseFloat(scanInfo.scanSpeed);
        const spotSize_mm = calculatedSpotSize / 1000;
        
        if (numFreq > 0 && numScanSpeed > 0) {
            setPulseSpacing(numScanSpeed / numFreq);
        } else {
            setPulseSpacing(0);
        }
        const newDisplay = {};
        if (calculatorMode === 'Direct') {
            if (numScanSpeed > 0 && spotSize_mm > 0 && numFreq > 0) {
                newDisplay.displayPulseOverlap = ((1 - (numScanSpeed / (spotSize_mm * numFreq))) * 100).toFixed(2);
            } else { newDisplay.displayPulseOverlap = '--'; }
            const numFill = parseFloat(scanInfo.fill);
            if (numFill > 0 && spotSize_mm > 0) {
                newDisplay.displayFillOverlap = ((1 - (numFill / spotSize_mm)) * 100).toFixed(2);
            } else { newDisplay.displayFillOverlap = '--'; }
        }
        newDisplay.displayScanSpeed = numScanSpeed > 0 ? numScanSpeed.toFixed(2) : '--';
        newDisplay.displayFill = parseFloat(scanInfo.fill) > 0 ? parseFloat(scanInfo.fill).toFixed(4) : '--';
        setCalculatedScanInfo(prev => ({ ...prev, ...newDisplay }));
    }, [scanInfo.scanSpeed, scanInfo.frequency, scanInfo.fill, calculatedSpotSize, calculatorMode]);

    useEffect(() => {
        const powerW = parseFloat(setupParameters.laserPowerCleaning);
        const freqHz = parseFloat(scanInfo.frequency);
        const pulseDuration_ns = parseFloat(laserInfo.pulseDuration_ns);
        const spotSize_um = parseFloat(calculatedSpotSize);

        let energyPerPulse_J = (freqHz > 0) ? (powerW / freqHz) : 0;
        const energyPerPulse_mJ = energyPerPulse_J * 1000;
        let peakPower_kW = (pulseDuration_ns > 0 && energyPerPulse_J > 0) ? (energyPerPulse_J / (pulseDuration_ns * 1e-9)) / 1000 : 0;
        
        let pulsesPerPosition = 0;
        let singleSpotFluence_mJ_cm2 = 0;
        if (spotSize_um > 0) {
            const spotDiameter_mm = spotSize_um / 1000;
            if (pulseSpacing > 0) pulsesPerPosition = spotDiameter_mm / pulseSpacing;
            
            const spotDiameter_cm = spotSize_um * 1e-4;
            const spotArea_cm2 = Math.PI * Math.pow(spotDiameter_cm / 2, 2);
            if (spotArea_cm2 > 0) singleSpotFluence_mJ_cm2 = energyPerPulse_mJ / spotArea_cm2;
        }
        
        const effectiveFluence_mJ_cm2 = singleSpotFluence_mJ_cm2 * pulsesPerPosition;
        const totalEnergyPerPosition_J = energyPerPulse_J * pulsesPerPosition * numberOfPasses;
        const totalEnergyPerPosition_kJ = totalEnergyPerPosition_J / 1000;
        
        setFluence({
            energyPerPulse: isNaN(energyPerPulse_mJ) ? 0 : energyPerPulse_mJ,
            pulsesPerPosition: isNaN(pulsesPerPosition) ? 0 : pulsesPerPosition,
            totalEnergyPerPosition: isNaN(totalEnergyPerPosition_kJ) ? 0 : totalEnergyPerPosition_kJ,
            singleSpot: isNaN(singleSpotFluence_mJ_cm2) ? 0 : singleSpotFluence_mJ_cm2,
            effective: isNaN(effectiveFluence_mJ_cm2) ? 0 : effectiveFluence_mJ_cm2,
        });
        setLaserInfo(prev => ({...prev, peakPower: isNaN(peakPower_kW) ? 0 : peakPower_kW }));
    }, [setupParameters.laserPowerCleaning, scanInfo.frequency, laserInfo.pulseDuration_ns, calculatedSpotSize, pulseSpacing, numberOfPasses]);

    useEffect(() => {
        const headPerf = headData[setupParameters.selectedHeadType]?.performanceMetrics;
        const focalLength = parseNumericValue(setupParameters.focusLens === 'Other' ? setupParameters.focusLensOther : setupParameters.focusLens);
        const hatchLength = parseFloat(scanInfo.xDirection);
        const fillPitch = parseFloat(scanInfo.fill);
        const initialVelocity = parseFloat(scanInfo.initialVelocity);
        const maxVelocity = parseFloat(scanInfo.scanSpeed);

        let calcs = {};
        let robotSpeedCalc = 0;
        let productivityRate = 0;

        if (headPerf && !isNaN(focalLength) && focalLength > 0 && !isNaN(hatchLength) && !isNaN(initialVelocity) && !isNaN(maxVelocity)) {
            const { acceleration, trackingDelay } = headPerf;
            calcs.maxAccelLinear = (acceleration * focalLength * 2);
            calcs.accelDistance = Math.min(hatchLength / 2, 0.5 * (Math.pow(maxVelocity, 2) - Math.pow(initialVelocity, 2)) / calcs.maxAccelLinear);
            calcs.coastDistance = hatchLength - 2 * calcs.accelDistance;
            calcs.accelTime = calcs.coastDistance > 0 ? (maxVelocity - initialVelocity) / calcs.maxAccelLinear : (calcs.maxAccelLinear > 0 ? (-initialVelocity + Math.sqrt(Math.pow(initialVelocity, 2) + calcs.maxAccelLinear * hatchLength)) / calcs.maxAccelLinear : 0);
            calcs.coastTime = calcs.coastDistance > 0 ? calcs.coastDistance / maxVelocity : 0;
            calcs.lineTime = 2 * calcs.accelTime + calcs.coastTime + 0.0003;
            calcs.turnAroundTime = calcs.maxAccelLinear > 0 ? (2 * initialVelocity / calcs.maxAccelLinear) + (2 * trackingDelay) : 0;
            calcs.totalLineTime = calcs.turnAroundTime + calcs.lineTime;
            calcs.avgSpeed = calcs.totalLineTime > 0 ? hatchLength / calcs.totalLineTime : 0;
            calcs.maxAvgSpeed = (hatchLength / (2 * Math.sqrt(hatchLength / (2 * acceleration * focalLength)) + (2 * trackingDelay) + 0.0003)) / 1000;
            setErrors(prev => ({...prev, avgSpeedWarning: calcs.avgSpeed > calcs.maxAvgSpeed ? 'Warning: Average Speed may exceed theoretical maximum.' : null}));
            robotSpeedCalc = !isNaN(fillPitch) && calcs.totalLineTime > 0 ? fillPitch / calcs.totalLineTime : 0;
            productivityRate = calcs.avgSpeed * fillPitch;
        }
        setMotionCalculations(calcs);
        setProductivity({ rate: productivityRate, robotSpeed: robotSpeedCalc });
    }, [headData, setupParameters, scanInfo]);

    useEffect(() => { if (!partInfo.isMismatch) setPartInfo(prev => ({ ...prev, thickness2: prev.thickness })); }, [partInfo.isMismatch, partInfo.thickness]);

    useEffect(() => {
        if (activeTab === 'scanInfo' && scanCanvasRef.current) drawScanArea(scanCanvasRef.current, scanInfo.xDirection, scanInfo.yDirection, scanInfo.fill, calculatedSpotSize);
        if (activeTab === 'partInformation' && partCanvasRef.current) drawPartGraphic(partCanvasRef.current, partInfo);
    }, [scanInfo, partInfo, calculatedSpotSize, activeTab]);

    const getTabStatus = useCallback(() => 'default', []);

    // --- RENDER ---
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'laserInfo': return <LaserSelection laserInfo={laserInfo} handleLaserInfoChange={handleLaserInfoChange} nominalFrequencies={nominalFrequencies} />;
            case 'setup': return <HeadSetup setupParameters={setupParameters} handleSetupParameterChange={handleSetupParameterChange} calculatedSpotSize={calculatedSpotSize} />;
            case 'scanInfo': return <ScanInfoTab calculatorMode={calculatorMode} setCalculatorMode={setCalculatorMode} reverseInputMode={reverseInputMode} setReverseInputMode={setReverseInputMode} scanInfo={scanInfo} handleScanInfoChange={handleScanInfoChange} calculatedScanInfo={calculatedScanInfo} scanCanvasRef={scanCanvasRef} numberOfPasses={numberOfPasses} setNumberOfPasses={setNumberOfPasses} />;
            case 'partInformation': return <PartInfo partInfo={partInfo} handlePartInfoChange={handlePartInfoChange} partCanvasRef={partCanvasRef} />;
            case 'materialProperties': return <MaterialProperties material={partInfo.material} />;
            case 'contaminantInfo': return <ContaminantInfo contaminant={partInfo.contaminant} />;
            case 'processWindow': return <ProcessWindowChart material={partInfo.material} contaminant={partInfo.contaminant} currentPower={setupParameters.laserPowerCleaning} currentSpeed={scanInfo.scanSpeed} />;
            case 'pulseSpacing': return <PulseSpacing scanInfo={scanInfo} pulseSpacing={pulseSpacing} />;
            case 'fluence': return <EnergyAndFluence fluence={fluence} laserInfo={laserInfo} />;
            case 'productivity': return <ProductivityAndMotion motionCalculations={motionCalculations} productivity={productivity} productivityUnit={productivityUnit} setProductivityUnit={setProductivityUnit} avgSpeedUnit={avgSpeedUnit} setAvgSpeedUnit={setAvgSpeedUnit} robotSpeedUnit={robotSpeedUnit} setRobotSpeedUnit={setRobotSpeedUnit} errors={errors} />;
            case 'maintenance': return <MaintenanceAndTroubleshooting />;
            case 'aiAssistant': return <AIAssistant aiPrompt={aiPrompt} setAiPrompt={setAiPrompt} handleAiSubmit={() => {}} aiLoading={aiLoading} aiResponse={aiResponse} />;
            case 'picture': return <Pictures pictures={pictures} setPictures={setPictures} handlePictureUpload={handlePictureUpload} />;
            case 'grading': return <Grading grading={grading} handleGradingChange={handleGradingChange} />;
            case 'save': return <SaveAndExport newSetupName={newSetupName} setNewSetupName={setNewSetupName} handleSaveSetup={handleSaveSetup} exportToCsv={() => {}} exportToPdf={() => {}} submitSuggestion={() => {}} />;
            case 'loadSave': return <LoadSetup savedSetups={savedSetups} selectedSetupToLoad={selectedSetupToLoad} setSelectedSetupToLoad={setSelectedSetupToLoad} handleLoadSetup={handleLoadSetup} />;
            case 'other': return <Other otherNotes={otherNotes} setOtherNotes={setOtherNotes} />;
            default: return null;
        }
    }

    return (
        <div className="flex flex-row-reverse space-x-4 space-x-reverse">
            <div className="w-64 flex-shrink-0">
                <div className="tab-container bg-gray-50 rounded-lg shadow-md">
                    {cleaningTabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${getTabStatus(tab.id)}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow bg-white p-6 md:p-8 rounded-lg shadow-xl relative">
                {notification.show && <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>{notification.message}</div>}
                <div className="flex justify-between items-center mb-6"><img id="homeLogo" src="https://placehold.co/150x50/6366F1/FFFFFF?text=Cleaning&font=Inter" alt="Cleaning Mode" className="cursor-pointer rounded-md shadow-md" onClick={goToHomeScreen} /></div>
                <div className="min-h-[600px]">
                    {renderActiveTab()}
                </div>
            </div>
        </div>
    );
};

export default CleaningMode;
