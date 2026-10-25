import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { recomputeProductRating } from "../../shared/reviews.ts";

const AVATAR_BACKGROUNDS = [
  "clean soft beige studio backdrop",
  "blurred modern city street in daylight",
  "warm wooden cafe interior, softly out of focus",
  "bright home office with shelves blurred behind",
  "blurred green park foliage and soft daylight",
  "soft grey seamless studio backdrop",
  "sunlit living room with a bright window behind",
  "blurred coastal boardwalk at golden hour",
  "muted blue-grey studio backdrop",
  "blurred bookstore aisle with warm lamps",
  "soft terracotta wall with a gentle shadow",
  "blurred rooftop garden at dusk",
  "blurred farmers market stalls in daylight",
  "soft sage green studio backdrop"
];

const AVATAR_POSES = [
  "arms relaxed at their sides, shoulders squared to the camera",
  "head tilted slightly, soft genuine smile",
  "chin resting lightly on one hand, warm gaze",
  "body turned slightly away, looking back over the shoulder at the camera",
  "arms lightly crossed, friendly confident smile",
  "one hand tucking hair behind the ear, laughing softly",
  "leaning slightly forward toward the camera, bright engaged expression",
  "hands in pockets, casual relaxed stance",
  "one hand raised in a small friendly wave",
  "seated at a table with forearms resting in front, open smile",
  "holding a coffee cup with both hands, relaxed expression",
  "standing with one hand on the hip, easy confident grin"
];

const AVATAR_FRAMINGS = [
  "tight head-and-shoulders portrait filling the frame",
  "head-and-shoulders crop with a little space above the head",
  "three-quarter view portrait, head and shoulders",
  "portrait shot from a slightly lower angle looking up",
  "portrait shot from a slightly higher angle, head and shoulders",
  "close head-and-shoulders portrait, subject just off center"
];

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

function pick(list, seed) {
  return list[Math.abs(hashCode(seed)) % list.length];
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { product_id, product_name, author, email, rating, title, comment, media, avatar } = body || {};
    if (!product_id || !author || !rating || !comment) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return Response.json({ error: "Invalid rating" }, { status: 400 });
    }

    // Reviewer's own photo when supplied, otherwise a photorealistic AI headshot
    let reviewerAvatar = typeof avatar === "string" ? avatar : "";
    if (!reviewerAvatar) {
      try {
        const background = pick(AVATAR_BACKGROUNDS, author + "|bg");
        const pose = pick(AVATAR_POSES, author + "|pose");
        const framing = pick(AVATAR_FRAMINGS, author + "|frame");
        const res = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: `Photorealistic headshot photograph of a real, ordinary-looking person named ${author}, ${pose}, ${framing}, ${background}, natural skin texture and pores, everyday casual clothing, shot on an 85mm lens at f/2, soft natural light, shallow depth of field, authentic candid customer profile photo, sharp focus, high resolution, no text, no illustration, not a painting, not 3d render`,
        });
        reviewerAvatar = res?.url || "";
      } catch (e) {
        console.error("avatar generation failed:", e?.message || e);
      }
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
      avatar: reviewerAvatar,
      status: "approved",
    });
    const product = await recomputeProductRating(base44.asServiceRole, product_id);
    return Response.json({ review, rating: product.rating, reviews_count: product.reviews_count });
  } catch (error) {
    console.error("submitReview error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}