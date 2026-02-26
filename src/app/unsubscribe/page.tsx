"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const eventName = searchParams.get("event");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {status === "success" ? (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Désinscription confirmée</h1>
            <p className="text-gray-500 mb-6">
              Vous ne recevrez plus de notifications pour
              {eventName ? <> l&apos;événement <strong>&quot;{eventName}&quot;</strong></> : " cet événement"}.
            </p>
          </>
        ) : status === "not_found" ? (
          <>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Lien invalide</h1>
            <p className="text-gray-500 mb-6">
              Ce lien de désinscription n&apos;est plus valide ou a déjà été utilisé.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Erreur</h1>
            <p className="text-gray-500 mb-6">
              Une erreur est survenue lors de la désinscription. Veuillez réessayer.
            </p>
          </>
        )}

        <Link
          href="/explore"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-[#0f172a] text-white rounded-xl text-sm font-medium hover:bg-[#1e293b] transition-colors"
        >
          Retour aux événements
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
