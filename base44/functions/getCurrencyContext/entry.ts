export default async function(req) {
  try {
    const ip = req.headers.get("cf-connecting-ip") || (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "";
    let currency = "USD";
    let country = "United States";

    if (ip) {
      try {
        const geo = await fetch(`https://ipapi.co/${ip}/json/`, { headers: { Accept: "application/json" } }).then((r) => r.json());
        if (geo && geo.currency) currency = geo.currency;
        if (geo && geo.country_name) country = geo.country_name;
      } catch (_) {}
    }

    let rates = {};
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/USD").then((r) => r.json());
      if (r && r.rates) rates = r.rates;
    } catch (_) {}

    const rate = rates[currency] || 1;
    return Response.json({ country, currency, rate, rates, base: "USD" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}