export const materialProperties = {
  stainless_steel: {
    name: 'Stainless Steel (304)',
    density: '8.0 g/cm³',
    melting_point: '1400-1450 °C',
    thermal_conductivity: '16.2 W/(m·K)',
    reflectivity_1064nm: '~65-70%',
    notes: 'Good corrosion resistance. Lower thermal conductivity compared to steel, which can lead to heat buildup. High reflectivity requires higher power density to initiate coupling.'
  },
  mild_carbon_steel: {
    name: 'Mild Carbon Steel',
    density: '7.85 g/cm³',
    melting_point: '1420-1540 °C',
    thermal_conductivity: '45.0 W/(m·K)',
    reflectivity_1064nm: '~55-60%',
    notes: 'Absorbs laser energy more readily than stainless steel or aluminum. Prone to oxidation, requiring good shielding or a reactive cleaning process.'
  },
  aluminum: {
    name: 'Aluminum (6061)',
    density: '2.7 g/cm³',
    melting_point: '582-652 °C',
    thermal_conductivity: '167 W/(m·K)',
    reflectivity_1064nm: '>80-90%',
    notes: 'Very high reflectivity and thermal conductivity make it challenging. Requires high peak power to overcome reflectivity. Low melting point means it can be damaged easily once coupling occurs.'
  },
  copper: {
    name: 'Copper',
    density: '8.96 g/cm³',
    melting_point: '1084 °C',
    thermal_conductivity: '401 W/(m·K)',
    reflectivity_1064nm: '>95%',
    notes: 'Extremely high reflectivity and thermal conductivity, making it one of the most difficult materials to process with a 1µm laser. Often requires a green or blue laser for better absorption.'
  },
  titanium: {
    name: 'Titanium (Ti-6Al-4V)',
    density: '4.43 g/cm³',
    melting_point: '1668 °C',
    thermal_conductivity: '6.7 W/(m·K)',
    reflectivity_1064nm: '~50-55%',
    notes: 'Highly reactive with oxygen at high temperatures, requiring excellent inert gas shielding to prevent embrittlement. Low thermal conductivity can concentrate heat.'
  },
};
