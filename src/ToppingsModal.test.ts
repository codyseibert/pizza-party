import { controller as makeController } from "./ToppingsModal";
import { describe, expect, beforeEach, it, jest } from "@jest/globals";

describe("ToppingsModel controller", () => {
  const onConfirmMock = jest.fn().mockReturnValue(null);
  let defaultControllerArgs;

  beforeEach(() => {
    defaultControllerArgs = {
      model: {
        toppings: [
          {
            name: "cheese",
            cost: 1.42,
          },
          {
            name: "olives",
            cost: 2.32,
          },
          {
            name: "onions",
            cost: 3.11,
          },
        ],
        selectedToppings: [],
      },
      initialSelectedToppings: [],
      onConfirm: onConfirmMock,
      getToppings: () => Promise.resolve([]),
    };
  });

  describe("onMount", () => {
    it("should set the expected selected values based on the confirmedToppings passed in", async () => {
      const getToppings = async () => [
        { name: "cheese", cost: 0.99 },
        { name: "onions", cost: 0.99 },
        { name: "olives", cost: 0.99 },
      ];
      const getToppingsMock = jest
        .fn()
        .mockImplementation(getToppings) as jest.Mocked<typeof getToppings>;
      const { onMount, isToppingSelected } = makeController({
        model: {
          toppings: [],
          selectedToppings: [],
        },
        initialSelectedToppings: ["cheese", "olives"],
        getToppings: getToppingsMock,
      });
      await onMount();
      expect(isToppingSelected("cheese")).toBeTruthy();
      expect(isToppingSelected("olives")).toBeTruthy();
      expect(isToppingSelected("onions")).toBeFalsy();
    });
  });

  describe("toggleAll", () => {
    it("should turn all of the toppings to true when called", () => {
      const { toggleAll, isToppingSelected } = makeController({
        ...defaultControllerArgs,
      } as any);
      toggleAll(true);
      expect(isToppingSelected("cheese")).toBeTruthy();
      expect(isToppingSelected("olives")).toBeTruthy();
      expect(isToppingSelected("onions")).toBeTruthy();
    });

    it("calling twice with an already selected topping should clear it", () => {
      const { toggleTopping, toggleAll, isToppingSelected } = makeController({
        ...defaultControllerArgs,
      } as any);
      toggleTopping("cheese", true);
      toggleAll(true);
      toggleAll(false);
      expect(isToppingSelected("cheese")).toBeFalsy();
      expect(isToppingSelected("olives")).toBeFalsy();
      expect(isToppingSelected("onions")).toBeFalsy();
    });
  });

  describe("toggleTopping", () => {
    it("should turn all of the toppings to true when called", () => {
      const { isToppingSelected, toggleTopping } = makeController({
        ...defaultControllerArgs,
      } as any);
      toggleTopping("olives", true);
      expect(isToppingSelected("olives")).toBeTruthy();
    });
  });

  describe("toggleTopping", () => {
    it("should turn all of the toppings to true when called", () => {
      const { isToppingSelected, toggleTopping } = makeController({
        ...defaultControllerArgs,
      } as any);
      toggleTopping("olives", true);
      expect(isToppingSelected("olives")).toBeTruthy();
    });
  });

  describe("handleConfirmClick", () => {
    it("should call onConfirm with the expected selected toppings", () => {
      const { handleConfirmClick, toggleTopping } = makeController({
        ...defaultControllerArgs,
      });
      toggleTopping("cheese", true);
      handleConfirmClick();
      expect(onConfirmMock).toHaveBeenCalledWith([
        { cost: 1.42, name: "cheese" },
      ]);
    });
  });

  describe("isAllSelected", () => {
    it("should return true if every topping is selected", () => {
      const { isAllSelected, toggleAll } = makeController({
        ...defaultControllerArgs,
      });
      toggleAll(true);
      expect(isAllSelected()).toBeTruthy();
    });
  });

  describe("isAnyToppingSelected", () => {
    it("should return true if every topping is selected", () => {
      const controller = makeController({
        ...defaultControllerArgs,
      });
      controller.toggleTopping("onions", true);
      expect(controller.isAnyToppingSelected).toBeTruthy();
    });
  });

  describe("totalUpcharge", () => {
    it("should return the correct total upcharge based on what was selected", () => {
      const controller = makeController({
        ...defaultControllerArgs,
      });
      controller.toggleTopping("onions", true);
      controller.toggleTopping("cheese", true);
      controller.toggleTopping("olives", true);
      expect(controller.totalUpcharge()).toEqual("6.85");
    });
  });

  describe("getTopping", () => {
    it("should return the correct topping based on the name", () => {
      const { getTopping } = makeController({
        ...defaultControllerArgs,
      });
      expect(getTopping("cheese")).toEqual({
        name: "cheese",
        cost: 1.42,
      });
    });
  });

  describe("toppingKeys", () => {
    it("should return all the toppings", () => {
      const { toppingKeys } = makeController({
        ...defaultControllerArgs,
      });
      expect(toppingKeys()).toEqual(["cheese", "olives", "onions"]);
    });
  });
});
