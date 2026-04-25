import { describe, it, expect } from "vitest";
import { buildDemoModel } from "@/lib/demo-model";
import { computeProjection } from "@/lib/projection-engine";
import { applyScenarioOverrides } from "@/lib/scenario-engine";
import { SCENARIO_TEMPLATES } from "@/lib/constants";
import type { Scenario } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// Sanity checks on the demo fixture so we notice if anyone retunes the
// numbers and breaks the headline runway figures the landing page implies.
describe("demo model — landing-page showcase", () => {
  const model = buildDemoModel();

  it("covers all 8 preset burn categories", () => {
    const presetKeys = model.burnCategories.map((c) => c.presetKey);
    expect(presetKeys).toEqual(
      expect.arrayContaining([
        "headcount",
        "token_grants",
        "infrastructure",
        "legal",
        "marketing",
        "token_incentives",
        "grants_out",
        "office_admin",
      ]),
    );
  });

  it("has $6.0M of hard treasury (stables + fiat)", () => {
    const stables = model.treasury.stablecoins.reduce((a, s) => a + s.amount, 0);
    const fiat = model.treasury.fiat.reduce((a, f) => a + f.amount, 0);
    expect(stables).toBe(5_000_000);
    expect(fiat).toBe(1_000_000);
  });

  it("includes both a major (ETH) and a native asset", () => {
    const tiers = model.treasury.volatileAssets.map((a) => a.tier);
    expect(tiers).toContain("major");
    expect(tiers).toContain("native");
  });

  it("baseline produces multi-month hard runway shorter than horizon", () => {
    const { summary, projections } = computeProjection(model);
    expect(projections).toHaveLength(18);
    // Hard runway: $6M / ~$416K net burn ≈ 14 months
    expect(summary.hardRunwayMonths).toBeGreaterThanOrEqual(13);
    expect(summary.hardRunwayMonths).toBeLessThanOrEqual(16);
  });

  it("bear market scenario shifts extended runway downward", () => {
    const tpl = SCENARIO_TEMPLATES.find((t) => t.key === "bear_market")!;
    const baselineExt = computeProjection(model).summary.extendedRunwayMonths;
    const scenario: Scenario = {
      id: uuidv4(),
      name: tpl.name,
      color: tpl.color,
      createdAt: new Date().toISOString(),
      isActive: true,
      templateKey: tpl.key,
      overrides: tpl.buildOverrides(model),
    };
    const stressed = applyScenarioOverrides(model, scenario.overrides);
    const stressedExt = computeProjection(stressed).summary.extendedRunwayMonths;
    // Either both null (runway exceeds horizon) — must compare hard balances —
    // or stressed is strictly smaller / equal.
    if (baselineExt !== null && stressedExt !== null) {
      expect(stressedExt).toBeLessThanOrEqual(baselineExt);
    } else {
      // If extended runway never depletes in either case, at least the hard
      // balance at month 18 must be lower under bear-market stress.
      const baselineEnd = computeProjection(model).projections.at(-1)!.extendedBalance;
      const stressedEnd = computeProjection(stressed).projections.at(-1)!.extendedBalance;
      expect(stressedEnd).toBeLessThan(baselineEnd);
    }
  });

  it("aggressive hiring scenario shortens hard runway", () => {
    const tpl = SCENARIO_TEMPLATES.find((t) => t.key === "aggressive_hiring")!;
    const baseline = computeProjection(model).summary.hardRunwayMonths;
    const scenario: Scenario = {
      id: uuidv4(),
      name: tpl.name,
      color: tpl.color,
      createdAt: new Date().toISOString(),
      isActive: true,
      templateKey: tpl.key,
      overrides: tpl.buildOverrides(model),
    };
    const stressed = applyScenarioOverrides(model, scenario.overrides);
    const stressedHard = computeProjection(stressed).summary.hardRunwayMonths;
    expect(stressedHard).not.toBeNull();
    expect(baseline).not.toBeNull();
    expect(stressedHard!).toBeLessThan(baseline!);
  });
});
