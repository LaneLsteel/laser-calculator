// This file contains all the large, constant data objects for the app.
// By centralizing them, we avoid duplicating data in different components.

// Data extracted from the IPG Beam Delivery Catalog - v1.13.pdf and other sources.
export const headData = {
  "D30L Welding Head": {
    configurations: ["R (Horizontal RHS)", "V (Vertical)", "S (Standalone)", "L (Horizontal LHS)"],
    collimators: ["50mm", "60mm", "85mm", "100mm", "Other"],
    focusLenses: ["100mm", "125mm", "150mm", "200mm", "250mm", "300mm", "400mm", "500mm", "Other"],
    fiberReceivers: ["HLC-8", "LCA"],
  },
  "D50L Welding Head": {
    configurations: ["R (Horizontal RHS)", "V (Vertical)", "S (Standalone)", "L (Horizontal LHS)", "B (Backwards)"],
    collimators: ["100mm", "120mm", "140mm", "150mm", "160mm", "180mm", "200mm", "Other"],
    focusLenses: ["150mm", "200mm", "250mm", "300mm", "400mm", "500mm", "600mm", "700mm", "800mm", "900mm", "1000mm", "Other"],
    fiberReceivers: ["HLC-8", "LCA"],
    beamShaperModules: ["Circular", "Square"],
  },
  "D50S Welding Head": {
    configurations: ["R (Horizontal RHS)", "V (Vertical)", "S (Standalone)", "L (Horizontal LHS)", "T (Vertical, Camera LHS)"],
    collimators: ["100mm", "120mm", "140mm", "150mm", "160mm", "180mm", "200mm", "Other"],
    focusLenses: ["150mm", "200mm", "250mm", "300mm", "400mm", "500mm", "600mm", "700mm", "800mm", "900mm", "1000mm", "Other"],
    fiberReceivers: ["HLC-8", "LCA", "HLC-16"],
    beamShaperModules: ["Circular", "Square"],
  },
  "D50HP Welding Head": {
    configurations: ["R (Horizontal RHS)", "V (Vertical)", "S (Standalone)", "L (Horizontal LHS)"],
    collimators: ["100mm", "120mm", "140mm", "160mm", "Other"],
    focusLenses: ["300mm", "400mm", "500mm", "600mm", "700mm", "800mm", "900mm", "1000mm", "Other"],
    fiberReceivers: ["HLC-16", "HLC-24"],
  },
  "D85 Welding Head": {
    configurations: ["V (Vertical)"],
    collimators: ["250mm", "300mm", "350mm", "Other"],
    focusLenses: ["250mm", "300mm", "350mm", "400mm", "500mm", "Other"],
    fiberReceivers: ["HLC-16", "HLC-24", "HLC-40"],
  },
  "D30 Wobble Head": {
    configurations: ["F (Forward)", "V (Vertical)", "J (Forward Left, Co-Wobble)"],
    collimators: ["50mm", "60mm", "85mm", "100mm", "Other"],
    focusLenses: ["100mm", "125mm", "150mm", "200mm", "250mm", "300mm", "400mm", "500mm", "Other"],
    fiberReceivers: ["HLC-8", "LCA"],
    electricalOptions: ["Wobble Tracker", "Scan Controller"],
    performanceMetrics: {
        motor: "33mm",
        mirror: true,
        acceleration: 12500,
        trackingDelay: 0.0005,
    },
  },
  "D50 Wobble Head": {
    configurations: ["V (Vertical)", "L (Horizontal LHS)"],
    collimators: ["100mm", "120mm", "140mm", "150mm", "160mm", "180mm", "200mm", "Other"],
    focusLenses: ["150mm", "200mm", "250mm", "300mm", "400mm", "500mm", "600mm", "700mm", "800mm", "900mm", "1000mm", "Other"],
    fiberReceivers: ["HLC-8", "LCA", "HLC-16"],
    electronicsOptions: ["Wobble Tracker", "Scan Controller"],
  },
  "D85 Wobble Head": {
    configurations: ["V (Vertical)"],
    collimators: ["250mm", "300mm", "Other"],
    focusLenses: ["250mm", "300mm", "350mm", "400mm", "500mm", "Other"],
    fiberReceivers: ["HLC-16", "HLC-24", "HLC-40"],
  },
  "MICRO Cutting Head": {
    configurations: ["S (Standalone)", "V (Vertical)", "L (Horizontal LHS)", "R (Horizontal RHS)"],
    collimators: ["50mm", "85mm", "100mm", "Other"],
    focusLenses: ["50mm", "85mm", "100mm", "Other"],
    fiberReceivers: ["HLC-8"],
    nozzleTips: ["0.2mm", "0.3mm", "0.4mm", "0.5mm", "0.8mm", "1.0mm", "1.2mm", "1.5mm"],
  },
  "COMPACT Cutting Head": {
    configurations: ["S (Standalone)"],
    collimators: ["100mm", "Other"],
    focusLenses: ["125mm", "150mm", "200mm", "Other"],
    fiberReceivers: ["HLC-8", "LCA"],
    nozzleTips: {
      "Wide Nozzle Tips": ["0.8mm", "1.0mm", "1.2mm", "1.5mm", "1.8mm", "2.0mm", "2.3mm", "2.5mm", "2.8mm", "3.0mm", "3.2mm", "3.5mm", "4.0mm", "4.5mm", "5.0mm"],
      "Narrow Nozzle Tips": ["0.8mm", "1.0mm", "1.2mm", "1.5mm", "1.8mm", "2.0mm", "2.3mm", "2.5mm", "2.8mm", "3.0mm"],
      "Dual Passage Nozzle Tips": ["0.8mm", "1.0mm", "1.2mm", "1.5mm", "1.8mm", "2.0mm", "2.3mm", "2.5mm", "3.0mm", "3.5mm", "4.0mm", "4.5mm", "5.0mm"],
    },
  },
  "D30 Cutting Head": {
    configurations: ["S (Standalone)"],
    collimators: ["100mm", "Other"],
    focusLenses: ["125mm", "150mm", "200mm", "Other"],
    fiberReceivers: ["HLC-8", "LCA", "HLC-16"],
    nozzleTips: {
      "Wide Nozzle Tips": ["0.8mm", "1.0mm", "1.2mm", "1.5mm", "1.8mm", "2.0mm", "2.3mm", "2.5mm", "2.8mm", "3.0mm", "3.2mm", "3.5mm", "4.0mm", "4.5mm", "5.0mm"],
      "Narrow Nozzle Tips": ["0.8mm", "1.0mm", "1.2mm", "1.5mm", "1.8mm", "2.0mm", "2.3mm", "2.5mm", "2.8mm", "3.0mm"],
      "Dual Passage Nozzle Tips": ["0.8mm", "1.0mm", "1.2mm", "1.5mm", "1.8mm", "2.0mm", "2.3mm", "2.5mm", "3.0mm", "3.5mm", "4.0mm", "4.5mm", "5.0mm"],
    },
  },
  "D50 HIGH-POWER Cutting Head": {
    configurations: ["S (Standalone)"],
    collimators: ["100mm", "Other"],
    focusLenses: ["200mm", "Other"],
    fiberReceivers: ["HLC-8", "LCA", "HLC-16"],
    longFiber: ["No", "Yes"],
    nozzleTips: {
      "Wide Nozzle Tips": ["0.8mm", "1.0mm", "1.2mm", "1.5mm", "1.8mm", "2.0mm", "2.3mm", "2.5mm", "2.8mm", "3.0mm", "3.2mm", "3.5mm", "4.0mm", "4.5mm", "5.0mm"],
      "Dual Passage Nozzle Tips": ["0.8mm", "1.0mm", "1.2mm", "1.5mm", "1.8mm", "2.0mm", "2.3mm", "2.5mm", "3.0mm", "3.5mm", "4.0mm", "4.5mm", "5.0mm"],
    },
  },
  "MID-POWER Scanner (1064-1070nm)": {
    baseProducts: ["CDSH0013 - Mid Power Scanner", "CDSH0018 - Mid Power Scanner with LDD Compatibility"],
    scanControlInterfaces: ["IPG Cont. Type E or YLP-HP-B Intf, 3M cable", "IPG Cont. 24V (YLS/YLR) Intf, 3M cable", "XY2-100, 3M cable", "IPG Cont. Type E or YLP-HP-B Intf, 5M cable", "XY2-100, 5M cable"],
    lasers: ["Not Specified"],
    configurations: ["Horizontal no Camera Port", "Horizontal w/ Camera Port", "Vertical no Camera Port", "Vertical w/ Camera Port"],
    focusLenses: ["100mm, OG SM", "160mm, FS MM", "163mm, OG SM", "254mm, OG SM", "254mm, FS MM", "330mm, OG SM", "420mm, OG SM", "Other"],
    collimators: ["50mm", "No Collimator", "35mm Collimator Adaptor", "Other"],
    fiberReceivers: ["HLC-8", "LCA"],
    collimatorFiberReceivers: ["50mm Collimator, HLC-8 Receiver", "No Collimator, 35mm Collimator Adaptor", "Other"],
    fiberReceiverOptions: ["35mm Collimator Input", "HLC-8"],
    performanceMetrics: {
        motor: "12mm",
        mirror: true,
        acceleration: 700000,
        trackingDelay: 0.00008,
    },
  },
  "MID-POWER Scanner (1030nm)": {
    baseProducts: ["CDSH0001 - Mid Power Scanner"],
    scanControlInterfaces: ["IPG Cont. 24V (YLS/YLR) Intf, 3M cable", "XY2-100, 3M cable", "IPG Cont. 24V (YLS/YLR) Intf, 5M cable", "XY2-100, 5M cable"],
    lasers: ["Not Specified"],
    configurations: ["Horizontal no Camera Port", "Horizontal w/ Camera Port", "Vertical no Camera Port"],
    focusLenses: ["100mm, OG SM", "163mm, OG SM", "254mm, OG SM", "330mm, OG SM", "420mm, OG SM", "Other"],
    collimators: ["No Collimator", "35mm Collimator Adaptor", "Other"],
    fiberReceivers: [],
    collimatorFiberReceivers: ["No Collimator, 35mm Collimator Adaptor", "Other"],
  },
  "MID-POWER Scanner (505-540nm)": {
    baseProducts: ["CDSH0005 - Mid Power Scanner"],
    scanControlInterfaces: ["IPG Cont. Type E or YLP-HP-B Intf, 3M cable", "IPG Cont. 24V (YLS/YLR) Intf, 3M cable", "XY2-100, 3M cable"],
    lasers: ["Not Specified"],
    configurations: ["Horizontal, no camera port"],
    focusLenses: ["165mm, OG SM", "Other"],
    collimators: ["No Collimator", "35mm Collimator Adaptor", "Other"],
    fiberReceivers: [],
    collimatorFiberReceivers: ["No Collimator, 35mm Collimator Adaptor", "Other"],
  },
  "D20 2D HIGH-POWER Scanner": {
    scanControlInterfaces: ["IPG Controller, (YLPN) Type-E or YLP-HP-B Laser Interface", "IPG Controller, (YLS/YLR) 24V Laser Interface", "No Scan Controller"],
    lasers: ["Not Specified"],
    configurations: ["Horizontal Collimator w/ Camera Port", "1Vertical Collimator w/ Camera Port"],
    focusLenses: ["260mm, SM", "500mm, SM", "No Lens", "Other"],
    collimators: ["50mm", "60mm", "85mm", "100mm", "120mm", "160mm", "Other"],
    fiberReceivers: ["HLC-8", "LCA", "HLC-8 Rotary"],
    performanceMetrics: {
        motor: "20mm",
        mirror: true,
        acceleration: 70000,
        trackingDelay: 0.00025,
    },
  },
  "D33 2D HIGH-POWER Scanner": {
    scanControlInterfaces: ["IPG Controller, (YLPN) YLP-HP-B Laser Interface", "IPG Controller, (YLS/YLR) 24V Laser Interface", "No Scan Controller"],
    lasers: ["Not Specified"],
    configurations: ["Horizontal Collimator w/ Camera Port", "Vertical Collimator w/ Camera Port"],
    focusLenses: ["254mm, MM", "413mm, MM", "510mm, MM", "405mm, SM", "500mm, SM", "505mm, SM", "Other"],
    collimators: ["100mm", "120mm", "140mm", "Other"],
    fiberReceivers: ["HLC-8", "LCA", "HLC-16", "HLC-8 w/ rotary"],
    performanceMetrics: {
        motor: "33mm",
        mirror: true,
        acceleration: 12500,
        trackingDelay: 0.0005,
    },
  },
  "D33-F 2D HIGH-POWER Scanner": {
    scanControlInterfaces: ["IPG Controller, (YLPN) YLP-HP-B Laser Interface", "IPG Controller, (YLS/YLR) 24V Laser Interface", "No Scan Controller"],
    lasers: ["Not Specified"],
    configurations: ["Horizontal Collimator w/ Camera Port", "Vertical Collimator w/ Camera Port"],
    focusLenses: ["254mm, MM", "413mm, MM", "510mm, MM", "405mm, SM", "500mm, SM", "505mm, SM", "Other"],
    collimators: ["100mm", "120mm", "140mm", "Other"],
    fiberReceivers: ["HLC-8", "LCA", "HLC-16", "HLC-8 w/ rotary"],
  },
  "D33 3D HIGH-POWER Scanner": {
    scanControlInterfaces: ["IPG Controller, (YLPN) YLP-HP-B Laser Interface", "IPG Controller, (YLS/YLR) 24V Laser Interface", "No Scan Controller"],
    lasers: ["Not Specified"],
    configurations: ["Vertical Collimator w/ Camera Port"],
    focusLenses: ["254mm, MM", "413mm, MM", "510mm, MM", "405mm, SM", "500mm, SM", "505mm, SM", "Other"],
    collimators: ["100mm", "120mm", "140mm", "Other"],
    fiberReceivers: ["HLC-8", "LCA"],
  },
  "IR NANO SECOND Marker - integrated head": {
    basePartNumbers: ["CDSH0008", "CDSH0011 - Point Module"],
    scanControlInterfaces: ["IPG Cont. Type E Intf", "XY2-100"],
    lasers: ["20W", "30W", "50W"],
    configurations: ["Horizontal, no Camera Port", "Vertical, no Camera Port"],
    focusLenses: ["100mm, OG SM", "163mm, OG SM", "254mm, OG SM", "330mm, OG SM", "420mm, OG SM", "Other"],
    collimators: ["Other"],
    collimatorFiberReceivers: ["Not Specified"],
  },
  "IR NANO SECOND Marker - non-integrated head": {
    baseProducts: ["CDSH0013 - Mid Power Scanner"],
    scanControlInterfaces: ["IPG Cont. Type E Intf, 3M cable", "XY2-100, 3M cable", "IPG Cont. Type E Intf, 5M cable", "XY2-100, 5M cable"],
    lasers: ["20W", "30W", "50W", "100W"],
    configurations: ["Horizontal no Camera Port", "Horizontal w/ Camera Port", "Vertical no Camera Port"],
    focusLenses: ["100mm, OG SM", "163mm, OG SM", "254mm, OG SM", "330mm, OG SM", "420mm, OG SM", "Other"],
    collimators: ["35mm Coll Adapter", "Other"],
    collimatorFiberReceivers: ["35mm Coll Adapter"],
  },
  "PICOSECOND Marker": {
    basePartNumbers: ["CDSH0004"],
    scanControlInterfaces: ["IPG Cont. 24V Intf", "XY2-100"],
    lasers: ["25W"],
    configurations: ["Horizontal, no Camera Port", "Vertical, no Camera Port"],
    focusLenses: ["100mm, OG SM", "163mm, OG SM", "254mm, OG SM", "330mm, OG SM", "420mm, OG SM", "Other"],
    collimators: ["Other"],
    collimatorFiberReceivers: ["Not Specified"],
  },
  "GREEN Marker": {
    basePartNumbers: ["CDSH0006"],
    scanControlInterfaces: ["IPG Cont. Type E Intf", "IPG Cont. 24V Intf", "XY2-100"],
    lasers: ["10W", "20W"],
    configurations: ["Horizontal, no Camera Port"],
    focusLenses: ["165mm, OG SM", "Other"],
    collimators: ["Other"],
    collimatorFiberReceivers: ["Not Specified"],
  },
  "D50 Cladding Head": {
    configurations: ["S (Standalone)", "V (Vertical)"],
    collimators: ["100mm", "120mm", "140mm", "160mm", "180mm", "200mm", "Other"],
    focusLenses: ["150mm", "200mm", "250mm", "300mm", "400mm", "500mm", "600mm", "Other"],
    fiberReceivers: ["HLC-16", "HLC-24"],
    claddingNozzles: ["F250", "F300", "F400"],
  },
};

