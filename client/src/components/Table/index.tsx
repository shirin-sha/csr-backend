import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import {
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
  usePagination,
} from "react-table";

import { Button, Input, Label, Row, Form } from "reactstrap";
// import { useHistory } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { toInteger } from "lodash";

interface Globalfilter {
  preGlobalFilteredRows: any;
  globalFilter: any;
  setGlobalFilter: any;
  setCondition?: any;
  condition?: any;
  activeStatus?: any;
  typeStatus?: any;
  setActiveStatus?: any;
  setTypeStatus?: any;
  enableFiltration?:any
  spnsrFiltr?:any;
}

// Define a default UI for filtering
function GlobalFilter({
  //this line  [eslint] 'preGlobalFilteredRows' is missing in props validation [react/prop-types]
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
  setCondition,
  condition,
  activeStatus,
  typeStatus,
  setActiveStatus,
  setTypeStatus,
  enableFiltration,

}: Globalfilter) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  console.log('filtration',enableFiltration);
  
  const onChange = useAsyncDebounce((value: any) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <span>
      Search:{" "}
      <Row className="mr-5">
        <input
          style={{ width: "50%", paddingRight: "50px" }}
          className="form-control col-xl-8"
          value={value || ""}
          onChange={(e) => {

            setValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={`${count} records...`}
        />
       {enableFiltration >=0 && <>
       <Input
          value={activeStatus}
          onChange={async (e) => {
            console.log('changed');
            
            const v = toInteger(e.target.value);
            console.log({ v });
            console.log(typeof( v));
            await setActiveStatus(v);
            if (v == 0) {
              setCondition({});
              console.log(condition);
            } else if (v == 1) {
              const c = { ...condition };
              c.activated = { $ne: null };
              setCondition(c);
              console.log(condition);
            } else if (v == 2) {
              const c = { ...condition };
              c.activated = null;
              setCondition(c);
              console.log(condition);
            }
          }}
          style={{ width: "15%", marginLeft: "10px" }}
          type="select"
        >
          <option value="0">All</option>
          <option value="1">Active</option>
          <option value="2">Inactive</option>
        </Input>
        <Input
          value={typeStatus}
          onChange={(e) => {
            const v = toInteger(e.target.value);
            console.log({ v });
            console.log(typeof v);
            setTypeStatus(v);
            if (v == 0) {
              const c = { ...condition };
              c.type = undefined;
              setCondition(c);
              console.log(condition);
            } else if (v == 1) {
              const c = { ...condition };
              c.type = 1;
              setCondition(c);
              console.log(condition);
            } else if (v == 2) {
              const c = { ...condition };
              c.type = 0;
              setCondition(c);
              console.log(condition);
            }
          }}
          style={{ width: "15%", marginLeft: "10px" }}
          type="select"
        >
          <option value="0">All</option>
          <option value="1">{enableFiltration===0? 'Corporate':'Islamic'}</option>
          <option value="2">{enableFiltration===0? 'Individual' :'Conventional'}</option>
        </Input>
        <Button
          style={{ width: "15%", marginLeft: "10px" }}
          onClick={() => {
            setActiveStatus("All");
            setTypeStatus("All");
            setCondition({});
          }}
        >
          All
        </Button>
        </>}
      </Row>
    </span>
  );
}

interface tableinterface {
  columns: any;
  data: any;
  fetchData: any;
  loading: any;
  pageCount: any;
  setCondition?: any;
  condition?: any;
  activeStatus?: any;
  typeStatus?: any;
  setActiveStatus?: any;
  setTypeStatus?: any;
  enableFiltration?:any;

}

function Table({
  columns,
  data,
  fetchData,
  loading,
  pageCount: controlledPageCount,
  setCondition,
  condition,
  activeStatus,
  typeStatus,
  setActiveStatus,
  setTypeStatus,
  enableFiltration,

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
    state: { pageIndex, pageSize },
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
  useEffect(() => {
    fetchData({ pageIndex, pageSize });
  }, [fetchData, pageIndex, pageSize]);
  return (
    <React.Fragment>
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        globalFilter={state.globalFilter}
        setGlobalFilter={setGlobalFilter}
        condition={condition}
        setCondition={setCondition}
        activeStatus={activeStatus}
        typeStatus={typeStatus}
        setActiveStatus={setActiveStatus}
        setTypeStatus={setTypeStatus}
        enableFiltration={enableFiltration}
        
      />

      <table className="table" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup: any) => (
            <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any) => (
                <th key={column.id}>{column.render("Header")}</th>
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

          <tr>
            {loading ? (
              <td>Loading...</td>
            ) : (
              <td>
                Showing {page.length} of ~{controlledPageCount * pageSize}{" "}
                results
              </td>
            )}
          </tr>
        </tbody>
      </table>

      {/* pagination */}
      <div
        className="pagination"
        style={{ paddingLeft: ".5rem", height: "2.5rem" }}
      >
        <Button onClick={() => gotoPage(1)} disabled={!canPreviousPage}>
          {"<<"}
        </Button>{" "}
        <Button
          style={{ marginLeft: ".5rem" }}
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
        >
          {"<"}
        </Button>{" "}
        <Button
          style={{ marginLeft: ".5rem" }}
          onClick={() => nextPage()}
          disabled={!canNextPage}
        >
          {">"}
        </Button>{" "}
        <Button
          style={{ marginLeft: ".5rem" }}
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
        >
          {">>"}
        </Button>{" "}
        <span style={{ margin: "auto" }}>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span style={{ width: "20%", display: "flex" }}>
          <label htmlFor="" style={{ marginTop: "auto", marginLeft: "auto" }}>
            {" "}
            Go to page:{" "}
          </label>
          <Input
            style={{ width: "40%" }}
            max={pageCount}
            min={1}
            type="number"
            value={pageIndex + 1}
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
          />
        </span>{" "}
        <span style={{ display: "flex", padding: ".5rem" }}>
          <Input
            type="select"
            style={{ height: "40px", marginTop: "-10px" }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[4,10, 20].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </Input>
        </span>
      </div>
    </React.Fragment>
  );
}

export default Table;
