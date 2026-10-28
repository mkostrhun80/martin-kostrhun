# Signature artwork

The intro and `public/images/signature.svg` use smooth vector outlines generated
from Allura Regular by the Allura Project Authors, licensed under SIL OFL 1.1.
Source: https://github.com/google/fonts/tree/main/ofl/allura

The font is retained here as an editable design source with its original license.
The website renders generated SVG curves and does not load the font at runtime.

Regenerate from the repository root with Python and fonttools installed:

    python3 scripts/generate-signature.py

This updates the lettering paths, reveal bounds and timing in
`lib/signature-lettering.ts`, as well as the standalone SVG artwork.
