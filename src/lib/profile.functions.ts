import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const now = new Date().toISOString();
    const {
      data: userData,
      error: userError,
    } = await context.supabase.auth.getUser();
    if (userError || !userData.user) {
      throw userError ?? new Error("Unable to resolve authenticated user");
    }

    const { data: existingProfile, error: existingProfileError } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("id", context.userId)
      .maybeSingle();

    if (existingProfileError) throw existingProfileError;

    if (!existingProfile) {
      const { error: insertError } = await context.supabase.from("profiles").insert({
        id: context.userId,
        display_name: userData.user.user_metadata?.display_name ?? userData.user.email?.split("@")[0] ?? null,
        visibility: "private",
        created_at: now,
        updated_at: now,
      });
      if (insertError) throw insertError;
    }

    const [profileRes, rolesRes, badgesRes] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase
        .from("user_badges")
        .select("badge_id, issue_number, displayed, earned_at, badges(name, description, rarity, icon, color, max_supply)")
        .eq("user_id", context.userId)
        .order("earned_at", { ascending: false }),
    ]);
    if (profileRes.error) throw profileRes.error;
    return {
      profile: profileRes.data,
      roles: (rolesRes.data ?? []).map((r) => r.role),
      badges: badgesRes.data ?? [],
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      display_name: z.string().max(80).optional(),
      username: z.string().min(2).max(40).regex(/^[a-zA-Z0-9_-]+$/).optional().nullable(),
      bio: z.string().max(500).optional().nullable(),
      region: z.string().max(80).optional().nullable(),
      interests: z.array(z.string().max(40)).max(20).optional(),
      visibility: z.enum(["public", "private"]).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
