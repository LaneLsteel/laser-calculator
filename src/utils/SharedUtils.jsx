// This file contains all the large, constant data objects for the app.
// By centralizing them, we avoid duplicating data in different components.

/**
 * Parses a string or number, extracting the numeric part.
 * Handles units like 'mm', 'W', and specific designators like 'SM', 'MM', 'OG'.
 * @param {string|number} strOrNum - The input string or number.
 * @returns {number} - The parsed number, or NaN if invalid.
 */
export const parseNumericValue = (strOrNum) => {
  if (typeof strOrNum === 'number') {
    return strOrNum;
  }
  if (typeof strOrNum !== 'string' || !strOrNum) {
    return NaN;
  }
  const cleanedStr = strOrNum.replace(/(mm|W|OG|SM|MM|FS)/gi, '').trim();
  const parsedNum = parseFloat(cleanedStr);
  return parsedNum;
};

/**
 * Finds the closest predefined thickness value to the user's input.
 * @param {number} inputThickness_mm - The user's input thickness in mm.
 * @param {number[]} thicknessOptions_mm - An array of predefined thickness options in mm.
 * @returns {number} - The closest value from the options array.
 */
export const findClosestThickness = (inputThickness_mm, thicknessOptions_mm) => {
  if (isNaN(inputThickness_mm) || !thicknessOptions_mm || thicknessOptions_mm.length === 0) {
    return (thicknessOptions_mm && thicknessOptions_mm[0]) || 0;
  }
  return thicknessOptions_mm.reduce((prev, curr) =>
    Math.abs(curr - inputThickness_mm) < Math.abs(prev - inputThickness_mm) ? curr : prev
  );
};

/**
 * Determines the extension recommendation based on material and welding type for LightWeld.
 * @param {string} material - The selected material.
 * @param {string} weldingType - The selected welding type ('fusion' or 'with_wire').
 * @returns {Object} An object containing extension details.
 */
export const getExtensionRecommendation = (material, weldingType) => {
  if (weldingType === 'with_wire') {
    if (['stainless steel', 'mild steel', 'galvanized steel', 'titanium', 'nickel alloys'].includes(material)) {
      return { needed: true, size: "10mm", image: "https://placehold.co/100x100/ADD8E6/000000?text=10mm+Ext", label: "10mm Extension (for Hard Wire)" };
    } else if (['aluminum 5xxx', 'aluminum 6xxx', 'copper'].includes(material)) {
      return { needed: true, size: "7mm", image: "https://placehold.co/100x100/ADD8E6/000000?text=7mm+Ext", label: "7mm Extension (for Soft Wire)" };
    }
  }
  return { needed: false, size: "N/A", image: "", label: "No specific extension recommended for this setup." };
};

/**
 * Parses YLPN model strings to extract min pulse, max pulse, and max power.
 * @param {string} modelString - The YLPN model string.
 * @returns {object} - An object containing minPulse, maxPulse, and maxPower.
 */
export const parseYlpnModel = (modelString) => {
    let minPulse = NaN, maxPulse = NaN, maxPowerVal = NaN;
    const modelRegex = /YLPN-\d+-([\dx.]+)-(\d+)-(\d+)/;
    const match = modelString.match(modelRegex);
    if (match) {
      const pulseDurationPart = match[2];
      maxPowerVal = parseFloat(match[3]);
      const pulseRegex = /(\d+(?:\.\d+)?)(?:x(\d+(?:\.\d+)?))?(?:x(\d+(?:\.\d+)?))?/;
      const pulseMatch = pulseDurationPart.match(pulseRegex);
      if (pulseMatch) {
        if (pulseMatch[1] && pulseMatch[2]) {
          minPulse = parseFloat(pulseMatch[1]);
          maxPulse = pulseMatch[3] ? parseFloat(pulseMatch[3]) : parseFloat(pulseMatch[2]);
        } else if (pulseMatch[1]) {
          minPulse = maxPulse = parseFloat(pulseMatch[1]);
        }
      }
    }
    return { minPulse, maxPulse, maxPower: maxPowerVal };
};

/**
 * Converts a base value to a target unit for display.
 * @param {number} baseValue - The value in its base unit.
 * @param {string} targetUnit - The desired unit for display.
 * @param {string} valueType - The type of measurement (e.g., 'length_micrometers').
 * @param {number} fixedDecimalPlaces - The number of decimal places for the result.
 * @returns {string} - The formatted string of the converted value.
 */
