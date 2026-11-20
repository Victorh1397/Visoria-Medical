/**
 * Resuelve el `src` de una captura declarada en src/content/home/*.yaml.
 * - "PENDIENTE" → undefined (Annotated pinta el placeholder).
 * - Nombre de archivo → la imagen de src/assets/screens/, optimizada por astro:assets.
 */
import type { ImageMetadata } from 'astro';

export const PENDING = 'PENDIENTE';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/screens/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
});

export function resolveScreen(src: string): ImageMetadata | undefined {
  if (src.trim() === PENDING) return undefined;
  const match = Object.entries(files).find(([path]) => path.endsWith(`/${src}`));
  if (!match) {
    throw new Error(`Captura no encontrada: src/assets/screens/${src}. Revise el nombre en src/content/home/.`);
  }
  return match[1].default;
}
