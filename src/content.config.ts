import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { photosLoader } from './loaders/photos';

const photos = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string(),
    category: z.string().optional(),
    image: image(),
    date: z.date().optional(),
    acquisition: z.string().optional(),
    creative: z.string().optional(),
    body: z.string().optional(),
  }),
  loader: photosLoader(),
});

const projects = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    order: z.number().optional(),
    image: image().optional(),
  }),
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
});

export const collections = { photos, projects };
