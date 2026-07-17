export type VisualCategory =
  | 'characters'
  | 'objects'
  | 'places'
  | 'actions'
  | 'scenes'
  | 'microstories'
  | 'pronouns';

export interface VisualMetadata {
  id: string;
  file: string;
  alt: string;
  unit: string;
  category: VisualCategory;
  subjects: readonly string[];
}

export interface ResolvedVisual extends VisualMetadata {
  src: string;
  fallback: string;
}
