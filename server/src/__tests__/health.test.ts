import request from 'supertest';
import { createApp } from '../app';

describe('GET /health', () => {
  it('responds ok without touching Supabase', async () => {
    const res = await request(createApp()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('auth middleware', () => {
  it('rejects requests without a bearer token', async () => {
    const res = await request(createApp()).get('/swimmers');
    expect(res.status).toBe(401);
  });

  it('rejects a malformed token', async () => {
    const res = await request(createApp()).get('/swimmers').set('Authorization', 'Bearer not-a-real-jwt');
    expect(res.status).toBe(401);
  });
});

describe('jwt round-trip', () => {
  it('signs a token that authenticate() accepts and reads app_role from it', async () => {
    const { signAppToken } = await import('../services/jwt.service');
    const token = signAppToken('11111111-1111-1111-1111-111111111111', 'coach');
    // /swimmers requires role coach; a valid coach token should get past auth+role checks and only
    // fail later trying to reach Supabase (which isn't running in this unit test) — proves the JWT
    // signing/verification/RLS-claim wiring is correct without needing a live database.
    const res = await request(createApp()).get('/swimmers').set('Authorization', `Bearer ${token}`);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  }, 15000);
});
