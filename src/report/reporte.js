// =========================
// VARIABLES
// =========================

let rawDataReport = [];

// =========================
// CARGAR DATOS
// =========================

window.addEventListener("load", init);

async function init() {
    try {
        rawDataReport = await loadData();
        applyFiltersDate();
        applyFiltersTypeSLA();
    } catch (error) {
        console.error(error);
        alert("Error cargando datos desde el JSON");
    }
}

async function loadData() {
    const response = await fetch(
        `${JSON_URL}?t=${Date.now()}`,
        { cache: "no-store" }
    );

    if (!response.ok) {
        throw new Error("No se pudo cargar el JSON");
    }

    const data = await response.json();

    return data.map(mapJsonItem);
}

// =========================
// RENDERIZADO
// =========================

function renderTables(data) {

    const tables = [
        {
            tableId: "table-body-sla-resp-pais",
            groupBy: "Country",
            slaField: "InSLAResponse"
        },
        {
            tableId: "table-body-sla-resp-dealer",
            groupBy: "Dealer",
            slaField: "InSLAResponse"
        },
        {
            tableId: "table-body-sla-resp-asset",
            groupBy: "Asset",
            slaField: "InSLAResponse"
        },
        {
            tableId: "table-body-sla-sol-pais",
            groupBy: "Country",
            slaField: "InSLAResolved"
        },
        {
            tableId: "table-body-sla-sol-dealer",
            groupBy: "Dealer",
            slaField: "InSLAResolved"
        },
        {
            tableId: "table-body-sla-sol-asset",
            groupBy: "Asset",
            slaField: "InSLAResolved"
        }
    ];

    tables.forEach(config => {
        renderSLATable(
            data,
            config.tableId,
            config.groupBy,
            config.slaField
        );
    });
}
function renderSLATable(data, tableBodyId, groupByField, slaField) {

    const tableBody = document.getElementById(tableBodyId);

    if (!tableBody) {
        console.warn(`No existe la tabla ${tableBodyId}`);
        return;
    }

    tableBody.innerHTML = "";

    const grouped = {};

    data.forEach(item => {

        const key = item[groupByField] || "Unknown";

        if (!grouped[key]) {
            grouped[key] = {
                tickets: 0,
                inSLA: 0,
                outSLA: 0
            };
        }

        grouped[key].tickets++;

        if (item[slaField]) {
            grouped[key].inSLA++;
        } else {
            grouped[key].outSLA++;
        }
    });

    const rows = Object.entries(grouped)
        .sort((a, b) => b[1].tickets - a[1].tickets);

    rows.forEach(([name, stats]) => {

        const percentage =
        ((stats.inSLA / stats.tickets) * 100).toFixed(1);
        const slaColor = getSLAColor(percentage);
        tableBody.insertAdjacentHTML(
            "beforeend",
            `
            <tr>
                <td>${name}</td>
                <td>${stats.tickets}</td>
                <td>${stats.inSLA}</td>
                <td>${stats.outSLA}</td>
                <td> <div class=" status-pill ${slaColor}">${percentage}%</div> </td>
            </tr>
            `
        );
    });
    function getSLAColor(percentage){
        if(percentage>=95){
            return COLORS.tailwind.Low;
        }
        else if(percentage>=90){
            return COLORS.tailwind.High;
        }else{
            return COLORS.tailwind.Critical;
        }
    }
}

function applyFiltersDate() {

    const startDate = document.getElementById("filter-start-date").value;
    const endDate = document.getElementById("filter-end-date").value;

    const filteredData = rawDataReport.filter(item => {

        if (!item["Open Request"]) {
            return false;
        }

        const openRequestDate = item["Open Request"].substring(0, 10);

        if (!startDate && !endDate) {
            return true;
        }

        if (startDate && !endDate) {
            return openRequestDate >= startDate;
        }

        if (!startDate && endDate) {
            return openRequestDate <= endDate;
        }

        return openRequestDate >= startDate &&
               openRequestDate <= endDate;
    });

    renderTables(filteredData);

    const type = document.getElementById("filter-type-sla").value;

    if (type === "Resp") {
        renderKPIs(filteredData, "InSLAResponse");
        renderSummaryTable(filteredData, "InSLAResponse");
    }
    else {
        renderKPIs(filteredData, "InSLAResolved");
        renderSummaryTable(filteredData, "InSLAResolved");
    }
}
function applyFiltersTypeSLA() {

    const type = document.getElementById("filter-type-sla").value;

    const responseSection =
        document.getElementById("sla-response-section");

    const solutionSection =
        document.getElementById("sla-solution-section");

    switch (type) {

        case "Resp":
            responseSection.style.display = "";
            solutionSection.style.display = "none";
            break;

        case "Sol":
            responseSection.style.display = "none";
            solutionSection.style.display = "";
            break;
    }

    applyFiltersDate();
}

