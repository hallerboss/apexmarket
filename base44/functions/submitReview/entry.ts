import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { recomputeProductRating } from "../../shared/reviews.ts";

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
    const review = await base44.asServiceRole.entities.Review.create({
      product_id,
      product_name: product_name || "",
      author,
      email: email || "",
      rating: r,
      title: title || "",
      comment,
      media: Array.isArray(media) ? media : [],
      status: "approved",
    });
    const product = await recomputeProductRating(base44.asServiceRole, product_id);
    return Response.json({ review, rating: product.rating, reviews_count: product.reviews_count });
  } catch (error) {
    console.error("submitReview error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}