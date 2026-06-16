"use client";

export default function PlaceCard({
  place,
}: {
  place: { name: string; address: string; rating?: number; url: string };
}) {
  return (
    <a
      href={place.url}
      target="_blank"
      rel="noreferrer"
      className="block border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{place.name}</h4>
        {place.rating ? (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            ⭐ {place.rating.toFixed(1)}
          </span>
        ) : null}
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{place.address}</p>
      <p className="text-[10px] text-gray-400 mt-1">Source: Google Maps</p>
    </a>
  );
}
