import { useQuery } from "@tanstack/react-query";
import supabase from "@/utils/supabase/client/supabase";

async function getSession() {
  const session = await supabase.auth.getSession();

  return session;
}

export default function useCheckSession() {
  return useQuery({
    queryKey: ["supabaseSession"],
    queryFn: getSession,
    staleTime: Infinity,
    throwOnError: true,
  });
}
