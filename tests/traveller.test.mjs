import test from 'node:test';
import assert from 'node:assert/strict';
import { travelPoint } from '../lib/traveller.ts';
test('travelling dot ends at heading and follows same path in reverse at desktop and mobile widths', () => { for (const width of [375, 768, 1280, 1440]) {
    const target = { x: width * .05 + 7, y: 1150 };
    const start = travelPoint(0, width, 720, 1000, target);
    const end = travelPoint(1, width, 720, 1000, target);
    assert.deepEqual(end, target);
    assert.ok(start.x > width * .8);
    for (let i = 0; i <= 100; i++) {
        const p = i / 100, frame = travelPoint(p, width, 720, 1000, target);
        assert.ok(Number.isFinite(frame.x) && Number.isFinite(frame.y));
        assert.ok(frame.x >= 0 && frame.x <= width);
        const reverse = travelPoint(1 - (1 - p), width, 720, 1000, target);
        assert.ok(Math.abs(frame.x - reverse.x) < 1e-8 && Math.abs(frame.y - reverse.y) < 1e-8);
    }
} });
test('mobile route takes the left gutter after crossing above the contents', () => {
    const target = { x: 27, y: 1150 };
    for (const p of [.4, .6, .8]) {
        const point = travelPoint(p, 375, 720, 1000, target);
        assert.ok(Math.abs(point.x - 12) < 1e-8);
        assert.ok(point.y >= 746 && point.y <= 976);
    }
});

test('portrait collapse and expansion have exact reversible endpoints', async()=>{
 const {photoFrame}=await import('../lib/traveller.ts');
 const photo={left:420,top:90,width:600,height:750},dot={left:100,top:1000,width:14,height:14},destination={left:72,top:200,width:494,height:329};
 for(const [a,b,expanding] of [[photo,dot,false],[dot,destination,true]]){
   for(const t of [0,1]){const frame=photoFrame(a,b,t,expanding);for(const key of ['left','top','width','height']) assert.equal(frame[key],(t?b:a)[key]);}
   for(let i=0;i<=100;i++){const frame=photoFrame(a,b,i/100,expanding);assert.ok(frame.width>0&&frame.height>0);assert.ok(frame.radius>=0&&frame.radius<=Math.min(frame.width,frame.height)/2);}
 }
});
test('trail keeps compact geometric spacing along the same route',async()=>{
 const {sampleRoute,routePoint}=await import('../lib/traveller.ts');
 const route=sampleRoute(p=>travelPoint(p,1440,900,1400,{x:318,y:2200}));
 assert.deepEqual(routePoint(route,0),travelPoint(0,1440,900,1400,{x:318,y:2200}));
 assert.deepEqual(routePoint(route,route.length),{x:318,y:2200});
 for(let d=100;d<route.length;d+=23){const head=routePoint(route,d),tail=routePoint(route,d-18);assert.ok(Math.hypot(head.x-tail.x,head.y-tail.y)<=18.001);}
});
