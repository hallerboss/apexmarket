import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Loads Google Analytics 4 (gtag.js) when a Measurement ID is configured
 * in Admin Settings (SiteSetting key: ga_measurement_id).
 * The analytics.js module already sends events via window.gtag — this
 * component just bootstraps the script so those calls work.
 */
export default function GoogleAnalyticsLoader() {
  useEffect(() => {
    base44.entities.SiteSetting.filter({ key: "ga_measurement_id" })
      .then((rows) => {
        const id = rows[0]?.value;
        if (!id || !id.startsWith("G-")) return;
        if (document.getElementById("ga-gtag-src")) return;

        const s = document.createElement("script");
        s.id = "ga-gtag-src";
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
        document.head.appendChild(s);

        const init = document.createElement("script");
        init.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${id}');`;
        document.head.appendChild(init);
      })
      .catch(() => {});
  }, []);

  return null;
}