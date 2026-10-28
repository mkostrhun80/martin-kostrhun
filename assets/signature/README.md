# Signature artwork

The signature uses WindSong Regular by the WindSong Project Authors under SIL
OFL 1.1. The original font and its license are retained in this directory.
Source: https://github.com/google/fonts/tree/main/ofl/windsong

The supplied screen recording `Záznam obrazovky 2026-10-28 v 20.16.47.mov`
(approximately 1.8–4 seconds) is the current motion reference. Short fragments
appear across the entire signature together, extend into finished ink, hold,
then contract in reverse. The signature stays centered and sharp throughout.
There is no moving pen tip, added underline, blur or upward exit.

`SIGNATURE_MOTION` in `lib/home-intro.ts` controls the 2.5-second signature
phase; the existing hero entrance follows without changing the hero design.
The earlier standalone HTML remains a historical reference for the pen routes.

`lib/signature-lettering.ts` contains native font outline curves and separate
centerline pen routes. The ink remains exact vector geometry; the routes only
control its animated reveal. There is no runtime font or video download.

To regenerate from the repository root, install Python fonttools, numpy and
Pillow, then run:

    python3 scripts/generate-signature.py

`scripts/signature_geometry.py` derives and smooths centerline routes for masks.
Intermediate raster geometry never becomes the visible ink. The generator also
updates the reusable artwork in `public/images/signature.svg`.
