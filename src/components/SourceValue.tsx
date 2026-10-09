import type { Cell } from '../lib/data';

export function SourceValue({ cell, emphasize, lineBreaks }: { cell: Cell; emphasize?: 'distance' | 'pace'; lineBreaks?: RegExp }) {
  const value = String(cell.value);
  const pattern = emphasize === 'distance' ? /(\b\d+(?:\.\d+)?(?:–\d+(?:\.\d+)?)?K\b)/g : /(Sub-4|~?\d:\d{2}(?:–\d:\d{2})?(?:\/km)?)/g;
  const format = (text: string) => emphasize ? text.split(pattern).map((part, index) => index % 2 ? <span className="key-value" key={index}>{part}</span> : part) : text;
  // Captured separators stay in the DOM verbatim; only their visual presentation changes.
  return <span data-source-cell={cell.address} className="source-text">{lineBreaks ? value.split(lineBreaks).map((part, index) => <span key={index} className={index % 2 ? 'sr-only' : 'source-line'}>{index % 2 ? part : format(part)}</span>) : format(value)}</span>;
}
