import {
  checkUrl,
  normalizeUrl,
  normalizeWhatsapp,
  Network,
} from './social.rules';

// Tabla de casos compartida con el admin (spec 007, AC-5).
const urlCase = (network: Network, raw: string) => {
  const url = normalizeUrl(raw);
  return url === null ? null : checkUrl(network, url);
};

describe('normalizeUrl + checkUrl', () => {
  it.each<[Network, string, unknown]>([
    ['instagram', 'instagram.com/x', { value: 'https://instagram.com/x' }],
    [
      'instagram',
      '  https://www.instagram.com/x  ',
      { value: 'https://www.instagram.com/x' },
    ],
    [
      'facebook',
      'HTTP://M.Facebook.com/x',
      { value: 'http://m.facebook.com/x' },
    ],
    ['facebook', 'fb.com/x', { value: 'https://fb.com/x' }],
    [
      'linkedin',
      'mx.linkedin.com/in/x',
      { value: 'https://mx.linkedin.com/in/x' },
    ],
    ['instagram', '', null],
    ['instagram', '   ', null],
    ['instagram', 'facebook.com/x', { error: 'DOMAIN' }],
    ['instagram', 'notinstagram.com/x', { error: 'DOMAIN' }],
    ['instagram', 'instagram.com.evil.io/x', { error: 'DOMAIN' }],
    ['instagram', 'hola', { error: 'FORMAT' }],
    ['instagram', 'hola mundo.com', { error: 'FORMAT' }],
    ['instagram', 'javascript:alert(1)', { error: 'FORMAT' }],
    ['instagram', 'ftp://instagram.com/x', { error: 'FORMAT' }],
  ])('%s %j', (network, raw, expected) => {
    expect(urlCase(network, raw)).toEqual(expected);
  });
});

describe('normalizeWhatsapp', () => {
  it.each([
    ['+52 984-168-1263', { value: '529841681263' }],
    ['(52) 984.168.1263', { value: '529841681263' }],
    ['', { error: 'REQUIRED' }],
    [' + - ', { error: 'REQUIRED' }],
    ['12345', { error: 'LENGTH' }],
    ['12345678', { error: 'LENGTH' }],
    ['1234567890123456', { error: 'LENGTH' }],
    ['52984abc1263', { error: 'LENGTH' }],
  ])('%j', (raw, expected) => {
    expect(normalizeWhatsapp(raw)).toEqual(expected);
  });
});
