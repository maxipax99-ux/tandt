/** Shows the intake-call booking page (Cal.com / Calendly) inline, with a plain link as a fallback. */
export function BookingEmbed({ url }: { url: string }) {
  let embeddable = false;
  try {
    const host = new URL(url).hostname;
    embeddable = ["cal.com", "app.cal.com", "calendly.com"].includes(host);
  } catch {
    return null;
  }
  return (
    <div className="space-y-4">
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 py-2.5 font-medium text-accent-ink">
        Book your 15-minute call<span className="sr-only"> (opens in a new tab)</span>
      </a>
      {embeddable ? (
        <iframe
          src={url}
          title="Book your intake call"
          className="h-[700px] w-full rounded-2xl border border-line bg-white"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : null}
    </div>
  );
}
