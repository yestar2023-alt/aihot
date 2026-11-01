import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { MARKETING_LANES, MARKETING_SOURCE_LANES, PRIVATE_MARKETING_SEED_IDS, WORK_TRACKS } from "@aihot/industry/source-coverage";
import { candidateState } from "@aihot/backend/admin/source-coverage";

const config: { sources: Array<{
  id: string;
  participation_mode: string;
  site_fulltext: boolean;
  syndicate_fulltext: boolean;
  kind: string;
  enabled?: boolean;
  config: { feedUrl?: string; query?: string; searchType?: string; _aihot?: { initialBackfillLimit?: number } };
}> } = JSON.parse(readFileSync(new URL("../industry/sources.json", import.meta.url), "utf8"));
const at = new Date("2026-11-01T08:00:00.000Z");
const baseline = {
  enabled: true, health: "ok", fail_count: 0, interval_minutes: 240,
  last_ok_at: new Date(at.getTime() - 30 * 60_000),
  last_fetch_at: new Date(at.getTime() - 30 * 60_000),
  next_fetch_at: new Date(at.getTime() + 3 * 60 * 60_000),
};

test("every configured marketing seed belongs to exactly one protected registry entry", () => {
  const configIds = config.sources.map(source => source.id);
  assert.equal(configIds.length, 34);
  assert.equal(config.sources.filter(s => s.kind === "rss").length, 24);
  assert.equal(config.sources.filter(s => s.kind === "x_search").length, 10);
  assert.equal(new Set(configIds).size, configIds.length);
  assert.deepEqual([...configIds].sort(), [...PRIVATE_MARKETING_SEED_IDS].sort());
  assert.deepEqual([...Object.keys(MARKETING_SOURCE_LANES)].sort(), [...configIds].sort());
  const lanes = new Set(MARKETING_LANES.map(l => l.id));
  for (const [id, groups] of Object.entries(MARKETING_SOURCE_LANES)) {
    assert.ok(groups.length >= 1, `${id} has no coverage`);
    assert.ok(groups.every(l => lanes.has(l)), `${id} has an unknown category`);
  }
  assert.equal(MARKETING_LANES.length, 11);
  assert.deepEqual([...WORK_TRACKS], ["Build", "Grow", "Automate"]);
  for (const track of WORK_TRACKS) assert.ok(MARKETING_LANES.some(l => l.track === track));
  for (const lane of MARKETING_LANES) assert.ok(Object.values(MARKETING_SOURCE_LANES).some(x => (x as readonly string[]).includes(lane.id)));
});

test("candidate feeds have no public or full-text side effects by default", () => {
  for (const source of config.sources) {
    assert.equal(source.participation_mode, "isolated", source.id);
    assert.equal(source.site_fulltext, false, source.id);
    assert.equal(source.syndicate_fulltext, false, source.id);
    if (source.kind === "rss") {
      assert.match(source.config.feedUrl ?? "", /^https:\/\//, source.id);
      assert.ok((source.config._aihot?.initialBackfillLimit ?? 0) <= 5, source.id);
    } else {
      assert.equal(source.kind, "x_search", source.id);
      assert.equal(source.enabled, false, source.id);
      assert.equal(source.config.searchType, "Latest", source.id);
      assert.ok(typeof source.config.query === "string" && source.config.query.includes("-filter:replies"), source.id);
    }
  }
});

test("source health distinguishes missing evidence, errors, staleness and successful fetching", () => {
  assert.equal(candidateState({ ...baseline, enabled: false }, at), "paused");
  assert.equal(candidateState({ ...baseline, health: "failing" }, at), "failing");
  assert.equal(candidateState({ ...baseline, fail_count: 3 }, at), "failing");
  assert.equal(candidateState({ ...baseline, last_ok_at: null, last_fetch_at: null }, at), "not_tested");
  assert.equal(candidateState({ ...baseline, last_ok_at: null }, at), "never_successful");
  assert.equal(candidateState({ ...baseline, health: "degraded" }, at), "degraded");
  assert.equal(candidateState({ ...baseline, last_ok_at: new Date(at.getTime()-2*24*3600_000) }, at), "stale");
  assert.equal(candidateState({ ...baseline, next_fetch_at: new Date(at.getTime()-2*3600_000) }, at), "overdue");
  assert.equal(candidateState(baseline, at), "observed_ok");
});
