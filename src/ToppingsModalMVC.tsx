import { Dialog } from "@headlessui/react";
import { getToppings, TTopping } from "./api/getToppings";
import { MVCWrapper } from "./MVCWrapper";

type Props = {
  onClose: () => void;
  onConfirm: (selectedToppings: TTopping[]) => void;
  confirmedToppings: TTopping[];
};

const context = ({ onConfirm, onClose, confirmedToppings }: Props) => {
  return {
    getToppings() {
      return getToppings();
    },
    onConfirm,
    confirmedToppings,
    onClose,
  };
};

const model = {
  toppings: [] as TTopping[],
  selectedToppings: {} as Record<string, boolean>,
};

export type Model = typeof model;
export type Context = ReturnType<typeof context>;
type Controller = ReturnType<typeof controller>;

export const controller = (model: Model, context: Context) => {
  context.getToppings().then((allToppings) => {
    model.toppings = allToppings;
    model.selectedToppings = allToppings.reduce((obj, topping) => {
      return {
        ...obj,
        [topping.name]: context.confirmedToppings.find(
          (confirmed) => confirmed.name === topping.name
        )
          ? true
          : false,
      };
    }, {});
  });

  return {
    model,
    actions: {
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
      handleOnClose() {
        context.onClose();
      },
      handleConfirmClick() {
        context.onConfirm(
          model.toppings.filter(
            (topping) => model.selectedToppings[topping.name]
          )
        );
      },
    },
    getters: {
      get toppingKeys() {
        return model.toppings.map((topping) => topping.name);
      },
    },
    computeds: {
      isToppingSelected() {
        return Object.entries(model.selectedToppings).some(
          ([, checked]) => checked
        );
      },
      toppingKeys() {
        return model.toppings.map((topping) => topping.name);
      },
      totalUpcharge() {
        return model.toppings
          .reduce((sum, topping) => {
            return (
              sum + (model.selectedToppings[topping.name] ? topping.cost : 0)
            );
          }, 0)
          .toFixed(2);
      },
    },
  };
};

const view = ({ model, computeds, actions, getters }: Controller) => {
  return (
    <Dialog
      open={true}
      onClose={actions.handleOnClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-10">
          <Dialog.Title>Pizza Toppings</Dialog.Title>

          <div className="mb-6 h-10 flex flex-col gap-2">
            <p>Please select the toppings you want on your pizza.</p>

            {computeds.isToppingSelected() && (
              <p>
                There will be an upcharge of <b>${computeds.totalUpcharge()}</b>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input
                onChange={(e) => actions.toggleAll(e.target.checked)}
                id="select-all"
                type="checkbox"
              />
              <label htmlFor="select-all">Select All</label>
            </div>

            {getters.toppingKeys.map((toppingKey) => (
              <div key={toppingKey} className="flex gap-2">
                <input
                  checked={model.selectedToppings[toppingKey] ?? false}
                  onChange={(e) =>
                    actions.toggleTopping(toppingKey, e.target.checked)
                  }
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
            <button
              className="btn btn-success"
              onClick={actions.handleConfirmClick}
            >
              Confirm
            </button>
            <button className="btn" onClick={actions.handleOnClose}>
              Cancel
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export const ToppingsModalMVC = MVCWrapper<Props>({
  view,
  controller,
  model,
  context,
});
