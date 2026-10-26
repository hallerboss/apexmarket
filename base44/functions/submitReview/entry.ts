import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { recomputeProductRating } from "../../shared/reviews.ts";

// Diverse cast of ordinary-looking people: every review gets a different person.
const AVATAR_PEOPLE = [
  "a Black man in his 30s with short cropped hair and a close beard",
  "a Black woman with natural curly hair and a warm smile",
  "a Black woman with long braided hair",
  "a young Black man with a high fade haircut",
  "a Black man in his 50s with greying short hair and glasses",
  "an East Asian (Chinese) woman with straight shoulder-length black hair",
  "an East Asian (Chinese) man with short black hair and glasses",
  "a young Chinese woman with a blunt bob haircut",
  "a Chinese man in his 40s with neatly combed black hair",
  "a young Chinese woman with long black hair and a light fringe",
  "a South Asian woman with long dark wavy hair",
  "a South Asian man with dark hair and a short beard",
  "a white man with light brown hair and a light beard",
  "a white woman with blonde hair in a low ponytail",
  "a Latino man with wavy dark hair",
  "a Latina woman with dark curly hair",
  "a Middle Eastern woman with dark hair and olive skin",
  "a Southeast Asian woman with long straight black hair",
  "a Pacific Islander man with dark hair and a friendly grin",
  "an older white woman with short grey hair and glasses"
];

// Locations: studio plus everyday places, outdoors and indoors.
const AVATAR_BACKGROUNDS = [
  "clean soft beige studio backdrop",
  "sunny sandy beach with ocean waves softly blurred behind",
  "blurred busy city street with storefronts in daylight",
  "mountain overlook with hazy peaks blurred behind",
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
  "quiet forest trail with tall trees blurred behind",
  "desert landscape with warm sand dunes blurred behind",
  "blurred subway platform with warm lights",
  "snowy mountain village softly blurred behind",
  "blurred city park bench and trees in autumn"
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

// Rotates through every pool so consecutive reviews never repeat a look.
function buildAvatarPrompt(author, rotation) {
  const base = Math.abs(hashCode(author)) + rotation;
  const person = AVATAR_PEOPLE[base % AVATAR_PEOPLE.length];
  const background = AVATAR_BACKGROUNDS[(base * 3 + 1) % AVATAR_BACKGROUNDS.length];
  const pose = AVATAR_POSES[(base * 5 + 2) % AVATAR_POSES.length];
  const framing = AVATAR_FRAMINGS[(base * 7 + 3) % AVATAR_FRAMINGS.length];
  return `Photorealistic candid headshot photograph of ${person}, an ordinary real person, a completely unique individual with a face unlike any other, posing as a customer named ${author}, ${pose}, ${framing}, ${background}, natural skin texture and pores, everyday casual clothing, shot on an 85mm lens at f/2, soft natural light, shallow depth of field, authentic customer profile photo, sharp focus, high resolution, no text, no illustration, not a painting, not 3d render`;
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

    // Reviewer's own photo when supplied, otherwise their account profile photo,
    // and only if neither exists, a photorealistic AI headshot.
    let reviewerAvatar = typeof avatar === "string" ? avatar : "";
    if (!reviewerAvatar) {
      try {
        const me = await base44.auth.me();
        reviewerAvatar = me?.photo || "";
      } catch (e) {
        reviewerAvatar = "";
      }
    }
    if (!reviewerAvatar) {
      try {
        // Rotate through the pools based on how many reviews already exist,
        // so each new review shows a different person and setting.
        let existingCount = 0;
        try {
          existingCount = await base44.asServiceRole.entities.Review.count({});
        } catch (e) {
          existingCount = 0;
        }
        const res = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: buildAvatarPrompt(author, existingCount),
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