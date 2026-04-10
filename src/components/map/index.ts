import dynamic from 'next/dynamic';

export const PropertyMapDynamic = dynamic(
  () => import('./PropertyMap'),
  { ssr: false }
);
