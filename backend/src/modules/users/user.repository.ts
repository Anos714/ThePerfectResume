import { db } from "@/db";
import { users } from "@/db/schema";
import { RegisterInput } from "@/modules/users/auth.schema";
import { eq } from "drizzle-orm";

const payload = {
  id: users.id,
  username: users.username,
  email: users.email,
  isVerified: users.isVerified,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

const payloadWithPassword = {
  ...payload,
  passwordHash: users.passwordHash,
};

export const findUserById = async (id: string) => {
  const [user] = await db.select(payload).from(users).where(eq(users.id, id));
  return user;
};

export const findUserByIdWithPassword = async (id: string) => {
  const [user] = await db
    .select(payloadWithPassword)
    .from(users)
    .where(eq(users.id, id));
  return user;
};

export const findUserByEmail = async (email: string) => {
  const [user] = await db
    .select(payload)
    .from(users)
    .where(eq(users.email, email));
  return user;
};

export const createUser = async (data: RegisterInput) => {
  const [user] = await db.insert(users).values(data).returning(payload);
  return user;
};

export const updateVerificationStatus = async (userId: string) => {
  const [updatedUser] = await db
    .update(users)
    .set({ isVerified: true })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });
  return updatedUser;
};

export const updateUserPassword = async (userId: string, password: string) => {
  const [updatedUser] = await db
    .update(users)
    .set({ passwordHash: password })
    .where(eq(users.id, userId))
    .returning(payload);
  return updatedUser;
};
