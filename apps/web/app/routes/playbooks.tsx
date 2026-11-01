import { Link, useSearchParams } from "react-router";
import { PLAYBOOKS, PLAYBOOK_TRACKS } from "@aihot/site/playbooks";
import { pageMeta } from "../lib/seo";
import { edgeTtl } from "../lib/api.server";
import type { Screen } from "../components/shell/screens";

export const handle: Screen = { tab: "playbooks", name: "Playbooks" };
export const headers = () => edgeTtl(300);
export function meta() {
  return pageMeta({
    path: "/playbooks", title: "AI Workflows: Build, Grow & Automate",
    description: "Practical Build, Grow and Automate workflow guides for independent developers, creators and small teams.",
  });
}
export default function PlaybookIndex() {
  const [params] = useSearchParams();
  const active = PLAYBOOK_TRACKS.find(t => t.key === params.get("track"))?.key ?? "All";
  const visible = active === "All" ? PLAYBOOKS : PLAYBOOKS.filter(p => p.track === active);
  return (
    <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-8 sm:px-6 lg:pt-12">
      <p className="text-[12px] font-semibold uppercase tracking-[0.19em] text-accent">Practical guides · Source linked</p>
      <h1 className="mt-3 max-w-3xl text-[36px] font-bold leading-[1.13] tracking-tight text-ink sm:text-[48px]">
        Build. Grow. Automate.
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-[1.8] text-ink-3">Source-linked guides for shipping products, finding users and reducing repetitive work. Every guide includes prerequisites, practical steps, failure checks and honest verification notes.</p>
      <nav aria-label="Filter playbooks by workflow track" className="mt-8 flex flex-wrap gap-2">
        {[{ key: "All", title: "All guides" }, ...PLAYBOOK_TRACKS].map(t => (
          <Link key={t.key} to={t.key === "All" ? "/playbooks" : `/playbooks?track=${t.key}`}
            aria-current={active === t.key ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold ring-1 ring-line ${active === t.key ? "bg-ink text-bg" : "bg-surface text-ink hover:bg-bg-sunk"}`}>
            {t.title} ({t.key === "All" ? PLAYBOOKS.length : PLAYBOOKS.filter(p => p.track === t.key).length})
          </Link>
        ))}
      </nav>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {visible.map(p => (
          <article key={p.slug} className="flex flex-col rounded-panel bg-surface p-6 ring-1 ring-line">
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-3">
              <span className="rounded-full bg-accent-soft px-2.5 py-1 font-medium text-accent">{p.track}</span>
              <span>{p.category}</span>
              <span>{p.readingMinutes} min read</span>
            </div>
            <h2 className="mt-4 text-[21px] font-semibold leading-snug text-ink">
              <Link to={`/playbooks/${p.slug}`} className="hover:text-accent">{p.title}</Link>
            </h2>
            <p className="mt-3 flex-1 text-[14px] leading-[1.8] text-ink-3">{p.description}</p>
            <p className="mt-4 text-[12px] text-ink-4">Documented approach · Not independently tested</p>
            <Link to={`/playbooks/${p.slug}`} className="mt-4 text-[13px] font-semibold text-accent hover:underline">Read the playbook →</Link>
          </article>
        ))}
      </div>
      <div className="mt-12 rounded-panel bg-bg-sunk p-6 sm:p-8">
        <h2 className="text-[20px] font-semibold text-ink">A working plan is not a completed test.</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-3">Our guides are original editorial syntheses of publicly available documentation. A documented design is not a claim that the integration was tested. Verify pricing, terms, permissions and feature availability before production use.</p>
        <Link to="/signals" className="mt-4 inline-flex text-[13px] font-semibold text-accent hover:underline">Discover curated Signals →</Link>
      </div>
    </main>
  );
}