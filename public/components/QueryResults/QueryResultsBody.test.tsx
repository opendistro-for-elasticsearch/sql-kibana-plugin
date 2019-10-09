/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, cleanup } from "@testing-library/react";
import QueryResultsBody from "./QueryResultsBody";
// @ts-ignore
import { Pager } from "@elastic/eui/lib";
// @ts-ignore
import { SortableProperties } from "@elastic/eui/lib/services";
import { mockQueryResults, mockQueryResultResponse, mockErrorMessage, mockSuccessfulMessage, mockSortableColumns} from "../../../test/mocks/mockData";
import userEvent from "@testing-library/user-event";
import { QueryMessage, QueryResult } from "../Main/main";


function renderQueryResultsBody(mockQueryResultsSelected: QueryResult,
                                mockQueryResultsRaw: string,
                                mockSortableProperties: SortableProperties,
                                messages: QueryMessage[],
                                onSort: (prop: string) => void,
                                onQueryChange: (query: object) => void,
                                updateExpandedMap:(map: object) => void,
                                onChangeItemsPerPage: (itemsPerPage: number) => void) {
    return {
        ...render(
            <QueryResultsBody
                selectedTabId={'0'}
                selectedTabName={'Messages'}
                tabNames={['Messages', 'Index_1']}
                queryResultSelected={mockQueryResultsSelected}
                queryResultsRaw={mockQueryResultsRaw}
                queryResultsJDBC={mockQueryResultsRaw}
                queryResultsCSV={mockQueryResultsRaw}
                messages={[]}
                searchQuery={""}
                onQueryChange={onQueryChange}
                pager={new Pager(0, 10)}
                itemsPerPage={10}
                firstItemIndex={0}
                lastItemIndex={10}
                onChangeItemsPerPage={onChangeItemsPerPage}
                onChangePage={() => {}}
                onSort={onSort}
                sortedColumn={'col1'}
                sortableProperties={mockSortableProperties}
                itemIdToExpandedRowMap={{}}
                updateExpandedMap={updateExpandedMap}
            />
        ),
    };
}


describe("<QueryResultsBody /> spec", () => {

  afterEach(cleanup);
  const onSort = jest.fn();
  const onQueryChange = jest.fn();
  const updateExpandedMap = jest.fn();
  const onChangeItemsPerPage = jest.fn();

  it("renders the component", () => {
    const mockSortableProperties = new SortableProperties(
      [
        {
          name: "",
          getValue: (item: any) => "",
          isAscending: true
        }
      ],
      ""
    );

    const emptyQueryResult = {
      fields: [''],
      records: [{}],
      message: ''
    };

    const { queryByTestId } = renderQueryResultsBody(emptyQueryResult, '', mockSortableProperties, mockErrorMessage, onSort, onQueryChange, updateExpandedMap, onChangeItemsPerPage);

    // Download buttons, pagination, search area, table should not be visible when there is no data
    expect(queryByTestId('Download')).toBeNull();
    expect(queryByTestId('Rows per page')).toBeNull();
    expect(queryByTestId('tableRow')).toBeNull();
    expect(queryByTestId('Search')).toBeNull();

    expect(document.body.children[0]).toMatchSnapshot();

  });

  it("renders component with mock QueryResults data", async() => {
    const mockSortableProperties = new SortableProperties(
          mockSortableColumns,
          mockSortableColumns[0].name
      ) ;

    (window as any).HTMLElement.prototype.scrollIntoView = function() {};

    const { getAllByText, getAllByTestId, getAllByLabelText, getByText, getByPlaceholderText } = renderQueryResultsBody(mockQueryResults[0].data, mockQueryResultResponse.data.resp, mockSortableProperties, mockSuccessfulMessage, onSort, onQueryChange, updateExpandedMap, onChangeItemsPerPage);
    expect(document.body.children[0]).toMatchSnapshot();

    // Test sorting
    await fireEvent.click(getAllByTestId('tableHeaderSortButton')[0]);
    expect(onSort).toHaveBeenCalled();

    // Test pagination
    await fireEvent.click(getAllByText('Rows per page', { exact: false})[0]);
    expect(getByText("10 rows"));
    expect(getByText("20 rows"));
    expect(getByText("50 rows"));
    expect(getByText("100 rows"));
    await fireEvent.click(getByText("20 rows"));
    expect(onChangeItemsPerPage).toHaveBeenCalled();

    // Test nested tables - click on row icon
    expect(getAllByLabelText('Expand').length).toBeGreaterThan(0);
    await fireEvent.click(getAllByLabelText('Expand')[0]);
    expect(updateExpandedMap).toHaveBeenCalledTimes(1);

    // Test nested tables - click on cell link
    await fireEvent.click(getAllByText('manufacturer: [2]', { exact: false })[0]);
    expect(updateExpandedMap).toHaveBeenCalled();

    // Tests download button
    const downloadButton = getAllByText('Download')[0];
    expect(downloadButton).not.toBe(null);
    await fireEvent.click(downloadButton);
    expect(getByText("Download JSON"));
    expect(getByText("Download JDBC"));
    expect(getByText("Download CSV"));
    await fireEvent.click(getByText("Download JSON"));
    await fireEvent.click(getByText("Download JDBC"));
    await fireEvent.click(getByText("Download CSV"));

    // Test search field
    const searchField = getByPlaceholderText('Search');
    expect(searchField).not.toBe(null);
    await userEvent.type(searchField, 'Test')
    expect(onQueryChange).toHaveBeenCalled();

    // Test collapse button
    expect(document.body.children[0]).toMatchSnapshot();
    expect(getAllByLabelText('Collapse').length).toBeGreaterThan(0);
    await fireEvent.click(getAllByLabelText('Collapse')[0]);
    expect(updateExpandedMap).toHaveBeenCalled();
    
  });
});