import { getVisual, handleVisualError, type VisualId } from '../visual-library';

interface OfficialVisualProps {
  visualId: VisualId;
  className?: string;
  imageClassName?: string;
  eager?: boolean;
}

export function OfficialVisual({
  visualId,
  className = '',
  imageClassName = '',
  eager = false,
}: OfficialVisualProps) {
  const visual = getVisual(visualId);

  return (
    <figure
      className={`overflow-hidden rounded-2xl bg-white border border-gray-100 ${className}`.trim()}
    >
      <img
        src={visual.src}
        alt={visual.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={(event) => handleVisualError(event, visual)}
        className={`block w-full aspect-[5/4] object-cover object-center ${imageClassName}`.trim()}
      />
    </figure>
  );
}
