export type Point = {
    x: number;
    y: number;
};
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const ease = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
export function bezier(t: number, a: Point, b: Point, c: Point, d: Point): Point { const p = clamp(t), q = 1 - p; return { x: q * q * q * a.x + 3 * q * q * p * b.x + 3 * q * p * p * c.x + p * p * p * d.x, y: q * q * q * a.y + 3 * q * q * p * b.y + 3 * q * p * p * c.y + p * p * p * d.y }; }
export function travelPoint(progress: number, width: number, indexTop: number, indexBottom: number, target: Point): Point {
    const p = clamp(progress);
    const left = width < 760 ? 12 : 28, right = width - (width < 760 ? 14 : 48);
    const top = indexTop + 26, bottom = indexBottom - 24;
    const a = { x: right, y: top }, b = { x: left, y: top }, c = { x: left, y: bottom }, d = { x: right, y: bottom };
    if (width < 760) {
        if (p < .35)
            return bezier(p / .35, a, { x: width * .68, y: top - 12 }, { x: width * .24, y: top + 8 }, b);
        if (p < .85)
            return bezier((p - .35) / .5, b, { x: left, y: top + 60 }, { x: left, y: bottom - 60 }, c);
        return bezier((p - .85) / .15, c, { x: left, y: target.y - 32 }, { x: target.x, y: target.y - 24 }, target);
    }
    if (p < .35)
        return bezier(p / .35, a, { x: width * .68, y: top - 18 }, { x: width * .24, y: top + 12 }, b);
    if (p < .65)
        return bezier((p - .35) / .3, b, { x: left, y: top + 80 }, { x: left, y: bottom - 80 }, c);
    if (p < .87)
        return bezier((p - .65) / .22, c, { x: width * .28, y: bottom + 12 }, { x: width * .76, y: bottom - 12 }, d);
    return bezier((p - .87) / .13, d, { x: right, y: target.y - 32 }, { x: target.x + 50, y: target.y - 32 }, target);
}
