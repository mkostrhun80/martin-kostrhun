import type { ResponsiveImageSpec } from '@/lib/site-config';

export function PictureFrame({
  spec,
  className,
  priority = false,
}: {
  spec: ResponsiveImageSpec;
  className?: string;
  priority?: boolean;
}) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={spec.avifSrcSet} sizes={spec.sizes} />
      <source type="image/webp" srcSet={spec.webpSrcSet} sizes={spec.sizes} />
      <img
        src={spec.src}
        alt={spec.alt}
        width={spec.width}
        height={spec.height}
        sizes={spec.sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        draggable={false}
      />
    </picture>
  );
}
