"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "qrcode";

// Ultra HD export: 4096px for print-quality output
const EXPORT_SIZE = 4096;

interface EventQRCodeProps {
  eventUrl: string;
  eventName: string;
}

export function EventQRCode({ eventUrl, eventName }: EventQRCodeProps) {
  const [open, setOpen] = useState(false);
  const [svgData, setSvgData] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const generateQR = useCallback(async () => {
    // Generate SVG for display (crisp at any zoom)
    const svg = await QRCode.toString(eventUrl, {
      type: "svg",
      margin: 2,
      errorCorrectionLevel: "H", // Highest error correction (30%)
      color: { dark: "#0f172a", light: "#ffffff" },
    });
    setSvgData(svg);

    // Generate ultra HD canvas for bitmap downloads
    if (canvasRef.current) {
      await QRCode.toCanvas(canvasRef.current, eventUrl, {
        width: EXPORT_SIZE,
        margin: 4,
        errorCorrectionLevel: "H",
        color: { dark: "#0f172a", light: "#ffffff" },
      });
    }
  }, [eventUrl]);

  useEffect(() => {
    if (open) generateQR();
  }, [open, generateQR]);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAs = (format: "png" | "jpg" | "svg") => {
    const safeName = eventName.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);

    if (format === "svg") {
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr_${safeName}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    const dataUrl = canvas.toDataURL(mimeType, 1.0);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr_${safeName}.${format}`;
    a.click();
  };

  return (
    <>
      {/* Inline preview: URL + copy + QR button */}
      <div className="flex items-center gap-3 mt-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          <span className="text-sm text-navy truncate font-mono">{eventUrl}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg shrink-0 gap-1.5"
          onClick={copyUrl}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copie
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Copier
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg shrink-0 gap-1.5"
          onClick={() => setOpen(true)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75H16.5v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75H16.5v-.75z" />
          </svg>
          QR Code
        </Button>
      </div>

      {/* QR Code Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-navy text-center">QR Code — {eventName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-5 py-4">
            {/* QR Code SVG display — centered, fixed size */}
            <div
              className="w-64 h-64 mx-auto bg-white p-3 rounded-xl border border-gray-200 shadow-sm [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
              dangerouslySetInnerHTML={{ __html: svgData }}
            />
            {/* URL */}
            <p className="text-xs text-muted-foreground font-mono text-center break-all px-4">{eventUrl}</p>
            {/* Download buttons */}
            <div className="flex gap-3 w-full px-2">
              <Button
                className="flex-1 gradient-emerald text-white rounded-xl gap-2"
                onClick={() => downloadAs("png")}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                PNG
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl gap-2"
                onClick={() => downloadAs("jpg")}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                JPG
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl gap-2"
                onClick={() => downloadAs("svg")}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                SVG
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              Ultra HD 4096px &middot; Correction d&apos;erreur maximale (niveau H)
            </p>
          </div>
          {/* Hidden canvas for ultra HD export */}
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
}
