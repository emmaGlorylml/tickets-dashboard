

// =========================
// CONFIGURACION JSON
// =========================

// URL DEL JSON
const JSON_URL = "./tickets.json";

// =========================
// VARIABLES
// =========================

let rawData = [];
let charts = {};

// =========================
// CARGAR JSON
// =========================

async function loadSharePointData() {

    try {

        const response = await fetch(`${JSON_URL}?t=${new Date().getTime()}`, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("No se pudo cargar el JSON");
        }

        const data = await response.json();


        rawData = data.map(mapJsonItem);

        populateFilterOptions();

        applyFilters();

    } catch (err) {

        console.error(err);

        alert("Error cargando datos desde el JSON");
    }
}

// =========================
// MAPEO JSON
// =========================

function mapJsonItem(item) {

    return {

        "Ticket Number": item.TicketNumber || "",

        "Assigned to": item.AssignedTo?.Value || "Sin asignar",

        "Dealer": item.Dealer || "",

        "Asset": item.Asset?.Value || "",

        "Prioridad": item.Priority?.Value || "",

        "Next Steps": item.NextSteps?.Value || "",

        "Status": item.Status?.Value || "",

        "Open Request": item.OpenRequest || "",

        "Customer": item.Customer || "",

        "Country": item.Country || ""
    };
}

// =========================
// CHARTS
// =========================
const PRIO_COLORS = {
    'Critical': '#EF4444', // Rojo
    'High': '#F59E0B',    // Ambar
    'Medium': '#3B82F6',   // Azul
    'Low': '#10B981'     // Esmeralda
};
const MULTI_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#10B981', '#F59E0B', '#06B6D4', '#64748B'];

function initCharts() {
    const commonOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#94A3B8', font: { size: 10 }, padding: 10 } }
        },
        scales: {
            x: { grid: { color: '#1E293B' }, ticks: { color: '#94A3B8', font: { size: 9 } } },
            y: { grid: { color: '#1E293B' }, ticks: { color: '#94A3B8', font: { size: 9 } } }
        }
    };

    charts.spec = new Chart(document.getElementById('chartSpec'), {
        type: 'bar',
        options: { ...commonOptions, indexAxis: 'y' },
        data: {
            labels: [], datasets: [
                { label: 'En progreso', backgroundColor: '#F59E0B', data: [] },
                { label: 'Abierto', backgroundColor: '#3B82F6', data: [] }
            ]
        }
    });

    charts.trend = new Chart(document.getElementById('chartTrend'), {
        type: 'bar',
        options: {
            ...commonOptions,
            scales: {
                x: { stacked: true, grid: { display: false }, ticks: { color: '#94A3B8' } },
                y: { stacked: true, grid: { color: '#1E293B' }, ticks: { color: '#94A3B8' } }
            }
        },
        data: {
            labels: [],
            datasets: [
                { label: 'Critical', backgroundColor: PRIO_COLORS['Critical'], data: [] },
                { label: 'High', backgroundColor: PRIO_COLORS['High'], data: [] },
                { label: 'Medium', backgroundColor: PRIO_COLORS['Medium'], data: [] },
                { label: 'Low', backgroundColor: PRIO_COLORS['Low'], data: [] }
            ]
        }
    });

    charts.dealer = new Chart(document.getElementById('chartDealer'), {
        type: 'pie',
        options: {
            ...commonOptions,
            scales: { x: { display: false }, y: { display: false } },
            plugins: {
                legend: { position: 'right', labels: { color: '#94A3B8', font: { size: 9 } } }
            }
        },
        data: { labels: [], datasets: [{ label: 'Tickets', backgroundColor: MULTI_COLORS, borderWidth: 0, data: [] }] }
    });

    charts.nextActions = new Chart(document.getElementById('chartNextActions'), {
        type: 'doughnut',
        options: {
            ...commonOptions,
            cutout: '65%',
            scales: { x: { display: false }, y: { display: false } },
            plugins: {
                legend: { position: 'right', labels: { color: '#94A3B8', font: { size: 9 } } }
            }
        },
        data: { labels: [], datasets: [{ label: 'Frecuencia', backgroundColor: MULTI_COLORS, borderWidth: 0, data: [] }] }
    });
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split(' ')[0].split('/');
    if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
    return new Date(dateStr);
}

// =========================
// FILTROS
// =========================

function populateFilterOptions() {

    const dealers = new Set();
    const countries = new Set();
    const prios = new Set();

    rawData.forEach(row => {

        if (row.Dealer) dealers.add(row.Dealer);
        if (row.Prioridad) prios.add(row.Prioridad);

        countries.add(extractCountry(row.Country));
    });

    fillSelect("filter-dealer", dealers);
    fillSelect("filter-country", countries);
    fillSelect("filter-prio", prios);
}

