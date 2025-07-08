import React from 'react';

const Pictures = ({ pictures, setPictures, handlePictureUpload }) => {
  return (
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
  );
};

export default Pictures;
