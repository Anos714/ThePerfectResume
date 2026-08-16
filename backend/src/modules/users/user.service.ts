import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/modules/users/auth.schema";
import { AppError } from "@/utils/AppError";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdWithPassword,
  updateUserPassword,
  updateVerificationStatus,
} from "./user.repository";
import { redisClient } from "@/config/redis";

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