export const gasProperties = {
  'argon': {
    'default': { advantages: "Inert, provides good shielding, stable arc, good for most metals.", disadvantages: "Lower thermal conductivity than helium, can lead to humping/undercutting at high speeds, higher cost than nitrogen." },
    'aluminum': { advantages: "Good for shielding aluminum to prevent oxidation and porosity. Produces a stable arc.", disadvantages: "Good for shielding aluminum to prevent oxidation and porosity. Produces a stable arc." },
    'mild_carbon_steel': { advantages: "Good general-purpose shielding gas for carbon steels, provides stable arc and good bead appearance.", disadvantages: "Can be less effective than CO2 or mixes for deep penetration or high speed. Potential for undercutting." },
    'high_carbon_steel': { advantages: "Good for shielding to minimize oxidation, can help with arc stability.", disadvantages: "May not provide enough penetration on its own. Risk of porosity if not properly managed." },
    'stainless_steel': { advantages: "Excellent for shielding stainless steel to prevent oxidation and maintain corrosion resistance. Produces bright, clean welds.", disadvantages: "Can cause lack of fusion or humping at high speeds if not optimized. Higher cost." },
    'copper': { advantages: "Provides good shielding for copper, preventing oxidation.", disadvantages: "Lower thermal conductivity can make it challenging for high heat input required for copper. Risk of porosity." },
    'titanium': { advantages: "Essential for shielding titanium due to its high reactivity with atmospheric gases. Prevents embrittlement.", disadvantages: "Requires very high purity and excellent shielding coverage to be effective. Relatively expensive." }
  },
  'nitrogen': {
    'default': { advantages: "Cost-effective, can increase penetration, good for some stainless steels.", disadvantages: "Can cause porosity or nitriding in some materials (e.g., aluminum, titanium, carbon steel), reactive." },
    'aluminum': { advantages: "Generally NOT recommended due to severe nitriding and porosity.", disadvantages: "Causes severe nitriding, porosity, and embrittlement. Avoid." },
    'mild_carbon_steel': { advantages: "Can increase penetration and improve bead profile in some applications. Cost-effective.", disadvantages: "Risk of nitriding and porosity, which can degrade mechanical properties. Not ideal for all carbon steels." },
    'high_carbon_steel': { advantages: "May offer increased penetration.", disadvantages: "High risk of nitriding and embrittlement. Generally not recommended." },
    'stainless_steel': { advantages: "Can stabilize austenite, improve mechanical properties, and increase penetration in certain grades (e.g., duplex, lean duplex).", disadvantages: "Careful control of nitrogen percentage is crucial to avoid porosity or hot cracking. Not suitable for all stainless steel grades." },
    'copper': { advantages: "Can provide some shielding.", disadvantages: "Risk of porosity and nitriding. Generally not preferred over inert gases." },
    'titanium': { advantages: "NOT recommended.", disadvantages: "Causes severe nitriding and embrittlement. Avoid." }
  },
  'helium': {
    'default': { advantages: "High thermal conductivity, provides deeper penetration, faster welding speeds, good for thick materials.", disadvantages: "Higher cost than argon, requires higher flow rates, can be harder to start arc." },
    'aluminum': { advantages: "Excellent for aluminum due to high thermal conductivity, helps with heat dissipation and reduces porosity. Good for thick sections.", disadvantages: "Very high cost, can be difficult to control arc stability, requires high flow rates." },
    'mild_carbon_steel': { advantages: "Provides deeper penetration and faster welding speeds, good for thick carbon steels.", disadvantages: "High cost, higher flow rates needed, can lead to excessive spatter and porosity if not optimized." },
    'high_carbon_steel': { advantages: "Offers deeper penetration and improved fusion.", disadvantages: "High cost, higher flow rates, can exacerbate issues with hydrogen cracking if moisture is present." },
    'stainless_steel': { advantages: "Increases penetration and welding speed, good for thick stainless sections.", disadvantages: "High cost, can lead to wider, flatter beads and potential for oxidation if not mixed with argon." },
    'copper': { advantages: "Ideal for copper due to its high thermal conductivity, facilitates deep penetration and good fusion.", disadvantages: "Very high cost, high flow rates required, can be challenging to manage arc." },
    'titanium': { advantages: "Can be used, but pure argon is often preferred for simplicity and cost, as titanium primarily needs inert shielding.", disadvantages: "Helium's higher thermal conductivity might be less critical than strict inertness for titanium. Higher cost." }
  },
  'co2': {
    'default': { advantages: "Reactive, provides good penetration, good for carbon steels, cost-effective.", disadvantages: "Can cause spatter, promotes oxidation, generally not used for reactive metals or high-quality finishes." },
    'aluminum': { advantages: "NOT recommended due to severe oxidation and porosity.", disadvantages: "Causes severe oxidation, porosity, and poor weld quality. Avoid." },
    'mild_carbon_steel': { advantages: "Very common and cost-effective for carbon steels, provides good penetration and bead shape.", disadvantages: "Can cause significant spatter and promotes oxidation. Not ideal for very clean welds." },
    'high_carbon_steel': { advantages: "Promotes oxidation and can increase carbon pickup, leading to embrittlement. Generally used in mixes." },
    'stainless_steel': { advantages: "Generally NOT recommended for pure CO2 due to oxidation and carbide precipitation.", disadvantages: "Causes severe oxidation, carbide precipitation, and loss of corrosion resistance. Only used in small percentages in mixes." },
    'copper': { advantages: "NOT recommended.", disadvantages: "Causes severe oxidation and poor weld quality. Avoid." },
    'titanium': { advantages: "NOT recommended.", disadvantages: "Causes severe oxidation and embrittlement. Avoid." }
  },
  'argon_helium_mix': {
    'default': { advantages: "Combines benefits of argon (arc stability) and helium (penetration) and helium (speed). Good for various materials.", disadvantages: "Higher cost than pure argon, requires careful optimization of mix ratio." },
    'aluminum': { advantages: "Excellent for aluminum, especially thicker sections. Helium increases heat input and reduces porosity, while argon maintains arc stability.", disadvantages: "Higher cost. Optimal mix ratio depends on thickness and application." },
    'mild_carbon_steel': { advantages: "Improved penetration and wetting compared to pure argon, with good arc stability.", disadvantages: "Higher cost than pure argon or argon-CO2 mixes. May increase spatter slightly." },
    'high_carbon_steel': { advantages: "Offers better penetration and fusion than pure argon.", disadvantages: "Higher cost. Careful control needed to avoid excessive heat input." },
    'stainless_steel': { advantages: "Increases penetration and welding speed, good for thick stainless sections.", disadvantages: "Higher cost. Can lead to wider, flatter beads and potential for oxidation if not mixed with argon." },
    'copper': { advantages: "Highly effective for copper, combining good heat input from helium with arc stability from argon.", disadvantages: "Higher cost and flow rates. Requires careful parameter setup." },
    'titanium': { advantages: "Can be used, but pure argon is often preferred for simplicity and cost, as titanium primarily needs inert shielding.", disadvantages: "Helium's higher thermal conductivity might be less critical than strict inertness for titanium. Higher cost." }
  },
  'nitrogen_argon_mix': {
    'default': { advantages: "Can improve penetration and arc stability for specific applications, especially some stainless steels.", disadvantages: "Risk of nitriding depending on material and nitrogen percentage. Not universally applicable." },
    'aluminum': { advantages: "NOT recommended due to nitriding.", disadvantages: "Causes nitriding and porosity. Avoid." },
    'mild_carbon_steel': { advantages: "Can improve penetration and bead profile in some cases.", disadvantages: "Risk of nitriding and embrittlement, especially with higher nitrogen content. Not as common as argon-CO2 mixes." },
    'high_carbon_steel': { disadvantages: "High risk of nitriding and embrittlement. Generally not recommended for high carbon steels." },
    'stainless_steel': { advantages: "Commonly used for austenitic stainless steels (e.g., 304, 316) to improve penetration, arc stability, and mechanical properties. Nitrogen stabilizes austenite.", disadvantages: "Careful control of nitrogen percentage is crucial to avoid porosity or hot cracking. Not suitable for all stainless steel grades." },
    'copper': { advantages: "Generally not preferred.", disadvantages: "Risk of nitriding and porosity. Inert gases are better." },
    'titanium': { advantages: "NOT recommended.", disadvantages: "Causes severe nitriding and embrittlement. Avoid." }
  }
};

