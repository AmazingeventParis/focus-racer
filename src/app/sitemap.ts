import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://focusracer.swipego.app";

export const revalidate = 3600; // regenerate at most once per hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, changeFrequency: "daily", priority: 1 },
    { url: `${APP_URL}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/pricing`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_URL}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${APP_URL}/legal`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const events = await prisma.event.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, updatedAt: true },
      orderBy: { date: "desc" },
      take: 5000,
    });

    const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
      url: `${APP_URL}/events/${event.id}`,
      lastModified: event.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...eventPages];
  } catch (err) {
    console.error("[sitemap] Error fetching events:", err);
    return staticPages;
  }
}
