import fp from 'fastify-plugin';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient | null;
  }
}

export const supabasePlugin = fp(async (app) => {
  const supabaseUrl = process.env['SUPABASE_URL'] ?? 'https://grzlzvidmccrjpqxpbcf.supabase.co';
  const supabaseKey =
    process.env['SUPABASE_SERVICE_ROLE_KEY'] ??
    process.env['SUPABASE_ANON_KEY'] ??
    'sb_publishable_LqvKiqZbZ8JIulChcktqug_aQVtzVvb';

  if (!supabaseUrl || !supabaseKey) {
    app.log.warn('Supabase URL or Key not configured; Supabase client disabled.');
    app.decorate('supabase', null);
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    app.decorate('supabase', supabase);
    app.log.info({ supabaseUrl }, 'Connected to Supabase Cloud Client');
  } catch (err) {
    app.log.error({ err }, 'Failed to initialize Supabase Cloud Client');
    app.decorate('supabase', null);
  }
});
