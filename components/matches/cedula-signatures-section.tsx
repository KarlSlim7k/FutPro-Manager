"use client";

import { useState } from "react";
import { DigitalSignaturePad } from "./digital-signature-pad";

interface CedulaSignaturesSectionProps {
  headRefName: string | null;
  firstAstName: string | null;
  secondAstName: string | null;
  fourthOffName: string | null;
  homeTeamName: string;
  awayTeamName: string;
  matchId: string;
}

export function CedulaSignaturesSection({
  headRefName,
  firstAstName,
  secondAstName,
  fourthOffName,
  homeTeamName,
  awayTeamName,
  matchId,
}: CedulaSignaturesSectionProps) {
  const [refereeSig, setRefereeSig] = useState<string | null>(null);
  const [homeCapSig, setHomeCapSig] = useState<string | null>(null);
  const [awayCapSig, setAwayCapSig] = useState<string | null>(null);

  return (
    <div className="pt-8 space-y-6">
      {/* Officials Signatures */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-xs">
        <div className="flex flex-col items-center">
          <DigitalSignaturePad
            roleName="Árbitro Central"
            signatoryName={headRefName ?? "Árbitro Central"}
            onSaveSignature={(sig) => setRefereeSig(sig)}
            existingSignatureUrl={refereeSig}
          />
          <div className="border-t border-gray-800 pt-1 font-bold text-gray-900 truncate w-full mt-1">
            {headRefName ?? "Árbitro Central"}
          </div>
          <span className="text-[10px] text-gray-500 uppercase">Árbitro Central</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="border-t border-gray-800 pt-1 font-bold text-gray-900 truncate w-full mt-auto">
            {firstAstName ?? "Primer Asistente"}
          </div>
          <span className="text-[10px] text-gray-500 uppercase">Primer Asistente</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="border-t border-gray-800 pt-1 font-bold text-gray-900 truncate w-full mt-auto">
            {secondAstName ?? "Segundo Asistente"}
          </div>
          <span className="text-[10px] text-gray-500 uppercase">Segundo Asistente</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="border-t border-gray-800 pt-1 font-bold text-gray-900 truncate w-full mt-auto">
            {fourthOffName ?? "Cuarto Oficial"}
          </div>
          <span className="text-[10px] text-gray-500 uppercase">Cuarto Oficial</span>
        </div>
      </div>

      {/* Team Captains Signatures */}
      <div className="grid grid-cols-2 gap-8 text-center text-xs max-w-xl mx-auto pt-2">
        <div className="flex flex-col items-center">
          <DigitalSignaturePad
            roleName={`Capitán ${homeTeamName}`}
            signatoryName={`Delegado ${homeTeamName}`}
            onSaveSignature={(sig) => setHomeCapSig(sig)}
            existingSignatureUrl={homeCapSig}
          />
          <div className="border-t border-gray-800 pt-1 font-bold text-gray-900 w-full mt-1">
            Capitán / Delegado
          </div>
          <span className="text-[10px] text-gray-500 uppercase">{homeTeamName}</span>
        </div>

        <div className="flex flex-col items-center">
          <DigitalSignaturePad
            roleName={`Capitán ${awayTeamName}`}
            signatoryName={`Delegado ${awayTeamName}`}
            onSaveSignature={(sig) => setAwayCapSig(sig)}
            existingSignatureUrl={awayCapSig}
          />
          <div className="border-t border-gray-800 pt-1 font-bold text-gray-900 w-full mt-1">
            Capitán / Delegado
          </div>
          <span className="text-[10px] text-gray-500 uppercase">{awayTeamName}</span>
        </div>
      </div>
    </div>
  );
}
