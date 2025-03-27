import { z } from "zod";

const CLIENT_ENV_TYPE = z.object({
  supabase: z.object({
    url: z.string(),
    anonKey: z.string(),
  }),
});

export const CLIENT_ENV = CLIENT_ENV_TYPE.parse({
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
});
