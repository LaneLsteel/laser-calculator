import React from 'react';
import { cleaningLaserModels, maxEnergyOptions_mJ } from '../../data/SharedData';

const LaserSelection = ({ laserInfo, handleLaserInfoChange, nominalFrequencies }) => {
  return (
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
        <div>
          <label htmlFor="pulseDuration_ns" className="block text-sm font-medium text-gray-700 mb-1">Laser Mode (Pulse Duration):</label>
          <select id="pulseDuration_ns" name="pulseDuration_ns" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={laserInfo.pulseDuration_ns || ''} onChange={handleLaserInfoChange}>
            <option value="">-- Select --</option>
            {[20, 25, 50, 70, 100, 150, 300, 500].map(duration => <option key={duration} value={duration}>{duration} ns</option>)}
          </select>
        </div>
        {laserInfo.pulseDuration_ns && (
          <div className="pt-4">
            <label htmlFor="repetitionRate_kHz" className="block text-sm font-medium text-gray-700 mb-1">Repetition Rate (kHz):</label>
            <div className="text-center font-semibold text-indigo-600 mb-2">Current: {parseFloat(laserInfo.repetitionRate_kHz).toLocaleString(undefined, { maximumFractionDigits: 2 })} kHz</div>
            <div className="text-center text-sm text-gray-600 mt-2">Nominal PRR for {laserInfo.pulseDuration_ns}ns mode: <span className="font-bold">{(nominalFrequencies[laserInfo.pulseDuration_ns] || 0).toLocaleString()} kHz</span></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaserSelection;
