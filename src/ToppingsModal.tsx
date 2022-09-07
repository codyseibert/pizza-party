import { Dialog } from "@headlessui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getToppings, TTopping } from "./api/getToppings";
import { derived, useController } from "./hooks/useController";
import { useOnMount } from "./hooks/useOnMount";
import { useProxyState } from "./hooks/useProxyState";

type Model = {
  toppings: TTopping[];
  selectedToppings: Record<string, boolean>;
};

export const controller = ({
  model,
  onConfirm = () => {},
  initialSelectedToppings,
  getToppings,
}: {
  model: Model;
  onConfirm?: (selectedToppings: TTopping[]) => void;
  initialSelectedToppings: string[];
  getToppings: () => Promise<TTopping[]>;
}) => {
  async function onMount() {
    const toppings = await getToppings();
    model.toppings = toppings;
    model.selectedToppings = Object.fromEntries(
      toppings.map(({ name }) => [
        name,
        initialSelectedToppings.some((topping) => topping === name),
      ])
    );
  }

  function onUnmount() {
    model.toppings = [];
    model.selectedToppings = {};
  }

  function toggleTopping(toppingKey: string, isChecked: boolean) {
    model.selectedToppings[toppingKey] = isChecked;
  }

  function handleConfirmClick() {
    onConfirm(
      model.toppings.filter(({ name }) => model.selectedToppings[name])
    );
  }

  function getTopping(name: string): TTopping | undefined {
    return model.toppings.find((topping) => topping.name === name);
  }

  function isToppingSelected(name: string) {
    return model.selectedToppings[name];
  }

  function toggleAll(isChecked: boolean) {
    toppingKeys().forEach((toppingName) => {
      toggleTopping(toppingName, isChecked);
    });
  }

  const toppingKeys = () => model.toppings.map((topping) => topping.name);
  const isAllSelected = () =>
    toppingKeys().every((name) => isToppingSelected(name));
  const isAnyToppingSelected = () =>
    Object.values(model.selectedToppings).some((isChecked) => isChecked);
  const totalUpcharge = () =>
    model.toppings
      .reduce(
        (sum, topping) =>
          sum + (isToppingSelected(topping.name) ? topping.cost : 0),
        0
      )
      .toFixed(2);

  return {
    onMount,
    onUnmount,
    toggleTopping,
    handleConfirmClick,
    toggleAll,
    ...derived({
      getTopping,
      isToppingSelected,
      isAllSelected,
      toppingKeys,
      isAnyToppingSelected,
      totalUpcharge,
    }),
  };
};

export const ToppingsModal = ({
  onConfirm,
  onClose,
  initialSelectedToppings = [],
}: {
  onClose: () => void;
  onConfirm: (selectedToppings: TTopping[]) => void;
  initialSelectedToppings: string[];
}) => {
  const model = useMemo(
    () => ({
      toppings: [] as TTopping[],
      selectedToppings: [] as string[],
    }),
    []
  );

  const {
    getTopping,
    handleConfirmClick,
    isAllSelected,
    isAnyToppingSelected,
    isToppingSelected,
    onMount,
    toggleAll,
    toggleTopping,
    toppingKeys,
    onUnmount,
    totalUpcharge,
  } = useController({
    model,
    controller,
    initialSelectedToppings,
    onConfirm,
    getToppings,
  }) as ReturnType<typeof controller>;

  useOnMount(onMount, onUnmount);

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-10">
          <Dialog.Title>Pizza Toppings</Dialog.Title>

          <div className="mb-6 h-10 flex flex-col gap-2">
            <p>Please select the toppings you want on your pizza.</p>

            {isAnyToppingSelected() && (
              <p>
                There will be an upcharge of <b>${totalUpcharge()}</b>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input
                onChange={(e) => toggleAll(e.target.checked)}
                id="select-all"
                type="checkbox"
                checked={isAllSelected()}
              />
              <label htmlFor="select-all">Select All</label>
            </div>

            {toppingKeys().map((toppingKey) => (
              <div key={toppingKey} className="flex gap-2">
                <input
                  checked={isToppingSelected(toppingKey)}
                  onChange={(e) => toggleTopping(toppingKey, e.target.checked)}
                  id={toppingKey}
                  type="checkbox"
                />
                <label htmlFor={toppingKey} key={toppingKey}>
                  {toppingKey} ${getTopping(toppingKey)?.cost}
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn btn-success" onClick={handleConfirmClick}>
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
