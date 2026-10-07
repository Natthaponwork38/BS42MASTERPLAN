import type { Cell } from '../lib/data';

export function SourceValue({ cell }: { cell: Cell }) {
  return <span data-source-cell={cell.address} className="source-text">{String(cell.value)}</span>;
}
