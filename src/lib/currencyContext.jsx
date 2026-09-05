import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", PKR: "₨", INR: "₹", CNY: "¥", AUD: "A$",
  CAD: "C$", AED: "د.إ", SAR: "﷼", CHF: "Fr", SEK: "kr", NOK: "kr", DKK: "kr", RUB: "₽",
  TRY: "₺", BRL: "R$", MXN: "$", ZAR: "R", SGD: "S$", MYR: "RM", THB: "฿", IDR: "Rp",
  PHP: "₱", VND: "₫", KRW: "₩", NGN: "₦", EGP: "E£", PLN: "zł", CZK: "Kč", HUF: "Ft",
  ILS: "₪", NZD: "NZ$", HKD: "HK$", TWD: "NT$", UAH: "₴", RON: "lei", BGN: "лв",
  HRK: "kn", QAR: "﷼", KWD: "د.ك", OMR: "﷼", BHD: "د.ب", JOD: "د.ا", LKR: "Rs",
  BDT: "৳", NPR: "₨", ARS: "$", CLP: "$", COP: "$", PEN: "S/", VES: "Bs",
};

export function symbolFor(code) {
  return SYMBOLS[code] || (code ? code + " " : "$");
}

const CurrencyContext = createContext(null);

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      formatPrice: (n) => `$${Number(n || 0).toFixed(2)}`,
      currency: "USD", symbol: "$", ready: false, rates: {}, setCurrency: () => {}, currencies: [],
    };
  }
  return ctx;
}

export function CurrencyProvider({ children }) {
  const [state, setState] = useState({ currency: "USD", symbol: "$", rate: 1, rates: {}, ready: false });

  useEffect(() => {
    const saved = localStorage.getItem("currency");
    base44.functions.invoke("getCurrencyContext")
      .then((res) => {
        const d = res.data || {};
        const rates = d.rates || {};
        const code = saved && rates[saved] ? saved : d.currency || "USD";
        const rate = rates[code] || d.rate || 1;
        setState({ currency: code, symbol: symbolFor(code), rate, rates, ready: true });
      })
      .catch(() => {
        const code = saved || "USD";
        setState({ currency: code, symbol: symbolFor(code), rate: 1, rates: {}, ready: true });
      });
  }, []);

  const setCurrency = useCallback((code) => {
    setState((s) => {
      const rate = s.rates[code] || 1;
      localStorage.setItem("currency", code);
      return { ...s, currency: code, symbol: symbolFor(code), rate };
    });
  }, []);

  const formatPrice = useCallback((usd) => {
    const v = (Number(usd) || 0) * (state.rate || 1);
    const noDecimal = ["JPY", "KRW", "VND", "IDR", "CLP", "PYG", "UGX", "RWF"].includes(state.currency);
    const dec = noDecimal ? 0 : 2;
    return `${state.symbol}${v.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
  }, [state]);

  const currencies = Object.keys(state.rates || {}).filter((c) => SYMBOLS[c]).sort();

  return (
    <CurrencyContext.Provider value={{ ...state, formatPrice, setCurrency, currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
}