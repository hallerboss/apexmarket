import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const topic = body?.topic || '';
    const category = body?.category || 'Buying Guides';

    const prompt = `You are an expert e-commerce content writer for ApexMarket, a premium multi-vendor marketplace.
${topic ? `Write about this specific topic: ${topic}` : 'Search the web for currently trending products, popular consumer tech, and shopping trends right now.'}

Category: ${category}

Write a complete, SEO-optimized blog post article (800-1200 words) that helps shoppers make informed buying decisions. Include:
- An engaging introduction that hooks the reader
- Key product recommendations with specific features and benefits
- Comparison points and buying considerations (price ranges, what to look for)
- A conclusion with a call to action to shop at ApexMarket

Format the content in clean HTML using <h2>, <h3>, <p>, <ul>, <li> tags only. Do NOT include <html>, <body>, or <h1> tags — the title is rendered separately.

Also generate:
- A compelling title (under 70 characters)
- A URL-friendly slug (lowercase, hyphenated)
- A 1-2 sentence excerpt
- 5-8 relevant tags
- An SEO title (under 60 characters)
- A meta description (150-160 characters)`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_1_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          slug: { type: 'string' },
          excerpt: { type: 'string' },
          content: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          seo_title: { type: 'string' },
          meta_description: { type: 'string' }
        },
        required: ['title', 'slug', 'excerpt', 'content']
      }
    });

    return Response.json({ post: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}