import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import {
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
  usePagination,
} from "react-table";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Row,
  Form,
} from "reactstrap";
// import { useHistory } from "react-router";
import { Link, useHistory } from "react-router-dom";

interface tableinterface {
  columns?: any;
  data?: any;
 
  loading?: any;
  pageCount?: any;
}

function SimpleTable({
  columns,
  data,

  loading,
  pageCount: controlledPageCount,
}: tableinterface) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
  
  } = useTable(
    {
      columns,
      data,

      initialState: { pageIndex: 0, pageSize: 10 },
      manualPagination: true,

      pageCount: controlledPageCount,
    },
    useGlobalFilter,
    usePagination
  );

  return (
    <React.Fragment>
      <table className="table" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup: any) => (
            <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any) => (
                <th key={column.id}>
                  {column.render("Header")}
                  {/* Render the columns filter UI */}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row: any, i: number) => {
            prepareRow(row);
            return (
              <tr key={row.id} {...row.getRowProps()}>
                {row.cells.map((cell: any) => {
                  return (
                    <td key={cell.id} {...cell.getCellProps()}>
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </React.Fragment>
  );
}

export default SimpleTable;
