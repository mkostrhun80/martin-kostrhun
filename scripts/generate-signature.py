"""Generate signature assets from the user's supplied HTML artwork.

The original lettering is retained, with pixel-trace steps replaced by smooth
cubic curves. Invisible reveal routes are split for the draw/retract motion.
Uses the standard library; no fonts, rasterization or tracing required.
"""
import json
import math
import re
from pathlib import Path
from signature_curves import curved_path, smooth_outline

root = Path(__file__).resolve().parents[1]
art = json.loads((root / 'assets/signature/reference-artwork.json').read_text())


def fragment_routes(path, limit=40):
    """Split the supplied M/L centerlines without changing their geometry."""
    points = [(float(x), float(y)) for x, y in re.findall(
        r'[ML]\s*([-\d.]+)\s+([-\d.]+)', path)]
    fragment = [points[0]]
    remaining = limit
    for target in points[1:]:
        start = fragment[-1]
        distance = math.dist(start, target)
        while distance >= remaining:
            fraction = remaining / distance
            split = tuple(start[i] + (target[i] - start[i]) * fraction for i in (0, 1))
            fragment.append(split)
            yield fragment
            fragment = [split]
            start = split
            distance = math.dist(start, target)
            remaining = limit
        fragment.append(target)
        remaining -= distance
    if len(fragment) > 1:
        yield fragment


traces = []
for stroke in art['traces']:
    for points in fragment_routes(stroke['path']):
        traces.append({'path': curved_path(points, sigma=.75)})

header = '// Generated from the supplied HTML artwork by scripts/generate-signature.py.\n'
ink = smooth_outline(art['ink'])
exports = {
    'signatureInk': ink,
    'signatureTraces': traces,
    'signatureViewBox': art['viewBox'],
    'signatureStrokeWidth': max(stroke['width'] for stroke in art['traces']),
    'signatureFillRule': art['fillRule'],
}
(root / 'lib/signature-lettering.ts').write_text(header + ''.join(
    f'export const {name} = {json.dumps(value, separators=(",", ":"))} as const;\n'
    for name, value in exports.items()))
box = art['viewBox']
(root / 'public/images/signature.svg').write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {box["width"]} {box["height"]}" '
    'role="img" aria-label="Martin Kostrhun"><title>Martin Kostrhun</title>'
    f'<path fill="#14243a" fill-rule="{art["fillRule"]}" d="{ink}"/></svg>\n')
print('Generated signature from the supplied artwork with', len(traces), 'reveal fragments')
