import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const image_url = body.image_url;
    const product_name = body.product_name || '';
    if (!image_url || typeof image_url !== 'string') {
      return Response.json({ error: 'image_url is required' }, { status: 400 });
    }

    const prompt = `You are an expert e-commerce product copywriter and catalog manager.

STEP 1 — Study the provided product image carefully. Identify exactly what the product is, plus its visible materials, colors, shapes, design details, components, ports/buttons, packaging, and any text or logos visible in the image. Your analysis must be grounded primarily in what you actually SEE in the image.
${product_name ? `The seller named this product: "${product_name}". Use this as a hint, but trust the image when they disagree.` : ''}

STEP 2 — Use web research on similar products in this category to enrich your understanding of typical specifications, materials and use cases. Write ORIGINAL content from your own analysis; never copy text from any source.

Return JSON with EXACTLY these fields:
- "description": rich HTML product description, 2-3 short paragraphs each wrapped in <p> tags. Describe the product, its build quality, materials, and intended use. Be specific and accurate to what is shown.
- "short_description": a concise 1-2 sentence HTML summary wrapped in a single <p> tag that states what the product is and its main benefit.
- "features": an array of EXACTLY 10 short, specific feature bullet strings. Each bullet must describe a concrete, observable or well-known attribute of THIS product (materials, dimensions, connectivity, power source, included accessories, design details, compatibility). Do not use generic filler like "high quality" or "great value".
- "seo_title": an SEO-optimized title, max 60 characters.
- "meta_description": a meta description, max 160 characters.
- "focus_keywords": an array of 5-8 SEO focus keyword strings.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gemini_3_1_pro',
      add_context_from_internet: true,
      file_urls: [image_url],
      response_json_schema: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          short_description: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } },
          seo_title: { type: 'string' },
          meta_description: { type: 'string' },
          focus_keywords: { type: 'array', items: { type: 'string' } },
        },
        required: ['description', 'short_description', 'features', 'seo_title', 'meta_description', 'focus_keywords'],
      },
    });

    const out = {
      description: typeof result.description === 'string' ? result.description : '',
      short_description: typeof result.short_description === 'string' ? result.short_description : '',
      features: Array.isArray(result.features) ? result.features.map((f) => String(f)).filter(Boolean) : [],
      seo_title: typeof result.seo_title === 'string' ? result.seo_title : '',
      meta_description: typeof result.meta_description === 'string' ? result.meta_description : '',
      focus_keywords: Array.isArray(result.focus_keywords) ? result.focus_keywords.map((k) => String(k)).filter(Boolean) : [],
    };
    return Response.json(out);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}