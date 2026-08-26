import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { recomputeProductRating } from "../../shared/reviews.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const { product_id } = body || {};
    if (!product_id) return Response.json({ error: "Missing product_id" }, { status: 400 });
    const product = await recomputeProductRating(base44.asServiceRole, product_id);
    return Response.json({ rating: product.rating, reviews_count: product.reviews_count });
  } catch (error) {
    console.error("recomputeProductRating error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}