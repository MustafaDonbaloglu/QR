type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24", "aria-hidden": true };

export const IconQr = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" /></svg>
);
export const IconBolt = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M13 3 4 14h7l-1 7 9-11h-7l1-7z" /></svg>
);
export const IconPlus = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconLogout = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" /></svg>
);
export const IconSearch = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconLink = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
);
export const IconCopy = ({ className = "h-3.5 w-3.5" }: P) => (
  <svg {...base} className={className}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>
);
export const IconCheck = ({ className = "h-3.5 w-3.5" }: P) => (
  <svg {...base} className={className}><path d="m5 12 4.5 4.5L19 7" /></svg>
);
export const IconDownload = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
);
export const IconPalette = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4-4-7.4-9-7.4z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></svg>
);
export const IconTag = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z" /><circle cx="8" cy="8" r="1.5" /></svg>
);
export const IconRoute = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16" /></svg>
);
export const IconChart = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
);
export const IconWarn = ({ className = "h-4 w-4 shrink-0 mt-0.5" }: P) => (
  <svg {...base} className={className}><path d="M12 9v4M12 17h.01M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
);
export const IconArrowLeft = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
);
export const IconApple = ({ className = "h-3.5 w-3.5" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" /></svg>
);
export const IconAndroid = ({ className = "h-3.5 w-3.5" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}><path d="M17.6 9.5 19.4 6.4a.4.4 0 0 0-.7-.4l-1.8 3.1a11 11 0 0 0-9.8 0L5.3 6a.4.4 0 0 0-.7.4l1.8 3.1A10.4 10.4 0 0 0 1 18h22a10.4 10.4 0 0 0-5.4-8.5zM7 15.2a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2zm10 0a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2z" /></svg>
);
export const IconGlobe = ({ className = "h-3.5 w-3.5" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
);
