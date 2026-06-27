import type { SVGProps } from "react";

const base = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
);
export const HeartIcon = ({ filled, ...p }: SVGProps<SVGSVGElement> & { filled?: boolean }) => (
  <svg {...base} {...p} fill={filled ? "currentColor" : "none"}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
);
export const BagIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
export const ArrowUpRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
);
export const ArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
export const CheckIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2.5} {...p}><path d="m5 12 5 5L20 7"/></svg>
);
export const HomeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
);
export const UserIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
);
export const TrashIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
);
export const LockIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
export const ChevronLeft = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="m15 18-6-6 6-6"/></svg>
);
export const EyeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
);
export const EyeOffIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}><path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-3.1 3.9M6.6 6.6A18.5 18.5 0 0 0 2 11s3.5 7 10 7a10.8 10.8 0 0 0 4.2-.8"/><path d="M3 3l18 18"/><path d="M9.6 9.6A3 3 0 0 0 14.4 14.4"/></svg>
);
