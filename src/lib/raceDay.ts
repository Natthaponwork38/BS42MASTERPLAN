// Race Day requirements supplied by the user on 17 October 2026.
// This is separate from the deliberately excluded workbook Fueling Plan sheet.
export const raceOverview = { name: 'Bangsaen42', date: '2026-11-15', distanceKm: 42.195, goal: 'Sub-4', pace: '~5:41/km', hours: 4 } as const;

export const fuelingTimeline = [
  { time: 'Pre-race', product: 'ProEngy + AminoVITAL Blue', carbs: 70, caffeine: 0, kind: 'pre-race', productId: null },
  { time: '00:25', product: 'AminoVITAL Red', carbs: 28, caffeine: 0, kind: 'planned', productId: 'red' },
  { time: '00:55', product: 'X-REAL Blackcurrant', carbs: 29, caffeine: 0, kind: 'planned', productId: 'blackcurrant' },
  { time: '01:25', product: 'AminoVITAL Red', carbs: 28, caffeine: 0, kind: 'planned', productId: 'red' },
  { time: '01:55', product: 'X-REAL Blackcurrant', carbs: 29, caffeine: 0, kind: 'planned', productId: 'blackcurrant' },
  { time: '02:25', product: 'AminoVITAL Red', carbs: 28, caffeine: 0, kind: 'planned', productId: 'red' },
  { time: '02:55', product: 'X-REAL C29+ Orange', carbs: 29, caffeine: 75, kind: 'planned', productId: 'orange' },
  { time: '03:25', product: 'AminoVITAL Red', carbs: 28, caffeine: 0, kind: 'planned', productId: 'red' },
  { time: '03:50', product: 'X-REAL Blackcurrant', carbs: 29, caffeine: 0, kind: 'backup', productId: 'blackcurrant' },
] as const;

const planned = fuelingTimeline.filter(item => item.kind === 'planned');
const backup = fuelingTimeline.filter(item => item.kind === 'backup');
const preRaceCarbs = fuelingTimeline.filter(item => item.kind === 'pre-race').reduce((sum, item) => sum + item.carbs, 0);
const plannedCarbs = planned.reduce((sum, item) => sum + item.carbs, 0);
const backupCarbs = backup.reduce((sum, item) => sum + item.carbs, 0);
export const fuelingSummary = {
  preRaceCarbs, plannedCarbs, backupCarbs, maxInRaceCarbs: plannedCarbs + backupCarbs,
  plannedGels: planned.length, carryGels: planned.length + backup.length,
  carbsPerHour: Math.round(plannedCarbs / raceOverview.hours),
  caffeineMg: planned.reduce((sum, item) => sum + item.caffeine, 0),
};

export const packingProducts = [
  { id: 'proengy', group: 'Pre-Race', name: 'ProEngy Carb Powder 50g', quantity: 1, detail: '' },
  { id: 'blue', group: 'Pre-Race', name: 'AminoVITAL Blue 100g', quantity: 1, detail: '' },
  { id: 'red', group: 'Race Gels', name: 'AminoVITAL Red', quantity: fuelingTimeline.filter(item => item.productId === 'red').length, detail: '' },
  { id: 'blackcurrant', group: 'Race Gels', name: 'X-REAL Blackcurrant', quantity: fuelingTimeline.filter(item => item.productId === 'blackcurrant').length, detail: '2 planned + 1 backup' },
  { id: 'orange', group: 'Race Gels', name: 'X-REAL C29+ Orange', quantity: fuelingTimeline.filter(item => item.productId === 'orange').length, detail: '75mg caffeine' },
] as const;

export type PackingId = typeof packingProducts[number]['id'];
export type PackingState = Record<PackingId, boolean>;
export const PACKING_STORAGE_KEY = 'bs42-race-day-packing-v1';
export const emptyPacking = (): PackingState => ({ proengy: false, blue: false, red: false, blackcurrant: false, orange: false });

export function parsePacking(value: string | null): PackingState {
  const packed = emptyPacking();
  try {
    const saved: unknown = JSON.parse(value ?? 'null');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      for (const { id } of packingProducts) packed[id] = (saved as Record<string, unknown>)[id] === true;
    }
  } catch { /* A malformed saved checklist starts empty. */ }
  return packed;
}
