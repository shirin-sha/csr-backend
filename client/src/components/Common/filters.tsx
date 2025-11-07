import React from 'react';
import { Input } from 'reactstrap';

export const Filter = ({ column }: any) => {
  return (
    <div style={{ marginTop: 5 }}>
      {column.canFilter && column.render('Filter')}
    </div>
  );
};

interface DefaultColumnFilterProps {
  column: any
}
export const DefaultColumnFilter = ({
  column: {
    filterValue,
    setFilter,
    preFilteredRows: { length },
  },
} : DefaultColumnFilterProps) => {
  return (
    <Input
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      placeholder={`search (${length}) ...`}
    />
  );
};

interface SelectColumnFilterProps {
  column: any
}

export const SelectColumnFilter = ({
  column: { filterValue, setFilter, preFilteredRows, id },
} : SelectColumnFilterProps) => {
  const options : any = React.useMemo(() => {
    const options : any = new Set();
    preFilteredRows.forEach((row :any) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  return (
    <select
      id='custom-select'
      className="form-select"
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value=''>All</option>
      {options.map((option : any) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};
