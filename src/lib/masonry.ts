import type { CollectionEntry } from 'astro:content';

type Photo = CollectionEntry<'photos'>;

/**
 * Deal photos into `count` columns, each one going to the shortest column so
 * far. Fed a sorted list, this keeps earlier photos above later ones while
 * leaving the columns roughly level.
 */
export function packColumns(photos: Photo[], count: number): Photo[][] {
  const cols: Photo[][] = Array.from({ length: count }, () => []);
  const heights = new Array<number>(count).fill(0);

  for (const photo of photos) {
    const i = heights.indexOf(Math.min(...heights));
    cols[i].push(photo);
    heights[i] += photo.data.image.height / photo.data.image.width;
  }
  return cols;
}
