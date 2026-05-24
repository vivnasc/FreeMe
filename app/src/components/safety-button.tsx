"use client";

import { useState } from "react";

interface SafetyDict {
  helpNow: string;
  crisisTitle: string;
  crisisPT: string;
  crisisMZ: string;
  close: string;
}

export function SafetyButton({
  label,
  dict,
}: {
  label: string;
  dict: SafetyDict;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full bg-salvia px-4 py-2 font-sans text-sm text-creme shadow-lg transition-colors hover:bg-salvia/90"
        aria-label={label}
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carvao/40 backdrop-blur-sm">
          <div className="mx-6 w-full max-w-sm rounded-2xl bg-creme p-8 shadow-xl">
            <h2 className="font-serif text-xl font-semibold text-barro mb-6">
              {dict.crisisTitle}
            </h2>
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-areia p-4">
                <p className="font-sans text-xs text-carvao/60 mb-1">
                  Portugal
                </p>
                <p className="font-sans text-base font-medium text-carvao">
                  {dict.crisisPT}
                </p>
              </div>
              <div className="rounded-xl bg-areia p-4">
                <p className="font-sans text-xs text-carvao/60 mb-1">
                  Mocambique
                </p>
                <p className="font-sans text-base font-medium text-carvao">
                  {dict.crisisMZ}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-full border border-salvia/30 px-6 py-3 font-sans text-sm text-salvia transition-colors hover:bg-salvia/10"
            >
              {dict.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
