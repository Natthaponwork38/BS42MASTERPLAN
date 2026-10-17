import test from 'node:test';
import assert from 'node:assert/strict';
import { electrolyteSchedule, electrolyteSummary, emptyPacking, fuelingSummary, fuelingTimeline, packingProducts, parsePacking, plannedGelSodium, raceOverview, revoCaps, revoNutrients } from '../src/lib/raceDay';

test('race fueling totals keep pre-race, planned gels and optional backup separate', () => {
  assert.deepEqual(fuelingSummary, { preRaceCarbs: 70, plannedCarbs: 199, backupCarbs: 29, maxInRaceCarbs: 228, plannedGels: 7, carryGels: 8, carbsPerHour: 50, caffeineMg: 75 });
  assert.equal(raceOverview.date, '2026-11-15');
  assert.equal(raceOverview.distanceKm, 42.195);
  assert.deepEqual(fuelingTimeline.map(item=>[item.time,item.carbs,item.caffeine]), [
    ['Pre-race',70,0],['00:25',28,0],['00:55',29,0],['01:25',28,0],['01:55',29,0],['02:25',28,0],['02:55',29,75],['03:25',28,0],['03:50',29,0],
  ]);
});
test('packing keeps eight race gels separate from five capsules across six product types', () => {
  assert.equal(packingProducts.length,6);
  assert.deepEqual(packingProducts.map(item=>[item.id,item.quantity]), [['proengy',1],['blue',1],['revo',5],['red',4],['blackcurrant',3],['orange',1]]);
  assert.equal(packingProducts.filter(item=>item.group==='Race Gels').reduce((sum,item)=>sum+item.quantity,0),8);
});
test('saved packing data accepts only known boolean selections and recovers from malformed data', () => {
  for (const value of [null,'bad json','[]','null','42','"red"']) assert.deepEqual(parsePacking(value),emptyPacking());
  assert.deepEqual(parsePacking('{"red":true,"orange":"true","blue":1,"unknown":true}'), {...emptyPacking(),red:true});
  assert.deepEqual(parsePacking(JSON.stringify({...emptyPacking(),blue:true,orange:true})), {...emptyPacking(),blue:true,orange:true});
  const oldSelections={proengy:true,blue:true,red:true,blackcurrant:true,orange:true};
  assert.deepEqual(parsePacking(JSON.stringify(oldSelections)),{...oldSelections,revo:false});
});

test('REVO label nutrients come from one definition without unsupported carb or caffeine values', () => {
  assert.deepEqual(revoCaps.nutrientsMg,{sodium:150,potassium:50,calcium:20,magnesium:15,bcaa:50});
  assert.deepEqual(revoNutrients(2),{sodium:300,potassium:100,calcium:40,magnesium:30,bcaa:100});
  assert.deepEqual(electrolyteSummary.totalNutrientsMg,{sodium:750,potassium:250,calcium:100,magnesium:75,bcaa:250});
  assert.equal('carbs' in revoCaps,false); assert.equal('caffeine' in revoCaps,false);
});
test('provisional sodium totals exclude pre-race capsules, backup gel and unestablished sources', () => {
  assert.deepEqual(electrolyteSchedule.map(item=>[item.time,item.quantity]),[['Pre-race',2],['01:00',1],['02:00',1],['03:00',1]]);
  assert.deepEqual(plannedGelSodium.map(item=>[item.quantity,item.sodiumMg,item.totalSodiumMg]),[[4,140,560],[2,110,220],[1,120,120]]);
  const {totalNutrientsMg,...totals}=electrolyteSummary;
  assert.deepEqual(totals,{totalCapsules:5,preRaceCapsules:2,inRaceCapsules:3,preRaceSodiumMg:300,inRaceCapsuleSodiumMg:450,plannedGelSodiumMg:900,inRaceSodiumMg:1350,inRaceSodiumPerHourMg:338});
  assert.equal(totalNutrientsMg.sodium,totals.preRaceSodiumMg+totals.inRaceCapsuleSodiumMg);
});
