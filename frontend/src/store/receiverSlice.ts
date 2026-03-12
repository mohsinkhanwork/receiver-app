import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ReceiverState {
  isOpen: boolean;
  // Persists across modal open/close — this is the key requirement
  selectedCurrency: string;
  search: string;
}

const initialState: ReceiverState = {
  isOpen: false,
  selectedCurrency: "USD", 
  search: "",
};

const receiverSlice = createSlice({
  name: "receiver",
  initialState,
  reducers: {
    openModal:  (state) => { state.isOpen = true; },
    closeModal: (state) => { state.isOpen = false; },
    setSelectedCurrency: (state, action: PayloadAction<string>) => {
      state.selectedCurrency = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
});

export const { openModal, closeModal, setSelectedCurrency, setSearch } = receiverSlice.actions;
export default receiverSlice.reducer;
