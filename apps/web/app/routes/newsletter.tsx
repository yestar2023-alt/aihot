import { useLoaderData } from "react-router";
import { pageMeta } from "../lib/seo";
import type { Route } from "./+types/newsletter";
import type { Screen } from "../components/shell/screens";

export const handle: Screen = { tab: "me", name: "The Digest" };

/** An actual Buttondown account is required; never invent a subscriber or claim delivery. */
function validatedButtondownUsername(input: string | undefined): string | null {
  const candidate = input?.trim() ?? "";
  return /^[a-zA-Z0-9_-]{3,40}$/.test(candidate) ? candidate : null;
}
export async function loader() {
  const username = validatedButtondownUsername(process.env.BUTTONDOWN_USERNAME);
  return { username };
}
export const headers: Route.HeadersFunction = () => ({ "Cache-Control": "no-store" });
export function meta() {
  return pageMeta({
    title: "The Signal Digest — AI Marketing Newsletter", path: "/newsletter",
    description: "A focused biweekly roundup of AI marketing workflows, useful experiments and source-linked guides. No daily hype.",
  });
}
export default function Newsletter() {
  const { username } = useLoaderData<typeof loader>();
  const action = username ? `https://buttondown.com/api/emails/embed-subscribe/${username}` : null;
  return (
    <main className="mx-auto max-w-[900px] px-4 pb-24 pt-10 sm:px-6 lg:pt-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.19em] text-accent">THE SIGNAL DIGEST</p>
        <h1 className="mt-4 text-[36px] font-bold leading-tight tracking-tight text-ink sm:text-[50px]">One useful AI marketing email. Every two weeks.</h1>
        <p className="mt-5 text-[16px] leading-[1.85] text-ink-3">A few credible workflow ideas, practical marketing automations, and the original links behind them. Built for people who actually have campaigns to run.</p>
      </div>
      <section className="mx-auto mt-10 max-w-xl rounded-panel bg-surface p-6 ring-1 ring-line sm:p-8">
        {action ? (
          <>
            <h2 className="text-[18px] font-semibold text-ink">Join the free Digest</h2>
            <p className="mt-2 text-[13px] text-ink-3">Your email is handled by our newsletter provider, Buttondown. Follow the provider's confirmation steps if requested.</p>
            <form action={action} method="POST" className="mt-5 space-y-4">
              <label className="block text-[13px] font-medium text-ink-2" htmlFor="newsletter-email">Email address</label>
              <input id="newsletter-email" type="email" name="email" placeholder="you@company.com" autoComplete="email" required maxLength={254}
                className="w-full rounded-control bg-bg px-4 py-3 text-[15px] text-ink ring-1 ring-line-strong outline-none focus:ring-2 focus:ring-accent" />
              <input type="hidden" name="embed" value="1" />
              <button type="submit" className="w-full rounded-control bg-ink px-4 py-3 text-[14px] font-semibold text-bg hover:opacity-85">Subscribe for free</button>
            </form>
            <p className="mt-4 text-[12px] leading-[1.8] text-ink-4">Unsubscribe through the email provider's unsubscribe link. By subscribing, you agree to receive this newsletter and to the provider processing your email. <a className="text-accent underline" target="_blank" rel="noopener noreferrer" href="https://docs.buttondown.com/portal">Manage your subscription</a>.</p>
          </>
        ) : (
          <>
            <h2 className="text-[18px] font-semibold text-ink">The Digest is being set up</h2>
            <p className="mt-3 text-[14px] leading-[1.85] text-ink-3">The subscription provider has not been connected yet. We will not collect email addresses on this site until a verified mailing list and unsubscribe flow exist.</p>
            <a href="/feed/signals.xml" className="mt-5 inline-block text-[14px] font-semibold text-accent underline">Follow the curated RSS feed instead →</a>
          </>
        )}
      </section>
      <section className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
        {[
          ["What works", "Actionable workflows and real marketing tasks, not generic AI headlines."],
          ["What changed", "Material tool/API updates that affect your process or costs."],
          ["What to try", "Links to practical playbooks, templates and original documentation."],
        ].map(([title,copy]) => (
          <div key={title} className="rounded-panel bg-bg-sunk p-5">
            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-[13px] leading-[1.75] text-ink-3">{copy}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
