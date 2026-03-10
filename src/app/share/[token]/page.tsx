import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function getShareData(token: string) {
  try {
    const res = await fetch(`${APP_URL}/api/share/${token}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { token: string } }) {
  const data = await getShareData(params.token);
  if (!data) return { title: "Photo non trouvée" };

  return {
    title: `Photo de ${data.event?.name || "course"} | Focus Racer`,
    description: `Découvrez cette photo de ${data.event?.name}`,
    openGraph: {
      title: `Photo de ${data.event?.name}`,
      description: `Photographié par ${data.event?.user?.name || "un photographe"} sur Focus Racer`,
      images: data.photo?.imagePath ? [`${APP_URL}${data.photo.imagePath}`] : [],
    },
  };
}

export default async function SharePage({ params }: { params: { token: string } }) {
  const data = await getShareData(params.token);
  if (!data) notFound();

  // Track view
  fetch(`${APP_URL}/api/share/${params.token}/view`, { method: "POST" }).catch(() => {});

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-white/10 py-4 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-focus-racer.png" alt="Focus Racer" width={120} height={40} className="h-8 w-auto" />
        </Link>
      </header>

      {/* Photo */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {data.photo?.imagePath && (
            <div className="rounded-2xl overflow-hidden shadow-lg mb-6">
              <img
                src={data.photo.imagePath}
                alt={`Photo de ${data.event?.name}`}
                className="w-full h-auto"
              />
            </div>
          )}

          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-gray-900">{data.event?.name}</h1>
            {data.event?.date && (
              <p className="text-sm text-gray-500">
                {new Date(data.event.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {data.event?.location && ` — ${data.event.location}`}
              </p>
            )}
            {data.event?.user?.name && (
              <p className="text-xs text-gray-400">
                Photo par {data.event.user.name}
              </p>
            )}
          </div>

          <div className="text-center mt-8">
            <Link
              href={`/events/${data.event?.id || ""}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors shadow-lg"
            >
              Voir toutes les photos
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-gray-400">
        Focus Racer — Plateforme de photos de courses sportives
      </footer>
    </div>
  );
}
