import { useLoaderData } from "react-router";
import type { Route } from "./+types/signals";
import type { SignalFeed } from "@aihot/contracts/signals";
import { cachedPage, loadOr404, pageHeaders } from "../lib/api.server";
import { pageMeta } from "../lib/seo";
import { pageReuse } from "../lib/page-reuse";
import type { Screen } from "../components/shell/screens";

export const handle: Screen = { tab: "signals", name: "Signals" };
export const headers = pageHeaders;
export const { clientLoader, shouldRevalidate } = pageReuse<typeof loader>();

export async function loader({ request }: Route.LoaderArgs) {
  const upstream = new Headers();
  const feed = await loadOr404<SignalFeed>("/api/site/signals", { signal: request.signal, responseHeaders: upstream });
  return cachedPage(30, { feed }, upstream);
}
export function meta({ loaderData }: Route.MetaArgs) {
  const hasItems = (loaderData?.feed.items.length ?? 0) > 0;
  return pageMeta({
    title: "AI Signals for Marketers",
    description: "Human-selected AI marketing workflows, useful experiments, and credible resources. Our commentary links back to every original creator.",
    path: "/signals", noindex: !hasItems,
  });
}
export default function SignalsPage() {
  const { feed } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-[860px] px-4 pb-24 pt-7 sm:px-6 lg:pt-10">
      <header className="mb-8">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.19em] text-accent">AI Marketer Signal</div>
        <h1 className="text-[31px] font-bold tracking-tight text-ink sm:text-[42px]">Signals, not noise.</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-3">
          Useful AI marketing workflows, practical experiments, and resources worth opening.
          Every entry is individually reviewed, explicitly released, and links to its original source.
        </p>
        <a className="mt-4 inline-flex text-[13px] font-medium text-accent hover:underline" href="/feed/signals.xml">
          Subscribe to curated Signals RSS →
        </a>
      </header>
      {feed.items.length === 0 ? (
        <section className="rounded-panel border border-line bg-surface p-8 text-center">
          <h2 className="text-[18px] font-semibold text-ink">The editorial queue is being reviewed.</h2>
          <p className="mt-2 text-[14px] text-ink-3">No sources have been released yet. We publish fewer, more useful links rather than republishing everything we collect.</p>
        </section>
      ) : (
        <div className="space-y-4">
          {feed.items.map(item => (
            <article key={item.id} className="rounded-panel bg-surface px-5 py-5 ring-1 ring-line sm:px-7">
              <div className="mb-3 flex flex-wrap items-center gap-3 text-[12px] text-ink-4">
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-medium text-accent">Editor selected</span>
                <span>{item.sourceName}</span>
                <time dateTime={item.releasedAt}>{new Date(item.releasedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</time>
              </div>
              <h2 className="text-[19px] font-semibold leading-snug text-ink sm:text-[21px]">
                <a className="hover:text-accent" href={item.originalUrl} target="_blank" rel="noopener noreferrer">{item.title}</a>
              </h2>
              <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.8] text-ink-2">{item.summary}</p>
              <a className="mt-4 inline-flex break-all text-[13px] font-medium text-accent hover:underline" href={item.originalUrl} target="_blank" rel="noopener noreferrer">Read the original source →</a>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