export const wireTypes = {
  'aluminum': [
    { value: '4043', text: 'ER4043 (Aluminum)' },
    { value: '5356', text: 'ER5356 (Aluminum)' }
  ],
  'mild_carbon_steel': [
    { value: 'ER70S-6', text: 'ER70S-6 (Mild Steel)' },
    { value: 'ER70S-3', text: 'ER70S-3 (Mild Steel)' }
  ],
  'high_carbon_steel': [
    { value: 'ER80S-D2', text: 'ER80S-D2 (High Strength Steel)' },
    { value: 'ER90S-G', text: 'ER90S-G (High Strength Steel)' }
  ],
  'stainless_steel': [
    { value: 'ER308L', text: 'ER308L (Stainless Steel)' },
    { value: 'ER316L', text: 'ER316L (Stainless Steel)' }
  ],
  'steel': [
    { value: 'ER70S-6', text: 'ER70S-6 (Mild Steel)' },
    { value: 'ER80S-D2', text: 'ER80S-D2 (High Strength Steel)' }
  ],
  'copper': [
    { value: 'ERCu', text: 'ERCu (Copper)' },
    { value: 'ERCuSi-A', text: 'ERCuSi-A (Silicon Bronze)' }
  ],
  'titanium': [
    { value: 'ERTi-2', text: 'ERTi-2 (Commercially Pure Titanium)' },
    { value: 'ERTi-5', text: 'ERTi-5 (Ti-6Al-4V)' }
  ],
  'other': [
    { value: 'general_purpose', text: 'General Purpose Wire' }
  ]
};

