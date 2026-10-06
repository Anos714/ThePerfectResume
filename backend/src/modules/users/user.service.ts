import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/modules/users/auth.schema";
import { AppError } from "@/utils/AppError";
import {
  createGoogleAuthUser,
  createUser,
  findUserByEmail,
  findUserByEmailWithAuthProvider,
  findUserById,
  findUserByIdWithPassword,
  updateGoogleAuthUser,
  updateUserAvatar,
  updateUserPassword,
  updateVerificationStatus,
} from "./user.repository";
import { redisClient } from "@/config/redis";
import { cloudinary } from "@/config/cloudinary";
import { TokenPayload } from "google-auth-library";

// Avatar upload guard rails: images only, capped at 5 MB.
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export const uploadAvatarService = async (
  userId: string,
  file: File,
): Promise<string> => {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw AppError.BadRequest(
      "Unsupported file type. Please upload a JPEG, PNG, WebP, or AVIF image.",
    );
  }

  if (file.size > MAX_AVATAR_BYTES) {
    throw AppError.BadRequest("Image is too large. Maximum size is 5 MB.");
  }

  // Unsigned upload would leak the API secret to the browser; sign it
  // server-side instead. Avatars live under a per-user folder so a user's
  // old avatars are easy to find and clean up.
  const publicId = `avatars/${userId}/${crypto.randomUUID()}`;

  let uploadResult: { secure_url: string };
  try {
    uploadResult = await cloudinary.uploader.upload(
      // Cloudinary's SDK accepts a base64 data URI for buffer-less runtimes;
      // Bun File needs no intermediate copy.
      `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`,
      {
        public_id: publicId,
        folder: "avatars",
        overwrite: false,
        resource_type: "image",
      },
    );
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw AppError.InternalServerError(
      "Failed to upload image. Please try again.",
    );
  }

  const updatedUser = await updateUserAvatar(userId, uploadResult.secure_url);
  if (!updatedUser) {
    throw AppError.NotFound("User not found");
  }

  return uploadResult.secure_url;
};

export const registerUserService = async (data: RegisterInput) => {
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw AppError.Conflict("Invalid credentials");
  }

  if (!data.password) throw AppError.BadRequest("Password is required");

  const passwordHash = await Bun.password.hash(data.password);

  const newUser = await createUser({ ...data, password: passwordHash });

  return newUser;
};

export const verifyUserService = async (userId: string) => {
  const user = await updateVerificationStatus(userId);
  if (!user)
    throw AppError.NotFound("User verification failed. Account not found.");
  return user;
};

export const loginUserService = async (data: LoginInput) => {
  const user = await findUserByEmail(data.email);
  if (!user) throw AppError.NotFound("User not found");
  if (user.provider === "google")
    throw AppError.BadRequest("Please use Google to log in");
  return user;
};

export const forgotPasswordService = async (data: ForgotPasswordInput) => {
  const user = await findUserByEmail(data.email);
  if (!user) throw AppError.NotFound("User not found");
  if (user && !user.isVerified)
    throw AppError.Forbidden(
      "User not verified, please verify your email first.",
    );
  return user;
};

export const resetPasswordService = async (data: ResetPasswordInput) => {
  const storedOtp = await redisClient.get(`otp:${data.userId}`);

  if (!storedOtp) {
    throw AppError.BadRequest("OTP expired or user not found");
  }

  if (storedOtp !== data.otp) {
    throw AppError.BadRequest("Invalid OTP");
  }
  const passwordHash = await Bun.password.hash(data.newPassword);

  const updatedUser = await updateUserPassword(data.userId, passwordHash);

  await redisClient.del(`otp:${data.userId}`);

  return updatedUser;
};

export const getUserByIdService = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) throw AppError.NotFound("User not found");
  return user;
};

export const changePasswordService = async (
  data: ChangePasswordInput,
  userId: string,
) => {
  const user = await findUserByIdWithPassword(userId);
  if (!user) throw AppError.NotFound("User not found");
  if (!user.passwordHash)
    throw AppError.InternalServerError("Password is not set for this user");

  const oldPasswordMatch = await Bun.password.verify(
    data.oldPassword,
    user.passwordHash,
  );
  if (!oldPasswordMatch)
    throw AppError.BadRequest("Old password does not match");
  const passwordHash = await Bun.password.hash(data.newPassword);
  const updatedUser = await updateUserPassword(userId, passwordHash);
  return updatedUser;
};

export const googleAuthService = async (data: TokenPayload) => {
  const { email } = data;
  if (!email) throw AppError.BadRequest("Email not provided");
  let user = await findUserByEmailWithAuthProvider(email);
  if (user && user.provider !== "google") {
    throw AppError.BadRequest(
      "This email is registered with password. Please login using your email and password",
    );
  }

  if (!user) {
    user = await createGoogleAuthUser(data);
  } else if (user && user.provider === "google") {
    const hasChanged =
      user.googleId !== data.sub ||
      user.username !== data.name ||
      user.avatarUrl !== data.picture;
    if (hasChanged) {
      user = await updateGoogleAuthUser(user.id, data);
    }
  }

  return user;
};
