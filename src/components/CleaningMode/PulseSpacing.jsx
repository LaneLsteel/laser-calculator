import React from 'react';
import Tooltip from '../Tooltip';

const PulseSpacing = ({ scanInfo, pulseSpacing }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Pulse Spacing</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-gray-100 rounded-lg text-center text-sm">
          <p className="font-semibold text-gray-700">Rep. Rate:</p>
          <p className="text-lg text-gray-900">{parseFloat(scanInfo.frequency).toLocaleString()} Hz</p>
        </div>
        <div className="p-3 bg-gray-100 rounded-lg text-center text-sm">
          <p className="font-semibold text-gray-700">Scan Speed:</p>
          <p className="text-lg text-gray-900">{!isNaN(parseFloat(scanInfo.scanSpeed)) ? parseFloat(scanInfo.scanSpeed).toFixed(2) : '--'} mm/s</p>
        </div>
      </div>
      <div className="p-3 bg-indigo-50 rounded-lg text-center">
        <Tooltip text="Scan Speed / Repetition Rate">
          <h3 className="text-md font-semibold text-indigo-700">Calculated Pulse Spacing:</h3>
        </Tooltip>
        <p className="text-lg font-bold text-indigo-800">{pulseSpacing.toFixed(4)} mm</p>
      </div>
    </div>
  );
};

export default PulseSpacing;
