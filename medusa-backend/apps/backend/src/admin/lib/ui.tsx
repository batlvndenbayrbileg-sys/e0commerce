import { Heading, Text } from "@medusajs/ui";
import type { ReactNode } from "react";

/**
 * Shared admin UI kit — keeps every custom route on the same visual language
 * (card-based KPIs with colored icon badges, bordered table panels, skeleton
 * loaders). Built only on verified @medusajs/ui Tailwind tokens.
 */

export const TONES: Record<string, string> = {
  green: "bg-ui-tag-green-bg text-ui-tag-green-icon",
  blue: "bg-ui-tag-blue-bg text-ui-tag-blue-icon",
  orange: "bg-ui-tag-orange-bg text-ui-tag-orange-icon",
  purple: "bg-ui-tag-purple-bg text-ui-tag-purple-icon",
  red: "bg-ui-tag-red-bg text-ui-tag-red-icon",
  grey: "bg-ui-tag-neutral-bg text-ui-tag-neutral-icon",
};

export const BAR_TONE: Record<string, string> = {
  green: "bg-ui-tag-green-icon",
  blue: "bg-ui-tag-blue-icon",
  orange: "bg-ui-tag-orange-icon",
  purple: "bg-ui-tag-purple-icon",
  red: "bg-ui-tag-red-icon",
  interactive: "bg-ui-fg-interactive",
};

/** Page header row: title + subtitle on the left, actions on the right. */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
      <div>
        <Heading level="h1">{title}</Heading>
        {description && <Text className="text-ui-fg-subtle" size="small">{description}</Text>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Responsive grid for StatCards. */
export function StatGrid({ children, cols = 4 }: { children: ReactNode; cols?: 3 | 4 | 5 }) {
  const map: Record<number, string> = {
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 xl:grid-cols-4",
    5: "sm:grid-cols-3 xl:grid-cols-5",
  };
  return <div className={`grid grid-cols-1 ${map[cols]} gap-4 px-6 py-5`}>{children}</div>;
}

/** A single KPI card with an optional colored icon badge + skeleton state. */
export function StatCard({ icon, tone = "blue", label, value, loading }: { icon?: ReactNode; tone?: string; label: string; value: ReactNode; loading?: boolean }) {
  return (
    <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4 transition-shadow hover:shadow-elevation-card-rest">
      <div className="flex items-center justify-between gap-2">
        <Text className="text-ui-fg-subtle" size="small">{label}</Text>
        {icon && <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${TONES[tone] || TONES.blue}`}>{icon}</span>}
      </div>
      {loading
        ? <div className="mt-2 h-8 w-28 rounded bg-ui-bg-component animate-pulse" />
        : <Heading level="h2" className="mt-2 tabular-nums">{value}</Heading>}
    </div>
  );
}

/** A titled section card — use to wrap tables or content blocks. */
export function Panel({ title, actions, children, bodyClassName = "" }: { title?: string; actions?: ReactNode; children: ReactNode; bodyClassName?: string }) {
  return (
    <div className="px-6 py-5">
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <Text weight="plus" size="small">{title}</Text>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`overflow-hidden rounded-lg border border-ui-border-base ${bodyClassName}`}>{children}</div>
    </div>
  );
}

/** Bordered wrapper for a bare <Table> without a title. */
export function TableCard({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-lg border border-ui-border-base">{children}</div>;
}

/** A small skeleton bar, e.g. inside table cells while loading. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-ui-bg-component animate-pulse ${className}`} />;
}

/** A horizontal proportion bar (value/max). */
export function Bar({ value, max, tone = "orange", className = "" }: { value: number; max: number; tone?: string; className?: string }) {
  const pct = Math.max(2, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-ui-bg-component ${className}`}>
      <div className={`h-full rounded-full ${BAR_TONE[tone] || BAR_TONE.orange}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
