// Shared helper: recompute a product's average rating + review count from approved reviews.
export async function recomputeProductRating(serviceClient, productId) {
  const reviews = await serviceClient.entities.Review.filter({ product_id: productId, status: "approved" });
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count : 0;
  const rating = Math.round(avg * 10) / 10;
  return await serviceClient.entities.Product.update(productId, { rating, reviews_count: count });
}