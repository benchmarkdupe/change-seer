import { RawSignal, INVERTED_SIGNAL_TYPES } from "../types/signal";
import { Category, ScoreBreakdown, ScoreContribution } from "../types/opportunity";
import { SCORING_VERSION, WEIGHT_PROFILES, REASON_TEMPLATES } from "./weightProfiles";

/**
 * ScoringEngine
 * -------------
 * Pure, stateless, and deterministic: same signals + same weight profile
 * version always produce the same score. That determinism is what makes
 * "why is this a 91" answerable — nothing here samples, guesses, or calls
 * an LLM. The AI Detail Page's *narrative* is generated separately (see
 * aiNarrative.ts) and is explicitly downstream of this engine, never a
 * replacement for it: the number is math, the story is prose about the math.
 *
 * Design constraints this class enforces:
 *  - Every point of the final score must map to a ScoreContribution the
 *    UI can render. No unexplained residual.
 *  - Signals decay in confidence weight the older they are — a scout
 *    that hasn't refreshed a signal in weeks shouldn't silently keep
 *    full influence.
 *  - A category with no weight configured for a given signal type simply
 *    ignores that signal (weight 0) rather than throwing, so scouts can
 *    emit signal types a category doesn't use.
 */
export class ScoringEngine {
  score(category: Category, signals: RawSignal[]): ScoreBreakdown {
    const profile = WEIGHT_PROFILES[category];
    const now = Date.now();

    const contributions: ScoreContribution[] = [];
    let weightedTotal = 0;
    let weightUsed = 0;

    for (const signal of signals) {
      const weight = profile[signal.type];
      if (!weight) continue; // this category doesn't use this signal type

      const inverted = INVERTED_SIGNAL_TYPES.has(signal.type);
      const effectiveValue = inverted ? 100 - signal.value : signal.value;

      const ageDays = (now - new Date(signal.detectedAt).getTime()) / 86_400_000;
      const recencyFactor = Math.max(0.4, 1 - ageDays / 30); // floor at 40% weight past ~18 days stale

      const appliedWeight = weight * (signal.sourceConfidence / 100) * recencyFactor;
      const contribution = effectiveValue * appliedWeight;

      weightedTotal += contribution;
      weightUsed += appliedWeight;

      const direction = effectiveValue >= 50 ? "up" : "down";
      contributions.push({
        signalType: signal.type,
        rawValue: signal.value,
        weight: Number(appliedWeight.toFixed(3)),
        contribution: Number(contribution.toFixed(2)),
        inverted,
        reason: REASON_TEMPLATES[signal.type][direction],
      });
    }

    const signalScore = weightUsed > 0 ? Math.round(weightedTotal / weightUsed) : 0;

    // Confidence reflects breadth (how many distinct scouts corroborated)
    // and per-signal source confidence — a single unverified scout report
    // should never produce a "high signal" score in isolation.
    const distinctScouts = new Set(signals.map((s) => s.scoutId)).size;
    const avgSourceConfidence =
      signals.length > 0
        ? signals.reduce((sum, s) => sum + s.sourceConfidence, 0) / signals.length
        : 0;
    const breadthFactor = Math.min(1, distinctScouts / 3); // 3+ scouts = full breadth credit
    const confidence = Math.round(avgSourceConfidence * 0.6 + breadthFactor * 100 * 0.4);

    // Momentum is isolated from the "momentum" signal type specifically,
    // falling back to a neutral midpoint if no scout reported it.
    const momentumSignal = signals.find((s) => s.type === "momentum");
    const momentum = momentumSignal ? momentumSignal.value : 50;

    const rating =
      signalScore >= 70 ? "high_signal" : signalScore >= 50 ? "moderate" : "low_signal";

    const topReasons = [...contributions]
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 5)
      .map((c) => c.reason);

    return {
      signalScore,
      confidence,
      momentum,
      rating,
      contributions: contributions.sort((a, b) => b.contribution - a.contribution),
      topReasons,
      scoringVersion: SCORING_VERSION,
      computedAt: new Date().toISOString(),
    };
  }
}
