const STEPS = [
  { title: "Order & share", body: "Pick your service and fill in a short questionnaire about the person and the moment." },
  { title: "Talk it through", body: "A 15-minute call so we can hear the stories in your own words." },
  { title: "Receive your words", body: "Get a complete draft, request edits, and receive the final version ready to read." },
];

export function ThreeSteps() {
  return (
    <ol className="grid gap-6 sm:grid-cols-3">
      {STEPS.map((step, i) => (
        <li key={step.title} className="rounded-2xl border border-line bg-surface p-6">
          <span className="font-serif text-4xl text-accent" aria-hidden="true">{i + 1}</span>
          <h3 className="mt-2 text-xl font-semibold">
            <span className="sr-only">Step {i + 1}: </span>
            {step.title}
          </h3>
          <p className="mt-2 text-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
