import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const body = await req.json();
    const imageUrl = String(body.image_url || "").trim();
    if (!imageUrl) {
      return Response.json({ error: "Image is required." }, { status: 400 });
    }
    const base44 = createClientFromRequest(req);
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        "You are a shopping assistant. Given this product image, return 3 to 5 short search keywords that describe the product (for example 'wireless bluetooth speaker black'). Reply with only the keywords separated by spaces, no punctuation, no extra text.",
      file_urls: [imageUrl],
    });
    const query = String(result || "").trim().replace(/\s+/g, " ");
    return Response.json({ query });
  } catch (error) {
    console.error("imageSearch error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}