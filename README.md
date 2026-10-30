# Line Coding Scheme Visualizer

An educational interactive app that demonstrates how binary data is represented as digital signals. Enter a bit stream and compare each scheme's waveform and per-bit output tokens.

## Supported schemes

- Unipolar NRZ
- Polar NRZ-L
- Polar NRZ-I
- Polar RZ
- Polar Biphase Manchester
- Polar Biphase Differential Manchester
- Bipolar AMI
- Bipolar Pseudoternary

## Features

Interactive bit-stream input, synchronized waveform animation, token output, initial-level options for differential schemes, light and dark themes, responsive layout, keyboard-visible focus, and reduced-motion support.

## Run locally

This is a static site with no build step or dependencies. For realistic browser testing, open a terminal in this folder and run:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`. No npm install or build command is needed.

## Use the visualizer

The fresh state shows a stream length of 0 and a starter `0` in the input; the actual stream is empty until you enter bits or deliberately submit that starter value. Enter 1–32 bits, select schemes, and compare the generated token streams and waveforms. The displayed count follows valid bits. Choose an initial level for NRZ-I and Differential Manchester, and use the theme control in the header to switch appearance.

## Live demo

Coming soon — GitHub Pages has not yet been enabled or verified.

## Known limitations

The supplied Differential Manchester sample tokens conflict with the written rule that bit 0 causes a boundary inversion. In the sample stream `111001011000`, the expected tokens mark the third `1` as inverted. The implementation follows the written rule, and the built-in self-test reports this mismatch.

This project is an educational demonstration, not a network protocol analyzer.
