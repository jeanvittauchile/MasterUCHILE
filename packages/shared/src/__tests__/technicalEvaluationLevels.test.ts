import { levelForSalida, levelForViraje } from '../domain/technicalEvaluationLevels';

describe('levelForSalida', () => {
  it('classifies a crol time squarely inside the AR range', () => {
    expect(levelForSalida('crol', 5.6)).toBe('AR');
  });

  it('classifies a crol time squarely inside the A range', () => {
    expect(levelForSalida('crol', 6.5)).toBe('A');
  });

  it('treats a boundary value as belonging to the faster level', () => {
    expect(levelForSalida('crol', 6)).toBe('AR');
    expect(levelForSalida('crol', 7)).toBe('A');
  });

  it('classifies a time faster than the whole AR range as AR', () => {
    expect(levelForSalida('crol', 4)).toBe('AR');
  });

  it('classifies a time slower than the whole P range as P', () => {
    expect(levelForSalida('crol', 20)).toBe('P');
  });

  it('uses a different table per stroke', () => {
    expect(levelForSalida('pecho', 10)).toBe('P');
    expect(levelForSalida('mariposa', 10)).toBe('P');
  });
});

describe('levelForViraje', () => {
  it('classifies same-stroke turns using that stroke\'s own viraje table', () => {
    expect(levelForViraje('crol_crol', 8)).toBe('AR');
    expect(levelForViraje('espalda_espalda', 8.5)).toBe('AR');
  });

  it('classifies transition turns using the combined-turn reference table', () => {
    expect(levelForViraje('mariposa_espalda', 8)).toBe('AR');
    expect(levelForViraje('pecho_crol', 13)).toBe('P');
  });
});
