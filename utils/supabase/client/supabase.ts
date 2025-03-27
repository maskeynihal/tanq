import { createBrowserClient } from "@supabase/ssr";

import { CLIENT_ENV } from "@/config/env";

export function createClient() {
  return createBrowserClient(
    CLIENT_ENV.supabase.url,
    CLIENT_ENV.supabase.anonKey
  );
}

const supabase = createClient();

export default supabase;
