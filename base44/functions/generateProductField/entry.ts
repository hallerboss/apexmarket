import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { type, image_url, product_name, product_description } = body || {};

    if (!type) return Response.json({ error: 'type is required' }, { status: 400 });

    let prompt = '';
    let schema: any = null;
    let useImage = false;

    if (type === 'title') {
      if (!image_url) return Response.json({ error: 'Product image required' }, { status: 400 });
      useImage = true;
      prompt = `Analyze this product image and generate 5 different compelling product titles for an e-commerce store.
${product_name ? `Current product name: ${product_name}` : 'No current name set.'}
Each title should be SEO-friendly, descriptive, and under 80 characters. Vary the style — some benefit-focused, some feature-focused, some brand-style.
Return exactly 5 title options.`;
      schema = {
        type: 'object',
        properties: { titles: { type: 'array', items: { type: 'string' } } },
        required: ['titles']
      };
    } else if (type === 'short_description') {
      if (!image_url) return Response.json({ error: 'Product image required' }, { status: 400 });
      useImage = true;
      prompt = `Perform a deep analysis of this product image. Extract the key features and selling points that a shopper would care about.
Generate 10 concise, benefit-driven feature bullets. Return them as HTML bullet points using <ul><li> format.
Also return the features as a plain array of strings.`;
      schema = {
        type: 'object',
        properties: {
          features_html: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } }
        },
        required: ['features_html', 'features']
      };
    } else if (type === 'meta_description') {
      prompt = `Generate 5 different SEO meta descriptions for a product.
${product_name ? `Product title: ${product_name}` : ''}
${product_description ? `Product description: ${product_description}` : ''}
Each meta description must be 150-160 characters, compelling, and include relevant keywords for search engines.
Return exactly 5 options.`;
      schema = {
        type: 'object',
        properties: { descriptions: { type: 'array', items: { type: 'string' } } },
        required: ['descriptions']
      };
    } else if (type === 'seo_title') {
      prompt = `Generate 5 SEO-optimized title tags for a product based on its name.
${product_name ? `Product name: ${product_name}` : ''}
Each SEO title should be under 60 characters, include primary search keywords, and be compelling for Google search results.
Return exactly 5 options.`;
      schema = {
        type: 'object',
        properties: { titles: { type: 'array', items: { type: 'string' } } },
        required: ['titles']
      };
    } else {
      return Response.json({ error: 'Invalid type. Use: title, short_description, meta_description, or seo_title' }, { status: 400 });
    }

    const llmParams: any = { prompt, response_json_schema: schema, model: 'gemini_3_1_pro' };
    if (useImage && image_url) {
      llmParams.file_urls = [image_url];
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM(llmParams);

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}