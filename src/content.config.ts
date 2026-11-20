/**
 * Contenido de la home (spec 003 R6). Cada sección es un YAML en src/content/home/ con una sola
 * entrada; las listas internas conservan el orden en que se escriben.
 *
 * Marca PENDIENTE: cualquier valor "PENDIENTE" se ve como placeholder y hace fallar
 * `npm run check:content`. Las líneas comentadas con "# PENDIENTE" no se publican y solo avisan.
 */
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const annotation = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  label: z.string(),
  text: z.string().optional(),
});

/** `src` es el nombre de archivo en src/assets/screens/ o "PENDIENTE". */
const screenshot = z.object({
  src: z.string(),
  alt: z.string().min(10),
  annotations: z.array(annotation).default([]),
});

const hero = defineCollection({
  loader: file('src/content/home/hero.yaml'),
  schema: z.object({
    eyebrow: z.string(),
    title: z.string().refine((t) => t.trim().split(/\s+/).length <= 10, 'La propuesta de valor admite 10 palabras como máximo (spec 003 R2).'),
    lead: z.string(),
    secondary: z.object({ label: z.string(), href: z.string() }),
    screenshot,
  }),
});

const features = defineCollection({
  loader: file('src/content/home/features.yaml'),
  schema: z.object({
    label: z.string(),
    title: z.string(),
    items: z
      .array(z.object({ title: z.string(), text: z.string(), screenshot }))
      .min(1)
      .max(5),
  }),
});

const security = defineCollection({
  loader: file('src/content/home/security.yaml'),
  schema: z.object({
    label: z.string(),
    title: z.string(),
    intro: z.string(),
    items: z.array(z.object({ measure: z.string(), detail: z.string() })).min(1),
  }),
});

const faq = defineCollection({
  loader: file('src/content/home/faq.yaml'),
  schema: z.object({
    label: z.string(),
    title: z.string(),
    items: z.array(z.object({ q: z.string(), a: z.string() })).min(1),
  }),
});

const cta = defineCollection({
  loader: file('src/content/home/cta.yaml'),
  schema: z.object({
    title: z.string(),
    text: z.string(),
  }),
});

export const collections = { hero, features, security, faq, cta };
