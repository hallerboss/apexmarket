import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const url = body.url;
    if (!url) return Response.json({ error: 'URL is required' }, { status: 400 });

    try { new URL(url); } catch {
      return Response.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      redirect: 'follow',
    });
    if (!response.ok) {
      return Response.json({ error: `Failed to fetch URL (${response.status})` }, { status: 400 });
    }

    const html = await response.text();
    const pageUrl = new URL(response.url || url);
    const origin = pageUrl.origin;

    // Extract text content
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ').trim().substring(0, 8000);

    // Extract image URLs and convert to absolute
    const imageMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
    const allImages = imageMatches
      .map((m) => {
        const src = m[1];
        if (src.startsWith('http')) return src;
        if (src.startsWith('//')) return 'https:' + src;
        if (src.startsWith('/')) return origin + src;
        return new URL(src, pageUrl.href).href;
      })
      .filter((src) => !src.includes('logo') && !src.includes('icon') && !src.includes('sprite') && !src.includes('favicon') && !src.includes('data:'))
      .slice(0, 20);

    // Extract page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';

    // Extract JSON-LD product data if available
    const jsonLdMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const jsonLdData = jsonLdMatches.map((m) => m[1]).join('\n').substring(0, 3000);

    // Use LLM to extract structured product data
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a product data extractor. Analyze the following web page content and extract product information.\n\nURL: ${url}\nPage Title: ${pageTitle}\n\nPage Content:\n${textContent}\n\nJSON-LD Data:\n${jsonLdData}\n\nImages found on page:\n${allImages.join('\n')}\n\nExtract the product details as structured data. For images, select only actual product images (not banners, logos, or UI elements). For variants, extract attributes like Size, Color, etc. with their available options. If a field is not found, leave it empty or 0.`,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Product name/title" },
          description: { type: "string", description: "Full product description (HTML allowed)" },
          short_description: { type: "string", description: "One-line product summary" },
          price: { type: "number", description: "Regular price (number only, no currency symbol)" },
          sale_price: { type: "number", description: "Sale price if available, 0 if none" },
          brand: { type: "string", description: "Brand name" },
          category: { type: "string", description: "Product category" },
          sku: { type: "string", description: "Product SKU if found" },
          images: { type: "array", items: { type: "string" }, description: "List of product image URLs" },
          variants: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Attribute name (e.g. Size, Color)" },
                options: { type: "array", items: { type: "string" }, description: "Available options" }
              }
            }
          },
          tags: { type: "array", items: { type: "string" }, description: "Product tags/keywords" }
        }
      }
    });

    return Response.json({ product: result });
  } catch (error) {
    console.error("importProductFromUrl error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}