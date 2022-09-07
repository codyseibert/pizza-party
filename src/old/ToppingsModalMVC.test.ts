import { Context, controller, Model } from "./ToppingsModalMVC";
import { describe, expect, it, jest } from "@jest/globals";
import { TTopping } from "./api/getToppings";

describe("ToppingsModelMVC.controller", () => {
  const mockAllToppings: TTopping[] = [
    {
      name: "cheese",
      cost: 0.99,
    },
    {
      name: "meat",
      cost: 1.5,
    },
    {
      name: "spinach",
      cost: 2.5,
    },
  ];
  const mockContext: Context = {
    confirmedToppings: [],
    getToppings: jest.fn().mockResolvedValue(mockAllToppings),
    onClose: jest.fn(),
    onConfirm: jest.fn(),
  };

  const mockModel: Model = {
    selectedToppings: {},
    toppings: [
      {
        name: "cheese",
        cost: 0.99,
      },
      {
        name: "meat",
        cost: 1.5,
      },
    ],
  };

  it("on initialization, the confirmedToppings in context should set the expected selectedToppings on the model on load", async () => {
    const { model } = await controller(mockModel, {
      ...mockContext,
      confirmedToppings: [{ name: "meat", cost: 1.5 }],
    });
    expect(model.selectedToppings).toEqual({
      meat: true,
      cheese: false,
      spinach: false,
    });
  });

  it("toggle all should set every selected topping to true", async () => {
    const { model, actions } = await controller(mockModel, {
      ...mockContext,
      confirmedToppings: [{ name: "meat", cost: 1.5 }],
    });
    actions.toggleAll(true);
    expect(model.selectedToppings).toEqual({
      meat: true,
      cheese: true,
      spinach: true,
    });
  });

  it("toppingKeys should return the expected list of toppings", async () => {
    const { getters } = await controller(mockModel, {
      ...mockContext,
      confirmedToppings: [{ name: "meat", cost: 1.5 }],
    });
    expect(getters.toppingKeys).toEqual(
      expect.arrayContaining(["meat", "cheese", "spinach"])
    );
  });

  it("totalUpcharge should be the expected amount when everything is selected", async () => {
    const { actions, computeds } = await controller(mockModel, mockContext);
    actions.toggleAll(true);
    expect(computeds.totalUpcharge()).toEqual(`${0.99 + 1.5 + 2.5}`);
  });
});