function fillSelect(id, set) {

    const el = document.getElementById(id);

    el.innerHTML = `<option value="all">Todos</option>`;

    Array.from(set)
        .sort()
        .forEach(v => {
            el.innerHTML += `<option value="${v}">${v}</option>`;
        });
}

function applyFilters() {

    const dF = document.getElementById('filter-dealer').value;
    const cF = document.getElementById('filter-country').value;
    const pF = document.getElementById('filter-prio').value;

    const filtered = rawData.filter(row => {

        const matchesDealer =
            dF === 'all' || row.Dealer === dF;

        const matchesCountry =
            cF === 'all' ||
            extractCountry(row.Country) === cF;

        const matchesPrio =
            pF === 'all' || row.Prioridad === pF;

        return matchesDealer && matchesCountry && matchesPrio;
    });

    renderDashboard(filtered);
}

//=========================
//COLORS
//=========================
function getPriorityClass(priority) {

    if (!priority) {
        return "";
    }

    const p = priority.toLowerCase();

    if (p.includes("critical") || p.includes("critica")) {
        return "bg-red-500/20 text-red-400";
    }

    if (p.includes("high") || p.includes("alta")) {
        return "bg-yellow-500/20 text-yellow-400";
    }

    if (p.includes("medium") || p.includes("media")) {
        return "bg-blue-500/20 text-blue-400";
    }

    if (p.includes("low") || p.includes("baja")) {
        return "bg-green-500/20 text-green-400";
    }

    return "";
}
// =========================
// RENDER
// =========================

function renderDashboard(data) {

    let critical = 0;
    let progress = 0;

    const weeks = {};
    const specs = {}, dealers = {}, heat = {}, weeksPrio = {}, nextActionsCounts = {};
    const priosLabels = ['Low', 'Medium', 'High', 'Critical'];
    let crit = 0;

    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    console.log(fourMonthsAgo);
    data.forEach(row => {
        const st = (row.Status || row.Status || '').toLowerCase();
        const spec = row['Assigned to'] || 'Sin asignar';
        const prioFull = row.Prioridad || 'Media';
        const hw = row.Asset || 'Otro';
        const dlr = row.Dealer || 'Desconocido';
        const action = row['Next Steps'] || 'Sin definir';

        const pKey = priosLabels.find(p => prioFull.includes(p)) || 'Media';

        const dateObj = parseDate(row['Open Request'] || row.Date);
        if (dateObj && !isNaN(dateObj) && dateObj >= fourMonthsAgo) {
            const wk = getWeekStart(dateObj);
            if (!weeksPrio[wk]) {
                weeksPrio[wk] = { 'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0 };
            }
            weeksPrio[wk][pKey]++;
        }

        if (pKey === 'Critical') crit++;
        if (st.includes('progres')) progress++;
        if (!specs[spec]) specs[spec] = { open: 0, progress: 0, total: 0 };
        if (st.includes('progres')) specs[spec].progress++; else specs[spec].open++;
        specs[spec].total++;

        dealers[dlr] = (dealers[dlr] || 0) + 1;

        if (action !== 'Sin definir') {
            nextActionsCounts[action] = (nextActionsCounts[action] || 0) + 1;
        }

        if (!heat[hw]) heat[hw] = { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 };
        heat[hw][pKey]++;
    });

    // KPIS

    document.getElementById('kpi-total').innerText = data.length;
    document.getElementById('kpi-crit').innerText = crit;
    document.getElementById('kpi-progress').innerText = progress;

    const topSpec = Object.entries(specs)
        .sort((a, b) => b[1] - a[1])[0];
    console.log(topSpec)
    if (topSpec) {

        document.getElementById('kpi-top-spec').innerText = topSpec[0];

        document.getElementById('kpi-top-spec-count').innerText =
            `${topSpec[1].total} asignados`;
    }

    // TABLA
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    data
        .filter(row => ['High', 'Critical'].includes(row.Prioridad))
        .forEach(row => {
            const sla = getSLAStatus(row['Open Request']);
            const slaClass = getSLAClass(row['Open Request']);
            tbody.innerHTML += `
                    <tr>
                        <td class="text-blue-400 font-mono font-bold break-words max-w-xs"> ${row['Ticket Number']} </td>
                        <td>${row['Assigned to']}</td>
                        <td>${row.Dealer}</td>
                        <td>${row.Asset}</td>
                        <td>
                            <span class="status-pill ${getPriorityClass(row.Prioridad)}">
                            ${row.Prioridad}
                            </span>
                        </td>
                        <td> ${row['Next Steps']} </td>
                        <td> 
                        <div class=" status-pill ${slaClass}">${sla}</div>
                        </td>
                        
                    </tr>
                    `;
        });
    // Actualizar Gráficas

    const sKeys = Object.keys(specs).sort();
    charts.spec.data.labels = sKeys;
    charts.spec.data.datasets[0].data = sKeys.map(k => specs[k].progress);
    charts.spec.data.datasets[1].data = sKeys.map(k => specs[k].open);
    console.log(charts.spec.data.datasets);
    charts.spec.update();

    const weekLabels = Object.keys(weeksPrio).sort();
    charts.trend.data.labels = weekLabels;
    charts.trend.data.datasets[0].data = weekLabels.map(w => weeksPrio[w]['Critical']);
    charts.trend.data.datasets[1].data = weekLabels.map(w => weeksPrio[w]['High']);
    charts.trend.data.datasets[2].data = weekLabels.map(w => weeksPrio[w]['Medium']);
    charts.trend.data.datasets[3].data = weekLabels.map(w => weeksPrio[w]['Low']);
    charts.trend.update();
    const dSorted = Object.entries(dealers).sort((a, b) => b[1] - a[1]).slice(0, 10);
    charts.dealer.data.labels = dSorted.map(x => x[0]);
    charts.dealer.data.datasets[0].data = dSorted.map(x => x[1]);
    charts.dealer.update();

    const aSorted = Object.entries(nextActionsCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    charts.nextActions.data.labels = aSorted.map(x => x[0]);
    charts.nextActions.data.datasets[0].data = aSorted.map(x => x[1]);
    charts.nextActions.update();
    const hwKeys = Object.keys(heat).sort((a, b) => {
        const sumA = Object.values(heat[a]).reduce((x, y) => x + y, 0);
        const sumB = Object.values(heat[b]).reduce((x, y) => x + y, 0);
        return sumB - sumA;
    }).slice(0, 12);
    const zValues = hwKeys.map(h => priosLabels.map(p => heat[h][p]));

    Plotly.newPlot('heatmap', [{
        z: zValues, x: priosLabels, y: hwKeys, type: 'heatmap',
        colorscale: [
            [0, '#0F172A'],    // Azul Oscuro
            [0.5, '#1E3A8A'],  // Azul Real
            [1, '#1D4ED8']     // Azul Cobalto (Criticidad máxima)
        ],
        showscale: true
    }], {
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 5, r: 20, b: 35, l: 120 },
        font: { color: '#94A3B8', size: 10 },
        xaxis: { side: 'bottom', gridcolor: '#1E293B' },
        yaxis: { gridcolor: '#1E293B' }
    }, { displayModeBar: false });
}

// =========================
// HELPERS
// =========================
function getSLAStatus(openRequest) {
    const openDate = new Date(openRequest);
    const today = new Date();

    // Ignorar horas para comparar solo fechas
    openDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
        (today - openDate) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 1) return "1 Day";
    if (diffDays === 2) return "2 Days";
    if (diffDays === 3) return "3 Days";
    return "+ 3 Days";
}

