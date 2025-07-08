import React from 'react';
import Tooltip from '../Tooltip';
import { convertAndDisplay } from '../../utils/SharedUtils';

const ProductivityAndMotion = ({
  motionCalculations,
  productivity,
  productivityUnit, setProductivityUnit,
  avgSpeedUnit, setAvgSpeedUnit,
  robotSpeedUnit, setRobotSpeedUnit,
  errors
}) => {
  const { maxAvgSpeed = 0, avgSpeed = 0 } = motionCalculations;
  const { robotSpeed = 0, rate = 0 } = productivity;

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Productivity & Motion</h1>
      <div className="space-y-3">
        <div className="p-3 bg-indigo-50 rounded-lg text-center">
          <div className="flex justify-center items-center">
            <Tooltip text="Hatch Length / Total Line Time (including turnarounds)">
              <h3 className="text-md font-semibold text-indigo-700 mr-2">Average Speed:</h3>
            </Tooltip>
            <select value={avgSpeedUnit} onChange={(e) => setAvgSpeedUnit(e.target.value)} className="bg-indigo-100 border border-indigo-300 rounded-md py-1 px-2 text-sm">
              <option value="mm_per_s">mm/s</option>
              <option value="m_per_s">m/s</option>
            </select>
          </div>
          <p className="text-lg font-bold text-indigo-800">{convertAndDisplay(avgSpeed, avgSpeedUnit, 'speed_mm_per_s', 2)}</p>
          {errors.avgSpeedWarning && <p className="text-xs text-red-600 mt-1">{errors.avgSpeedWarning}</p>}
        </div>
        <div className="p-3 bg-purple-50 rounded-lg text-center">
          <Tooltip text="Theoretical maximum average speed achievable with this head and hatch length.">
            <h3 className="text-md font-semibold text-purple-700">Max Average Speed (Theoretical):</h3>
          </Tooltip>
          <p className="text-lg font-bold text-purple-800">{maxAvgSpeed.toFixed(2)} m/sec</p>
        </div>
        <div className="p-3 bg-indigo-50 rounded-lg text-center">
          <div className="flex justify-center items-center">
            <Tooltip text="Fill Pitch / Total Line Time">
              <h3 className="text-md font-semibold text-indigo-700 mr-2">Robot Speed:</h3>
            </Tooltip>
            <select value={robotSpeedUnit} onChange={(e) => setRobotSpeedUnit(e.target.value)} className="bg-indigo-100 border border-indigo-300 rounded-md py-1 px-2 text-sm">
              <option value="mm_per_s">mm/s</option>
              <option value="m_per_s">m/s</option>
            </select>
          </div>
          <p className="text-lg font-bold text-indigo-800">{convertAndDisplay(robotSpeed, robotSpeedUnit, 'speed_mm_per_s', 2)}</p>
        </div>
        <div className="p-3 bg-teal-50 rounded-lg text-center">
          <div className="flex justify-center items-center">
            <Tooltip text="Average Speed * Fill Pitch">
              <h3 className="text-md font-semibold text-teal-700 mr-2">Productivity:</h3>
            </Tooltip>
            <select value={productivityUnit} onChange={(e) => setProductivityUnit(e.target.value)} className="bg-teal-100 border border-teal-300 rounded-md py-1 px-2 text-sm">
              <option value="mm2_per_s">mm²/s</option>
              <option value="cm2_per_s">cm²/s</option>
            </select>
          </div>
          <p className="text-lg font-bold text-teal-800">{convertAndDisplay(rate, productivityUnit, 'areaRate_mm2_per_s', 2)}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductivityAndMotion;
