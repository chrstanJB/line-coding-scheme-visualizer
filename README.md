# Line Coding Scheme Visualizer

An interactive static visualizer for comparing binary line coding schemes.

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

- The page starts with a zero length and an untouched starter `0`; the stream is empty until submission. Press **Encode stream** to validate and present a snapshot. Editing encoded inputs shows ?Input changed. Press Encode stream to update.? Typing alone does not update the waveforms.
- Separate **Play animation**, **Pause animation**, and **Stop animation** controls; the shared playhead can be dragged or moved with the keyboard.
- Each panel keeps its bits, waveform, inversion markers, and output tokens in a horizontally scrollable aligned layout.
- Hollow circles mean no inverse; solid circles mean inverse. Markers appear on NRZ-I and Differential Manchester waveforms for High and Low initial levels. Differential Manchester mid-bit transitions are always present and are not marked.
- Quick references cover all eight schemes.
- Light and dark themes retain the saved preference. The interface supports reduced motion, keyboard use, and responsive layouts.

## How to use

1. Choose the stream length and enter exactly that many bits. The displayed starter `0` is only a placeholder until you submit it.
2. Choose schemes and an initial level, then press **Encode stream**.
3. Use the animation controls to follow the encoded stream. Change input settings and encode again to refresh the displayed snapshot.

## Run locally

This static site has no build step or dependencies. From the project folder, run:

```sh
python -m http.server 8000
```

Then open http://localhost:8000.

## Notes

The implemented Differential Manchester rule inverts at the bit boundary for `0`, does not invert for `1`, and transitions mid-bit for every bit. The supplied reference sample `111001011000` marks its third bit as inverted; that differs from the implemented rule.
