"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "@/i18n/navigation";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthUser } from "@/hooks/use-auth-user";
import { cn } from "@/lib/utils";

export function FavoriteButton({ slug }: { slug: string }) {
  const { user } = useAuthUser();
  const router = useRouter();
  const [favId, setFavId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase || !user) return;
    supabase
      .from("favorites")
      .select("id")
      .eq("kind", "destination")
      .eq("ref", slug)
      .maybeSingle()
      .then(({ data }) => setFavId(data?.id ?? null));
  }, [user, slug]);

  if (!isSupabaseConfigured()) return null;

  async function toggle() {
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }
    const supabase = getSupabaseBrowser()!;
    if (favId) {
      setFavId(null);
      await supabase.from("favorites").delete().eq("id", favId);
    } else {
      const { data } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, kind: "destination", ref: slug })
        .select("id")
        .single();
      setFavId(data?.id ?? null);
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={toggle}
      aria-pressed={!!favId}
      aria-label="Favorite"
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-colors",
        favId ? "bg-white text-coral" : "bg-white/20 text-white hover:bg-white/35"
      )}
    >
      <Heart className={cn("h-5 w-5", favId && "fill-coral")} />
    </motion.button>
  );
}
