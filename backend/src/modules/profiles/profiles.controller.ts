import { Context, Env } from "hono";
import * as profileService from "./profiles.service";
import { ProfileInput } from "./profiles.schema";

type ProfileContext = Context<
  Env,
  string,
  {
    in: { json: ProfileInput };
    out: { json: ProfileInput };
  }
>;

export const getProfileController = async (c: Context) => {
  const user = c.get("user");
  const profile = await profileService.getProfileService(user.id);
  return c.json(
    {
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    },
    200,
  );
};

export const saveProfileController = async (c: ProfileContext) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const profile = await profileService.saveProfileService(user.id, data);
  return c.json(
    {
      success: true,
      message: "Profile saved successfully",
      data: profile,
    },
    200,
  );
};

export const deleteProfileController = async (c: Context) => {
  const user = c.get("user");
  await profileService.deleteProfileService(user.id);
  return c.json(
    {
      success: true,
      message: "Profile deleted successfully",
    },
    200,
  );
};
