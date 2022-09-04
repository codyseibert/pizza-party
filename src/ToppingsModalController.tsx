import { Dialog } from "@headlessui/react";
import React, { useEffect, useState } from "react";
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

const controller = ({
  model,
  setModel,
  onConfirm,
  confirmedToppings,
}: {
  model: Model;
  setModel: (newModel: Model) => void;
  onConfirm: (confirmedToppings: TTopping[]) => void;
  confirmedToppings: TTopping[];
}) => {
  return {
    onMount() {
      getToppings().then((allToppings) => {
        setModel({
          toppings: allToppings,
          selectedToppings: allToppings.reduce((obj, topping) => {
            return {
              ...obj,
              [topping.name]: confirmedToppings.find(
                (confirmed) => confirmed.name === topping.name
              )
                ? true
                : false,
            };
          }, {}),
        });
      });
    },
    toggleAll(isChecked: boolean) {
      setModel({
        ...model,
        selectedToppings: model.toppings.reduce(
          (obj, topping) => ({ ...obj, [topping.name]: isChecked }),
          {}
        ),
      });
    },
    toggleTopping(toppingKey: string, isChecked: boolean) {
      setModel({
        ...model,
        selectedToppings: {
          ...model.selectedToppings,
          [toppingKey]: isChecked,
        },
      });
    },
    handleConfirmClick() {
      onConfirm(
        model.toppings.filter((topping) => model.selectedToppings[topping.name])
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
        .reduce((sum, topping) => {
          return (
            sum + (model.selectedToppings[topping.name] ? topping.cost : 0)
          );
        }, 0)
        .toFixed(2);
    },
  };
};

export const ToppingsModalController = ({
  onConfirm,
  onClose,
  confirmedToppings = [],
}: Props) => {
  const [model, setModel] = useState({
    toppings: [] as TTopping[],
    selectedToppings: {} as Record<string, boolean>,
  });

  const {
    onMount,
    isToppingSelected,
    totalUpcharge,
    toggleAll,
    toppingKeys,
    toggleTopping,
    handleConfirmClick,
  } = controller({
    model,
    setModel,
    confirmedToppings,
    onConfirm,
  });

  useEffect(onMount, []);

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-10">
          <Dialog.Title>Pizza Toppings</Dialog.Title>

          <div className="mb-6 h-10 flex flex-col gap-2">
            <p>Please select the toppings you want on your pizza.</p>

            {isToppingSelected && (
              <p>
                There will be an upcharge of <b>${totalUpcharge}</b>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input
                onChange={(e) => toggleAll(e.target.checked)}
                id="select-all"
                type="checkbox"
              />
              <label htmlFor="select-all">Select All</label>
            </div>

            {toppingKeys.map((toppingKey) => (
              <div key={toppingKey} className="flex gap-2">
                <input
                  checked={model.selectedToppings[toppingKey] ?? false}
                  onChange={(e) => toggleTopping(toppingKey, e.target.checked)}
                  id={toppingKey}
                  type="checkbox"
                />
                <label htmlFor={toppingKey} key={toppingKey}>
                  {toppingKey}
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
