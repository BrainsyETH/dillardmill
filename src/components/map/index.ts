import dynamic from 'next/dynamic';

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
