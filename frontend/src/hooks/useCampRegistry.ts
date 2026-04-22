import { useEffect, useState } from "react";

import { subscribeCampRegistry } from "@/lib/camp-registry";

export function useCampRegistryVersion() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeCampRegistry(() => setVersion((current) => current + 1));
    return unsubscribe;
  }, []);

  return version;
}
