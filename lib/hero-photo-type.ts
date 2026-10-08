/** Clip the high-contrast type to the actual portrait, including its moving frame. */
export function syncHeroPhotoType(
  hero: HTMLElement,
  photo: { left: number; top: number; width: number; height: number },
  radiusX: number,
  radiusY = radiusX,
) {
  const scene = hero.getBoundingClientRect();
  const left = photo.left - scene.left, top = photo.top - scene.top;
  const right = scene.width - left - photo.width;
  const bottom = scene.height - top - photo.height;
  hero.style.setProperty('--hero-photo-type-clip',
    `inset(${top}px ${right}px ${bottom}px ${left}px round ${radiusX}px / ${radiusY}px)`);
}
