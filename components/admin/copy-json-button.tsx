"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyJsonButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <Button
      variant="secondary"
      onClick={handleCopy}
      className="border-[#1E2D5C] bg-[#131F43] text-white hover:border-[#00E5FF]/60 hover:bg-[#0B132B]"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "JSON copiado" : "Copiar JSON"}
    </Button>
  );
}
