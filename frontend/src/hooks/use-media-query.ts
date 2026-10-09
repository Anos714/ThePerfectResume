import { useEffect, useState } from "react";

/**
 * SSR-safe media query: it always reports `false` on the server *and* on the
 * first client render, then corrects itself in an effect. Returning `false`
 * during hydration is what keeps server and client markup identical; the value
 * settles one frame later without a hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}
