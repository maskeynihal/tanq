"use client";

import { User } from "@supabase/supabase-js";
import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

import supabase from "@/utils/supabase/client/supabase";

const fetchSupabaseUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }
  return data.user;
};

interface UseSupabaseUserOptions
  extends UndefinedInitialDataOptions<User, Error, User, string[]> {}

export default function useSupabaseUser(options?: UseSupabaseUserOptions) {
  return useQuery({
    ...(options && options),
    queryFn: fetchSupabaseUser,
    refetchOnWindowFocus: false,
    queryKey: ["supabaseUser"],
  });
}
