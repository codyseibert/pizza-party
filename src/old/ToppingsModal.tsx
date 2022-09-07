import { Dialog } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import { getToppings, TTopping } from "./api/getToppings";

type Props = {
  onClose: () => void;
  onConfirm: (selectedToppings: TTopping[]) => void;
  confirmedToppings: TTopping[];
};

export const ToppingsModal = ({
  onConfirm,
  onClose,
  confirmedToppings = [],
}: Props) => {
  const [toppings, setToppings] = useState<TTopping[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    getToppings().then((allToppings) => {
      setToppings(allToppings);
      setSelectedToppings(
        allToppings.reduce((obj, topping) => {
          return {
            ...obj,
            [topping.name]: confirmedToppings.find(
              (confirmed) => confirmed.name === topping.name
            )
              ? true
              : false,
          };
        }, {})
      );
    });
  }, []);

  function toggleAll(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedToppings(
      toppings.reduce(
        (obj, topping) => ({ ...obj, [topping.name]: e.target.checked }),
        {}
      )
    );
  }

  function toggleTopping(toppingKey: string) {
    return function (e: React.ChangeEvent<HTMLInputElement>) {
      setSelectedToppings({
        ...selectedToppings,
        [toppingKey]: e.target.checked,
      });
    };
  }

  function handleConfirmClick() {
    onConfirm(toppings.filter((topping) => selectedToppings[topping.name]));
  }

  function handleOnClose() {
    onClose();
  }

  const toppingKeys = toppings.map((topping) => topping.name);
  const isToppingSelected = Object.entries(selectedToppings).some(
    ([, checked]) => checked
  );
  const totalUpcharge = toppings
    .reduce((sum, topping) => {
      return sum + (selectedToppings[topping.name] ? topping.cost : 0);
    }, 0)
    .toFixed(2);

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
              <input onChange={toggleAll} id="select-all" type="checkbox" />
              <label htmlFor="select-all">Select All</label>
            </div>

            {toppingKeys.map((toppingKey) => (
              <div key={toppingKey} className="flex gap-2">
                <input
                  checked={selectedToppings[toppingKey] ?? false}
                  onChange={toggleTopping(toppingKey)}
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
            <button className="btn" onClick={handleOnClose}>
              Cancel
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
