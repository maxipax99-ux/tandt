import type { ReactNode } from "react";

export interface FaqItem {
  q: string;
  a: ReactNode;
}

/** Native <details> disclosure: keyboard and screen-reader friendly, zero JavaScript. */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {items.map((item) => (
        <details key={item.q} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
            <span>{item.q}</span>
            <span aria-hidden="true" className="text-accent transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="mt-3 text-muted">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