export const convertAndDisplay = (baseValue, targetUnit, valueType, fixedDecimalPlaces = 2) => {
    if (isNaN(baseValue)) return '--';
    let convertedValue = baseValue;
    switch (valueType) {
      case 'length_micrometers':
        switch (targetUnit) {
          case 'micrometers': convertedValue = baseValue; break;
          case 'mm': convertedValue = baseValue / 1000; fixedDecimalPlaces = 4; break;
          case 'cm': convertedValue = baseValue / 10000; fixedDecimalPlaces = 6; break;
          case 'inches': convertedValue = baseValue / 25400; fixedDecimalPlaces = 6; break;
          case 'nm': convertedValue = baseValue * 1000; fixedDecimalPlaces = 0; break;
          default: break;
        }
        break;
      case 'length_millimeters':
        switch (targetUnit) {
          case 'mm': convertedValue = baseValue; break;
          case 'cm': convertedValue = baseValue / 10; fixedDecimalPlaces = 3; break;
          case 'meters': convertedValue = baseValue / 1000; fixedDecimalPlaces = 4; break;
          case 'inches': convertedValue = baseValue / 25.4; fixedDecimalPlaces = 4; break;
          default: break;
        }
        break;
      case 'fluence_J_per_cm2':
        switch (targetUnit) {
          case 'J_per_cm2': convertedValue = baseValue; break;
          case 'J_per_m2': convertedValue = baseValue * 10000; break;
          case 'mJ_per_cm2': convertedValue = baseValue * 1000; break;
          case 'mJ_per_mm2': convertedValue = baseValue * 10; break;
          default: break;
        }
        break;
      case 'fluence_J_per_cm':
        switch (targetUnit) {
          case 'J_per_cm': convertedValue = baseValue; fixedDecimalPlaces = 3; break;
          case 'J_per_m': convertedValue = baseValue * 100; fixedDecimalPlaces = 3; break;
          case 'mJ_per_cm': convertedValue = baseValue * 1000; fixedDecimalPlaces = 3; break;
          case 'mJ_per_mm': convertedValue = baseValue * 100; fixedDecimalPlaces = 3; break;
          default: break;
        }
        break;
      case 'areaRate_mm2_per_s':
        switch (targetUnit) {
            case 'mm2_per_s': convertedValue = baseValue; break;
            case 'cm2_per_s': convertedValue = baseValue / 100; break;
            case 'm2_per_s': convertedValue = baseValue / 1000000; break;
            case 'in2_per_s': convertedValue = baseValue / 645.16; break;
            default: break;
        }
        break;
      case 'speed_mm_per_s':
        switch (targetUnit) {
          case 'mm_per_s': convertedValue = baseValue; break;
          case 'cm_per_s': convertedValue = baseValue / 10; break;
          case 'm_per_s': convertedValue = baseValue / 1000; break;
          case 'in_per_s': convertedValue = baseValue / 25.4; break;
          default: break;
        }
        break;
      default: break;
    }
    return String(convertedValue.toFixed(fixedDecimalPlaces));
};

/**
 * Draws the scan area visualization on a canvas. This is the FULL function.
 * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
 * @param {number} xDim - The X dimension of the scan area.
 * @param {number} yDim - The Y dimension of the scan area.
 * @param {number} fillVal - The fill/hatch spacing value.
 * @param {number} spotSize_um - The laser spot size in micrometers.
 */
export const drawScanArea = (canvas, xDim, yDim, fillVal, spotSize_um) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const xDirection = parseFloat(xDim);
    const yDirection = parseFloat(yDim);
    const fill = parseFloat(fillVal);

    if (isNaN(xDirection) || xDirection <= 0 || isNaN(yDirection) || yDirection <= 0) {
      ctx.fillStyle = '#AAA';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Enter X/Y Directions', canvas.width / 2, canvas.height / 2);
      return;
    }

    const axisPadding = 30;
    const drawableWidth = canvas.width - 2 * axisPadding;
    const drawableHeight = canvas.height - 2 * axisPadding;
    const scaleX = drawableWidth / xDirection;
    const scaleY = drawableHeight / yDirection;
    const scale = Math.min(scaleX, scaleY) * 0.9;
    const scaledX = xDirection * scale;
    const scaledY = yDirection * scale;
    const offsetX = axisPadding + (drawableWidth - scaledX) / 2;
    const offsetY = axisPadding + (drawableHeight - scaledY) / 2;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, scaledX, scaledY);

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + scaledY);
    ctx.lineTo(offsetX + scaledX, offsetY + scaledY);
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX, offsetY + scaledY);
    ctx.stroke();

    ctx.fillStyle = '#4b5563';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`X: ${xDirection.toFixed(1)}mm`, offsetX + scaledX / 2, canvas.height - 10);

    ctx.save();
    ctx.translate(10, offsetY + scaledY / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(`Y: ${yDirection.toFixed(1)}mm`, 0, 0);
    ctx.restore();

    if (!isNaN(fill) && fill > 0 && !isNaN(spotSize_um)) {
      const numLines = Math.floor(yDirection / fill);
      ctx.strokeStyle = '#1d4ed8';
      const spotSize_mm = spotSize_um / 1000;
      let scaledSpotSizeLineWidth = Math.max(0.5, spotSize_mm * scale);
      ctx.lineWidth = scaledSpotSizeLineWidth;
      for (let i = 0; i <= numLines; i++) {
        const yPos = offsetY + (i * fill * scale);
        if (yPos <= offsetY + scaledY + scaledSpotSizeLineWidth/2) {
            ctx.beginPath();
            ctx.moveTo(offsetX, yPos);
            ctx.lineTo(offsetX + scaledX, yPos);
            ctx.stroke();
        }
      }
    }
};

