import type { Cell } from '../lib/data';

export function SourceValue({ cell, emphasize }: { cell: Cell; emphasize?: 'distance' | 'pace' }) {
  const value = String(cell.value);
  const pattern = emphasize === 'distance' ? /(\b\d+(?:\.\d+)?(?:–\d+(?:\.\d+)?)?K\b)/g : /(Sub-4|~?\d:\d{2}(?:–\d:\d{2})?(?:\/km)?)/g;
  return <span data-source-cell={cell.address} className="source-text">{emphasize ? value.split(pattern).map((part, index) => index % 2 ? <span className="key-value" key={index}>{part}</span> : part) : value}</span>;
}
