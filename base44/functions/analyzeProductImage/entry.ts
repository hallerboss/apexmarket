import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const image_url = body.image_url;
    const product_name = body.product_name || '';
    if (!image_url || typeof image_url !== 'string') {
      return Response.json({ error: 'image_url is required' }, { status: 400 });
    }

    const prompt = `You are an expert e-commerce product copywriter. Analyze the provided product image${product_name ? ` (product name hint: "${product_name}")` : ''}. Research similar products on the web to understand typical features, materials and specifications. Then write ORIGINAL, accurate content from your own analysis — do not copy text from any source.

Return JSON with:
- description: a rich HTML product description (2-3 short paragraphs wrapped in <p> tags).
- short_description: a concise 1-2 sentence HTML summary.
- features: an array of EXACTLY 10 short feature bullet strings derived from the image and similar products.
- seo_title: an SEO-optimized title (<=60 chars).
- meta_description: a meta description (<=160 chars).
- focus_keywords: an array of 5-8 SEO focus keywords.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gemini_3_flash',
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

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}