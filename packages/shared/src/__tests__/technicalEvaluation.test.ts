import { createTechnicalEvaluationSchema, createBulkTechnicalEvaluationSchema } from '../schemas/technicalEvaluation.schema';

const attempt = { numeroIntento: 1, tiempo: '12.5', brazadas: 3 };

describe('createTechnicalEvaluationSchema', () => {
  it('rejects salida without estilo', () => {
    const result = createTechnicalEvaluationSchema.safeParse({ tipo: 'salida', attempts: [attempt] });
    expect(result.success).toBe(false);
  });

  it('rejects viraje without combinacion', () => {
    const result = createTechnicalEvaluationSchema.safeParse({ tipo: 'viraje', attempts: [attempt] });
    expect(result.success).toBe(false);
  });

  it('rejects viraje with estilo set instead of combinacion', () => {
    const result = createTechnicalEvaluationSchema.safeParse({
      tipo: 'viraje',
      estilo: 'crol',
      attempts: [attempt],
    });
    expect(result.success).toBe(false);
  });

  it('accepts salida with a valid estilo', () => {
    const result = createTechnicalEvaluationSchema.safeParse({
      tipo: 'salida',
      estilo: 'mariposa',
      attempts: [attempt],
    });
    expect(result.success).toBe(true);
  });

  it('accepts viraje with a valid combinacion', () => {
    const result = createTechnicalEvaluationSchema.safeParse({
      tipo: 'viraje',
      combinacion: 'mariposa_espalda',
      attempts: [attempt],
    });
    expect(result.success).toBe(true);
  });
});

describe('createBulkTechnicalEvaluationSchema', () => {
  it('rejects an empty entries list', () => {
    const result = createBulkTechnicalEvaluationSchema.safeParse({
      tipo: 'salida',
      estilo: 'crol',
      entries: [],
    });
    expect(result.success).toBe(false);
  });

  it('accepts multiple swimmers sharing one combinacion', () => {
    const result = createBulkTechnicalEvaluationSchema.safeParse({
      tipo: 'viraje',
      combinacion: 'pecho_crol',
      entries: [
        { swimmerId: '11111111-1111-1111-1111-111111111111', attempts: [attempt] },
        { swimmerId: '22222222-2222-2222-2222-222222222222', attempts: [attempt] },
      ],
    });
    expect(result.success).toBe(true);
  });
});
