"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "./icons";

export function CopyButton({ text, label = "Kopyala" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
        done ? "bg-ok-soft text-ok" : "text-accent hover:bg-accent-soft"
      }`}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <IconCheck /> : <IconCopy />}
      {done ? "Kopyalandı" : label}
    </button>
  );
}