function getSLAClass(openRequest) {
    const openDate = new Date(openRequest);
    const today = new Date();

    openDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    const diffDays = Math.floor(
        (today - openDate) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 1) return "bg-green-500";
    if (diffDays === 2) return "bg-yellow-500";
    if (diffDays === 3) return "bg-orange-500";
    return "bg-red-500";
}


function extractCountry(str) {

    if (!str) return "N/A";

    const low = str.toLowerCase();

    if (low.includes("mex")) return "México";
    if (low.includes("col")) return "Colombia";
    if (low.includes("per")) return "Perú";
    if (low.includes("bra")) return "Brasil";
    if (low.includes("rep")) return "República Dominicana";
    if (low.includes("bol")) return "Bolivia";
    if (low.includes("guat")) return "Guatemala";
    if (low.includes("sal")) return "Salvador";
    if (low.includes("ven")) return "Venezuela";
    if (low.includes("pan")) return "Panamá";
    if (low.includes("par")) return "Paraguay";
    if (low.includes("ecu")) return "Ecuador";
    if (low.includes("arg")) return "Argentina";
    if (low.includes("chi")) return "Chile";
    if (low.includes("cost")) return "Costa Rica";
    if (low.includes("suri")) return "Suriname";
    if (low.includes("guy")) return "Guyana";

    return "Otro";
}

function takeSnapshot() {

    html2canvas(
        document.getElementById('capture-area'),
        {
            backgroundColor: '#020617',
            scale: 2
        }
    ).then(canvas => {

        const a = document.createElement('a');

        a.download = 'dashboard.png';

        a.href = canvas.toDataURL();

        a.click();
    });
}

function mostrarReporte() {
    const img = document.createElement('img');
    img.src = 'https://emmaglorylml.github.io/tickets-dashboard/reporte.jpg';
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';

    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';

    modal.appendChild(img);

    modal.onclick = () => modal.remove();

    document.body.appendChild(modal);
}
// =========================
// INIT
// =========================

window.onload = () => {

    initCharts();

    loadSharePointData();
};
