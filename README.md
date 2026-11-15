# Line Coding Scheme Visualizer

A static interactive visualizer for comparing how binary streams map to digital signals.

## Live demo

[Open the GitHub Pages demo](https://chrstanjb.github.io/line-coding-scheme-visualizer/).

## Supported schemes

- **Unipolar:** Unipolar NRZ
- **Polar:** Polar NRZ-L, Polar NRZ-I, Polar RZ, Polar Biphase Manchester, Polar Biphase Differential Manchester
- **Bipolar:** Bipolar AMI, Bipolar Pseudoternary

## Using the visualizer

Choose a stream length and enter the bits, then press **Encode stream**. The starter `0` represents an empty stream until submitted; submitting it encodes one bit. Outputs remain a snapshot after edits, with a notice to encode again. Select schemes and an initial level before encoding.

Each Signals panel shows +V, 0, and -V, an output row aligned to its bit columns, and a scheme-colored waveform and playhead. Panels scroll horizontally for long streams. Output buttons jump the shared playhead to their bit. Each row uses one Tab stop; arrow keys move among its output buttons, and Enter or Space activates a button.

Use **Play animation**, **Pause animation**, and **Stop animation** to control playback. The shared line also supports pointer dragging and slider keyboard controls. Light and dark themes preserve the saved preference; reduced-motion settings are respected.

For NRZ-I and Differential Manchester, High and Low panels show inverse markers at each bit boundary. A solid circle sits at the transition corner for an inverse; a hollow circle sits on the flat line for no inverse. Differential Manchester's mid-bit transition is always present and is not marked. Quick references cover all eight schemes.

## Run locally

This static site has no build step or dependencies. From the project folder, run:

```sh
python -m http.server 8000
```

Then open http://localhost:8000.

## Notes

The implemented Differential Manchester rule inverts at the bit boundary for `0`, does not invert for `1`, and transitions mid-bit for every bit. In the supplied sample `111001011000`, bit 3 is no inverse under the implemented rule.
