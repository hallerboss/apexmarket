import { useState, useEffect } from "react";
import { ChevronDown, Search, ShieldCheck, HelpCircle } from "lucide-react";

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France",
  "Spain", "Italy", "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden",
  "Norway", "Denmark", "Finland", "Ireland", "Portugal", "Greece", "Poland",
  "Czech Republic", "Hungary", "Romania", "Bulgaria", "Croatia", "Slovakia",
  "Slovenia", "Estonia", "Latvia", "Lithuania", "Luxembourg", "Malta", "Cyprus",
  "Iceland", "Russia", "Ukraine", "Turkey", "United Arab Emirates", "Saudi Arabia",
  "Qatar", "Kuwait", "Bahrain", "Oman", "Israel", "Jordan", "Lebanon", "Egypt",
  "Pakistan", "India", "Bangladesh", "Sri Lanka", "Nepal", "China", "Japan",
  "South Korea", "Singapore", "Malaysia", "Indonesia", "Thailand", "Vietnam",
  "Philippines", "Hong Kong", "Taiwan", "New Zealand", "South Africa", "Nigeria",
  "Kenya", "Ghana", "Morocco", "Algeria", "Tunisia", "Brazil", "Argentina",
  "Mexico", "Chile", "Colombia", "Peru", "Venezuela",
];
const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
  "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

const inputCls =
  "w-full h-11 rounded-lg border border-[#e0e0e0] px-3 text-sm bg-white placeholder:text-[#A0A0A0] focus:border-black outline-none transition-colors";
const labelCls = "block text-xs font-medium text-black mb-1.5";
const selectRow =
  "w-full flex items-center justify-between h-11 rounded-lg border border-[#e0e0e0] px-3 text-sm bg-white appearance-none pr-9 focus:border-black outline-none";

export default function AddressCheckoutForm({ onSubmit, placing }) {
  const [form, setForm] = useState({
    country: "United States",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_search: "",
    street: "",
    apt: "",
    state: "",
    city: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.country_name && COUNTRIES.includes(d.country_name)) set("country", d.country_name);
      })
      .catch(() => {});
  }, []);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, street: form.street || form.address_search });
  };

  return (
    <form onSubmit={submit} className="text-black">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold tracking-tight">Add New Address</h3>
        <button type="button" aria-label="Help" className="text-[#A0A0A0] hover:text-black">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center gap-1.5 mb-5 text-green-700">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-xs font-medium">All information is encrypted</span>
      </div>

      {/* Country / region */}
      <label className={labelCls}>Country/region</label>
      <div className="relative mb-4">
        <select value={form.country} onChange={(e) => set("country", e.target.value)} className={selectRow}>
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#A0A0A0]" />
      </div>

      {/* First / Last name */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelCls}>
            First name<span className="text-red-600">*</span>
          </label>
          <input required placeholder="E.g., John" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>
            Last name<span className="text-red-600">*</span>
          </label>
          <input required placeholder="E.g., Smith" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Email */}
      <label className={labelCls}>
        Email<span className="text-red-600">*</span>
      </label>
      <input required type="email" placeholder="your@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} className={`${inputCls} mb-4`} />

      {/* Phone */}
      <label className={labelCls}>
        Phone number<span className="text-red-600">*</span>
      </label>
      <div className="flex mb-4">
        <span className="inline-flex items-center px-3 h-11 rounded-l-lg border border-r-0 border-[#e0e0e0] bg-[#f5f5f5] text-sm font-medium text-black">+1</span>
        <input
          required
          type="tel"
          placeholder="E.g., 1234567890"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          className="flex-1 h-11 rounded-r-lg border border-[#e0e0e0] px-3 text-sm placeholder:text-[#A0A0A0] focus:border-black outline-none"
        />
      </div>

      {/* Address search */}
      <label className={labelCls}>Address search</label>
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
        <input
          placeholder="Search by address (e.g., 123 Main St, Apt 4B)"
          value={form.address_search}
          onChange={(e) => {
            const v = e.target.value;
            set("address_search", v);
            setForm((f) => (f.street ? f : { ...f, street: v }));
          }}
          className="w-full h-11 rounded-lg border border-[#e0e0e0] pl-9 pr-3 text-sm placeholder:text-[#A0A0A0] focus:border-black outline-none"
        />
      </div>

      {/* Street + apt */}
      <label className={labelCls}>
        Address<span className="text-red-600">*</span>
      </label>
      <input required placeholder="Street address" value={form.street} onChange={(e) => set("street", e.target.value)} className={`${inputCls} mb-3`} />
      <input placeholder="Apt, unit, building, floor, room, etc. (optional)" value={form.apt} onChange={(e) => set("apt", e.target.value)} className={`${inputCls} mb-4`} />

      {/* State + city */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className={labelCls}>
            State/Province<span className="text-red-600">*</span>
          </label>
          <input required placeholder="State or province" value={form.state} onChange={(e) => set("state", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>
            City<span className="text-red-600">*</span>
          </label>
          <input required placeholder="City" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} />
        </div>
      </div>

      <button type="submit" disabled={placing} className="w-full h-12 rounded-lg bg-black text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
        {placing ? "Placing…" : (<>Proceed to Payment</>)}
      </button>
    </form>
  );
}