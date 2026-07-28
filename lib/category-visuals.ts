import {
  Car,
  Droplets,
  Hammer,
  Leaf,
  Paintbrush,
  SprayCan,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Visual = { icon: LucideIcon; tint: string };

const rules: { match: RegExp; visual: Visual }[] = [
  { match: /plumb|pipe|water/i, visual: { icon: Droplets, tint: "text-sky-500 bg-sky-500/10" } },
  { match: /electr|wiring|power/i, visual: { icon: Zap, tint: "text-amber-500 bg-amber-500/10" } },
  { match: /car|vehicle|auto/i, visual: { icon: Car, tint: "text-indigo-500 bg-indigo-500/10" } },
  { match: /garden|lawn|plant/i, visual: { icon: Leaf, tint: "text-emerald-500 bg-emerald-500/10" } },
  { match: /clean|wash/i, visual: { icon: SprayCan, tint: "text-cyan-500 bg-cyan-500/10" } },
  { match: /paint/i, visual: { icon: Paintbrush, tint: "text-rose-500 bg-rose-500/10" } },
  { match: /^ac$|air|cool|hvac/i, visual: { icon: Wind, tint: "text-teal-500 bg-teal-500/10" } },
  { match: /carpen|wood|furnitur/i, visual: { icon: Hammer, tint: "text-orange-500 bg-orange-500/10" } },
];

const fallback: Visual = { icon: Wrench, tint: "text-brand bg-brand/10" };

export const visualForCategory = (name: string) =>
  rules.find((rule) => rule.match.test(name))?.visual ?? fallback;
