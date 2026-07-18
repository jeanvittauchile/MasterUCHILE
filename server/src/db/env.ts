function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

export const env = {
  get SUPABASE_URL() {
    return required('SUPABASE_URL');
  },
  get SUPABASE_ANON_KEY() {
    return required('SUPABASE_ANON_KEY');
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return required('SUPABASE_SERVICE_ROLE_KEY');
  },
  get SUPABASE_JWT_SECRET() {
    return required('SUPABASE_JWT_SECRET');
  },
  get CORS_ORIGIN() {
    return process.env.CORS_ORIGIN ?? '*';
  },
  get PORT() {
    return process.env.PORT ?? '3001';
  },
};
