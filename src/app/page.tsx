import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { PublicRooms } from "@/components/landing/PublicRooms";
import { Footer } from "@/components/landing/Footer";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getPublicRooms } from "@/lib/db/rooms";
import type { Room } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let rooms: Room[] = [];
  try {
    const supabase = await getSupabaseServer();
    rooms = await getPublicRooms(supabase, 6);
  } catch {
    // Supabase env not set or DB unreachable — render landing without rooms.
    rooms = [];
  }

  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Features />
      <PublicRooms rooms={rooms} />
      <Footer />
    </main>
  );
}
