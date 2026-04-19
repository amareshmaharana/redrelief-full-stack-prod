import { useEffect, useState } from "react";

import { useCampRegistrySubscription } from "@/lib/camp-registry";

export function useCampRegistryVersion() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = useCampRegistrySubscription(() => setVersion((current) => current + 1));
    return unsubscribe;
  }, []);

  return version;
}
