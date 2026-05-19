interface EntityImagePreviewProps {
  imageUrl: string | null;
  alt: string;
  label: string;
}

export function EntityImagePreview({ imageUrl, alt, label }: EntityImagePreviewProps) {
  if (!imageUrl) {
    return <p className="text-sm text-gray-600">{label}: Sin imagen.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">{label} actual</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={alt} className="h-24 w-24 rounded-lg border border-gray-200 object-contain" />
    </div>
  );
}
