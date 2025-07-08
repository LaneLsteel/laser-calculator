import React from 'react';
import Tooltip from '../Tooltip'; // Assuming Tooltip component is in a shared folder

const ScanInfoTab = ({
    calculatorMode, setCalculatorMode,
    reverseInputMode, setReverseInputMode,
    scanInfo, handleScanInfoChange,
    calculatedScanInfo, scanCanvasRef,
    numberOfPasses, setNumberOfPasses
}) => {
    return (
        <div>
            <h1 className="text-2xl font-bold text-center mb-6">Scan Information</h1>
            <div className="flex items-center justify-center mb-4">
                <button 
                    onClick={() => setCalculatorMode(prev => (prev === 'Direct' ? 'Reverse' : 'Direct'))} 
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none text-sm"
                >
                    Switch to {calculatorMode === 'Direct' ? 'Reverse' : 'Direct'} Calculator
                </button>
            </div>
            <p className="text-center text-sm text-gray-600 mb-4">Current Mode: <span className="font-semibold">{calculatorMode}</span></p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* Input Fields */}
                <div>
                    <Tooltip text="The length of the scan line in the primary direction.">
                        <label htmlFor="xDirection" className="block mb-1 font-medium">X Direction (mm):</label>
                    </Tooltip>
                    <input type="number" id="xDirection" name="xDirection" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.xDirection} onChange={handleScanInfoChange} />
                </div>
                <div>
                    <Tooltip text="The width of the scanned area, perpendicular to the X Direction.">
                        <label htmlFor="yDirection" className="block mb-1 font-medium">Y Direction (mm):</label>
                    </Tooltip>
                    <input type="number" id="yDirection" name="yDirection" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.yDirection} onChange={handleScanInfoChange} />
                </div>

                {calculatorMode === 'Direct' ? (
                    <>
                        <div>
                            <Tooltip text="The speed of the scanner mirrors.">
                                <label htmlFor="scanSpeed" className="block mb-1 font-medium">Scan Speed (mm/s):</label>
                            </Tooltip>
                            <input type="number" id="scanSpeed" name="scanSpeed" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.scanSpeed} onChange={handleScanInfoChange} />
                        </div>
                        <div>
                           <Tooltip text="The number of laser pulses per second.">
                                <label htmlFor="frequency" className="block mb-1 font-medium">Frequency (Hz):</label>
                           </Tooltip>
                            <input type="number" id="frequency" name="frequency" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.frequency} onChange={handleScanInfoChange} placeholder="e.g., 20000" />
                        </div>
                        <div>
                            <Tooltip text="The spacing between each scan line (hatch).">
                                <label htmlFor="fill" className="block mb-1 font-medium">Fill (Hatch Spacing) (mm):</label>
                            </Tooltip>
                            <input type="number" id="fill" name="fill" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.fill} onChange={handleScanInfoChange} />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="col-span-2">
                            <label className="block mb-1 font-medium">Calculate From:</label>
                            <select value={reverseInputMode} onChange={(e) => setReverseInputMode(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm">
                                <option value="speed">Scan Speed</option>
                                <option value="frequency">Frequency</option>
                            </select>
                        </div>
                        {reverseInputMode === 'speed' ?
                            <div><label htmlFor="scanSpeed" className="block mb-1 font-medium">Scan Speed (mm/s):</label><input type="number" id="scanSpeed" name="scanSpeed" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.scanSpeed} onChange={handleScanInfoChange} /></div>
                            :
                            <div><label htmlFor="frequency" className="block mb-1 font-medium">Frequency (Hz):</label><input type="number" id="frequency" name="frequency" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.frequency} onChange={handleScanInfoChange} /></div>
                        }
                        <div>
                            <Tooltip text="The percentage of overlap between consecutive laser pulses along the scan line.">
                                <label htmlFor="pulseOverlap" className="block mb-1 font-medium">Pulse Overlap (%):</label>
                            </Tooltip>
                            <input type="number" id="pulseOverlap" name="pulseOverlap" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.pulseOverlap} onChange={handleScanInfoChange} />
                        </div>
                        <div>
                            <Tooltip text="The percentage of overlap between adjacent scan lines.">
                                <label htmlFor="fillOverlap" className="block mb-1 font-medium">Fill Overlap (%):</label>
                            </Tooltip>
                            <input type="number" id="fillOverlap" name="fillOverlap" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={scanInfo.fillOverlap} onChange={handleScanInfoChange} />
                        </div>
                    </>
                )}
                 <div>
                    <Tooltip text="The number of times the entire scan area will be repeated.">
                        <label htmlFor="numberOfPasses" className="block mb-1 font-medium">Number of Passes:</label>
                    </Tooltip>
                    <input type="number" min="1" step="1" id="numberOfPasses" name="numberOfPasses" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" value={numberOfPasses} onChange={(e) => setNumberOfPasses(parseInt(e.target.value, 10) || 1)} />
                </div>
            </div>

            <h2 className="text-xl font-semibold text-center text-gray-800 mt-6 mb-2">Scan Area Visualization</h2>
            <canvas ref={scanCanvasRef} width="300" height="200" className="mx-auto block border rounded-md bg-gray-50"></canvas>

            <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-center space-y-1 text-sm">
                <h3 className="text-md font-semibold text-indigo-700 mb-2">Calculated Scan Parameters:</h3>
                <p><strong>{calculatorMode === 'Direct' ? 'Calculated Pulse Overlap:' : 'Input Pulse Overlap:'}</strong> {calculatedScanInfo.displayPulseOverlap} %</p>
                <p><strong>{calculatorMode === 'Direct' ? 'Calculated Fill Overlap:' : 'Input Fill Overlap:'}</strong> {calculatedScanInfo.displayFillOverlap} %</p>
                <p><strong>{calculatorMode === 'Direct' ? 'Input Scan Speed:' : 'Calculated Scan Speed:'}</strong> {calculatedScanInfo.displayScanSpeed} mm/s</p>
                <p><strong>{calculatorMode === 'Direct' ? 'Input Fill:' : 'Calculated Fill Pitch:'}</strong> {calculatedScanInfo.displayFill} mm</p>
            </div>
        </div>
    );
};

export default ScanInfoTab;
