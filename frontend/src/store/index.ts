import { configureStore } from "@reduxjs/toolkit";
import receiverReducer from "./receiverSlice";
import transactionReducer from "./transactionSlice";

export const store = configureStore({
  reducer: {
    receiver:     receiverReducer,
    transactions: transactionReducer,
  },
});

// Infer types from the store itself — no manual typing needed
export type RootState    = ReturnType<typeof store.getState>;
export type AppDispatch  = typeof store.dispatch;
