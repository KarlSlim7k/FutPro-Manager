import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import type { Venue } from "@/types/database";

type VenueCardData = Pick<Venue, "id" | "name" | "address" | "city" | "state" | "latitude" | "longitude">;

interface VenueCardProps {
  leagueSlug: string;
  venue: VenueCardData;
}

function getLocation(venue: VenueCardData) {
  return [venue.city, venue.state].filter((value): value is string => Boolean(value)).join(", ");
}

export function VenueCard({ leagueSlug, venue }: VenueCardProps) {
  const hasCoordinates = venue.latitude !== null && venue.longitude !== null;

  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle className="line-clamp-2 text-lg">{venue.name}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">Dirección: {venue.address || "No definida"}</p>
          <p className="text-sm text-gray-600">Ubicación: {getLocation(venue) || "No definida"}</p>
          <p className="text-sm text-gray-600">
            Coordenadas: {hasCoordinates ? `${venue.latitude}, ${venue.longitude}` : "No definidas"}
          </p>
        </CardContent>
      </div>

      <CardContent className="pt-2">
        <TextLink
          href={`/dashboard/leagues/${leagueSlug}/venues/${venue.id}`}
        >
          Ver detalle
        </TextLink>
      </CardContent>
    </Card>
  );
}
