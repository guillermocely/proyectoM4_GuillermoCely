import type { Filter } from '../../types/filter';

export interface FiltersProps {
  filter: Filter;
  counts: Record<Filter, number>;
  onChange: (filter: Filter) => void;
}
