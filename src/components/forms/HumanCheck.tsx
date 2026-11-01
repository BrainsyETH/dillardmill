"use client";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type TurnstileAPI = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileAPI;
  }
}
export function HumanCheck({
  action,
  onToken,
  attempt = 0,
}: {
  action: "inquiry" | "booking";
  onToken: (token: string) => void;
  attempt?: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);
  useEffect(() => {
    if (!ready || !container.current || !window.turnstile || !sitekey) return;
    callback.current("");
    const id = window.turnstile.render(container.current, {
      sitekey,
      action,
      theme: "light",
      size: "flexible",
      callback: (token: string) => callback.current(token),
      "expired-callback": () => callback.current(""),
      "error-callback": () => {
        callback.current("");
        setFailed(true);
      },
    });
    return () => window.turnstile?.remove(id);
  }, [ready, sitekey, action, attempt]);
  if (!sitekey) return null;
  return (
    <div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={onReady}
        onError={() => setFailed(true)}
      />
      <div ref={container} />
      {failed && (
        <p role="alert" className="text-sm text-red-800">
          Security check unavailable. Refresh this page or call (314) 843-4321.
        </p>
      )}
    </div>
  );
}
