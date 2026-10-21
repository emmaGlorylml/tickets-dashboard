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
        renderTables(rawDataReport);
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