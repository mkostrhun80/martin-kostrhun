# Signature artwork

The current signature is the exact vector lettering supplied in
`Martin_Kostrhun_animace_bez_podkladu.html`. That file does not embed a font;
the visible name is an SVG outline. `reference-artwork.json` retains its ink,
even-odd fill rule, view box and original reveal routes. The visible outline
is copied verbatim, without substituting a different typeface.

The supplied screen recording `Záznam obrazovky 2026-10-28 v 20.16.47.mov`
(approximately 1.8–4 seconds) remains the motion reference. Short fragments
appear across the entire signature together, extend into finished ink, hold,
then contract in reverse. `SIGNATURE_MOTION` in `lib/home-intro.ts` controls
the 2.5-second signature phase. The original hero design follows unchanged.

To regenerate the TypeScript geometry and reusable SVG from the repository:

    python3 scripts/generate-signature.py

The generator uses only Python's standard library. It splits the supplied
invisible mask routes into short fragments; it never changes the visible ink.
There is no runtime font or video download.

The former WindSong font, its SIL OFL 1.1 license, and the font geometry helper
remain as historical source material. WindSong is no longer rendered.
