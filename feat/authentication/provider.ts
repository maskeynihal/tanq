import { supabase } from "@/utils/supabase/client/supabase";

async function signInWithGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
  });
}