export const weldingRecommendations = {
  "stainless steel": {
    "fusion": { "gas": "Nitrogen", "presets": { "1.0": { "program": "A1", "power": "250 W" }, "2.0": { "program": "A1", "power": "500 W" }, "3.0": { "program": "A1", "power": "750 W" }, "4.0": { "program": "A1", "power": "1000 W" }, "5.0": { "program": "A1", "power": "1250 W" }, "6.0": { "program": "A1", "power": "1500 W" } } },
    "with_wire": { "gas": "Nitrogen", "wire_alloy": "308LSi", "wire_diameter": "0.045\" (1.1mm)", "presets": { "1.0": { "program": "A2", "power": "400 W", "speed": "75 cm/min" }, "2.0": { "program": "A2", "power": "700 W", "speed": "70 cm/min" }, "3.0": { "program": "A2", "power": "1000 W", "speed": "65 cm/min" }, "4.0": { "program": "A2", "power": "1300 W", "speed": "60 cm/min" }, "5.0": { "program": "A2", "power": "1500 W", "speed": "55 cm/min" } } }
  },
  "mild steel": {
    "fusion": { "gas": "Nitrogen", "presets": { "1.0": { "program": "A4", "power": "250 W" }, "2.0": { "program": "A4", "power": "500 W" }, "3.0": { "program": "A4", "power": "750 W" }, "4.0": { "program": "A4", "power": "1000 W" }, "5.0": { "program": "A4", "power": "1250 W" }, "6.0": { "program": "A4", "power": "1500 W" } } },
    "with_wire": { "gas": "Nitrogen", "wire_alloy": "ER70S-6", "wire_diameter": "0.045\" (1.1mm)", "presets": { "1.0": { "program": "A5", "power": "400 W", "speed": "75 cm/min" }, "2.0": { "program": "A5", "power": "700 W", "speed": "70 cm/min" }, "3.0": { "program": "A5", "power": "1000 W", "speed": "65 cm/min" }, "4.0": { "program": "A5", "power": "1300 W", "speed": "60 cm/min" }, "5.0": { "program": "A5", "power": "1500 W", "speed": "55 cm/min" } } }
  },
  "galvanized steel": {
    "fusion": { "gas": "Nitrogen", "presets": { "1.0": { "program": "A7", "power": "250 W" }, "2.0": { "program": "A7", "power": "500 W" }, "3.0": { "program": "A7", "power": "750 W" }, "4.0": { "program": "A7", "power": "1000 W" }, "5.0": { "program": "A7", "power": "1250 W" }, "6.0": { "program": "A7", "power": "1500 W" } } }
  },
  "titanium": {
    "fusion": { "gas": "Argon", "presets": { "1.0": { "program": "E1", "power": "250 W" }, "2.0": { "program": "E1", "power": "500 W" }, "3.0": { "program": "E1", "power": "750 W" }, "4.0": { "program": "E1", "power": "1000 W" }, "5.0": { "program": "E1", "power": "1200 W" } } }
  },
  "nickel alloys": {
    "fusion": { "gas": "Nitrogen", "presets": { "1.0": { "program": "E1", "power": "200 W" }, "2.0": { "program": "E1", "power": "450 W" }, "3.0": { "program": "E1", "power": "750 W" }, "4.0": { "program": "E1", "power": "1000 W" }, "5.0": { "program": "E1", "power": "1200 W" } } },
    "with_wire": { "gas": "Nitrogen", "wire_alloy": "ERNi-1", "wire_diameter": "0.045\" (1.1mm)", "presets": { "1.0": { "program": "E5", "power": "500 W", "speed": "70 cm/min" }, "2.0": { "program": "E5", "power": "800 W", "speed": "65 cm/min" }, "3.0": { "program": "E5", "power": "1100 W", "speed": "60 cm/min" }, "4.0": { "program": "E5", "power": "1400 W", "speed": "55 cm/min" } } }
  },
  "aluminum 5xxx": {
    "fusion": { "gas": "Argon", "presets": { "1.0": { "program": "F", "power": "300 W" }, "2.0": { "program": "F", "power": "600 W" }, "3.0": { "program": "F", "power": "800 W" }, "4.0": { "program": "F", "power": "1100 W" }, "5.0": { "program": "F", "power": "1300 W" }, "6.0": { "program": "F", "power": "1400 W" } } },
    "with_wire": { "gas": "Argon", "wire_alloy": "ER5356", "wire_diameter": "0.047\" (1.2mm)", "presets": { "1.0": { "program": "F2", "power": "400 W", "speed": "80 cm/min" }, "2.0": { "program": "F2", "power": "700 W", "speed": "75 cm/min" }, "3.0": { "program": "F2", "power": "1000 W", "speed": "70 cm/min" }, "4.0": { "program": "F2", "power": "1300 W", "speed": "65 cm/min" }, "5.0": { "program": "F2", "power": "1500 W", "speed": "65 cm/min" } } }
  },
  "aluminum 6xxx": {
    "fusion": { "gas": "Argon", "presets": { "1.0": { "program": "F4", "power": "300 W" }, "2.0": { "program": "F4", "power": "600 W" }, "3.0": { "program": "F4", "power": "900 W" }, "4.0": { "program": "F4", "power": "1200 W" }, "5.0": { "program": "F4", "power": "1300 W" }, "6.0": { "program": "F4", "power": "1500 W" } } },
    "with_wire": { "gas": "Argon", "wire_alloy": "ER5356", "wire_diameter": "0.047\" (1.2mm)", "presets": { "1.0": { "program": "F5", "power": "400 W", "speed": "80 cm/min" }, "2.0": { "program": "F5", "power": "700 W", "speed": "75 cm/min" }, "3.0": { "program": "F5", "power": "1000 W", "speed": "70 cm/min" }, "4.0": { "program": "F5", "power": "1300 W", "speed": "65 cm/min" }, "5.0": { "program": "F5", "power": "1500 W", "speed": "65 cm/min" } } }
  },
  "aluminum 3xxx": {
    "fusion": { "gas": "Argon", "presets": { "1.0": { "program": "F4", "power": "300 W" }, "2.0": { "program": "F4", "power": "600 W" }, "3.0": { "program": "F4", "power": "900 W" }, "4.0": { "program": "F4", "power": "1200 W" }, "5.0": { "program": "F4", "power": "1300 W" } } }
  },
  "copper": {
    "fusion": { "gas": "Nitrogen", "presets": { "1.0": { "program": "I7", "power": "350 W" }, "2.0": { "program": "I7", "power": "650 W" }, "3.0": { "program": "I7", "power": "950 W" }, "4.0": { "program": "I7", "power": "1250 W" }, "5.0": { "program": "I7", "power": "1350 W" }, "6.0": { "program": "I7", "power": "1500 W" } } },
    "with_wire": { "gas": "Nitrogen", "wire_alloy": "ERCU", "wire_diameter": "0.047\" (1.2mm)", "presets": { "2.0": { "program": "I2", "power": "1000 W", "speed": "75 cm/min" }, "3.0": { "program": "I2", "power": "1500 W", "speed": "70 cm/min" } } }
  }
};

