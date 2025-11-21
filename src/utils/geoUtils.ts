import { Coordinates } from '../types';

export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3;
  const φ1 = coord1.latitude * Math.PI / 180;
  const φ2 = coord2.latitude * Math.PI / 180;
  const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function calculateRouteDistance(route: Coordinates[]): number {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(route[i], route[i + 1]);
  }
  return totalDistance;
}

export function calculatePolygonArea(coordinates: Coordinates[]): number {
  if (coordinates.length < 3) return 0;

  const R = 6371000;
  let area = 0;

  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length;
    const lat1 = coordinates[i].latitude * Math.PI / 180;
    const lat2 = coordinates[j].latitude * Math.PI / 180;
    const lon1 = coordinates[i].longitude * Math.PI / 180;
    const lon2 = coordinates[j].longitude * Math.PI / 180;

    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs(area * R * R / 2);
  return area;
}

export function isPointInTerritory(point: Coordinates, territory: Coordinates[]): boolean {
  let inside = false;
  for (let i = 0, j = territory.length - 1; i < territory.length; j = i++) {
    const xi = territory[i].latitude;
    const yi = territory[i].longitude;
    const xj = territory[j].latitude;
    const yj = territory[j].longitude;

    const intersect = ((yi > point.longitude) !== (yj > point.longitude)) &&
      (point.latitude < (xj - xi) * (point.longitude - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function generateTerritoryFromRoute(route: Coordinates[], radius: number = 50): Coordinates[] {
  if (route.length === 0) return [];
  if (route.length === 1) {
    return createCirclePolygon(route[0], radius);
  }

  const territory: Coordinates[] = [];
  
  for (const point of route) {
    territory.push(point);
  }

  return territory;
}

function createCirclePolygon(center: Coordinates, radius: number, points: number = 16): Coordinates[] {
  const polygon: Coordinates[] = [];
  const R = 6371000;
  
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radius * Math.cos(angle);
    const dy = radius * Math.sin(angle);
    
    const latitude = center.latitude + (dy / R) * (180 / Math.PI);
    const longitude = center.longitude + (dx / R) * (180 / Math.PI) / Math.cos(center.latitude * Math.PI / 180);
    
    polygon.push({ latitude, longitude });
  }
  
  return polygon;
}

export function calculateExperienceGain(distance: number, territoriesConquered: number): number {
  const baseXP = Math.floor(distance / 100);
  const territoryBonus = territoriesConquered * 50;
  return baseXP + territoryBonus;
}

export function calculateLevel(experience: number): number {
  return Math.floor(Math.sqrt(experience / 100)) + 1;
}
