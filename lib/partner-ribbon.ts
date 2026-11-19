import * as THREE from 'three';
import { advancePartners, canAutoplay, partnerRibbonLayout, partnerRibbonSlots, wrapPartnerPhase } from './partner-motion';

export type PartnerRibbon = {
  setPartners: (indices: number[]) => void;
  setPlaying: (playing: boolean) => void;
  step: (direction: number) => void;
  dispose: () => void;
};

export async function createPartnerRibbon(root: HTMLDivElement, atlasURL: string, options: {
  indices: number[]; playing: boolean; signal: AbortSignal; onUnavailable: () => void;
}): Promise<PartnerRibbon> {
  const texture = await new THREE.TextureLoader().loadAsync(atlasURL);
  if (options.signal.aborted) { texture.dispose(); throw new DOMException('Aborted', 'AbortError'); }
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, stencil: false, powerPreference: 'low-power' }); }
  catch (error) { texture.dispose(); throw error; }
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 10);
  camera.position.z = 1;
  const geometry = new THREE.PlaneGeometry(1, 1), atlasIndices = new Float32Array(24);
  geometry.setAttribute('atlasIndex', new THREE.InstancedBufferAttribute(atlasIndices, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: { atlas: { value: texture }, atlasSize: { value: new THREE.Vector2(texture.image.width, texture.image.height) }, cardSize: { value: new THREE.Vector2(216, 108) }, borderColor: { value: new THREE.Color('#c9bbaa') } },
    vertexShader: `
      attribute float atlasIndex; varying vec2 vUV; varying float vIndex;
      void main(){vUV=uv;vIndex=atlasIndex;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}
    `,
    fragmentShader: `
      uniform sampler2D atlas; uniform vec2 atlasSize; uniform vec2 cardSize; uniform vec3 borderColor;
      varying vec2 vUV; varying float vIndex;
      void main(){
        float col=mod(floor(vIndex+.5),8.0),row=floor(floor(vIndex+.5)/8.0);
        vec2 uv=vec2((col*256.0+2.0+vUV.x*252.0)/atlasSize.x,1.0-(row*128.0+2.0+(1.0-vUV.y)*124.0)/atlasSize.y);
        gl_FragColor=texture2D(atlas,uv);
        float radius=min(18.0,min(cardSize.x,cardSize.y)*.22);
        vec2 q=abs((vUV-.5)*cardSize)-cardSize*.5+radius;
        float distance=length(max(q,0.0))+min(max(q.x,q.y),0.0)-radius;
        float aa=max(fwidth(distance),.5);
        float border=smoothstep(-1.5-aa,-1.5+aa,distance);
        gl_FragColor.rgb=mix(gl_FragColor.rgb,borderColor,border);
        gl_FragColor.a*=1.0-smoothstep(-aa,aa,distance);
        if(gl_FragColor.a<.001)discard;
        #include <colorspace_fragment>
      }
    `,
    transparent: true, depthTest: false, depthWrite: false,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, 24), transform = new THREE.Object3D();
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  root.append(renderer.domElement);

  let indices = options.indices, playing = options.playing, phase = 0, target: number | null = null;
  let visible = false, disposed = false, dirty = true, ready = false, frame = 0, previous = 0, width = 1;
  let layout = partnerRibbonLayout(1);
  function stop() { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  function wake() { if (!disposed && visible && !document.hidden && !frame) frame = requestAnimationFrame(tick); }
  function draw() {
    const slots = partnerRibbonSlots(phase, indices.length, width);
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      transform.position.set(slot.x, slot.y, 0);
      transform.scale.set(layout.width, layout.height, 1);
      transform.updateMatrix(); mesh.setMatrixAt(i, transform.matrix);
      atlasIndices[i] = indices[slot.partner];
    }
    mesh.count = slots.length; mesh.instanceMatrix.needsUpdate = true;
    geometry.attributes.atlasIndex.needsUpdate = true;
    renderer.render(scene, camera);
    if (!ready) { root.dataset.renderer = 'webgl'; ready = true; }
    dirty = false;
  }
  function tick(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) { previous = 0; return; }
    if (previous && now - previous < 1000 / 60 - .5) { wake(); return; }
    const elapsed = previous ? Math.min((now - previous) / 1000, .05) : 0;
    previous = now;
    const autoplay = indices.length > 1 && canAutoplay({ playing, reduced: false, visible, hidden: document.hidden });
    if (target !== null) {
      phase += (target - phase) * (1 - Math.exp(-elapsed * 12));
      if (Math.abs(target - phase) < .05) { phase = wrapPartnerPhase(target, indices.length * layout.step); target = null; }
      dirty = true;
    } else if (autoplay) { phase = advancePartners(phase, indices.length * layout.step, elapsed); dirty = true; }
    if (dirty) draw();
    if (target !== null || autoplay) wake(); else previous = 0;
  }
  function measure() {
    const height = root.clientHeight, nextWidth = root.clientWidth;
    if (!height || !nextWidth) return;
    const oldStep = layout.step;
    width = nextWidth; layout = partnerRibbonLayout(width);
    phase = phase / oldStep * layout.step; target = null;
    camera.left = -width / 2; camera.right = width / 2; camera.top = height / 2; camera.bottom = -height / 2; camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1500000 / (width * height))));
    renderer.setSize(width, height, false);
    material.uniforms.cardSize.value.set(layout.width, layout.height);
    dirty = true; wake();
  }
  const intersection = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    if (visible) { dirty = true; wake(); } else stop();
  });
  const resize = new ResizeObserver(measure);
  const visibility = () => { if (document.hidden) stop(); else wake(); };
  const contextLost = (event: Event) => { event.preventDefault(); stop(); root.dataset.renderer = 'fallback'; options.onUnavailable(); };
  intersection.observe(root); resize.observe(root);
  document.addEventListener('visibilitychange', visibility);
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  measure();
  return {
    setPartners(next) { indices = next; phase = 0; target = null; dirty = true; wake(); },
    setPlaying(next) { playing = next; if (next) target = null; previous = 0; wake(); },
    step(direction) { playing = false; target = phase + direction * layout.step * 3; wake(); },
    dispose() {
      disposed = true; stop(); intersection.disconnect(); resize.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      geometry.dispose(); material.dispose(); texture.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
      delete root.dataset.renderer;
    },
  };
}
