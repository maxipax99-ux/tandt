import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-5xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

const buttonBase =
  "inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2.5 text-base font-medium transition-colors";

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: "primary" | "secondary" }) {
  const styles =
    variant === "primary"
      ? "bg-accent text-accent-ink hover:opacity-90"
      : "border border-accent text-accent hover:bg-accent-soft";
  return <Link className={`${buttonBase} ${styles} ${className}`} {...props} />;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "danger" }) {
  const styles = {
    primary: "bg-accent text-accent-ink hover:opacity-90",
    secondary: "border border-accent text-accent hover:bg-accent-soft",
    danger: "bg-red-800 text-white hover:bg-red-900",
  }[variant];
  return (
    <button
      className={`${buttonBase} ${styles} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}

export function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: ReactNode }) {
  return (
    <header className="pb-8 pt-12 sm:pt-16">
      <Container>
        {eyebrow ? <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted">{eyebrow}</p> : null}
        <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
        {intro ? <div className="mt-4 max-w-2xl text-lg text-muted">{intro}</div> : null}
      </Container>
    </header>
  );
}

export function Section({
  title,
  children,
  className = "",
  id,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section className={`py-10 sm:py-14 ${className}`} aria-labelledby={title ? headingId : undefined} id={id}>
      <Container>
        {title ? (
          <h2 id={headingId} className="mb-6 text-3xl font-semibold">
            {title}
          </h2>
        ) : null}
        {children}
      </Container>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface p-6 ${className}`}>{children}</div>;
}

/** Visible reminder on every legal page. Remove once a lawyer has reviewed the text. */
export function LawyerReviewBanner() {
  return (
    <div role="note" className="mb-8 rounded-lg border-2 border-dashed border-amber-700 bg-amber-50 p-4 text-amber-950">
      <strong>TODO for owner:</strong> Have a lawyer review before launch. This page is a plain-English starting
      point, not legal advice.
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: ReactNode }) {
  const styles = {
    info: "border-line bg-surface",
    error: "border-red-700 bg-red-50 text-red-900",
    success: "border-green-700 bg-green-50 text-green-900",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-lg border p-4 ${styles}`}>
      {children}
    </div>
  );
}
