import { Link, data, useLoaderData } from "react-router";
import type { Route } from "./+types/playbook";
import { playbookBySlug } from "../content/playbooks";
import { pageMeta } from "../lib/seo";
import { edgeTtl } from "../lib/api.server";
import type { Screen } from "../components/shell/screens";

export const handle: Screen = { tab: "featured", name: "Playbook" };
export const headers = () => edgeTtl(300);
export async function loader({ params }: Route.LoaderArgs) {
  const p = playbookBySlug(params.slug ?? "");
  if (!p) throw data({ message: "Not found" }, { status: 404 });
  return { p };
}
export function meta({ loaderData }: Route.MetaArgs) {
  const p = loaderData?.p;
  if (!p) return pageMeta({ title: "Playbook not found", path: "/playbooks", noindex: true });
  return pageMeta({
    title: p.title, path: `/playbooks/${p.slug}`, description: p.description,
    type: "article",
    jsonLd: {
      "@context": "https://schema.org", "@type": "TechArticle",
      headline: p.title, description: p.description,
      dateModified: p.lastReviewed, proficiencyLevel: "Beginner to intermediate",
      isAccessibleForFree: true,
    },
  });
}
export default function PlaybookDetail() {
  const { p } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-[850px] px-4 pb-24 pt-7 sm:px-6 lg:pt-12">
      <Link to="/playbooks" className="text-[13px] text-accent hover:underline">← All Playbooks</Link>
      <div className="mt-7 flex flex-wrap items-center gap-3 text-[12px] font-medium text-ink-3">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-accent">{p.category}</span>
        <span>{p.readingMinutes} min read</span><span>Reviewed {p.lastReviewed}</span>
      </div>
      <h1 className="mt-5 text-[33px] font-bold leading-[1.15] tracking-tight text-ink sm:text-[44px]">{p.title}</h1>
      <p className="mt-5 text-[16px] leading-[1.8] text-ink-3">{p.description}</p>
      <div className="mt-7 rounded-panel border border-line bg-bg-sunk p-5">
        <p className="text-[13px] font-semibold text-ink">Editorial verification status</p>
        <p className="mt-2 text-[13px] leading-[1.8] text-ink-3">{p.verification}. This is a planning guide based on linked official documentation, not a claim that we ran a production integration or achieved a specific result.</p>
      </div>
      <section className="mt-12">
        <h2 className="text-[23px] font-bold text-ink">What you will produce</h2>
        <p className="mt-3 text-[15px] leading-[1.9] text-ink-2">{p.outcome}</p>
        <p className="mt-3 text-[14px] text-ink-3"><strong className="text-ink-2">Designed for:</strong> {p.audience}</p>
      </section>
      <section className="mt-10">
        <h2 className="text-[23px] font-bold text-ink">Before you start</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-[14px] leading-[1.85] text-ink-2">{p.prerequisites.map(x=><li key={x}>{x}</li>)}</ul>
      </section>
      <section className="mt-12">
        <h2 className="text-[23px] font-bold text-ink">Step-by-step workflow</h2>
        <ol className="mt-5 space-y-6">{p.steps.map((x,i)=>
          <li key={x.title} className="flex gap-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[14px] font-bold text-accent">{i+1}</span>
            <div><h3 className="text-[17px] font-semibold text-ink">{x.title}</h3><p className="mt-2 text-[14px] leading-[1.85] text-ink-2">{x.detail}</p></div>
          </li>)}</ol>
      </section>
      <section className="mt-12 rounded-panel bg-surface p-5 ring-1 ring-line sm:p-7">
        <h2 className="text-[22px] font-bold text-ink">Human review checklist</h2>
        <ul className="mt-4 space-y-3">{p.checkpoints.map(x=>
          <li key={x} className="flex items-start gap-3 text-[14px] leading-[1.8] text-ink-2"><span className="mt-0.5 text-accent" aria-hidden>✓</span>{x}</li>)}</ul>
      </section>
      <section className="mt-12">
        <h2 className="text-[23px] font-bold text-ink">Troubleshooting and limitations</h2>
        <div className="mt-4 space-y-5">{p.pitfalls.map(x=>
          <div key={x.issue}><h3 className="text-[15px] font-semibold text-ink">{x.issue}</h3><p className="mt-1 text-[14px] leading-[1.85] text-ink-3">{x.response}</p></div>)}</div>
      </section>
      <section className="mt-12 border-t border-line pt-8">
        <h2 className="text-[22px] font-bold text-ink">First-party references</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-3">These sources document relevant platform features. They do not independently validate every editorial step above.</p>
        <ul className="mt-4 space-y-3">{p.sourceDocs.map(s=>
          <li key={s.url}><a href={s.url} rel="noopener noreferrer" target="_blank" className="break-words text-[14px] text-accent underline">{s.title} ↗</a></li>)}</ul>
      </section>
      <div className="mt-12 flex flex-wrap gap-5 border-t border-line pt-6 text-[13px] font-semibold text-accent">
        <Link to="/signals" className="hover:underline">Explore Signals →</Link>
        <Link to="/newsletter" className="hover:underline">Get the Digest →</Link>
      </div>
    </main>
  );
}