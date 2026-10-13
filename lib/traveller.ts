export type Point = {
    x: number;
    y: number;
};
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const ease = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
export function bezier(t: number, a: Point, b: Point, c: Point, d: Point): Point { const p = clamp(t), q = 1 - p; return { x: q * q * q * a.x + 3 * q * q * p * b.x + 3 * q * p * p * c.x + p * p * p * d.x, y: q * q * q * a.y + 3 * q * q * p * b.y + 3 * q * p * p * c.y + p * p * p * d.y }; }
export function travelPoint(progress: number, width: number, indexTop: number, indexBottom: number, target: Point): Point {
    const p = clamp(progress);
    if(p === 1) return {...target};
    const left = width <= 760 ? 12 : 28, right = width - (width <= 760 ? 14 : 48);
    const top = indexTop + 26, bottom = indexBottom - 24;
    const a = { x: right, y: top }, b = { x: left, y: top }, c = { x: left, y: bottom }, d = { x: right, y: bottom };
    if (width <= 760) {
        // A short gutter route avoids crossing text and controls on touch screens.
        const start = { x: left, y: top };
        if (p < .85)
            return bezier(p / .85, start, { x: left, y: top + 80 }, { x: left, y: bottom - 80 }, c);
        return bezier((p - .85) / .15, c, { x: left, y: target.y - 32 }, { x: target.x, y: target.y - 24 }, target);
    }
    if (p < .35)
        return bezier(p / .35, a, { x: width * .68, y: top - 18 }, { x: width * .24, y: top + 12 }, b);
    if (p < .65)
        return bezier((p - .35) / .3, b, { x: left, y: top + 80 }, { x: left, y: bottom - 80 }, c);
    if (p < .79)
        return bezier((p - .65) / .14, c, { x: width * .28, y: bottom - 30 }, { x: width * .76, y: bottom - 30 }, d);
    const e = {x:left,y:bottom+18};
    if(p < .9) return bezier((p-.79)/.11,d,{x:width*.8,y:bottom+22},{x:width*.2,y:bottom+18},e);
    return bezier((p-.9)/.1,e,{x:left,y:target.y},{x:target.x*.65,y:target.y},target);
}

export type Frame = {left:number;top:number;width:number;height:number};
/** Pure interpolation: exact endpoints make forward and reverse handoffs seamless. */
export function photoFrame(a:Frame,b:Frame,progress:number,expanding=false,photoRadius=12){
 const t=ease(progress), width=a.width+(b.width-a.width)*t, height=a.height+(b.height-a.height)*t;
 const half=Math.min(width,height)/2;
 return {left:a.left+(b.left-a.left)*t,top:a.top+(b.top-a.top)*t,width,height,radius:Math.min(half,expanding?7+(photoRadius-7)*t:half*t+photoRadius*(1-t))};
}
export function sampleRoute(fn:(p:number)=>Point){
 const points=[{...fn(0),distance:0}];let length=0;
 for(let i=1;i<=500;i++){const point=fn(i/500),last=points[i-1];length+=Math.hypot(point.x-last.x,point.y-last.y);points.push({...point,distance:length});}
 return {points,length};
}
export function routePoint(route:ReturnType<typeof sampleRoute>,distance:number):Point{
 const d=Math.max(0,Math.min(route.length,distance));let lo=0,hi=route.points.length-1;
 while(lo<hi){const mid=Math.floor((lo+hi)/2);if(route.points[mid].distance<d)lo=mid+1;else hi=mid;}
 const b=route.points[lo],a=route.points[Math.max(0,lo-1)],t=(d-a.distance)/(b.distance-a.distance||1);
 return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
}

/** Longer mobile phases and a small dead zone avoid reacting to the first touch. */
export function journeyTiming(heroHeight: number, targetTop: number, viewportHeight: number, mobile: boolean) {
  const start = mobile ? 32 : 12;
  const collapseEnd = Math.max(start + 240, heroHeight * (mobile ? .86 : .66));
  const travelEnd = Math.max(collapseEnd + 300, targetTop - viewportHeight * .76);
  const expandEnd = Math.max(travelEnd + (mobile ? 400 : 320), targetTop - viewportHeight * .12);
  return { start, collapseEnd, travelEnd, expandEnd };
}

/** Time-based damping settles without overshoot, regardless of display refresh rate. */
export function settleScroll(current: number, target: number, seconds: number, mobile: boolean) {
  if (Math.abs(target - current) < .25) return target;
  return current + (target - current) * (1 - Math.exp(-Math.max(0, seconds) / (mobile ? .17 : .11)));
}
