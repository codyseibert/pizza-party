import { useState } from "react";
import { TTopping } from "./api/getToppings";
import { ToppingsModal } from "./ToppingsModal";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [confirmedToppings, setConfirmedToppings] = useState<TTopping[]>([]);

  const handleModalConfirm = (toppings: TTopping[]) => {
    setShowModal(false);
    setConfirmedToppings(toppings);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const initialToppings = confirmedToppings.map((topping) => topping.name);

  return (
    <div className="App p-40">
      {showModal && (
        <ToppingsModal
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
          initialSelectedToppings={initialToppings}
        />
      )}

      <label
        htmlFor="my-modal"
        className="btn modal-button"
        onClick={() => setShowModal(!showModal)}
      >
        Select Toppings
      </label>

      <div className="flex flex-col gap-4">
        {confirmedToppings.map((topping) => (
          <div key={topping.name}>{topping.name} was selected, yum!</div>
        ))}
      </div>
    </div>
  );
}

export default App;
