import React from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import type { TutorialStep } from "@/types/database";
import { resolveCdnMediaUrl } from "@/lib/media/upload-media";

export interface TutorialStepViewProps {
  step: TutorialStep;
  tutorialTitle: string;
}

export function TutorialStepView({ step, tutorialTitle }: TutorialStepViewProps) {
  // Construcción de la URL de medios a partir de media_path
  let mediaUrl = "";
  if (step.media_path) {
    if (step.media_path.startsWith("http://") || step.media_path.startsWith("https://")) {
      mediaUrl = resolveCdnMediaUrl(step.media_path);
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const fullUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/league-media/${step.media_path.replace(/^\//, "")}`;
      mediaUrl = resolveCdnMediaUrl(fullUrl);
    }
  }

  const isVideo =
    step.media_type === "video" ||
    (step.media_path ? step.media_path.toLowerCase().endsWith(".mp4") : false);

  const altText = `Paso ${step.step_order + 1}: ${step.title} (${tutorialTitle})`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {step.step_order + 1}
        </span>
        <h3 className="text-lg font-semibold tracking-tight text-gray-900">
          {step.title}
        </h3>
      </div>

      {/* Contenido Markdown renderizado de forma segura en JSX puro */}
      <div className="prose prose-sm prose-blue mt-4 max-w-none text-gray-700 leading-relaxed">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-3 text-sm sm:text-base">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            ul: ({ children }) => <ul className="mb-3 list-disc pl-5 space-y-1 text-sm">{children}</ul>,
            ol: ({ children }) => <ol className="mb-3 list-decimal pl-5 space-y-1 text-sm">{children}</ol>,
            li: ({ children }) => <li>{children}</li>,
            code: ({ children }) => (
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-blue-800 border border-gray-200">
                {children}
              </code>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              >
                {children}
              </a>
            ),
          }}
        >
          {step.body_md}
        </ReactMarkdown>
      </div>

      {/* Renderizado de Media (Video MP4 o Imagen/GIF/WebP) */}
      {mediaUrl && (
        <div className="mt-5 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {isVideo ? (
            <video
              controls
              preload="metadata"
              className="max-h-[480px] w-full rounded-lg object-contain bg-black"
              src={mediaUrl}
            >
              Tu navegador no soporta la reproducción de video HTML5.
            </video>
          ) : (
            <div className="relative flex items-center justify-center p-2">
              <Image
                src={mediaUrl}
                alt={altText}
                width={800}
                height={450}
                unoptimized
                className="max-h-[480px] w-auto rounded-lg object-contain"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