export const thicknessOptions_mm = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0];
export const thicknessOptions_inches = [0.040, 0.080, 0.120, 0.160, 0.200, 0.250];

export const jointTipImages = {
  "butt": { src: "https://placehold.co/100x100/ADD8E6/000000?text=Narrow+Tip", label: "Narrow Tip (e.g., for Butt Joints)" },
  "tee": { src: "https://placehold.co/100x100/ADD8E6/000000?text=Standard+Tip", label: "Standard Tip (e.g., for Tee Joints)" },
  "lap": { src: "https://placehold.co/100x100/ADD8E6/000000?text=Standard+Tip", label: "Standard Tip (e.g., for Lap Joints)" },
  "edge": { src: "https://placehold.co/100x100/ADD8E6/000000?text=Narrow+Tip", label: "Narrow Tip (e.g., for Edge Joints)" },
  "corner": { src: "https://placehold.co/100x100/ADD8E6/000000?text=Standard+Tip", label: "Standard Tip (e.g., for Corner Joints)" },
  "flat_plate": { src: "https://placehold.co/100x100/ADD8E6/000000?text=Flat+Plate", label: "Flat Plate (e.g., for Surface Treatment)" }
};

export const weldingLaserModels = {
  "YLR": ["YLR SM-1500", "YLR SM-2000", "YLR-10", "YLR-100", "YLR-1000", "YLR-1000-WC-Y14", "YLR-1500", "YLR-200", "YLR-2000", "YLR-300", "YLR-3000", "YLR-400", "YLR-4000", "YLR-4000/6500-HPP", "YLR-50", "YLR-500-AC-Y14", "YLR-600", "YLR-6000", "YLR-600-SM", "YLR-700"],
  "YLR-QCW": ["YLR-150/1500-QCWACY14", "YLR-150-1500-QCW-MM", "YLR-150/1cw-MMACY"],
  "YLS": ["YLS-1000", "YLS-1500", "YLS-2000", "YLS-3000", "YLS-4000", "YLS-5000", "YLS-6000", "YLS-7000", "YLS-8000", "YLS-10000", "YLS-12000", "YLS-15000", "YLS-16000", "YLS-20000", "YLS-SM-1000", "YLS-SM-1200", "YLS-SM-1500", "YLS-SM-2000", "YLS-SM-3000"],
  "YLS-AMB": ["YLS-1000/1000-SM-AMB", "YLS-1000/2000-SM-AMB", "YLS-1200/1200-QCW-AMB", "YLS-1200/1800-AMB", "YLS-1500/1500-AMB", "YLS-1500/1500-SM-AMB", "YLS-2000/2000-AMB", "YLS-2000/2000-SM-AMB", "YLS-2000/3000-AMB", "YLS-2000/4000-SM-AMB", "YLS-3000/3000-AMB", "YLS-3000/3000-SM-AMB", "YLS-3000/5000-SM-AMB", "YLS-3000/8000-U-SM-AMB", "YLS-4000/2000-AMB", "YLS-4000/4000-AMB", "YLS-5000/5000-AMB", "YLS-6000/12000-AMB", "YLS-6000/4000-AMB", "YLS-6000/6000-AMB", "YLS-6000/6000-AMB-S2T", "YLS-8000/7000-AMB-HPP", "YLS-8000/8000-AMB"],
  "YLS-QCW": ["YLS-1200/12000-QCW", "YLS-1500/15000-QCW", "YLS-1800/18000-QCW", "YLS-2000/20000-QCW", "YLS-2300/23000-QCW", "YLS-450/4500-QCW", "YLS-4500/35000-QCW", "YLS-600/6000-QCW", "YLS-750/7500-QCW", "YLS-900/9000-QCW"],
  "YLS-U": ["YLS-1000-U", "YLS-2000-U", "YLS-3000-U", "YLS-4000-U", "YLS-5000-U", "YLS-6000-U", "YLS-8000-U", "YLS-10000-U", "YLS-12000-U", "YLS-15000-U"],
};

