export const contaminantData = {
  light_rust: {
    name: 'Light Rust (Oxide)',
    description: 'A light, reddish-brown oxide layer formed on iron or steel by the action of oxygen and moisture.',
    ablation_threshold: 'Low to Medium (e.g., 1-5 J/cm²)',
    vaporization_temp: 'N/A (typically removed by spallation)',
    recommended_approach: 'High peak power with short pulses (e.g., <100 ns) is very effective. A high pulse overlap ensures complete removal without damaging the substrate. High scan speeds are achievable.',
    fume_concerns: 'Primarily iron oxide particulates. Standard particulate filtration is effective. Good ventilation is always recommended.'
  },
  heavy_scale: {
    name: 'Heavy Mill Scale',
    description: 'A thick, flaky surface of oxides that is formed on iron and steel during hot rolling or forging.',
    ablation_threshold: 'Medium to High (e.g., 5-15 J/cm²)',
    vaporization_temp: '~1538 °C (Melting point of iron)',
    recommended_approach: 'Requires higher energy per pulse and higher effective fluence. Multiple passes at high speed can be more effective than a single slow pass. Wobble or large spot sizes can help break up the scale.',
    fume_concerns: 'Generates significant airborne particulates. Robust fume extraction with a high capture velocity is necessary.'
  },
  epoxy_paint: {
    name: 'Epoxy Paint',
    description: 'A durable, high-performance coating made from a two-part resin and hardener system.',
    ablation_threshold: 'Varies by color/filler, typically Medium (e.g., 3-10 J/cm²)',
    vaporization_temp: '~300-400 °C (Decomposition)',
    recommended_approach: 'A multi-step approach can be effective: a first pass at high speed to blister the paint, followed by a second pass to remove the residue. Lower power and high repetition rates can prevent overheating the substrate.',
    fume_concerns: 'Generates Volatile Organic Compounds (VOCs) and potentially hazardous fumes depending on the paint chemistry. Requires specialized fume extraction with carbon filters and adherence to local environmental regulations.'
  },
  oil_grease: {
    name: 'Oil & Grease',
    description: 'Hydrocarbon-based lubricants and protective coatings.',
    ablation_threshold: 'Low (e.g., < 2 J/cm²)',
    vaporization_temp: '~200-350 °C',
    recommended_approach: 'Easily vaporized with low power. A fast scan speed with a wide hatch spacing is usually sufficient. The primary goal is to heat the contaminant above its vaporization point without affecting the metal.',
    fume_concerns: 'Produces smoke and oil aerosols. An oil mist collector or appropriate fume extractor should be used.'
  },
  anodized_layer: {
    name: 'Anodized Layer (Aluminum)',
    description: 'A hard, protective layer of aluminum oxide grown on the surface of aluminum parts.',
    ablation_threshold: 'High (e.g., 10-20 J/cm²)',
    vaporization_temp: '~2072 °C',
    recommended_approach: 'Requires high fluence due to the hardness and transparency of aluminum oxide. High peak power is essential. Care must be taken to not melt the underlying aluminum substrate due to its much lower melting point.',
    fume_concerns: 'Mainly aluminum oxide dust. Can be abrasive to extraction systems. Ensure filtration is suitable for fine particulates.'
  }
};
