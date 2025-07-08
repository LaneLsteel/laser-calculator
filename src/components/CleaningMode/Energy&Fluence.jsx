import React from 'react';
import Tooltip from '../Tooltip';

const EnergyAndFluence = ({ fluence, laserInfo }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Energy & Fluence</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <Tooltip text="Average Power / Repetition Rate">
            <h3 className="text-md font-semibold text-blue-700">Energy per Pulse (mJ):</h3>
          </Tooltip>
          <p className="text-lg font-bold text-blue-800">{fluence.energyPerPulse.toFixed(2)}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <Tooltip text="Energy per Pulse / Pulse Duration">
            <h3 className="text-md font-semibold text-blue-700">Peak Power (kW):</h3>
          </Tooltip>
          <p className="text-lg font-bold text-blue-800">{laserInfo.peakPower.toFixed(2)}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <Tooltip text="Spot Diameter / Pulse Spacing">
            <h3 className="text-md font-semibold text-blue-700">Pulses per Position:</h3>
          </Tooltip>
          <p className="text-lg font-bold text-blue-800">{fluence.pulsesPerPosition.toFixed(2)}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <Tooltip text="Energy per Pulse * Pulses per Position * Passes">
            <h3 className="text-md font-semibold text-blue-700">Total Energy/Position (kJ):</h3>
          </Tooltip>
          <p className="text-lg font-bold text-blue-800">{fluence.totalEnergyPerPosition.toFixed(4)}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-center">
          <Tooltip text="Energy per Pulse / Spot Area">
            <h3 className="text-md font-semibold text-green-700">Single Pulse Fluence (mJ/cm²):</h3>
          </Tooltip>
          <p className="text-lg font-bold text-green-800">{fluence.singleSpot.toFixed(2)}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-center">
          <Tooltip text="Single Pulse Fluence * Pulses per Position">
            <h3 className="text-md font-semibold text-green-700">Effective Fluence (mJ/cm²):</h3>
          </Tooltip>
          <p className="text-lg font-bold text-green-800">{fluence.effective.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default EnergyAndFluence;
