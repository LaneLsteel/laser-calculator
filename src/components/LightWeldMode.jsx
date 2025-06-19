import React, { useState, useEffect, useCallback } from 'react';

// Import shared data and utility functions
import { weldingRecommendations, jointTipImages, thicknessOptions_mm, thicknessOptions_inches } from '../data/SharedData';
import { parseNumericValue, findClosestThickness, getExtensionRecommendation } from '../utils/SharedUtils';

const LightWeldMode = ({ goToHomeScreen }) => {
  // --- STATE for LightWeld mode ---
  const [activeTab, setActiveTab] = useState('laserInfo');
  const [laserInfo, setLaserInfo] = useState({ machine: '', maxPower: 0 });
  const [lightWeld, setLightWeld] = useState({
    material: '',
    thickness: NaN,
    thicknessUnit: 'mm',
    weldingType: '',
    jointType: '',
  });
  // This state helps auto-navigate to the next tab only after a user interaction.
  const [isInteracting, setIsInteracting] = useState(false);
  const [pictures, setPictures] = useState({ beforeProcess: null, afterProcess: null, notes: '' });
  const [grading, setGrading] = useState({ criterion1: '', result1: '', notes: '' });

  // --- TABS for this mode ---
  const lightWeldTabs = [
    { id: 'laserInfo', label: 'Machine Selection' },
    { id: 'material', label: 'Material & Thickness' },
    { id: 'settings', label: 'Welder Settings' },
    { id: 'picture', label: 'Pictures' },
    { id: 'grading', label: 'Grading' },
    { id: 'save', label: 'Save & Export' },
  ];

  // --- HANDLERS ---
  const handleMachineSelect = (e) => {
    const machineValue = e.target.value;
    setLaserInfo({ machine: machineValue, maxPower: machineValue ? parseNumericValue(machineValue) : 0 });
    // Auto-navigate to the next tab after selection
    if (machineValue) {
      setActiveTab('material');
    }
  };

  const handleLightWeldChange = (e) => {
    setIsInteracting(true);
    const { name, value } = e.target;
    setLightWeld(prev => ({ ...prev, [name]: name === 'thickness' ? parseFloat(value) : value }));
  };
  
  const handleThicknessUnitChange = (e) => {
    setIsInteracting(true);
    const newUnit = e.target.value;
    // Reset thickness value when unit changes to avoid confusion
    setLightWeld(prev => ({ ...prev, thicknessUnit: newUnit, thickness: NaN }));
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

  // Auto-navigate to the settings tab once all material inputs are filled.
  useEffect(() => {
    const { material, thickness, weldingType, jointType } = lightWeld;
    const allFieldsFilled = material && !isNaN(thickness) && weldingType && jointType;
    if (isInteracting && allFieldsFilled && activeTab !== 'settings') {
      setActiveTab('settings');
      setIsInteracting(false); // Reset interaction flag
    }
  }, [lightWeld, isInteracting, activeTab]);
  
  // Memoized function to get welder recommendations
  const welderRecommendations = useCallback(() => {
    const material = lightWeld.material.toLowerCase().trim();
    const thickness_mm = lightWeld.thickness;
    const weldingType = lightWeld.weldingType;
    const jointType = lightWeld.jointType;

    const recommendations = {
      materialDisplay: material || '--',
      thicknessDisplay: isNaN(thickness_mm) ? '--' : `${thickness_mm.toFixed(1)} mm`,
      fusion: { gas: '--', preset: '--', power: '--', display: 'hidden' },
      wire: { gas: '--', alloy: '--', diameter: '--', preset: '--', powerSpeed: '--', display: 'hidden' },
      tip: { src: '', label: '--', display: 'hidden' },
      extension: { needed: '--', size: '--', image: '', label: '--', display: 'hidden' },
    };

    if (!material || isNaN(thickness_mm) || thickness_mm <= 0 || !weldingType) {
      return recommendations;
    }

    const materialData = weldingRecommendations[material];
    if (!materialData) return recommendations;

    const closestThicknessKey = findClosestThickness(thickness_mm, thicknessOptions_mm).toFixed(1);

    if (weldingType === 'fusion' && materialData.fusion) {
      recommendations.fusion.display = 'block';
      const presetInfo = materialData.fusion.presets[closestThicknessKey];
      recommendations.fusion.gas = materialData.fusion.gas;
      if (presetInfo) {
        recommendations.fusion.preset = presetInfo.program;
        recommendations.fusion.power = presetInfo.power;
      }
    } else if (weldingType === 'with_wire' && materialData.with_wire) {
      recommendations.wire.display = 'block';
      const presetInfo = materialData.with_wire.presets[closestThicknessKey];
      recommendations.wire.gas = materialData.with_wire.gas;
      recommendations.wire.alloy = materialData.with_wire.wire_alloy;
      recommendations.wire.diameter = materialData.with_wire.wire_diameter;
      if (presetInfo) {
        recommendations.wire.preset = presetInfo.program;
        recommendations.wire.powerSpeed = `${presetInfo.power} @ ${presetInfo.speed}`;
      }
    }

    if (jointType && jointTipImages[jointType]) {
      recommendations.tip.display = 'block';
      recommendations.tip.src = jointTipImages[jointType].src;
      recommendations.tip.label = jointTipImages[jointType].label;
    }

    const extensionData = getExtensionRecommendation(material, weldingType);
    recommendations.extension.display = 'block';
    recommendations.extension.needed = extensionData.needed ? 'Yes' : 'No';
    recommendations.extension.size = extensionData.size;
    recommendations.extension.image = extensionData.image;
    recommendations.extension.label = extensionData.label;

    return recommendations;
  }, [lightWeld.material, lightWeld.thickness, lightWeld.weldingType, lightWeld.jointType]);
  
  const currentRecommendations = welderRecommendations();

  // Dynamically create the thickness dropdown options
  const populateLightWeldThicknessDropdown = useCallback(() => {
    const options = lightWeld.thicknessUnit === 'mm' ? thicknessOptions_mm : thicknessOptions_inches;
    return (
      <>
        <option value="">-- Select --</option>
        {options.map((val) => {
          const displayValue = lightWeld.thicknessUnit === 'mm' ? val.toFixed(1) : val.toFixed(3);
          const optionValueInMm = lightWeld.thicknessUnit === 'mm' ? val : (val * 25.4);
          return (
            <option key={`thickness-${val}`} value={String(optionValueInMm)}>
              {displayValue}
            </option>
          );
        })}
      </>
    );
  }, [lightWeld.thicknessUnit]);


  // --- RENDER ---
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <img id="homeLogo" src="https://placehold.co/150x50/10B981/FFFFFF?text=LightWeld&font=Inter" alt="LightWeld Mode" className="cursor-pointer rounded-md shadow-md" onClick={goToHomeScreen} />
        <div className="flex items-center space-x-2">
            <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)} className="bg-white border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {lightWeldTabs.map(tab => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
            </select>
        </div>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-xl mx-auto">
        {activeTab === 'laserInfo' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Machine Selection</h1>
                <label htmlFor="machine" className="block text-sm font-medium text-gray-700 mb-1">Machine:</label>
                <select id="machine" name="machine" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={laserInfo.machine || ''} onChange={handleMachineSelect}>
                    <option value="">-- Select Machine --</option>
                    <option value="1500">LightWELD 1500</option>
                    <option value="1500XC">LightWELD 1500 XC</option>
                    <option value="2000XR">LightWELD 2000 XR</option>
                </select>
            </div>
        )}
        {activeTab === 'material' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Material & Thickness</h1>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">Material:</label>
                    <select id="material" name="material" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={lightWeld.material || ''} onChange={handleLightWeldChange}>
                      <option value="">-- Select --</option>
                      {Object.keys(weldingRecommendations).map(matKey => <option key={matKey} value={matKey}>{matKey.charAt(0).toUpperCase() + matKey.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end space-x-2">
                    <div className="flex-grow">
                      <label htmlFor="thickness" className="block text-sm font-medium text-gray-700 mb-1">Thickness:</label>
                      <select id="thickness" name="thickness" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={isNaN(lightWeld.thickness) ? "" : String(lightWeld.thickness)} onChange={handleLightWeldChange}>
                        {populateLightWeldThicknessDropdown()}
                      </select>
                    </div>
                    <div>
                      <select name="thicknessUnit" className="mt-1 block p-2 border border-gray-300 rounded-md shadow-sm" value={lightWeld.thicknessUnit || 'mm'} onChange={handleThicknessUnitChange}>
                        <option value="mm">mm</option>
                        <option value="inches">in</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="weldingType" className="block text-sm font-medium text-gray-700 mb-1">Welding Type:</label>
                    <select id="weldingType" name="weldingType" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={lightWeld.weldingType || ''} onChange={handleLightWeldChange}>
                      <option value="">-- Select --</option>
                      <option value="fusion">Fusion</option>
                      <option value="with_wire">With Wire</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="jointType" className="block text-sm font-medium text-gray-700 mb-1">Joint Type:</label>
                    <select id="jointType" name="jointType" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={lightWeld.jointType || ''} onChange={handleLightWeldChange}>
                      <option value="">-- Select --</option>
                      {Object.keys(jointTipImages).map(joint => <option key={joint} value={joint}>{joint.charAt(0).toUpperCase() + joint.slice(1).replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
            </div>
        )}
        {activeTab === 'settings' && (
            <div>
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Welder Settings</h1>
                <div className="space-y-4 text-sm">
                  <p className="text-lg text-gray-700 text-center mb-4">
                    Recommendations for <span className="font-semibold">{currentRecommendations.materialDisplay}</span> (<span className="font-semibold">{currentRecommendations.thicknessDisplay}</span>):
                  </p>
                  {currentRecommendations.fusion.display === 'block' && (
                    <div className="bg-blue-50 p-3 rounded-lg shadow-sm">
                      <h2 className="text-md font-semibold text-blue-700 mb-1">Fusion Welding:</h2>
                      <p><strong>Gas:</strong> {currentRecommendations.fusion.gas}</p>
                      <p><strong>Preset:</strong> {currentRecommendations.fusion.preset}</p>
                      <p><strong>Power:</strong> {currentRecommendations.fusion.power}</p>
                    </div>
                  )}
                  {currentRecommendations.wire.display === 'block' && (
                    <div className="bg-green-50 p-3 rounded-lg shadow-sm">
                      <h2 className="text-md font-semibold text-green-700 mb-1">Wire Welding:</h2>
                      <p><strong>Gas:</strong> {currentRecommendations.wire.gas}</p>
                      <p><strong>Alloy:</strong> {currentRecommendations.wire.alloy}</p>
                      <p><strong>Diameter:</strong> {currentRecommendations.wire.diameter}</p>
                      <p><strong>Preset:</strong> {currentRecommendations.wire.preset}</p>
                      <p><strong>Power & Speed:</strong> {currentRecommendations.wire.powerSpeed}</p>
                      <p className="text-xs text-gray-500 mt-1">*Requires wire feeder.</p>
                    </div>
                  )}
                  {currentRecommendations.tip.display === 'block' && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-center">
                      <h2 className="text-md font-semibold text-gray-700 mb-1">Recommended Tip:</h2>
                      {currentRecommendations.tip.src && <img src={currentRecommendations.tip.src} alt="Tip" className="mx-auto my-1 rounded-md shadow-sm object-contain h-16" onError={(e) => { e.currentTarget.style.display='none'; }} />}
                      <p>{currentRecommendations.tip.label}</p>
                    </div>
                  )}
                  {currentRecommendations.extension.display === 'block' && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg text-center">
                      <h2 className="text-md font-semibold text-purple-700 mb-1">Extension:</h2>
                      <p><strong>Needed:</strong> {currentRecommendations.extension.needed}</p>
                      <p><strong>Size:</strong> {currentRecommendations.extension.size}</p>
                      {currentRecommendations.extension.image && <img src={currentRecommendations.extension.image} alt="Extension" className="mx-auto my-1 rounded-md shadow-sm object-contain h-16" onError={(e) => { e.currentTarget.style.display='none'; }} />}
                      <p>{currentRecommendations.extension.label}</p>
                    </div>
                  )}
                </div>
            </div>
        )}
        {activeTab === 'picture' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Process Pictures</h1>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="beforeProcess" className="block text-sm font-medium text-gray-700 mb-1">Before Process:</label>
                        <input type="file" id="beforeProcess" name="beforeProcess" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" onChange={(e) => handlePictureUpload(e, 'beforeProcess')} />
                        {pictures.beforeProcess && <img src={pictures.beforeProcess} alt="Before" className="mt-2 rounded-md shadow-md max-h-40 object-contain mx-auto" />}
                    </div>
                    <div>
                        <label htmlFor="afterProcess" className="block text-sm font-medium text-gray-700 mb-1">After Process:</label>
                        <input type="file" id="afterProcess" name="afterProcess" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" onChange={(e) => handlePictureUpload(e, 'afterProcess')} />
                        {pictures.afterProcess && <img src={pictures.afterProcess} alt="After" className="mt-2 rounded-md shadow-md max-h-40 object-contain mx-auto" />}
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'grading' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Grading</h1>
                <div className="space-y-4">
                  <div><label htmlFor="criterion1" className="block text-sm font-medium text-gray-700 mb-1">Criterion 1:</label><input type="text" id="criterion1" name="criterion1" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Weld Quality" value={grading.criterion1} onChange={handleGradingChange} /></div>
                  <div><label htmlFor="result1" className="block text-sm font-medium text-gray-700 mb-1">Result 1:</label><input type="text" id="result1" name="result1" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Pass" value={grading.result1} onChange={handleGradingChange} /></div>
                </div>
            </div>
        )}
        {activeTab === 'save' && (
            <div>
                <h1 className="text-2xl font-bold text-center mb-6">Save & Export</h1>
                <p className="text-center text-gray-600 mb-4">Export functionality for LightWeld mode would go here.</p>
                {/* Export buttons can be added here */}
            </div>
        )}
      </div>
    </div>
  );
};

export default LightWeldMode;
