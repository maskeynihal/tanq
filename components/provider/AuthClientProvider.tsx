"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { generateSampleData } from "@/lib/sample-data";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { User } from "@supabase/supabase-js";
import LoadingPage from "@/components/ui/LoadingPage";

// type User = {
//   id: string;
//   name: string;
//   email: string;
//   avatar?: string;
//   provider: "google" | "facebook" | "email" | "phone";
// };

type AuthContextType = {
  user: User | undefined;
  isLoading: boolean;
  // login: (provider: string, credentials: any) => Promise<void>;
  // logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: user,
    isFetching,
    isLoading: isLoading,
    isError,
  } = useSupabaseUser();

  useEffect(() => {
    if (isError) {
      router.push("/login");
    }
  }, [isError]);

  useEffect(() => {
    if (user && pathname === "/login") {
      router.push("/");
    }
  }, [user, pathname]);

  if (isLoading || isFetching) {
    return <LoadingPage />;
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
