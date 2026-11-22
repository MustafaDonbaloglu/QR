import { IconQr } from "./icons";

export function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-ink shadow-[0_6px_16px_-8px_var(--accent)]">
        <IconQr className="h-5 w-5" />
      </span>
      <span className="font-display text-[17px] font-bold leading-tight">QR Yönetimi</span>
    </span>
  );
}
