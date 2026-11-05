"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ASSUMPTIONS, DEFAULT_INPUT } from "@/lib/assumptions";
import { calculate, type ModelInput, type ModelResult } from "@/lib/calculate";

type ReturnsContextValue = {
  input: ModelInput;
  result: ModelResult;
  setSalePrice: (salePrice: number) => void;
  setDurationMonths: (durationMonths: number) => void;
  setAnnualRateBps: (annualRateBps: number) => void;
  reset: () => void;
};

const ReturnsContext = createContext<ReturnsContextValue | null>(null);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ReturnsProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<ModelInput>({ ...DEFAULT_INPUT });
  const result = useMemo(() => calculate(input), [input]);

  const value = useMemo<ReturnsContextValue>(
    () => ({
      input,
      result,
      setSalePrice: (salePrice) =>
        setInput((current) => ({
          ...current,
          salePrice: clamp(salePrice, ASSUMPTIONS.salePriceMin, ASSUMPTIONS.salePriceMax),
        })),
      setDurationMonths: (durationMonths) =>
        setInput((current) => ({
          ...current,
          durationMonths: clamp(
            durationMonths,
            ASSUMPTIONS.durationMin,
            ASSUMPTIONS.durationMax,
          ),
        })),
      setAnnualRateBps: (annualRateBps) =>
        setInput((current) => ({
          ...current,
          annualRateBps: clamp(
            annualRateBps,
            ASSUMPTIONS.rateMinBps,
            ASSUMPTIONS.rateMaxBps,
          ),
        })),
      reset: () => setInput({ ...DEFAULT_INPUT }),
    }),
    [input, result],
  );

  return (
    <ReturnsContext.Provider value={value}>{children}</ReturnsContext.Provider>
  );
}

export function useReturns() {
  const value = useContext(ReturnsContext);
  if (!value) {
    throw new Error("useReturns must be used within ReturnsProvider");
  }
  return value;
}
