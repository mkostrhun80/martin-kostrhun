"""Create WindSong ink curves and pen routes; requires fonttools, numpy, Pillow.
The website uses only generated SVG geometry, never a rasterized signature.
"""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from signature_geometry import pen_routes

font=TTFont('assets/signature/WindSong-Regular.ttf')
glyphs=font.getGlyphSet();cmap=font.getBestCmap();letters=[];x=0;previous=None;kerning={}
if 'kern' in font:
    for table in font['kern'].kernTables: kerning.update(getattr(table,'kernTable',{}))
for character in 'Martin Kostrhun':
    name=cmap[ord(character)];x+=kerning.get((previous,name),0)
    bounds=BoundsPen(glyphs);glyphs[name].draw(bounds)
    if bounds.bounds: letters.append((character,name,x,bounds.bounds))
    x+=font['hmtx'][name][0];previous=name
left=min(x+b[0] for _,_,x,b in letters);right=max(x+b[2] for _,_,x,b in letters)
bottom=min(b[1] for _,_,_,b in letters);top=max(b[3] for _,_,_,b in letters)
scale=900/(right-left);padding=18;width=936;height=round((top-bottom)*scale+padding*2+28,2)
ink=[];traces=[]
for index,(character,name,origin,bounds) in enumerate(letters):
    transform=(scale,padding+(origin-left)*scale,padding+top*scale)
    pen=SVGPathPen(glyphs,ntos=lambda n:f'{n:.2f}'.rstrip('0').rstrip('.'))
    glyphs[name].draw(TransformPen(pen,(scale,0,0,-scale,transform[1],transform[2])))
    ink.append(pen.getCommands())
    for route in pen_routes(glyphs,name,bounds,transform): traces.append({**route,'letter':index})
# Match the supplied HTML's handwriting window, with short lifts between strokes.
lift=12;word_lift=130;duration=5830-lift*(len(traces)-1)-word_lift
length=sum(t['length'] for t in traces);time=480;previous=0
for t in traces:
    if previous<6<=t['letter']: time+=word_lift
    previous=t['letter'];t['start']=round(time,2);t['duration']=round(t['length']/length*duration,2)
    time+=t['duration']+lift;del t['length'];del t['letter']
underline_y=round(height-15,2)
timing={'inkComplete':6310,'underline':6380,'underlineDuration':660,'lift':7820,'fade':8850}
header='// Generated from WindSong by scripts/generate-signature.py. Source/license: assets/signature/.\n'
Path('lib/signature-lettering.ts').write_text(header+'export const signatureInk = '+json.dumps(' '.join(ink))+';\nexport const signatureTraces = '+json.dumps(traces,separators=(',',':'))+' as const;\nexport const signatureViewBox = '+json.dumps({'width':width,'height':height})+' as const;\nexport const signatureUnderline = '+json.dumps(f'M30 {underline_y} Q468 {underline_y+8} 906 {underline_y-4}')+';\nexport const signatureTiming = '+json.dumps(timing)+' as const;\n')
Path('public/images/signature.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-label="Martin Kostrhun"><title>Martin Kostrhun</title><path fill="#14243a" d="'+ ' '.join(ink)+'"/></svg>\n')
print('Generated native vector ink and',len(traces),'pen movements')
