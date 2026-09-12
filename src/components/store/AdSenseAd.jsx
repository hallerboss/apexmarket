import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function AdSenseAd({ slot = "auto", format = "auto" }) {
  const [publisherId, setPublisherId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SiteSetting.filter({ key: "adsense_publisher_id" }, null, 1)
      .then((data) => {
        setPublisherId(data?.[0]?.value || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!publisherId) return;
    const existing = document.getElementById("adsbygoogle-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "adsbygoogle-script";
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, [publisherId]);

  if (loading || !publisherId) return null;

  return (
    <div className="my-8 text-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}