import {
  MAX_TOUR_IMAGES,
  normalizeDuration,
  normalizeImages,
  normalizeLocation,
} from './tours.rules';

describe('normalizeImages', () => {
  it('acepta nombres y rutas /uploads/ y conserva el orden', () => {
    expect(normalizeImages(['a.jpg', '/uploads/b.PNG', '3f2a-1.webp'])).toEqual(
      {
        images: ['a.jpg', 'b.PNG', '3f2a-1.webp'],
      },
    );
    expect(normalizeImages([])).toEqual({ images: [] });
  });

  it('rechaza más de 8 con TOO_MANY_IMAGES', () => {
    const nine = Array.from(
      { length: MAX_TOUR_IMAGES + 1 },
      (_, i) => `f${i}.jpg`,
    );
    expect(normalizeImages(nine)).toEqual({ error: 'TOO_MANY_IMAGES' });
    expect('error' in normalizeImages(nine.slice(0, 8))).toBe(false);
  });

  it.each([
    ['no es arreglo', 'a.jpg'],
    ['elemento no string', [1]],
    ['ruta con ..', ['../a.jpg']],
    ['nombre con ..', ['a..jpg']],
    ['subcarpeta', ['x/a.jpg']],
    ['otra ruta', ['/etc/a.jpg']],
    ['extensión no permitida', ['a.svg']],
    ['sin extensión', ['a']],
    ['espacios', ['a b.jpg']],
    ['repetidos', ['a.jpg', '/uploads/a.jpg']],
    ['vacío', ['']],
  ])('rechaza con INVALID_IMAGES: %s', (_n, input) => {
    expect(normalizeImages(input)).toEqual({ error: 'INVALID_IMAGES' });
  });
});

describe('normalizeDuration', () => {
  it.each([
    [undefined, undefined],
    [null, null],
    ['', null],
    [60, 60],
    ['90', 90],
  ])('%p -> %p', (input, out) => expect(normalizeDuration(input)).toBe(out));

  it.each([0, -5, 1.5, 'abc', '0', '1.5', true, NaN, {}])(
    '%p -> INVALID',
    (input) => {
      expect(normalizeDuration(input)).toBe('INVALID');
    },
  );
});

describe('normalizeLocation', () => {
  it.each([
    [undefined, undefined],
    [null, null],
    ['', null],
    ['   ', null],
    [' Cancún ', 'Cancún'],
  ])('%p -> %p', (input, out) => expect(normalizeLocation(input)).toBe(out));
});
