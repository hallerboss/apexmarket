import { useCurrency } from "@/lib/currencyContext";
import { Globe } from "lucide-react";

export default function CurrencySwitcher() {
  const { currency, currencies, setCurrency } = useCurrency();
  if (!currencies.length) return null;
  return (
    <div className="flex items-center gap-1">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="bg-transparent text-xs font-medium text-foreground outline-none cursor-pointer"
        aria-label="Currency"
      >
        {currencies.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}