import { Dialog } from "@headlessui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getToppings, TTopping } from "./api/getToppings";

type Props = {
  onClose: () => void;
  onConfirm: (selectedToppings: TTopping[]) => void;
  confirmedToppings: TTopping[];
};

type Model = {
  toppings: TTopping[];
  selectedToppings: Record<string, boolean>;
};

function useProxyState<T>(initialState: T): T {
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

const useController = ({
  model,
  onConfirm,
  confirmedToppings,
}: {
  model: Model;
  onConfirm: (confirmedToppings: TTopping[]) => void;
  confirmedToppings: TTopping[];
}) => {
  return {
    onMount() {
      getToppings().then((allToppings) => {
        model.toppings = allToppings;
        model.selectedToppings = allToppings.reduce(
          (obj, topping) => ({
            ...obj,
            [topping.name]: !!confirmedToppings.find(
              ({ name }) => name === topping.name
            ),
          }),
          {}
        );
      });
    },
    toggleAll(isChecked: boolean) {
      model.selectedToppings = model.toppings.reduce(
        (obj, topping) => ({ ...obj, [topping.name]: isChecked }),
        {}
      );
    },
    toggleTopping(toppingKey: string, isChecked: boolean) {
      model.selectedToppings = {
        ...model.selectedToppings,
        [toppingKey]: isChecked,
      };
    },
    handleConfirmClick() {
      onConfirm(
        model.toppings.filter((topping) => model.selectedToppings[topping.name])
      );
    },
    getTopping(name: string): TTopping | undefined {
      return model.toppings.find((topping) => topping.name === name);
    },
    get isAllSelected() {
      return Object.entries(model.selectedToppings).every(
        ([key, value]) => value
      );
    },
    get toppingKeys() {
      return model.toppings.map((topping) => topping.name);
    },
    get isToppingSelected() {
      return Object.entries(model.selectedToppings).some(
        ([, checked]) => checked
      );
    },
    get totalUpcharge() {
      return model.toppings
        .reduce(
          (sum, topping) =>
            sum + (model.selectedToppings[topping.name] ? topping.cost : 0),
          0
        )
        .toFixed(2);
    },
  };
};

export const ToppingsModalControllerProxy = ({
  onConfirm,
  onClose,
  confirmedToppings = [],
}: Props) => {
  const model = useProxyState<Model>({
    toppings: [] as TTopping[],
    selectedToppings: {} as Record<string, boolean>,
  });

  const controller = useController({
    model,
    confirmedToppings,
    onConfirm,
  });

  useEffect(controller.onMount, []);

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-10">
          <Dialog.Title>Pizza Toppings</Dialog.Title>

          <div className="mb-6 h-10 flex flex-col gap-2">
            <p>Please select the toppings you want on your pizza.</p>

            {controller.isToppingSelected && (
              <p>
                There will be an upcharge of <b>${controller.totalUpcharge}</b>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input
                onChange={(e) => controller.toggleAll(e.target.checked)}
                id="select-all"
                type="checkbox"
                checked={controller.isAllSelected}
              />
              <label htmlFor="select-all">Select All</label>
            </div>

            {controller.toppingKeys.map((toppingKey) => (
              <div key={toppingKey} className="flex gap-2">
                <input
                  checked={model.selectedToppings[toppingKey] ?? false}
                  onChange={(e) =>
                    controller.toggleTopping(toppingKey, e.target.checked)
                  }
                  id={toppingKey}
                  type="checkbox"
                />
                <label htmlFor={toppingKey} key={toppingKey}>
                  {toppingKey} ${controller.getTopping(toppingKey)?.cost}
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="btn btn-success"
              onClick={controller.handleConfirmClick}
            >
              Confirm
            </button>
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