export const cleaningLaserModels = {
  "CW": ["CW-1000", "CW-2000", "CW-3000"],
  "YLPN": {
    "default": ["YLPN-10", "YLPN-20", "YLPN-50"],
    "100": ["YLPN-100-100-3000-S", "YLPN-100-20x100-1000-R", "YLPN-100-20x40x100-500-R", "YLPN-100-20x70x100-1000-PF-LS", "YLPN-100-20x70x100-2000-PF-LS", "YLPN-100-25x100-1000-S", "YLPN-100-25x100-2000-S", "YLPN-100-25x70x100-2000-PF-R", "YLPN-100-500-R"],
    "150": ["YLPN-150-20x50x100-1000-LS", "YLPN-150-25x100x100-3000-S", "YLPN-150-25x100x100-6000-BST", "YLPN-150-30x50x100-200-S", "YLPN-150-50x300-2000-S"],
    "2": ["YLPN-2-2.5x240-500-MOPA", "YLPN-2-20x500-200", "YLPN-2-20x500-300-SKAM", "YLPN-2-20x500-500", "YLPN-2-20x500-500-SM", "YLPN-2-250x1500-50", "YLPN-2-2x240-300-HP", "YLPN-2-2x240-300-LP", "YLPN-2-30x120-200-R", "YLPN-2-30x120x240-2000-R", "YLPN-2-30x120X400-1000", "YLPN-2-30x120X400-2000-R"]
  },
  "YLPP": ["YLPP-100", "YLPP-200"],
  "YLPF": ["YLPF-10", "YLPF-20"],
};

