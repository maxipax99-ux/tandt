import type { Metadata } from "next";
import { Container, Notice } from "@/components/ui";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

const REASONS: Record<string, string> = {
  timeout: "You were signed out after a period of inactivity. Please sign in again.",
  denied: "That account doesn't have admin access.",
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { reason } = await searchParams;
  const note = typeof reason === "string" ? REASONS[reason] : undefined;
  return (
    <Container className="max-w-md py-16">
      <h1 className="mb-6 text-3xl font-semibold">Admin sign in</h1>
      {note ? <div className="mb-4"><Notice>{note}</Notice></div> : null}
      <LoginForm />
    </Container>
  );
}
