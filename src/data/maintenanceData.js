export const troubleshootingData = [
  {
    issue: "Low/No Laser Power Output",
    causes: [
      "Laser source is not enabled or is in standby.",
      "Safety interlocks (e.g., door, fiber) are not engaged.",
      "Optics (cover slide, lens) are dirty or damaged.",
      "Fiber optic cable is damaged or not seated correctly.",
      "Incorrect power parameter set in the controller."
    ],
    solutions: [
      "Ensure the laser key is turned on and the emission is enabled.",
      "Check all interlock indicators on the machine and controller.",
      "Inspect and clean the cover slide glass. Replace if damaged.",
      "Visually inspect the fiber for damage. Re-seat the fiber connector (QBH/HLC).",
      "Verify that the power setting in the software matches the expected output."
    ]
  },
  {
    issue: "Uneven or Inconsistent Cleaning",
    causes: [
      "Incorrect focal distance from the head to the workpiece.",
      "Scanner mirrors are dirty or failing.",
      "The part surface is highly irregular.",
      "Scan speed is too high for the power setting, leading to missed spots."
    ],
    solutions: [
      "Use the focus diodes or a measurement tool to set the correct working distance for your lens.",
      "Visually inspect the scanner mirrors for dust or debris. Contact service if they appear damaged.",
      "Consider using a 3D scanner head or adjusting the focus dynamically if available. Otherwise, break the job into smaller, flatter sections.",
      "Reduce scan speed or increase pulse overlap/frequency to ensure even coverage."
    ]
  },
  {
    issue: "Scanner Not Moving or 'Error' State",
    causes: [
      "The scan head is not receiving power.",
      "The control cable is disconnected or damaged.",
      "The scanner controller has faulted.",
      "The selected program has invalid parameters (e.g., scan area too large for the focal length)."
    ],
    solutions: [
      "Check the power supply and cable connections to the scan head.",
      "Inspect the control cable for any signs of damage and ensure it is securely connected at both ends.",
      "Power cycle the entire system (laser and controller). If the fault persists, note the error code and contact service.",
      "Reduce the scan dimensions (X and Y) or check for other invalid parameters in the selected program."
    ]
  },
  {
    issue: "Excessive Fumes or Smoke",
    causes: [
      "Fume extraction system is off or not positioned correctly.",
      "The filter in the fume extractor is full.",
      "Parameters are too aggressive, vaporizing too much material at once.",
      "Cleaning a very thick or volatile coating."
    ],
    solutions: [
      "Ensure the fume extractor is turned on and the nozzle is positioned as close as possible to the cleaning area.",
      "Check the fume extractor's filter status indicator and replace the filter if necessary.",
      "Try reducing power or increasing scan speed to lessen the amount of fume generated per second.",
      "For heavy coatings, consider a multi-pass approach or using a respirator with appropriate cartridges in addition to the fume extractor."
    ]
  }
];
