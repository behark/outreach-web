import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "score";

  try {
    // Basic fetch
    const leads = await prisma.outreachLead.findMany({
      include: {
        history: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    // Map and filter (some filtering is easier in JS for now to match local logic)
    const items = leads.map((lead: any) => {
      const lastStatus = lead.history[0];
      return {
        lead_key: lead.leadKey,
        name: lead.name,
        category: lead.category,
        city: lead.city,
        phone: lead.phone,
        rating: lead.rating,
        reviews: lead.reviews,
        website: lead.website,
        demo_url: lead.demoUrl,
        score: calculateScore(lead),
        last_status: lastStatus?.status || "",
        last_note: lastStatus?.note || "",
      };
    });

    let filtered = items;
    if (status) {
      filtered = filtered.filter((i: any) => i.last_status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((i: any) => 
        i.name.toLowerCase().includes(q) || 
        (i.city || "").toLowerCase().includes(q) || 
        (i.category || "").toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === "score") {
      filtered.sort((a: any, b: any) => b.score - a.score || a.name.localeCompare(b.name));
    } else if (sort === "reviews") {
      filtered.sort((a: any, b: any) => parseInt(b.reviews || "0") - parseInt(a.reviews || "0") || a.name.localeCompare(b.name));
    } else if (sort === "rating") {
      filtered.sort((a: any, b: any) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0") || a.name.localeCompare(b.name));
    } else if (sort === "name") {
      filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    const summary = {
      visible: filtered.length,
      total: items.length,
      closed_won: items.filter((i: any) => i.last_status === "closed_won").length
    };

    return NextResponse.json({ leads: filtered, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function calculateScore(lead: any) {
  let score = 0;
  const rating = parseFloat(lead.rating || "0");
  const reviews = parseInt(lead.reviews?.replace(/\D/g, "") || "0");
  
  if (rating >= 4.8) score += 35;
  else if (rating >= 4.5) score += 25;
  else if (rating >= 4.0) score += 15;
  
  score += Math.min(reviews, 500) / 10;
  if (!lead.website) score += 30;
  if (lead.demoUrl) score += 20;
  if (lead.instagramUrl || lead.facebookUrl) score += 10;
  if (lead.phone || lead.whatsappUrl) score += 10;
  
  return Math.floor(score);
}
