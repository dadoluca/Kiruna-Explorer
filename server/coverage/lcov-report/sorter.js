/* eslint-disable */
const addSorting = (function() {
    'use strict';
    let cols;
    let currentSort = {
        index: 0,
        desc: false
    };

    // returns the summary table element
    function getTable() {
        return document.querySelector('.coverage-summary');
    }
    // returns the thead element of the summary table
    function getTableHeader() {
        return getTable().querySelector('thead tr');
    }
    // returns the tbody element of the summary table
    function getTableBody() {
        return getTable().querySelector('tbody');
    }
    // returns the th element for nth column
    function getNthColumn(n) {
        return getTableHeader().querySelectorAll('th')[n];
    }

    function onFilterInput() {
        const searchValue = document.getElementById('fileSearch').value;
        const rows = document.getElementsByTagName('tbody')[0].children;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (
                row.textContent
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
            ) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    }

    // loads the search box
    function addSearchBox() {
        const template = document.getElementById('filterTemplate');
        const templateClone = template.content.cloneNode(true);
        templateClone.getElementById('fileSearch').oninput = onFilterInput;
        template.parentElement.appendChild(templateClone);
    }

    // loads all columns
    function loadColumns() {
        const colNodes = getTableHeader().querySelectorAll('th');
        const cols = [];
    
        for (const colNode of colNodes) {
            const col = {
                key: colNode.getAttribute('data-col'),
                sortable: !colNode.getAttribute('data-nosort'),
                type: colNode.getAttribute('data-type') || 'string'
            };
            cols.push(col);
    
            if (col.sortable) {
                col.defaultDescSort = col.type === 'number';
                colNode.innerHTML = colNode.innerHTML + '<span class="sorter"></span>';
            }
        }
    
        return cols;
    }
    
    // attaches a data attribute to every tr element with an object
    // of data values keyed by column name
    function loadRowData(tableRow) {
        const tableCols = tableRow.querySelectorAll('td');
        const data = {};
        for (let i = 0; i < tableCols.length; i++) {
            const colNode = tableCols[i];
            const col = cols[i];
            let val = colNode.getAttribute('data-value');
            if (col.type === 'number') {
                val = Number(val);
            }
            data[col.key] = val;
        }
        return data;
    }
    // loads all row data
    function loadData() {
        const rows = getTableBody().querySelectorAll('tr');
        for (const row of rows) {
            row.data = loadRowData(row);
        }
    }
    
    // sorts the table using the data for the ith column
    /* function sortByIndex(index, desc) {
    const key = cols[index].key;
    const sorter = function(a, b) {
        a = a.data[key];
        b = b.data[key];

        let comparisonResult;

        // Extract the nested ternary operation into an independent statement
        if (a < b) {
            comparisonResult = -1;
        } else if (a > b) {
            comparisonResult = 1;
        } else {
            comparisonResult = 0;
        }

        return comparisonResult;
    };

    let finalSorter = sorter;
    const tableBody = document.querySelector('.coverage-summary tbody');
    const rowNodes = tableBody.querySelectorAll('tr');
    const rows = [];

    // Use for-of loop instead of for loop
    for (const rowNode of rowNodes) {
        rows.push(rowNode);
        tableBody.removeChild(rowNode);
    }

    rows.sort(finalSorter);

    // Use for-of loop instead of for loop
    for (const row of rows) {
        tableBody.appendChild(row);
    }
}
 */
    // removes sort indicators for current column being sorted
    /* function removeSortIndicators() {
        const col = getNthColumn(currentSort.index);
        let cls = col.className;

        cls = cls.replace(/ sorted$/, '').replace(/ sorted-desc$/, '');
        col.className = cls;
    } */
    // adds sort indicators for current column being sorted
    function addSortIndicators() {
        getNthColumn(currentSort.index).className += currentSort.desc
            ? ' sorted-desc'
            : ' sorted';
    }
    // adds event listeners for all sorter widgets
    function enableUI() {
        for (let i = 0; i < cols.length; i++) {
            if (cols[i].sortable) {
                const el = getNthColumn(i).querySelector('.sorter').parentElement;
                if (el.addEventListener) {
                    el.addEventListener('click', ithSorter(i));
                } else {
                    el.attachEvent('onclick', ithSorter(i));
                }
            }
        }
    }

    // adds sorting functionality to the UI
    return function() {
        if (!getTable()) {
            return;
        }
        cols = loadColumns();
        loadData();
        addSearchBox();
        addSortIndicators();
        enableUI();
    };
})();

window.addEventListener('load', addSorting);
