export type Network = 'facebook' | 'instagram' | 'linkedin';
export type SocialError =
  | 'FORMAT'
  | 'DOMAIN'
  | 'REQUIRED'
  | 'LENGTH'
  | 'VISIBLE_WITHOUT_URL';
export type Result = { value: string } | { error: SocialError };

export const NETWORKS: Network[] = ['facebook', 'instagram', 'linkedin'];

const DOMAINS: Record<Network, string[]> = {
  facebook: ['facebook.com', 'fb.com'],
  instagram: ['instagram.com'],
  linkedin: ['linkedin.com'],
};

/** Quita espacios; vacío => null; sin http(s):// le antepone https://. */
export function normalizeUrl(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/** Valida una URL ya normalizada contra los dominios de la red y devuelve `url.href`. */
export function checkUrl(network: Network, url: string): Result {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { error: 'FORMAT' };
  }
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    !parsed.hostname.includes('.')
  ) {
    return { error: 'FORMAT' };
  }
  const host = parsed.hostname.toLowerCase().replace(/^(www\.|m\.)+/, '');
  const ok = DOMAINS[network].some((d) => host === d || host.endsWith(`.${d}`));
  return ok ? { value: parsed.href } : { error: 'DOMAIN' };
}

/** Deja solo dígitos (11 a 15). */
export function normalizeWhatsapp(raw: string): Result {
  const digits = raw.replace(/[\s\-+().]/g, '');
  if (!digits) return { error: 'REQUIRED' };
  return /^\d{11,15}$/.test(digits) ? { value: digits } : { error: 'LENGTH' };
}
