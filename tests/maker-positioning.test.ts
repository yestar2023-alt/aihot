import assert from "node:assert/strict";
import { test } from "node:test";
import { SITE } from "@aihot/site";
import { PLAYBOOKS, PLAYBOOK_TRACKS, playbookBySlug } from "@aihot/site/playbooks";
import { MARKETING_LANES, WORK_TRACKS, MARKETING_SOURCE_LANES, PRIVATE_MARKETING_SEED_IDS } from "@aihot/industry/source-coverage";

test("public positioning is for makers and small teams, not marketers only", () => {
  assert.match(SITE.name, /AI Workflow Fieldbook/);
  assert.match(SITE.homeTitle, /Build, Grow & Automate/);
  assert.match(SITE.description, /independent makers and small teams/i);
  assert.equal(SITE.locale, "en-US");
  assert.deepEqual([...WORK_TRACKS], [...PLAYBOOK_TRACKS.map(x => x.key)]);
});

test("all three tracks have a sourced, honestly labelled starter guide", () => {
  assert.ok(PLAYBOOKS.length >= 5);
  for (const track of PLAYBOOK_TRACKS) {
    const guides = PLAYBOOKS.filter(p => p.track === track.key);
    assert.ok(guides.length >= 1, `Missing ${track.key} guide`);
    for (const guide of guides) {
      assert.equal(guide.verification, "Documented approach — not independently tested");
      assert.ok(guide.steps.length >= 5, guide.slug);
      assert.ok(guide.sourceDocs.length > 0, guide.slug);
      assert.ok(guide.sourceDocs.every(s => s.url.startsWith("https://")), guide.slug);
      assert.equal(playbookBySlug(guide.slug)?.title, guide.title);
    }
  }
  assert.equal(new Set(PLAYBOOKS.map(p => p.slug)).size, PLAYBOOKS.length);
});

test("every protected candidate source resolves to a Build Grow or Automate lane", () => {
  const valid = new Set(WORK_TRACKS);
  for (const id of PRIVATE_MARKETING_SEED_IDS) {
    const lanes = MARKETING_SOURCE_LANES[id as keyof typeof MARKETING_SOURCE_LANES] as readonly string[];
    assert.ok(lanes.length, `Missing lanes: ${id}`);
    for (const lane of lanes) {
      const meta = MARKETING_LANES.find(m => m.id === lane);
      assert.ok(meta, `Unknown lane ${lane}`);
      assert.ok(valid.has(meta.track), `No parent track for ${lane}`);
    }
  }
  assert.equal(MARKETING_LANES.find(x => x.id === "build")?.track, "Build");
});
