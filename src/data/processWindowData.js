// This data represents general "safe" operating windows for laser cleaning.
// The values are for demonstration and should be refined with experimental data.
// 'minSpeed' and 'maxSpeed' are in mm/s.
// 'minPower' and 'maxPower' are in Watts.

export const processWindowData = {
  stainless_steel: {
    light_rust: { minSpeed: 8000, maxSpeed: 25000, minPower: 500, maxPower: 2000 },
    heavy_scale: { minSpeed: 4000, maxSpeed: 15000, minPower: 1000, maxPower: 3000 },
    oil_grease: { minSpeed: 10000, maxSpeed: 30000, minPower: 200, maxPower: 800 },
  },
  mild_carbon_steel: {
    light_rust: { minSpeed: 7000, maxSpeed: 22000, minPower: 400, maxPower: 1800 },
    heavy_scale: { minSpeed: 3000, maxSpeed: 12000, minPower: 1200, maxPower: 3000 },
    epoxy_paint: { minSpeed: 2000, maxSpeed: 10000, minPower: 800, maxPower: 2500 },
  },
  aluminum: {
    anodized_layer: { minSpeed: 1000, maxSpeed: 8000, minPower: 1500, maxPower: 4000 },
    oil_grease: { minSpeed: 12000, maxSpeed: 35000, minPower: 150, maxPower: 700 },
    epoxy_paint: { minSpeed: 2500, maxSpeed: 12000, minPower: 700, maxPower: 2200 },
  },
  // Default values if a specific contaminant is not listed for a material
  default: {
    minSpeed: 1000, maxSpeed: 20000, minPower: 100, maxPower: 2000
  }
};
