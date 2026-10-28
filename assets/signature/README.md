# Signature artwork

The signature uses WindSong Regular by the WindSong Project Authors under SIL
OFL 1.1. The original font and its license are retained in this directory.
Source: https://github.com/google/fonts/tree/main/ofl/windsong

The supplied `Martin_Kostrhun_animace_bez_podkladu.html` is the reference for
stroke easing, subtle speed variation, the moving pen tip, underline, lift and
fade timing. The sample page and its labels are not part of the website.

`lib/signature-lettering.ts` contains native font outline curves and separate
centerline pen routes. The ink remains exact vector geometry; the routes only
control its animated reveal. There is no runtime font or video download.

To regenerate from the repository root, install Python fonttools, numpy and
Pillow, then run:

    python3 scripts/generate-signature.py

`scripts/signature_geometry.py` derives and smooths centerline routes for masks.
Intermediate raster geometry never becomes the visible ink. The generator also
updates the reusable artwork in `public/images/signature.svg`.
