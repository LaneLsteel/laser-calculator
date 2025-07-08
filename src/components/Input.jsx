// src/components/Input.js

import React from 'react';
import Tooltip from './Tooltip'; // Assuming Tooltip component exists

const InputField = ({ name, label, value, onChange, error, tooltip, type = 'number', placeholder, unit, readOnly = false }) => {
    const isError = error && error.length > 0;
    const inputClasses = `
        mt-1 block w-full p-2 border rounded-md shadow-sm
        ${isError ? 'border-red-500' : 'border-gray-300'}
        ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    `;

    const labelElement = (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
    );

    return (
        <div className="mb-4">
            {tooltip ? (
                <Tooltip text={tooltip}>
                    {labelElement}
                </Tooltip>
            ) : (
                labelElement
            )}
            <div className="relative">
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    className={inputClasses}
                />
                {unit && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">{unit}</span>
                    </div>
                )}
            </div>
            {isError && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
};

export default InputField;