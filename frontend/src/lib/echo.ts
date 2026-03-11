/**
 * Lazy Echo singleton — initialised only on the client after first call.
 * Guards against SSR (Next.js runs components on the server too).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let echoInstance: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getEcho(): Promise<any> {
  // Never run on the server
  if (typeof window === "undefined") return null;

  if (echoInstance) return echoInstance;

  // Dynamic imports prevent Pusher/Echo from running during SSR
  const [{ default: Pusher }, { default: Echo }] = await Promise.all([
    import("pusher-js"),
    import("laravel-echo"),
  ]);

  // Pusher must be on window before Echo initialises
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).Pusher = Pusher;

  echoInstance = new Echo({
    broadcaster: "reverb",
    key:     process.env.NEXT_PUBLIC_REVERB_APP_KEY  || "app-key",
    wsHost:  process.env.NEXT_PUBLIC_REVERB_HOST     || "127.0.0.1",
    wsPort:  Number(process.env.NEXT_PUBLIC_REVERB_PORT)  || 8080,
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT)  || 8080,
    forceTLS: false,
    enabledTransports: ["ws"],
  });

  return echoInstance;
}
