import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { recomputeProductRating } from "../../shared/reviews.ts";

const AVATAR_STYLES = [
  "soft neutral beige background, warm friendly expression, soft natural window light",
  "muted blue-grey background, calm confident expression",
  "warm peach background, cheerful smile",
  "soft lavender background, gentle thoughtful expression",
  "sunny warm background, bright happy expression",
  "dark charcoal background, professional composed expression",
  "terracotta background, relaxed friendly expression",
  "sage green background, approachable expression"
];

const AVATAR_POSES = [
  "arms relaxed at their sides, shoulders squared to the camera",
  "head tilted slightly, soft genuine smile",
  "chin resting lightly on one hand, warm gaze",
  "body turned slightly away, looking back over the shoulder at the camera",
  "arms lightly crossed, friendly confident smile",
  "one hand tucking hair behind the ear, laughing softly",
  "leaning slightly forward toward the camera, bright engaged expression",
  "hands in pockets, casual relaxed stance"
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
      const pose = AVATAR_POSES[Math.abs(hashCode(author + "|pose")) % AVATAR_POSES.length];
      const res = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: `Photorealistic headshot photograph of a real, ordinary-looking person named ${author}, ${pose}, head and shoulders visible and filling the frame, natural skin texture and pores, everyday casual clothing, shot on an 85mm lens at f/2, soft natural window light, shallow depth of field, ${style}, authentic candid customer profile photo, sharp focus, high resolution, no text, no illustration, not a painting, not 3d render`,
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