function renderKPIs(data, slaField) {

    const countries = {};

    data.forEach(item => {

        const country = item.Country || "Unknown";

        if (!countries[country]) {
            countries[country] = {
                total: 0,
                inSLA: 0
            };
        }

        countries[country].total++;

        if (item[slaField]) {
            countries[country].inSLA++;
        }
    });

    const percentages = {};

    Object.entries(countries).forEach(([country, stats]) => {

        percentages[country] =
            stats.total > 0
                ? (stats.inSLA / stats.total) * 100
                : 0;
    });

    // Promedio de TODOS los países encontrados
    const allCountries = Object.values(percentages);

    const globalPercentage =
        allCountries.length > 0
            ? allCountries.reduce((a, b) => a + b, 0) / allCountries.length
            : 0;

    document.getElementById("kpi-total").textContent =
        `${globalPercentage.toFixed(1)}%`;

    document.getElementById("kpi-mex").textContent =
        `${(percentages["México"] || 0).toFixed(1)}%`;

    document.getElementById("kpi-col").textContent =
        `${(percentages["Colombia"] || 0).toFixed(1)}%`;

    document.getElementById("kpi-latam").textContent =
        `${(percentages["LATAM"] || 0).toFixed(1)}%`;
}

function renderSummaryTable(data, slaField) {

    const groupedCountries = {};
    const groupedDealers = {};
    const groupedAssets = {};

    data.forEach(item => {

        const country = item.Country || "Unknown";
        const dealer = item.Dealer || "Unknown";
        const asset = item.Asset || "Unknown";

        if (!groupedCountries[country]) {
            groupedCountries[country] = { total: 0, inSLA: 0 };
        }

        if (!groupedDealers[dealer]) {
            groupedDealers[dealer] = { total: 0, inSLA: 0 };
        }

        if (!groupedAssets[asset]) {
            groupedAssets[asset] = { total: 0, inSLA: 0 };
        }

        groupedCountries[country].total++;
        groupedDealers[dealer].total++;
        groupedAssets[asset].total++;

        if (item[slaField]) {
            groupedCountries[country].inSLA++;
            groupedDealers[dealer].inSLA++;
            groupedAssets[asset].inSLA++;
        }
    });

    function calculatePercentages(group) {
        return Object.entries(group).map(([name, stats]) => ({
            name,
            percentage: stats.total
                ? (stats.inSLA / stats.total) * 100
                : 0,
            tickets: stats.total
        }));
    }

    const countries = calculatePercentages(groupedCountries);
    const dealers = calculatePercentages(groupedDealers);
    const assets = calculatePercentages(groupedAssets);

    const global =
        countries.reduce((sum, c) => sum + c.percentage, 0) /
        (countries.length || 1);

    const bestCountry =
        countries.sort((a, b) => b.percentage - a.percentage)[0];

    const bestDealer =
        dealers.sort((a, b) => b.percentage - a.percentage)[0];

    const bestAsset =
        assets.sort((a, b) => b.percentage - a.percentage)[0];

    const opportunityAsset =
        assets.sort((a, b) => a.percentage - b.percentage)[0];

    const tbody = document.getElementById("summary-table-body");

    tbody.innerHTML = `
        <tr>
            <td>${global.toFixed(1)}%</td>
            <td>${bestCountry?.name || "-"} (${bestCountry?.percentage.toFixed(1) || 0}%)</td>
            <td>${bestDealer?.name || "-"} (${bestDealer?.percentage.toFixed(1) || 0}%)</td>
            <td>${bestAsset?.name || "-"} (${bestAsset?.percentage.toFixed(1) || 0}%)</td>
            <td>${opportunityAsset?.name || "-"} (${opportunityAsset?.percentage.toFixed(1) || 0}%)</td>
            <td>95%</td>
        </tr>
    `;
}
function downloadExcel() {

    const type = document.getElementById("filter-type-sla").value;

    let tables = [];

    if (type === "Resp") {

        tables = [
            {
                sheetName: "Pais",
                tbodyId: "table-body-sla-resp-pais"
            },
            {
                sheetName: "Dealer",
                tbodyId: "table-body-sla-resp-dealer"
            },
            {
                sheetName: "Asset",
                tbodyId: "table-body-sla-resp-asset"
            }
        ];

    } else {

        tables = [
            {
                sheetName: "Pais",
                tbodyId: "table-body-sla-sol-pais"
            },
            {
                sheetName: "Dealer",
                tbodyId: "table-body-sla-sol-dealer"
            },
            {
                sheetName: "Asset",
                tbodyId: "table-body-sla-sol-asset"
            }
        ];
    }

    const workbook = XLSX.utils.book_new();

    tables.forEach(table => {

        const rows = document.querySelectorAll(
            `#${table.tbodyId} tr`
        );

        const sheetData = [
            ["Nombre", "Tickets", "Dentro SLA", "Fuera SLA", "% SLA"]
        ];

        rows.forEach(row => {

            const cols = row.querySelectorAll("td");

            sheetData.push([
                cols[0]?.innerText || "",
                cols[1]?.innerText || "",
                cols[2]?.innerText || "",
                cols[3]?.innerText || "",
                cols[4]?.innerText || ""
            ]);
        });

        const worksheet =
            XLSX.utils.aoa_to_sheet(sheetData);

        worksheet["!cols"] = [
            { wch: 35 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 }
        ];

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            table.sheetName
        );
    });

    const today = new Date()
        .toISOString()
        .substring(0, 10);

    XLSX.writeFile(
        workbook,
        `SLA_Report_${type}_${today}.xlsx`
    );
}