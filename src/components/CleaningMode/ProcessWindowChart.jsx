import React, { useRef, useEffect } from 'react';
import { processWindowData } from '../../data/processWindowData';

const ProcessWindowChart = ({ material, contaminant, currentPower, currentSpeed }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const padding = 50;
        const width = canvas.width - 2 * padding;
        const height = canvas.height - 2 * padding;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Chart background
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(padding, padding, width, height);
        
        // Define axis limits
        const maxSpeedAxis = 40000; // mm/s
        const maxPowerAxis = 4500; // Watts

        // Draw axes
        ctx.beginPath();
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 1;
        // Y-axis (Power)
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + height);
        // X-axis (Speed)
        ctx.lineTo(padding + width, padding + height);
        ctx.stroke();

        // Draw axis labels and gridlines
        ctx.fillStyle = '#4b5563';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const power = (maxPowerAxis / 5) * i;
            const y = padding + height - (power / maxPowerAxis) * height;
            ctx.fillText(power.toFixed(0), padding - 25, y);
            ctx.beginPath();
            ctx.strokeStyle = '#e5e7eb';
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + width, y);
            ctx.stroke();
        }
        // X-axis labels
        for (let i = 0; i <= 4; i++) {
            const speed = (maxSpeedAxis / 4) * i;
            const x = padding + (speed / maxSpeedAxis) * width;
            ctx.fillText((speed / 1000).toFixed(0) + 'k', x, padding + height + 20);
        }
        ctx.fillText('Speed (mm/s)', padding + width / 2, padding + height + 40);
        ctx.save();
        ctx.translate(15, padding + height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Power (W)', 0, 0);
        ctx.restore();


        // Get process window for material/contaminant
        const windowData = (processWindowData[material] && processWindowData[material][contaminant]) 
            ? processWindowData[material][contaminant] 
            : null;

        if (windowData) {
            const { minSpeed, maxSpeed, minPower, maxPower } = windowData;
            
            // Map data to canvas coordinates
            const x1 = padding + (minSpeed / maxSpeedAxis) * width;
            const x2 = padding + (maxSpeed / maxSpeedAxis) * width;
            const y1 = padding + height - (maxPower / maxPowerAxis) * height;
            const y2 = padding + height - (minPower / maxPowerAxis) * height;

            // Draw the "safe" process window
            ctx.fillStyle = 'rgba(74, 222, 128, 0.3)'; // Light green
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)'; // Darker green
            ctx.lineWidth = 1;
            ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            
            ctx.fillStyle = '#166534';
            ctx.font = '12px sans-serif';
            ctx.fillText('Process Window', x1 + (x2 - x1) / 2, y1 + (y2 - y1) / 2);
        } else {
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px sans-serif';
            ctx.fillText('Select Material & Contaminant', canvas.width / 2, canvas.height / 2);
        }

        // Plot the user's current parameters
        if (currentPower > 0 && currentSpeed > 0) {
            const userX = padding + (currentSpeed / maxSpeedAxis) * width;
            const userY = padding + height - (currentPower / maxPowerAxis) * height;

            ctx.beginPath();
            ctx.fillStyle = '#ef4444'; // Red dot
            ctx.arc(userX, userY, 5, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = '#dc2626';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('You Are Here', userX, userY - 15);
        }

    }, [material, contaminant, currentPower, currentSpeed]);

    return (
        <div>
            <h1 className="text-2xl font-bold text-center mb-4">Process Window Visualizer</h1>
            <p className="text-center text-sm text-gray-500 mb-4">This chart shows a typical operating window. Your current parameters are marked with a red dot.</p>
            <canvas ref={canvasRef} width="600" height="400" className="mx-auto block border rounded-md"></canvas>
        </div>
    );
};

export default ProcessWindowChart;
