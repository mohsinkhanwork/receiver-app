import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from ".";

// Pre-typed hooks — use these everywhere instead of raw useDispatch/useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
