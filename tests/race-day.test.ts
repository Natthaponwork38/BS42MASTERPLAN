import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyPacking, fuelingSummary, fuelingTimeline, packingProducts, parsePacking, raceOverview } from '../src/lib/raceDay';

test('race fueling totals keep pre-race, planned gels and optional backup separate', () => {
  assert.deepEqual(fuelingSummary, { preRaceCarbs: 70, plannedCarbs: 199, backupCarbs: 29, maxInRaceCarbs: 228, plannedGels: 7, carryGels: 8, carbsPerHour: 50, caffeineMg: 75 });
  assert.equal(raceOverview.date, '2026-11-15');
  assert.equal(raceOverview.distanceKm, 42.195);
  assert.deepEqual(fuelingTimeline.map(item=>[item.time,item.carbs,item.caffeine]), [
    ['Pre-race',70,0],['00:25',28,0],['00:55',29,0],['01:25',28,0],['01:55',29,0],['02:25',28,0],['02:55',29,75],['03:25',28,0],['03:50',29,0],
  ]);
});
test('packing quantities account for seven planned gels and one backup in five product types', () => {
  assert.equal(packingProducts.length,5);
  assert.deepEqual(packingProducts.map(item=>[item.id,item.quantity]), [['proengy',1],['blue',1],['red',4],['blackcurrant',3],['orange',1]]);
  assert.equal(packingProducts.filter(item=>item.group==='Race Gels').reduce((sum,item)=>sum+item.quantity,0),8);
});
test('saved packing data accepts only known boolean selections and recovers from malformed data', () => {
  for (const value of [null,'bad json','[]','null','42','"red"']) assert.deepEqual(parsePacking(value),emptyPacking());
  assert.deepEqual(parsePacking('{"red":true,"orange":"true","blue":1,"unknown":true}'), {...emptyPacking(),red:true});
  assert.deepEqual(parsePacking(JSON.stringify({...emptyPacking(),blue:true,orange:true})), {...emptyPacking(),blue:true,orange:true});
});
