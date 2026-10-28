"""Generate smooth signature artwork from Allura (SIL OFL); requires fonttools.
Run from the repository root. The web only uses the generated SVG paths.
"""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

font = TTFont('assets/signature/Allura-Regular.ttf')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
kerning = {}
if 'kern' in font:
    for table in font['kern'].kernTables:
        kerning.update(getattr(table, 'kernTable', {}))
letters = []
x = 0
previous = None
for character in 'Martin Kostrhun':
    name = cmap[ord(character)]
    x += kerning.get((previous, name), 0)
    bounds = BoundsPen(glyphs)
    glyphs[name].draw(bounds)
    if bounds.bounds:
        left, bottom, right, top = bounds.bounds
        letters.append((character, name, x, (left+x, bottom, right+x, top)))
    x += font['hmtx'][name][0]
    previous = name
left = min(item[3][0] for item in letters)
right = max(item[3][2] for item in letters)
bottom = min(item[3][1] for item in letters)
top = max(item[3][3] for item in letters)
scale = 900 / (right-left)
padding = 18
height = round((top-bottom)*scale + padding*2 + 28, 2)
width = 936
result = []
time = 80
for index, (character, name, origin, bounds) in enumerate(letters):
    if index == 6:
        time += 180  # Lift the pen between first and last name.
    pen = SVGPathPen(glyphs, ntos=lambda number: f'{number:.2f}'.rstrip('0').rstrip('.'))
    glyphs[name].draw(TransformPen(pen, (scale,0,0,-scale,padding+(origin-left)*scale,padding+top*scale)))
    duration = 330 if character in 'MK' else 195
    start_x = round(padding+(bounds[0]-left)*scale-2, 2)
    span = round((bounds[2]-bounds[0])*scale+4, 2)
    result.append({'letter':character,'path':pen.getCommands(),'left':start_x,'width':span,'start':time,'duration':duration})
    time += duration-15
underline_start = time+100
underline_y = round(height-15, 2)
timing = {'underline':underline_start,'underlineDuration':320,'end':underline_start+550}
header = '// Generated from Allura by scripts/generate-signature.py. Source and SIL OFL: assets/signature/.\n'
Path('lib/signature-lettering.ts').write_text(header+'export const signatureLettering = '+json.dumps(result,ensure_ascii=False,separators=(',',':'))+' as const;\nexport const signatureViewBox = '+json.dumps({'width':width,'height':height})+' as const;\nexport const signatureUnderline = '+json.dumps(f'M30 {underline_y} Q468 {underline_y+8} 906 {underline_y-4}')+';\nexport const signatureTiming = '+json.dumps(timing)+' as const;\n')
paths=''.join('<path d="'+item['path']+'"/>' for item in result)
Path('public/images/signature.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-label="Martin Kostrhun"><title>Martin Kostrhun</title><g fill="#14243a">{paths}</g></svg>\n')
