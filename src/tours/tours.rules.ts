// Reglas puras de la galería y de los campos opcionales de un tour (spec 006).

export const MAX_TOUR_IMAGES = 8;

const IMAGE_NAME = /^[A-Za-z0-9._-]+\.(jpe?g|png|webp|gif)$/i;
const UPLOADS_PREFIX = '/uploads/';

export type ImagesResult =
  | { images: string[] }
  | { error: 'TOO_MANY_IMAGES' | 'INVALID_IMAGES' };

/** Acepta `abc.jpg` o `/uploads/abc.jpg`; devuelve los nombres de archivo en orden. */
export function normalizeImages(input: unknown): ImagesResult {
  if (!Array.isArray(input)) return { error: 'INVALID_IMAGES' };
  if (input.length > MAX_TOUR_IMAGES) return { error: 'TOO_MANY_IMAGES' };

  const names: string[] = [];
  for (const item of input) {
    if (typeof item !== 'string') return { error: 'INVALID_IMAGES' };
    const name = item.startsWith(UPLOADS_PREFIX)
      ? item.slice(UPLOADS_PREFIX.length)
      : item;
    if (!IMAGE_NAME.test(name) || name.includes('..'))
      return { error: 'INVALID_IMAGES' };
    names.push(name);
  }
  if (new Set(names).size !== names.length) return { error: 'INVALID_IMAGES' };
  return { images: names };
}

/** `undefined` = no viene (no se toca); `null` = vacía; número = entero >= 1; `'INVALID'` = rechazar. */
export function normalizeDuration(
  input: unknown,
): number | null | undefined | 'INVALID' {
  if (input === undefined) return undefined;
  if (input === null || input === '') return null;
  const n =
    typeof input === 'string' && /^\d+$/.test(input.trim())
      ? Number(input)
      : input;
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 ? n : 'INVALID';
}

/** `undefined` = no viene; vacía o solo espacios = `null`. */
export function normalizeLocation(input: unknown): string | null | undefined {
  if (input === undefined) return undefined;
  if (input === null) return null;
  return typeof input === 'string' ? input.trim() || null : null;
}
