// Post-login navigation must only ever target an in-app path, otherwise a
// crafted `?redirect=https://evil.com` (or a protocol-relative `//evil.com`)
// could send the user off-site.
export function safeRedirect(redirect: string | null | undefined): string | null {
  if (!redirect) return null;
  if (!/^\/(?![/\\])/.test(redirect)) return null;
  return redirect;
}
