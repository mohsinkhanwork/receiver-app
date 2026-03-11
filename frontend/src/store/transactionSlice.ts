import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Transaction {
  id: number;
  currency: string;
  to_name: string;
  amount: string;
  status: "Approved" | "Pending";
}

interface TransactionState {
  items: Transaction[];
}

const initialState: TransactionState = {
  items: [],
};

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    // Replace full list when switching currencies or on initial fetch
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.items = action.payload;
    },

    // Add a single new transaction to the top of the list (from socket event)
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      // Guard against duplicates — the socket and initial fetch can race
      const exists = state.items.some((t) => t.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
      }
    },

    // Update a single transaction's status in-place (from socket or UI click)
    patchTransactionStatus: (
      state,
      action: PayloadAction<{ id: number; status: "Approved" | "Pending" }>
    ) => {
      const tx = state.items.find((t) => t.id === action.payload.id);
      if (tx) tx.status = action.payload.status;
    },
  },
});

export const { setTransactions, addTransaction, patchTransactionStatus } =
  transactionSlice.actions;
export default transactionSlice.reducer;
