import { useState } from 'react';
import { formatDate } from '../lib/dates';
import { emptyPacking, fuelingSummary as summary, fuelingTimeline, PACKING_STORAGE_KEY, packingProducts, parsePacking, raceOverview, type PackingId, type PackingState } from '../lib/raceDay';
import './RaceDay.css';

function loadChecklist() {
  try { return { packed: parsePacking(localStorage.getItem(PACKING_STORAGE_KEY)), storageError: false }; }
  catch { return { packed: emptyPacking(), storageError: true }; }
}

export function RaceDay() {
  const [checklist, setChecklist] = useState(loadChecklist);
  const save = (packed: PackingState, reset = false) => {
    let storageError = false;
    try {
      if (reset) localStorage.removeItem(PACKING_STORAGE_KEY);
      else localStorage.setItem(PACKING_STORAGE_KEY, JSON.stringify(packed));
    } catch { storageError = true; }
    setChecklist({ packed, storageError });
  };
  const toggle = (id: PackingId, checked: boolean) => save({ ...checklist.packed, [id]: checked });
  const reset = () => {
    if (window.confirm('Reset Checklist? This will uncheck all 5 product types.')) save(emptyPacking(), true);
  };
  const packedCount = packingProducts.filter(item => checklist.packed[item.id]).length;
  return <div className="race-day">
    <header className="page-header"><div><p className="eyebrow">Race plan</p><h1>Race Day</h1><p className="subtitle">Prepare, pack, review.</p></div></header>

    <section aria-labelledby="race-overview-title">
      <h2 id="race-overview-title">Race Overview</h2>
      <p className="race-event">{raceOverview.name}</p>
      <p className="race-event-date"><time dateTime={raceOverview.date}>{formatDate(raceOverview.date, { day: 'numeric', month: 'long', year: 'numeric' })}</time></p>
      <dl className="race-overview-values"><div><dt>Distance</dt><dd>{raceOverview.distanceKm}K</dd></div><div><dt>Goal</dt><dd>{raceOverview.goal}</dd></div><div><dt>Target pace</dt><dd>{raceOverview.pace}</dd></div></dl>
    </section>

    <section aria-labelledby="fueling-summary-title">
      <h2 id="fueling-summary-title">Fueling Summary</h2>
      <dl className="race-nutrition">
        <div className="planned-carbs"><dt>Planned in-race carbs</dt><dd>{summary.plannedCarbs}<span>g</span><small>{summary.plannedGels} planned gels</small></dd></div>
        <div><dt>Pre-race intake</dt><dd>{summary.preRaceCarbs}<span>g</span><small>Before the race</small></dd></div>
        <div><dt>Optional backup</dt><dd>{summary.backupCarbs}<span>g</span><small>1 extra gel</small></dd></div>
        <div><dt>Maximum in-race</dt><dd>{summary.maxInRaceCarbs}<span>g</span><small>Including backup</small></dd></div>
        <div><dt>Approx. planned intake</dt><dd>~{summary.carbsPerHour}<span>g/hour</span><small>Over {raceOverview.hours} hours</small></dd></div>
        <div><dt>Planned caffeine</dt><dd>{summary.caffeineMg}<span>mg</span><small>In the Orange gel</small></dd></div>
      </dl>
      <p className="race-note">Pre-race carbohydrate is separate from every in-race total.</p>
    </section>

    <section aria-labelledby="fueling-timeline-title">
      <h2 id="fueling-timeline-title">Fueling Timeline</h2>
      <p className="race-note">Planned elapsed times · review before the event.</p>
      <div className="fueling-columns" aria-hidden="true"><span>Time</span><span>Product</span><span>Carbs</span></div>
      <ol className="fueling-timeline">{fuelingTimeline.map(item => <li key={item.time}>
        <span className="fueling-time">{item.time}</span>
        <div className="fueling-product">{item.product}{item.caffeine > 0 && <span>{item.caffeine}mg caffeine</span>}{item.kind === 'backup' && <span>Optional backup</span>}</div>
        <span className="fueling-carbs">{item.carbs}g<span className="sr-only"> carbohydrate</span></span>
      </li>)}</ol>
    </section>

    <section aria-labelledby="packing-title">
      <h2 id="packing-title">Packing Checklist</h2>
      <p className="packing-count" role="status">{packedCount} / {packingProducts.length} product types packed</p>
      {checklist.storageError && <p className="race-note" role="alert">Browser storage is unavailable. Checklist changes are kept for this visit only.</p>}
      {(['Pre-Race', 'Race Gels'] as const).map(group => <fieldset className="packing-group" key={group}><legend>{group}</legend>
        {packingProducts.filter(item => item.group === group).map(item => <label className="packing-item" key={item.id}>
          <input type="checkbox" checked={checklist.packed[item.id]} onChange={event => toggle(item.id, event.currentTarget.checked)} />
          <span className="material-symbols-rounded packing-check" aria-hidden="true">check</span>
          <span className="packing-name">{item.name}{item.detail && <small>{item.detail}</small>}</span>
          <span className="packing-quantity">× {item.quantity}</span>
        </label>)}
      </fieldset>)}
      <p className="race-carry">Total race gels to carry: <strong>{summary.carryGels}</strong></p>
      <button className="race-reset" type="button" onClick={reset}>Reset Checklist</button>
      <div className="race-notes"><h3>Hydration &amp; fueling notes</h3><p>Review your practiced hydration plan separately. In-race drink carbohydrate is not included in the gel totals.</p><p>The Blackcurrant backup is optional and excluded from the planned {summary.plannedCarbs}g. This timeline is for reviewing the plan before the race.</p></div>
    </section>
  </div>;
}
