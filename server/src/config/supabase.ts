import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabaseAdmin =
  env.STORAGE_PROVIDER === "supabase" && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;
