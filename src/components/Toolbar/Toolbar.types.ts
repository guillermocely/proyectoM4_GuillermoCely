import type { Sort } from '../../types/filter';

export interface ToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  sort: Sort;
  onSortChange: (value: Sort) => void;
}
