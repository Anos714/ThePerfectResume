import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

// Avatar/image uploads. Cloudinary handles on-the-fly resize + optimization,
// so avatars are delivered as a small transformed variant (see avatarUrl).
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
