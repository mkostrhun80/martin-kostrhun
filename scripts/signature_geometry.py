"""Derive pen routes for font artwork. Final ink remains native font curves."""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageChops
from fontTools.pens.basePen import BasePen
from fontTools.pens.transformPen import TransformPen

class OutlinePen(BasePen):
    def __init__(self, glyphs):
        super().__init__(glyphs)
        self.contours = []
        self.points = []
    def _moveTo(self, point):
        self.points = [point]
    def _lineTo(self, point):
        self.points.append(point)
    def _qCurveToOne(self, control, end):
        start = self.points[-1]
        for t in np.linspace(0, 1, 18)[1:]:
            self.points.append(tuple((1-t)**2*start[i]+2*(1-t)*t*control[i]+t*t*end[i] for i in (0,1)))
    def _curveToOne(self, a, b, end):
        start = self.points[-1]
        for t in np.linspace(0, 1, 24)[1:]:
            self.points.append(tuple((1-t)**3*start[i]+3*(1-t)**2*t*a[i]+3*(1-t)*t*t*b[i]+t**3*end[i] for i in (0,1)))
    def _closePath(self):
        if self.points: self.contours.append(self.points)
        self.points = []
    _endPath = _closePath

def thin(mask):
    image = np.pad(mask, 1)
    while True:
        changed = False
        for phase in (0, 1):
            p = [image[:-2,1:-1],image[:-2,2:],image[1:-1,2:],image[2:,2:],image[2:,1:-1],image[2:,:-2],image[1:-1,:-2],image[:-2,:-2]]
            count = sum(v.astype(np.uint8) for v in p)
            transitions = sum((~p[i] & p[(i+1)%8]).astype(np.uint8) for i in range(8))
            if phase == 0:
                corners = ~(p[0]&p[2]&p[4]) & ~(p[2]&p[4]&p[6])
            else:
                corners = ~(p[0]&p[2]&p[6]) & ~(p[0]&p[4]&p[6])
            remove = image[1:-1,1:-1] & (count>=2) & (count<=6) & (transitions==1) & corners
            if remove.any():
                image[1:-1,1:-1][remove] = False
                changed = True
        if not changed: return image[1:-1,1:-1]

def routes(mask):
    ys,xs = np.where(thin(mask))
    pixels = set(zip(xs.tolist(),ys.tolist()))
    graph = {}
    for x,y in pixels:
        links=[]
        for dx,dy in ((-1,-1),(0,-1),(1,-1),(-1,0),(1,0),(-1,1),(0,1),(1,1)):
            q=(x+dx,y+dy)
            if q not in pixels: continue
            if dx and dy and ((x+dx,y) in pixels or (x,y+dy) in pixels): continue
            links.append(q)
        graph[(x,y)] = links
    visited=set(); result=[]
    def edge(a,b): return tuple(sorted((a,b)))
    def walk(start,next_point):
        path=[start,next_point];visited.add(edge(start,next_point))
        while len(graph[path[-1]])==2:
            choices=[q for q in graph[path[-1]] if edge(path[-1],q) not in visited]
            if not choices: break
            q=choices[0];visited.add(edge(path[-1],q));path.append(q)
            if q==start: break
        length=sum(math.dist(a,b) for a,b in zip(path,path[1:]))
        if length>=4: result.append(path)
    for point,links in graph.items():
        if not links: result.append([(point[0]-.2,point[1]),(point[0]+.2,point[1])])
        elif len(links)!=2:
            for q in links:
                if edge(point,q) not in visited: walk(point,q)
    for point,links in graph.items():
        for q in links:
            if edge(point,q) not in visited: walk(point,q)
    ordered=[]
    if result:
        cursor=min((point for route in result for point in (route[0],route[-1])),key=lambda p:p[0])
        while result:
            index,reverse=min(((i,r) for i in range(len(result)) for r in (False,True)),key=lambda choice:math.dist(cursor,result[choice[0]][-1 if choice[1] else 0]))
            route=result.pop(index)
            if reverse: route=route[::-1]
            ordered.append(route);cursor=route[-1]
    return ordered

def simplify(points, tolerance=.65):
    if len(points)<3: return points
    a,b=points[0],points[-1]
    dx,dy=b[0]-a[0],b[1]-a[1]
    denominator=math.hypot(dx,dy)
    distances=[abs(dy*(p[0]-a[0])-dx*(p[1]-a[1]))/denominator if denominator else math.dist(p,a) for p in points]
    index=max(range(len(points)),key=lambda i:distances[i])
    if distances[index]<=tolerance: return [a,b]
    return simplify(points[:index+1],tolerance)[:-1]+simplify(points[index:],tolerance)

def smooth_path(points):
    def fmt(p): return f'{p[0]:.2f} {p[1]:.2f}'
    parts=['M'+fmt(points[0])]
    for i in range(1,len(points)):
        p0=points[max(0,i-2)];p1=points[i-1];p2=points[i];p3=points[min(len(points)-1,i+1)]
        a=tuple(p1[j]+(p2[j]-p0[j])*.12 for j in (0,1))
        b=tuple(p2[j]-(p3[j]-p1[j])*.12 for j in (0,1))
        parts.append('C'+fmt(a)+' '+fmt(b)+' '+fmt(p2))
    return ' '.join(parts)

def pen_routes(glyphs, name, bounds, transform):
    left,bottom,right,top=bounds
    raster_scale=320/max(1,top-bottom)
    margin=5
    size=(math.ceil((right-left)*raster_scale)+margin*2,330)
    pen=OutlinePen(glyphs)
    glyphs[name].draw(TransformPen(pen,(raster_scale,0,0,-raster_scale,margin-left*raster_scale,margin+top*raster_scale)))
    canvas=Image.new('1',size)
    for contour in pen.contours:
        layer=Image.new('1',size);ImageDraw.Draw(layer).polygon(contour,fill=1)
        canvas=ImageChops.logical_xor(canvas,layer)
    scale,origin,baseline=transform
    movements=[]
    for route in routes(np.array(canvas,dtype=bool)):
        points=[(origin+(left+(p[0]-margin)/raster_scale)*scale,baseline-(top-(p[1]-margin)/raster_scale)*scale) for p in simplify(route)]
        length=sum(math.dist(a,b) for a,b in zip(points,points[1:]))
        if length<1.3: continue
        if movements and math.dist(movements[-1][-1],points[0])<3:
            movements[-1].extend(points)
        else: movements.append(points)
    return [{'path':smooth_path(points),'length':sum(math.dist(a,b) for a,b in zip(points,points[1:]))} for points in movements]
