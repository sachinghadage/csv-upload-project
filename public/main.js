document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch('/api/csv/upload', {
        method: 'POST',
        body: formData
    });
    const message = await response.text();
    alert(message);
    loadFiles();
});

async function loadFiles() {
    const response = await fetch('/api/csv/files');
    const files = await response.json();
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    files.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file;
        li.addEventListener('click', () => loadFileData(file));
        fileList.appendChild(li);
    });
}

async function loadFileData(filename) {
    const response = await fetch(`/api/csv/files/${filename}`);
    const data = await response.json();
    displayTable(data);
    setupChart(data);
}

function displayTable(data) {
    const tableContainer = document.getElementById('tableContainer');
    if (data.length === 0) {
        tableContainer.innerHTML = 'No data found';
        return;
    }
    const table = document.createElement('table');
    const headers = Object.keys(data[0]);
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.addEventListener('click', () => sortTableByColumn(data, header));
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
    setupPagination(data);
}

function sortTableByColumn(data, column) {
    const sortedData = data.sort((a, b) => {
        if (a[column] < b[column]) return -1;
        if (a[column] > b[column]) return 1;
        return 0;
    });
    displayTable(sortedData);
}

document.getElementById('searchBox').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cell = row.children[0]; // Change to the column you want to search
        if (cell.textContent.toLowerCase().includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

function setupPagination(data) {
    const itemsPerPage = 100;
    const numPages = Math.ceil(data.length / itemsPerPage);
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= numPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => paginateTable(data, i, itemsPerPage));
        paginationContainer.appendChild(button);
    }

    paginateTable(data, 1, itemsPerPage);
}

function paginateTable(data, pageNum, itemsPerPage) {
    const tableContainer = document.getElementById('tableContainer');
    const table = tableContainer.querySelector('table');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    const start = (pageNum - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach(row => {
        const tr = document.createElement('tr');
        const headers = Object.keys(row);
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function setupChart(data) {
    const headers = Object.keys(data[0]);
    const chartContainer = document.getElementById('chartContainer');
    chartContainer.innerHTML = '';

    headers.forEach(header => {
        const button = document.createElement('button');
        button.textContent = `Chart ${header}`;
        button.addEventListener('click', () => drawChart(data, header));
        chartContainer.appendChild(button);
    });
}

function drawChart(data, column) {
    const chartData = [['Row', column]];
    data.forEach((row, index) => {
        chartData.push([index + 1, parseFloat(row[column])]);
    });

    const googleChartData = google.visualization.arrayToDataTable(chartData);
    const options = {
        title: `${column} Chart`,
        hAxis: { title: 'Row' },
        vAxis: { title: column },
        legend: 'none'
    };
    const chart = new google.visualization.LineChart(document.getElementById('chartDiv'));
    chart.draw(googleChartData, options);
}

google.charts.load('current', { packages: ['corechart'] });
loadFiles();
