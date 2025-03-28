"use client";

import type React from "react";
import { User } from "@supabase/supabase-js";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import LoadingPage from "@/components/ui/LoadingPage";
import useCheckSession from "@/hooks/useCheckSession";
import { useRouter, usePathname } from "next/navigation";
import { createContext, useContext, useEffect } from "react";

type AuthContextType = {
  user: User | undefined;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, isFetching } = useCheckSession();

  const isCheckingUserSession = isFetching;

  const hasSession = Boolean(session?.data?.session);

  const {
    data: user,
    isFetching: isUserFetching,
    isError,
  } = useSupabaseUser({
    enabled: hasSession,
  });

  const isLoading = isCheckingUserSession || isUserFetching;

  useEffect(() => {
    if (isError) {
      router.push("/login");
    }
  }, [isError, router]);

  useEffect(() => {
    if (user && pathname === "/login") {
      router.push("/");
    }
  }, [user, pathname, router]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (user && pathname === "/login") {
    return <LoadingPage message="Redirecting to your page..." />;
  }

  if (!session && pathname !== "/login") {
    return <LoadingPage message="Redirecting to login page..." />;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
