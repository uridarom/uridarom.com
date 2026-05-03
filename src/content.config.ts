import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const photos = defineCollection({
  loader: glob({ base: './src/content', pattern: 'photos/*.md' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    category: z.enum(['photography', 'astrophotography']),
    image: image(),
    thumbAspect: z.enum(['landscape', 'portrait', 'square']).default('landscape'),
    acquisition: z.string().optional(),
    creative: z.string().optional(),
    date: z.date().optional(),
    featured: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content', pattern: 'projects/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    order: z.number().default(99),
  }),
});

export const collections = { photos, projects };
