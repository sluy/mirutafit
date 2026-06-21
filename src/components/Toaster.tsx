"use client";

import { Toaster as SonnerToaster } from "sonner";

// Single place to configure app-wide toasts. Use `toast.success(...)` /
// `toast.error(...)` from "sonner" anywhere in client components.
export default function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: { fontFamily: "var(--font-sans)" },
      }}
    />
  );
}
