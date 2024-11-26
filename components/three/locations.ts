export interface Location {
  name: string;
  coordinates: [number, number]; // [latitude, longitude]
  description?: string;
}

export const visitedLocations: Location[] = [
  {
    name: "Singapore",
    coordinates: [1.3521, 103.8198],
    description: "The Little Red Dot"
  },
  {
    name: "Hong Kong",
    coordinates: [22.3193, 114.1694],
    description: "Pearl of the Orient"
  },
  {
    name: "Notre Dame",
    coordinates: [41.7002, -86.2379],
    description: "Our Lady's University"
  }
];
