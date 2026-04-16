import dynamic from 'next/dynamic';

export { default as MarkerFilter } from './MarkerFilter';
export type { MarkerFilterValue } from './MarkerFilter';

export const PropertyMapDynamic = dynamic(
  () => import('./PropertyMap'),
  { ssr: false }
);

export const PropertyLayoutViewDynamic = dynamic(
  () => import('./PropertyLayoutView'),
  { ssr: false }
);

export const AdminMapEditorDynamic = dynamic(
  () => import('./AdminMapEditor'),
  { ssr: false }
);
