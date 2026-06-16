export interface LatLng {
  lat: number;
  lng: number;
}

export interface NavPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category?: string;
}

export interface StepInfo {
  index: number;
  fromName: string;
  toName: string;
  summary: string;
  distance: number;
}
