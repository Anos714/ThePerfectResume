import { RegisterInput } from "@/modules/users/auth.schema";
import { AppError } from "@/utils/AppError";
import {
  createUser,
  findUserByEmail,
  updateVerificationStatus,
} from "./user.repository";

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
