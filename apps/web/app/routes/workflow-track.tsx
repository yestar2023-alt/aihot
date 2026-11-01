import { Link, data, useLoaderData } from "react-router";
import type { Route } from "./+types/workflow-track";
import { PLAYBOOKS, PLAYBOOK_TRACKS } from "@aihot/site/playbooks";
import { pageMeta } from "../lib/seo";
import { edgeTtl } from "../lib/api.server";
import type { Screen } from "../components/shell/screens";

export const handle: Screen = { tab: "playbooks", name: "Workflows" };
export const headers = () => edgeTtl(300);
const INTRO = {
  Build: { lead: "Ship a useful product with fewer blind spots.", detail: "AI-assisted coding, MVPs, agents and deployment. Follow a clear brief, verify the resulting code, and separate preview from production.", next: "Start with one small working user journey and a real acceptance test." },
  Grow: { lead: "Reach users with evidence instead of hype.", detail: "SEO, distribution, content and conversion ideas for independent makers. Start with a user problem, validate search intent and publish something that adds original value.", next: "Record your sources and the date of each SERP or audience observation." },
  Automate: { lead: "Make repeatable work less repetitive.", detail: "Connect research, reporting and operational tasks with n8n, APIs and AI agents. Reliability, privacy and human approval matter more than flashy demos.", next: "Write down the trigger, data inputs, expected output and failure handling." },
} as const;

export async function loader({ params }: Route.LoaderArgs) {
  const track = PLAYBOOK_TRACKS.find(t => t.key.toLowerCase() === params.track);
  if (!track) throw data({ message: "Workflow category not found" }, { status: 404 });
  const guides = PLAYBOOKS.filter(p => p.track === track.key);
  return { track, intro: INTRO[track.key], guides };
}
export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return pageMeta({ path: "/playbooks", title: "Workflow category unavailable", noindex: true });
  const { track, guides, intro } = loaderData;
  return pageMeta({
    title: `${track.title} with AI — Practical Workflow Guides`,
    path: `/workflows/${track.key.toLowerCase()}`,
    description: `${intro.lead} ${track.description}`,
    // Avoid thin indexed category pages while the guide library is still in validation.
    noindex: guides.length < 3,
  });
}
export default function WorkflowTrack() {
  const { track, intro, guides } = useLoaderData<typeof loader>();
  return <main className="mx-auto max-w-[1080px] px-4 pb-24 pt-8 sm:px-6 lg:pt-12">
    <Link to="/playbooks" className="text-[13px] font-medium text-accent hover:underline">← All Playbooks</Link>
    <div className="mt-8 border-b border-line pb-9">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">AI WORKFLOWS / {track.title.toUpperCase()}</p>
      <h1 className="mt-3 text-[40px] font-bold tracking-tight text-ink sm:text-[56px]">{intro.lead}</h1>
      <p className="mt-5 max-w-3xl text-[16px] leading-[1.85] text-ink-3">{intro.detail}</p>
      <p className="mt-4 text-[13px] font-medium text-ink-2">First move: {intro.next}</p>
    </div>
    <nav aria-label="Workflow categories" className="mt-7 flex flex-wrap gap-2">
      {PLAYBOOK_TRACKS.map(t => <Link key={t.key} to={`/workflows/${t.key.toLowerCase()}`}
        aria-current={track.key === t.key ? "page" : undefined}
        className={`rounded-full px-4 py-2 text-[13px] font-semibold ring-1 ring-line ${t.key === track.key ? "bg-ink text-bg" : "bg-surface text-ink hover:bg-bg-sunk"}`}>
        {t.title}</Link>)}
    </nav>
    <div className="mb-6 mt-10 flex flex-wrap items-end justify-between gap-2">
      <div><h2 className="text-[25px] font-bold tracking-tight text-ink">Start with a practical guide</h2>
        <p className="mt-2 text-[13px] text-ink-3">Documentation-based starters, not claimed hands-on test results.</p></div>
      <span className="text-[13px] text-ink-4">{guides.length} guide{guides.length === 1 ? "" : "s"}</span>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      {guides.map(p => <article key={p.slug} className="flex flex-col rounded-panel bg-surface p-6 ring-1 ring-line">
        <p className="text-[12px] font-semibold text-accent">{p.category} · {p.readingMinutes} min</p>
        <h3 className="mt-3 text-[20px] font-semibold leading-snug text-ink"><Link to={`/playbooks/${p.slug}`} className="hover:text-accent">{p.title}</Link></h3>
        <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-3">{p.description}</p>
        <p className="mt-4 text-[12px] text-ink-4">{p.verification}</p>
        <Link to={`/playbooks/${p.slug}`} className="mt-4 text-[13px] font-semibold text-accent hover:underline">Read guide →</Link>
      </article>)}
    </div>
    <div className="mt-12 rounded-panel bg-bg-sunk p-6">
      <h2 className="text-[19px] font-semibold text-ink">Evidence before automation.</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-3">Always check source documentation, permissions, costs and version-specific behavior. We label guides as documented rather than tested until a reproducible test record exists.</p>
      <Link to="/signals" className="mt-4 inline-block text-[13px] font-semibold text-accent hover:underline">See reviewed Signals →</Link>
    </div>
  </main>;
}
