import React from 'react';
import { contaminantData } from '../../data/contaminantData';

const PartInfo = ({ partInfo, handlePartInfoChange, partCanvasRef }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Part Information</h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">Base Material:</label>
          <select 
            id="material" 
            name="material" 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" 
            value={partInfo.material || ''} 
            onChange={handlePartInfoChange}
          >
            <option value="">-- Select Material --</option>
            <option value="stainless_steel">Stainless Steel</option>
            <option value="mild_carbon_steel">Mild Carbon Steel</option>
            <option value="aluminum">Aluminum</option>
            <option value="copper">Copper</option>
            <option value="titanium">Titanium</option>
          </select>
        </div>

        <div>
          <label htmlFor="contaminant" className="block text-sm font-medium text-gray-700 mb-1">Contaminant to Remove:</label>
          <select 
            id="contaminant" 
            name="contaminant" 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" 
            value={partInfo.contaminant || ''} 
            onChange={handlePartInfoChange}
          >
            <option value="">-- Select Contaminant --</option>
            {Object.keys(contaminantData).map(key => (
              <option key={key} value={key}>{contaminantData[key].name}</option>
            ))}
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
  );
};

export default PartInfo;
