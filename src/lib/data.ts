import master from '../data/master-plan.json';
import longRun from '../data/long-run.json';
import guardrails from '../data/guardrails.json';
import type { Table, Cell } from '../../scripts/parser';

export type { Cell, SourceRow, Table } from '../../scripts/parser';
export const plan = master as Table;
export const roadmap = longRun as Table & { chart: Table; chartTitle: string; series: { name: string; categories: string; values: string }[] };
export const rules = guardrails as { title: Cell; entries: { row: number; title: Cell; text: Cell }[] };
