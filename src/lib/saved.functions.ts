import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listSaved = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_opportunities")
      .select("opportunity_id, saved_at, note")
      .order("saved_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const toggleSaved = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ opportunityId: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("saved_opportunities")
      .select("id")
      .eq("user_id", context.userId)
      .eq("opportunity_id", data.opportunityId)
      .maybeSingle();
    if (existing) {
      await context.supabase.from("saved_opportunities").delete().eq("id", existing.id);
      return { saved: false };
    }
    await context.supabase.from("saved_opportunities").insert({
      user_id: context.userId,
      opportunity_id: data.opportunityId,
    });
    return { saved: true };
  });
