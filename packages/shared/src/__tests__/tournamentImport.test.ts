import { parseTournamentImportLine } from '../domain/tournamentImport';

describe('parseTournamentImportLine', () => {
  it('parses a simple single-day line with "de" before the month', () => {
    expect(parseTournamentImportLine('28 de Marzo : XXII COPPA ITALIA MASTER', 2026)).toEqual({
      nombre: 'XXII COPPA ITALIA MASTER',
      fecha: '2026-03-28',
      fechaFin: null,
      prioritario: false,
    });
  });

  it('parses a single-day line without "de" and detects "(prioritario)"', () => {
    expect(parseTournamentImportLine('16 mayo :  XIII PEÑALOLEN MASTER (prioritario )', 2026)).toEqual({
      nombre: 'XIII PEÑALOLEN MASTER',
      fecha: '2026-05-16',
      fechaFin: null,
      prioritario: true,
    });
  });

  it('parses a date range "DD-DD Mes" with no space before the colon', () => {
    expect(parseTournamentImportLine('24-26 Julio:  Nacional Master Invierno FECHIDA (Prioritario ).', 2026)).toEqual({
      nombre: 'Nacional Master Invierno FECHIDA',
      fecha: '2026-07-24',
      fechaFin: '2026-07-26',
      prioritario: true,
    });
  });

  it('parses a line with an explicit year and no colon separator at all', () => {
    expect(parseTournamentImportLine('6-9 Enero 2027 XXI NACIONAL MÁSTER FCHMN (Prioritario )', 2026)).toEqual({
      nombre: 'XXI NACIONAL MÁSTER FCHMN',
      fecha: '2027-01-06',
      fechaFin: '2027-01-09',
      prioritario: true,
    });
  });

  it('parses a "Prioritario Regional" variant, still flags prioritario', () => {
    expect(parseTournamentImportLine('4-6 Diciembre :   Natación Sin Frontera ARICA (Prioritario Regional )', 2026)).toEqual({
      nombre: 'Natación Sin Frontera ARICA',
      fecha: '2026-12-04',
      fechaFin: '2026-12-06',
      prioritario: true,
    });
  });

  it('parses a non-priority line with trailing period and extra spacing before the colon', () => {
    expect(parseTournamentImportLine('21-27 octubre  : CAMPEONATO PANAMERICANO MASTER BUENOS AIRES', 2026)).toEqual({
      nombre: 'CAMPEONATO PANAMERICANO MASTER BUENOS AIRES',
      fecha: '2026-10-21',
      fechaFin: '2026-10-27',
      prioritario: false,
    });
  });

  it('parses zero-padded days', () => {
    expect(parseTournamentImportLine('05 Septiembre :  VII COPA ARAUCANÍA DE NATACIÓN MASTER', 2026)).toEqual({
      nombre: 'VII COPA ARAUCANÍA DE NATACIÓN MASTER',
      fecha: '2026-09-05',
      fechaFin: null,
      prioritario: false,
    });
  });

  it('strips a trailing period left over after removing the priority marker', () => {
    const result = parseTournamentImportLine('17 Octubre :  IX VERSIÓN AGUAS ABIERTAS MASTER. (Prioritario)', 2026);
    expect(result?.nombre).toBe('IX VERSIÓN AGUAS ABIERTAS MASTER');
    expect(result?.prioritario).toBe(true);
  });

  it('rejects blank lines and unparseable garbage', () => {
    expect(parseTournamentImportLine('', 2026)).toBeNull();
    expect(parseTournamentImportLine('   ', 2026)).toBeNull();
    expect(parseTournamentImportLine('esto no es una fecha', 2026)).toBeNull();
    expect(parseTournamentImportLine('32 Enero: Fecha invalida', 2026)).toBeNull();
  });

  it('parses the full real calendar pasted by the coach without dropping any line', () => {
    const lines = [
      '28 de Marzo : XXII COPPA ITALIA MASTER',
      '16 mayo :  XIII PEÑALOLEN MASTER (prioritario )',
      '30 mayo : VII COPA SMART SWIM',
      '13 Junio :  VI COPA SANTIAGO DEPORTE ( Prioritario ).',
      '4 Julio :  X COPA MASTER SAN BERNARDO.',
      '24-26 Julio:  Nacional Master Invierno FECHIDA (Prioritario ).',
      '8 Agosto :  IV COPA DEL MAULE',
      '22 Agosto :  VI COPA MASTER LQBLO (Prioritario)',
      '05 Septiembre :  VII COPA ARAUCANÍA DE NATACIÓN MASTER',
      '03-04 octubre :   XVI COPA ESPAÑA MASTER',
      '17 Octubre :  IX VERSIÓN AGUAS ABIERTAS MASTER. (Prioritario)',
      '21-27 octubre  : CAMPEONATO PANAMERICANO MASTER BUENOS AIRES',
      '24 Octubre :  XIV COPA 4 ESTILOS MASTER PROVIDENCIA',
      '07 noviembre :  V COPA UC MASTER',
      '4-6 Diciembre :   Natación Sin Frontera ARICA (Prioritario Regional )',
      '12 Diciembre :  XII COPA NATACIÓN RECOLETA (Prioritario )',
      '6-9 Enero 2027 XXI NACIONAL MÁSTER FCHMN (Prioritario )',
    ];
    const parsed = lines.map((l) => parseTournamentImportLine(l, 2026));
    expect(parsed.every((p) => p !== null)).toBe(true);
    expect(parsed).toHaveLength(17);
    expect(parsed.filter((p) => p!.prioritario)).toHaveLength(8);
    expect(parsed.filter((p) => p!.fechaFin)).toHaveLength(5);
    // último, con año explícito distinto al default
    expect(parsed[16]).toMatchObject({ fecha: '2027-01-06', fechaFin: '2027-01-09' });
  });
});
