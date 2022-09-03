export type TTopping = {
  cost: number;
  name: string;
};

export const getToppings = async () => {
  const toppings: TTopping[] = [
    {
      cost: 0.99,
      name: "cheese",
    },
    {
      cost: 1.29,
      name: "meat",
    },
    {
      cost: 0.5,
      name: "bacon",
    },
    {
      cost: 0.99,
      name: "spinach",
    },
  ];
  return toppings;
};
