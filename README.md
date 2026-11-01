# Line Coding Scheme Visualizer

An interactive visualizer for exploring how binary bit streams are represented by digital line coding schemes. Enter bits to compare their signal waveforms and per-bit output tokens.

**Live demo:** https://chrstanjb.github.io/line-coding-scheme-visualizer/

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

- Bit-stream input starts at length `0` with an empty stream.
- All results appear under one OUTPUT section, including waveform and token output.
- Initial-level controls for differential schemes.
- Light and dark themes with the selected preference saved.
- Responsive layout for desktop and mobile.
- Keyboard accessibility and reduced-motion support.

## How to use

1. Choose a stream length and enter exactly that many bits. The stream starts empty; the displayed `0` is only a starter value.
2. Choose which schemes to compare, and select an initial level for differential schemes.
3. Read each scheme's tokens and waveform in the OUTPUT section. Use **Play animation** to follow the bit stream.

## Run locally

This is a static site with no build step or dependencies. From the project folder, run:

```sh
python -m http.server 8000
```

Then open http://localhost:8000.

## Project structure

- `index.html` — page structure and controls
- `css/style.css` — responsive layout and themes
- `js/app.js` — encoders, rendering, and interactions

## Notes

Differential Manchester follows the implemented rule: a `0` causes an inversion at the bit boundary, a `1` does not, and every bit has a mid-bit transition. The supplied reference sample `111001011000` marks its third bit as inverted, which does not match this rule.

The author tested the site in a desktop browser and a phone browser.
