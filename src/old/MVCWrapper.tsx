/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @next/next/no-title-in-document-head */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/display-name */
// eslint-disable-next-line @next/next/no-document-import-in-page
import { FC, useMemo, useRef, useState } from "react";

export function MVCWrapper<T>({
  view,
  controller,
  model,
  context,
}: {
  view: FC<any>;
  controller: any;
  model: object;
  context?: (props?: any) => object;
}) {
  const View = view;

  return (props: T) => {
    const [, setState] = useState(model);

    const ctx = context?.(props);
    const ref = useRef(ctx);
    ref.current = ctx;

    const proxyModel = useMemo(() => {
      return new Proxy(model || {}, {
        set(target, key, value) {
          Object.assign(target, { [key]: value });
          setState({ ...target });
          return true;
        },
      });
    }, []);

    const control = useMemo(() => controller(proxyModel, ref.current), []);

    return <View {...control} />;
  };
}
