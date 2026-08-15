import { db } from "@/db";
import { users } from "@/db/schema";
import { RegisterInput } from "@/modules/users/auth.schema";
import { eq } from "drizzle-orm";

export const findUserByEmail = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
};

export const createUser = async (data: RegisterInput) => {
  const [user] = await db.insert(users).values(data).returning({
    id: users.id,
    username: users.username,
    email: users.email,
    isVerified: users.isVerified,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  });
  return user;
};

export const updateVerificationStatus = async (userId: string) => {
  const [updatedUser] = await db.update(users).set({ isVerified: true }).where(eq(users.id, userId)).returning({
    id: users.id,
    username: users.username,
    email: users.email,
    isVerified: users.isVerified,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  });
  return updatedUser;
};

