import { useEffect, useRef } from "react";

export const useOnMount = (onMount, onUnmount?) => {
  const p = useRef(Promise.resolve());

  useEffect(() => {
    p.current = p.current.then(onMount);
    return () => {
      if (onUnmount) {
        p.current = p.current.then(onUnmount);
      }
    };
  }, []);
};
