import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/marketing-home";
import type { SignalFeed } from "@aihot/contracts/signals";
import { SITE } from "@aihot/site";
import { PLAYBOOK_TRACKS } from "@aihot/site/playbooks";
import { PLAYBOOKS } from "../content/playbooks";
import { cachedPage, loadOr404 } from "../lib/api.server";
import { pageReuse } from "../lib/page-reuse";
import { pageMeta, organizationLd, siteUrl } from "../lib/seo";
import type { Screen } from "../components/shell/screens";

export const handle: Screen = { tab: "featured", name: "Home" };
export { pageHeaders as headers } from "../lib/api.server";
export const { clientLoader, shouldRevalidate } = pageReuse<typeof loader>();

export async function loader({ request }: Route.LoaderArgs) {
  const upstream = new Headers();
  const signals = await loadOr404<SignalFeed>("/api/site/signals", { signal: request.signal, responseHeaders: upstream });
  return cachedPage(30, { signals }, upstream);
}
export function meta() {
  return pageMeta({ path: "/", jsonLd: [organizationLd(), { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: siteUrl(), inLanguage: "en-US", description: SITE.description }] });
}
export default function MarketingHome() {
  const { signals } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-[1130px] px-4 pb-24 pt-8 sm:px-6 lg:pt-12">
      <div className="grid gap-10 border-b border-line pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14 lg:pb-20">
        <section>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-[12px] font-semibold text-accent">
            <span className="size-2 rounded-full bg-accent" />
            Practical AI for makers and lean teams
          </div>
          <h1 className="max-w-[760px] text-[40px] font-bold leading-[1.09] tracking-[-0.05em] text-ink sm:text-[58px] lg:text-[65px]">
            Build. Grow.<br/><span className="text-accent">Automate.</span>
          </h1>
          <p className="mt-6 max-w-[630px] text-[16px] leading-[1.85] text-ink-3 sm:text-[18px]">
            Practical AI workflows to ship products, find customers and run small teams more efficiently.
            Real tasks, source-linked steps and clear limitations—not another tool directory or recycled news feed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/playbooks" className="inline-flex items-center rounded-control bg-ink px-5 py-3 text-[14px] font-semibold text-bg hover:opacity-85">Explore Playbooks →</Link>
            <Link to="/signals" className="inline-flex items-center rounded-control bg-surface px-5 py-3 text-[14px] font-semibold text-ink ring-1 ring-line-strong hover:bg-bg-sunk">Read Signals</Link>
          </div>
          <p className="mt-5 text-[12px] leading-relaxed text-ink-4">For indie developers, creators and small teams · Original sources linked · Editorial review before public release</p>
        </section>
        <aside className="self-center rounded-panel bg-surface p-6 ring-1 ring-line sm:p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.19em] text-ink-4">START WITH THE JOB TO BE DONE</p>
          <h2 className="mt-4 text-[24px] font-semibold leading-snug text-ink">Find the next useful workflow.</h2>
          <div className="mt-6 space-y-5">
            {[
              ["01","Build","Ship a small AI-assisted site, automate code reviews, or prototype an agent."],
              ["02","Grow","Find search demand, improve distribution and repurpose original content."],
              ["03","Automate","Connect repeatable research, reporting and operations without losing human control."],
            ].map(([n,title,desc])=>(
              <div key={n} className="flex gap-3">
                <span className="font-mono text-[13px] font-semibold text-accent">{n}</span>
                <div><h3 className="text-[14px] font-semibold text-ink">{title}</h3><p className="mt-1 text-[13px] leading-[1.7] text-ink-3">{desc}</p></div>
              </div>
            ))}
          </div>
          <Link to="/newsletter" className="mt-7 inline-flex text-[13px] font-semibold text-accent hover:underline">About the biweekly Digest →</Link>
        </aside>
      </div>
      <section className="py-12 lg:py-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent">USEFUL, REPRODUCIBLE WORK</p>
            <h2 className="mt-2 text-[27px] font-bold tracking-tight text-ink sm:text-[32px]">Guides for real work</h2>
            <p className="mt-2 text-[14px] text-ink-3">Browse tasks across Build, Grow and Automate. Practical steps and verification before hype.</p>
          </div>
          <Link to="/playbooks" className="text-[13px] font-semibold text-accent hover:underline">All Playbooks →</Link>
        </div>
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {PLAYBOOK_TRACKS.map(t => (
            <Link key={t.key} to={`/playbooks?track=${t.key}`} className="rounded-panel bg-bg-sunk p-4 ring-1 ring-line hover:bg-surface">
              <h3 className="text-[18px] font-bold text-ink">{t.title} →</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-3">{t.description}</p>
              <span className="mt-3 inline-block text-[12px] font-medium text-accent">{PLAYBOOKS.filter(p => p.track === t.key).length} starter guides</span>
            </Link>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PLAYBOOKS.slice(0, 6).map(p=>(
            <article key={p.slug} className="flex flex-col rounded-panel bg-surface p-5 ring-1 ring-line">
              <p className="text-[12px] font-medium text-accent">{p.track} · {p.category}</p>
              <h3 className="mt-3 text-[19px] font-semibold leading-[1.35] text-ink">
                <Link to={`/playbooks/${p.slug}`} className="hover:text-accent">{p.title}</Link>
              </h3>
              <p className="mt-3 flex-1 text-[13px] leading-[1.8] text-ink-3">{p.description}</p>
              <p className="mt-5 text-[11px] text-ink-4">Source-led guide · Not independently tested</p>
              <Link to={`/playbooks/${p.slug}`} className="mt-3 text-[13px] font-semibold text-accent hover:underline">Open guide →</Link>
            </article>
          ))}
        </div>
      </section>
      <section className="border-t border-line py-12 lg:py-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent">FROM THE EDITORIAL DESK</p>
            <h2 className="mt-2 text-[27px] font-bold tracking-tight text-ink sm:text-[32px]">Recent AI Signals</h2>
            <p className="mt-2 text-[14px] text-ink-3">Every publicly listed Signal is checked and deliberately released.</p>
          </div>
          <Link to="/signals" className="text-[13px] font-semibold text-accent hover:underline">Browse all Signals →</Link>
        </div>
        {signals.items.length === 0 ? (
          <div className="rounded-panel bg-bg-sunk p-7">
            <h3 className="text-[16px] font-semibold text-ink">The first Signals are in editorial review.</h3>
            <p className="mt-2 text-[14px] leading-[1.8] text-ink-3">We keep unverified source posts off the public site. In the meantime, explore the source-linked Playbooks above.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {signals.items.slice(0,4).map(item=>(
              <article key={item.id} className="rounded-panel bg-surface p-5 ring-1 ring-line">
                <p className="text-[12px] text-ink-4">{item.sourceName} · {new Date(item.releasedAt).toLocaleDateString("en-US")}</p>
                <h3 className="mt-2 text-[18px] font-semibold text-ink"><a href={item.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{item.title}</a></h3>
                <p className="mt-3 text-[13px] leading-[1.8] text-ink-3">{item.summary}</p>
                <a className="mt-3 inline-flex text-[13px] font-medium text-accent hover:underline" href={item.originalUrl} target="_blank" rel="noopener noreferrer">View original source →</a>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="rounded-panel bg-bg-sunk px-6 py-9 sm:px-10 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.17em] text-accent">THE SIGNAL DIGEST</p>
            <h2 className="mt-3 text-[27px] font-bold tracking-tight text-ink sm:text-[34px]">Stay useful without chasing every AI headline.</h2>
            <p className="mt-3 text-[14px] leading-[1.8] text-ink-3">A focused biweekly selection of product-building, growth and automation workflows, with links to the original sources.</p>
          </div>
          <Link to="/newsletter" className="inline-flex shrink-0 rounded-control bg-ink px-5 py-3 text-[14px] font-semibold text-bg hover:opacity-85">Explore the Digest →</Link>
        </div>
      </section>
      <p className="mt-10 text-center text-[12px] text-ink-4">{SITE.name} · Independent editorial research. External articles remain with their creators.</p>
    </main>
  );
}
