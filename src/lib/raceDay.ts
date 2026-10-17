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

// Product-label values supplied by the user. Unknown carbohydrate/caffeine
// values are intentionally absent, rather than treated as zero.
export const revoCaps = {
  name: 'REVO CAPS Electrolyte + BCAA', shortName: 'REVO CAPS',
  nutrientsMg: { sodium: 150, potassium: 50, calcium: 20, magnesium: 15, bcaa: 50 },
} as const;

export const electrolyteSchedule = [
  { time: 'Pre-race', note: '10–20 minutes before start', quantity: 2, kind: 'pre-race' },
  { time: '01:00', note: '', quantity: 1, kind: 'in-race' },
  { time: '02:00', note: '', quantity: 1, kind: 'in-race' },
  { time: '03:00', note: '', quantity: 1, kind: 'in-race' },
] as const;

export const revoNutrients = (quantity: number) => Object.fromEntries(
  Object.entries(revoCaps.nutrientsMg).map(([nutrient, mg]) => [nutrient, mg * quantity]),
) as Record<keyof typeof revoCaps.nutrientsMg, number>;

const gelSodiumMg = { red: 140, blackcurrant: 110, orange: 120 } as const;
export const plannedGelSodium = Object.entries(gelSodiumMg).map(([productId, sodiumMg]) => {
  const sessions = planned.filter(item => item.productId === productId);
  return { product: sessions[0].product, quantity: sessions.length, sodiumMg, totalSodiumMg: sodiumMg * sessions.length };
});
const totalCapsules = electrolyteSchedule.reduce((sum, item) => sum + item.quantity, 0);
const preRaceCapsules = electrolyteSchedule.filter(item => item.kind === 'pre-race').reduce((sum, item) => sum + item.quantity, 0);
const inRaceCapsules = electrolyteSchedule.filter(item => item.kind === 'in-race').reduce((sum, item) => sum + item.quantity, 0);
const plannedGelSodiumMg = plannedGelSodium.reduce((sum, item) => sum + item.totalSodiumMg, 0);
const inRaceCapsuleSodiumMg = revoNutrients(inRaceCapsules).sodium;
export const electrolyteSummary = {
  totalCapsules, preRaceCapsules, inRaceCapsules,
  totalNutrientsMg: revoNutrients(totalCapsules), preRaceSodiumMg: revoNutrients(preRaceCapsules).sodium,
  inRaceCapsuleSodiumMg, plannedGelSodiumMg,
  inRaceSodiumMg: plannedGelSodiumMg + inRaceCapsuleSodiumMg,
  inRaceSodiumPerHourMg: Math.round((plannedGelSodiumMg + inRaceCapsuleSodiumMg) / raceOverview.hours),
};
export const electrolyteNote = 'Adjust electrolyte intake according to conditions, fluid intake, and symptoms. Heavy sweating alone does not establish sodium requirements. Do not force capsules or overdrink to meet a target.';

export const packingProducts = [
  { id: 'proengy', group: 'Pre-Race', name: 'ProEngy Carb Powder 50g', quantity: 1, detail: '' },
  { id: 'blue', group: 'Pre-Race', name: 'AminoVITAL Blue 100g', quantity: 1, detail: '' },
  { id: 'revo', group: 'Pre-Race', name: revoCaps.name, quantity: electrolyteSummary.totalCapsules, detail: '', unit: 'capsules' },
  { id: 'red', group: 'Race Gels', name: 'AminoVITAL Red', quantity: fuelingTimeline.filter(item => item.productId === 'red').length, detail: '' },
  { id: 'blackcurrant', group: 'Race Gels', name: 'X-REAL Blackcurrant', quantity: fuelingTimeline.filter(item => item.productId === 'blackcurrant').length, detail: '2 planned + 1 backup' },
  { id: 'orange', group: 'Race Gels', name: 'X-REAL C29+ Orange', quantity: fuelingTimeline.filter(item => item.productId === 'orange').length, detail: '75mg caffeine' },
] as const;

export type PackingId = typeof packingProducts[number]['id'];
export type PackingState = Record<PackingId, boolean>;
export const PACKING_STORAGE_KEY = 'bs42-race-day-packing-v1';
export const emptyPacking = (): PackingState => Object.fromEntries(packingProducts.map(item => [item.id, false])) as PackingState;

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