export const maxEnergyOptions_mJ = [1, 2, 5, 7, 10, 20, 25, 40, 50, 100, 150];

export const workingDistances = {
  "D30L Welding Head": { "100mm": 107, "125mm": 132, "150mm": 157, "200mm": 207, "250mm": 257, "300mm": 307, "400mm": 407, "500mm": 507 },
  "D50L Welding Head": { "150mm": 157, "200mm": 207, "250mm": 257, "300mm": 307, "400mm": 407, "500mm": 507, "600mm": 607, "700mm": 707, "800mm": 807, "900mm": 907, "1000mm": 1007 },
  "D50S Welding Head": { "150mm": 157, "200mm": 207, "250mm": 257, "300mm": 307, "400mm": 407, "500mm": 507, "600mm": 607, "700mm": 707, "800mm": 807, "900mm": 907, "1000mm": 1007 },
  "D50HP Welding Head": { "300mm": 307, "400mm": 407, "500mm": 507, "600mm": 607, "700mm": 707, "800mm": 807, "900mm": 907, "1000mm": 1007 },
  "D85 Welding Head": { "250mm": 257, "300mm": 307, "350mm": 357, "400mm": 407, "500mm": 507 },
  "D30 Wobble Head": { "100mm": 107, "125mm": 132, "150mm": 157, "200mm": 207, "250mm": 257, "300mm": 307, "400mm": 407, "500mm": 507 },
  "D50 Wobble Head": { "150mm": 157, "200mm": 207, "250mm": 257, "300mm": 307, "400mm": 407, "500mm": 507, "600mm": 607, "700mm": 707, "800mm": 807, "900mm": 907, "1000mm": 1007 },
  "D85 Wobble Head": { "250mm": 257, "300mm": 307 },
  "MICRO Cutting Head": { "50mm": 57, "85mm": 92, "100mm": 107 },
  "COMPACT Cutting Head": { "125mm": 132, "150mm": 157, "200mm": 207 },
  "D30 Cutting Head": { "125mm": 132, "150mm": 157, "200mm": 207 },
  "D50 HIGH-POWER Cutting Head": { "200mm": 207 },
  "MID-POWER Scanner (1064-1070nm)": { "100mm, OG SM": 100, "160mm, FS MM": 160, "163mm, OG SM": 163, "254mm, OG SM": 254, "254mm, FS MM": 254, "330mm, OG SM": 330, "420mm, OG SM": 420 },
  "MID-POWER Scanner (1030nm)": { "100mm, OG SM": 100, "163mm, OG SM": 163, "254mm, OG SM": 254, "330mm, OG SM": 330, "420mm, OG SM": 420 },
  "MID-POWER Scanner (505-540nm)": { "165mm, OG SM": 165 },
  "D20 2D HIGH-POWER Scanner": { "260mm, SM": 260, "500mm, SM": 500, "No Lens": 0 },
  "D33 2D HIGH-POWER Scanner": { "254mm, MM": 261, "413mm, MM": 420, "510mm, MM": 517, "405mm, SM": 420, "500mm, SM": 517, "505mm, SM": 517 },
  "D33-F 2D HIGH-POWER Scanner": { "254mm, MM": 261, "413mm, MM": 420, "510mm, MM": 517, "405mm, SM": 420, "500mm, SM": 517, "505mm, SM": 517 },
  "D33 3D HIGH-POWER Scanner": { "254mm, MM": 261, "413mm, MM": 420, "510mm, MM": 517, "405mm, SM": 420, "500mm, SM": 517, "505mm, SM": 517 },
  "IR NANO SECOND Marker - integrated head": { "100mm, OG SM": 100, "163mm, OG SM": 163, "254mm, OG SM": 254, "330mm, OG SM": 330, "420mm, OG SM": 420 },
  "IR NANO SECOND Marker - non-integrated head": { "100mm, OG SM": 100, "163mm, OG SM": 163, "254mm, OG SM": 254, "330mm, OG SM": 330, "420mm, OG SM": 420 },
  "PICOSECOND Marker": { "100mm, OG SM": 100, "163mm, OG SM": 163, "254mm, OG SM": 254, "330mm, OG SM": 330, "420mm, OG SM": 420 },
  "GREEN Marker": { "165mm, OG SM": 165 },
  "D50 Cladding Head": { "150mm": 157, "200mm": 207, "250mm": 257, "300mm": 307, "400mm": 407, "500mm": 507, "600mm": 607 },
};