/**
 * Draws a visual representation of the part and joint type. This is the FULL function.
 * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
 * @param {object} partInfo - An object containing part dimensions and joint type.
 */
export const drawPartGraphic = (canvas, partInfo) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { length, thickness, thickness2, gap, jointType, isMismatch } = partInfo;
    const pLength = parseFloat(length);
    const pThickness1 = parseFloat(thickness);
    const actualThickness2 = isMismatch ? parseFloat(thickness2) : pThickness1;
    const pGap = isNaN(parseFloat(gap)) ? 0 : parseFloat(gap);

    if (isNaN(pLength) || pLength <= 0 || isNaN(pThickness1) || pThickness1 <= 0 || (isMismatch && (isNaN(actualThickness2) || actualThickness2 <= 0))) {
        ctx.fillStyle = '#AAA';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Enter valid dimensions', canvas.width / 2, canvas.height / 2);
        return;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const padding = 30;
    
    let maxDim;
    switch (jointType) {
        case 'butt': maxDim = Math.max(pLength * 2 + pGap, pThickness1, actualThickness2); break;
        case 'lap': maxDim = Math.max(pLength * 1.5, pThickness1 + actualThickness2 + pGap); break;
        case 'corner': maxDim = Math.max(pLength + actualThickness2 + pGap, pLength + pThickness1); break;
        case 'tee': maxDim = Math.max(pLength, pLength + pThickness1 + pGap); break;
        case 'edge': maxDim = Math.max(pLength, pThickness1 + actualThickness2 + pGap); break;
        default: maxDim = Math.max(pLength, pThickness1);
    }
    if (isNaN(maxDim) || maxDim <=0) maxDim = 100;

    const scale = Math.min((canvasWidth - 2 * padding) / maxDim, (canvasHeight - 2 * padding) / maxDim) * 0.8;
    const s_length = pLength * scale;
    const s_thickness1 = pThickness1 * scale;
    const s_thickness2 = actualThickness2 * scale;
    const s_gap = pGap * scale;

    ctx.lineWidth = 2;
    const originX = canvasWidth / 2;
    const originY = canvasHeight / 2;

    const drawRect = (x, y, w, h, color = '#bfdbfe', stroke = '#3b82f6') => {
        ctx.fillStyle = color;
        ctx.strokeStyle = stroke;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
    };

    switch (jointType) {
        case 'butt': {
            const part1X = originX - s_length - s_gap / 2;
            const part1Y = originY - s_thickness1 / 2;
            drawRect(part1X, part1Y, s_length, s_thickness1);
            const part2X = originX + s_gap / 2;
            const part2Y = originY - s_thickness2 / 2;
            drawRect(part2X, part2Y, s_length, s_thickness2, '#93c5fd');
            break;
        }
        case 'lap': {
            const part1X = originX - s_length / 2;
            const part1Y = originY;
            drawRect(part1X, part1Y, s_length, s_thickness1);
            const part2X = part1X;
            const part2Y = part1Y - s_thickness2 - s_gap;
            drawRect(part2X, part2Y, s_length, s_thickness2, '#93c5fd');
            break;
        }
        case 'corner': {
            const part1X = originX - s_length / 2;
            const part1Y = originY;
            drawRect(part1X, part1Y, s_length, s_thickness1);
            const part2X = originX - s_length / 2 + s_length;
            const part2Y = originY - s_thickness2;
            drawRect(part2X, part2Y, s_thickness2, s_length, '#93c5fd');
            break;
        }
        case 'tee': {
            const horizX = originX - s_length / 2;
            const horizY = originY;
            drawRect(horizX, horizY, s_length, s_thickness1);
            const vertX = originX - s_thickness2 / 2;
            const vertY = originY - s_length;
            drawRect(vertX, vertY, s_thickness2, s_length, '#93c5fd');
            break;
        }
        case 'edge': {
            const part1X = originX - s_length / 2;
            const part1Y = originY - (s_thickness1 / 2);
            drawRect(part1X, part1Y, s_length, s_thickness1);
            const part2X = part1X;
            const part2Y = part1Y + s_thickness1 + s_gap;
            drawRect(part2X, part2Y, s_length, s_thickness2, '#93c5fd');
            break;
        }
        default: // flat_plate or unknown
            const flatPlateX = originX - s_length / 2;
            const flatPlateY = originY - s_thickness1 / 2;
            drawRect(flatPlateX, flatPlateY, s_length, s_thickness1);
            break;
    }
};