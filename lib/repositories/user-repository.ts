import { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "../errors";
import { CreateProfileInput, Profile, UpdateProfileInput } from "../types";
import { BaseRepository } from "./base-repository";

export class UserRepository extends BaseRepository<Profile> {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  protected getTableName(): string {
    return "profiles";
  }

  async getProfile(userId: string): Promise<Profile> {
    await this.validateUser(userId);

    return this.executeQuery(
      async () =>
        await this.supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single(),
      "fetch user profile"
    );
  }

  async createProfile(
    input: CreateProfileInput,
    userId: string
  ): Promise<Profile> {
    await this.validateUser(userId);

    if (!input.email?.trim()) {
      throw new ValidationError("Email is required");
    }

    const profileData = {
      id: userId,
      email: input.email.trim(),
      display_name: input.displayName?.trim() || null,
    };

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("profiles")
          .insert(profileData)
          .select()
          .single(),
      "create user profile"
    );
  }

  async updateProfile(
    input: UpdateProfileInput,
    userId: string
  ): Promise<Profile> {
    await this.validateUser(userId);

    const updateData: Partial<Profile> = {};

    if (input.displayName !== undefined) {
      updateData.display_name = input.displayName?.trim() || null;
    }

    return this.executeMutation(
      async () =>
        await this.supabase
          .from("profiles")
          .update(updateData)
          .eq("id", userId)
          .select()
          .single(),
      "update user profile"
    );
  }

  async getAllUsers(): Promise<Profile[]> {
    return this.executeQueryList(
      async () =>
        await this.supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }),
      "fetch all users"
    );
  }

  async deleteUser(userId: string): Promise<void> {
    await this.validateUser(userId);

    // Delete user settings first
    const { error: settingsError } = await this.supabase
      .from("user_settings")
      .delete()
      .eq("user_id", userId);

    if (settingsError) {
      await this.handleError(settingsError, "delete user settings");
    }

    // Delete profile
    const { error: profileError } = await this.supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      await this.handleError(profileError, "delete user profile");
    }
  }
}
