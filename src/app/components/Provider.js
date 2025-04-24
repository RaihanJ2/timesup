"use client";
import { SessionProvider } from "next-auth/react";

export const Providers = ({ session, children }) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};
