import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const photos = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string(),
    category: z.string().optional(),
    image: image().optional(),
    date: z.date().optional(),
    acquisition: z.string().optional(),
    creative: z.string().optional(),
  }),
  loader: glob({ base: './src/content/photos', pattern: '**/*.md' }),
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
