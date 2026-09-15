import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

function escapeXml(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const method = req.method;

    // POST = admin-triggered sync (require admin auth)
    // GET = public feed fetch by Google Merchant Center (no auth)
    if (method === "POST") {
      const user = await base44.auth.me();
      if (!user || user.role !== "admin") {
        return Response.json({ error: "Admin access required" }, { status: 403 });
      }
    }

    // Load settings
    const settings = await base44.asServiceRole.entities.SiteSetting.list();
    const getSetting = (key) => settings.find((s) => s.key === key)?.value || "";
    const storeName = getSetting("store_name") || "ApexMarket";

    // Fetch published products eligible for Google Shopping
    const products = await base44.asServiceRole.entities.Product.filter({ status: "published" }, "-created_date", 500);
    const eligible = products.filter((p) => p.google_shopping !== false);

    const baseUrl = "https://apexmarket-app.base44.app";

    const items = eligible.map((p) => {
      const price = (p.sale_price || p.price || 0).toFixed(2);
      const availability = (p.stock || 0) > 0 ? "in stock" : "out of stock";
      const image = p.images?.[0] || "";
      const link = `${baseUrl}/product/${p.id}`;
      const desc = String(p.short_description || p.description || "").replace(/<[^>]+>/g, "").slice(0, 5000);
      const brand = p.brand || storeName;
      const additionalImages = (p.images || []).slice(1, 10);

      let xml = "    <item>\n";
      xml += `      <g:id>${escapeXml(p.id)}</g:id>\n`;
      xml += `      <g:title>${escapeXml(p.name)}</g:title>\n`;
      xml += `      <g:description>${escapeXml(desc)}</g:description>\n`;
      xml += `      <g:link>${escapeXml(link)}</g:link>\n`;
      if (image) xml += `      <g:image_link>${escapeXml(image)}</g:image_link>\n`;
      additionalImages.forEach((img) => {
        xml += `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>\n`;
      });
      xml += `      <g:availability>${availability}</g:availability>\n`;
      xml += `      <g:price>${price} USD</g:price>\n`;
      if (p.sale_price && p.sale_price < p.price) {
        xml += `      <g:sale_price>${p.sale_price.toFixed(2)} USD</g:sale_price>\n`;
      }
      xml += `      <g:brand>${escapeXml(brand)}</g:brand>\n`;
      xml += `      <g:condition>new</g:condition>\n`;
      if (p.category) xml += `      <g:google_product_category>${escapeXml(p.category)}</g:google_product_category>\n`;
      if (p.sku) {
        xml += `      <g:gtin>${escapeXml(p.sku)}</g:gtin>\n`;
        xml += `      <g:mpn>${escapeXml(p.sku)}</g:mpn>\n`;
      }
      xml += "    </item>";
      return xml;
    }).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n  <channel>\n    <title>${escapeXml(storeName)} - Product Feed</title>\n    <link>${escapeXml(baseUrl)}</link>\n    <description>Google Merchant Center product feed for ${escapeXml(storeName)}</description>\n${items}\n  </channel>\n</rss>`;

    // For POST: save sync timestamp and return summary
    if (method === "POST") {
      const syncTime = new Date().toISOString();
      const existing = settings.find((s) => s.key === "merchant_last_sync");
      if (existing) {
        await base44.asServiceRole.entities.SiteSetting.update(existing.id, { value: syncTime });
      } else {
        await base44.asServiceRole.entities.SiteSetting.create({ key: "merchant_last_sync", value: syncTime });
      }
      return Response.json({
        success: true,
        synced: eligible.length,
        last_sync: syncTime,
        feed_url: `${baseUrl}/functions/syncGoogleMerchant`,
      });
    }

    // For GET: return the XML feed for Google's scheduled fetch
    return new Response(xml, {
      headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}