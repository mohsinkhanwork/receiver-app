"use client";

import { Provider } from "react-redux";
import { store } from "@/store";

// Wraps the app with the Redux store.
// Must be a client component because Redux uses React context under the hood.
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
