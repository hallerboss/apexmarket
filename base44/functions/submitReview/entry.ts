import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { recomputeProductRating } from "../../shared/reviews.ts";

const AVATAR_STYLES = [
  "soft pastel mint background, warm friendly expression, soft studio lighting",
  "deep blue gradient background, calm confident expression",
  "warm peach background, cheerful smile",
  "lavender background, gentle thoughtful expression",
  "sunny yellow background, bright happy expression",
  "charcoal background, professional composed expression",
  "terracotta background, relaxed friendly expression",
  "sage green background, approachable expression"
];

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { product_id, product_name, author, email, rating, title, comment, media } = body || {};
    if (!product_id || !author || !rating || !comment) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return Response.json({ error: "Invalid rating" }, { status: 400 });
    }

    // Generate an AI circle avatar for the reviewer
    let avatar = "";
    try {
      const style = AVATAR_STYLES[Math.abs(hashCode(author)) % AVATAR_STYLES.length];
      const res = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: `Circular avatar portrait of a friendly person named ${author}, head and shoulders centered, minimalist illustrated style, ${style}, high quality, suitable as a small profile picture`,
      });
      avatar = res?.url || "";
    } catch (e) {
      console.error("avatar generation failed:", e?.message || e);
    }

    const review = await base44.asServiceRole.entities.Review.create({
      product_id,
      product_name: product_name || "",
      author,
      email: email || "",
      rating: r,
      title: title || "",
      comment,
      media: Array.isArray(media) ? media : [],
      avatar,
      status: "approved",
    });
    const product = await recomputeProductRating(base44.asServiceRole, product_id);
    return Response.json({ review, rating: product.rating, reviews_count: product.reviews_count });
  } catch (error) {
    console.error("submitReview error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}