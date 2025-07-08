import React from 'react';

const Other = ({ otherNotes, setOtherNotes }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Other Notes</h1>
      <textarea
        value={otherNotes}
        onChange={(e) => setOtherNotes(e.target.value)}
        className="w-full h-40 p-2 border border-gray-300 rounded-md shadow-sm"
        placeholder="Enter any additional notes here..."
      />
    </div>
  );
};

export default Other;
