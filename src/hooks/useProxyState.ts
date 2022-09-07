import { useMemo, useState } from "react";

// currently I'm not using this approach, I switched to useController
export function useProxyState<T>(initialState: T): T {
  const [, setCount] = useState(0);

  const proxy = useMemo(
    () =>
      new Proxy(initialState as any, {
        set(target, prop, value) {
          target[prop] = value;
          setCount((prev) => {
            return (prev + 1) % Number.MAX_SAFE_INTEGER;
          });
          return true;
        },
      }),
    []
  );

  return proxy;
}
