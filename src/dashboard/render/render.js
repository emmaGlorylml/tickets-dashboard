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
    data.forEach(row => {
        const st = (row.Status || row.Status || '').toLowerCase();
        const spec = row['Assigned to'] || 'Sin asignar';
        const prioFull = row.Prioridad || 'Media';
        const hw = row.Asset || 'Otro';
        const dlr = row.Dealer || 'Desconocido';
        const action = row['Next Steps'] || 'Sin definir';
        const assignmentDate = row['AssignmentDate'];

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
    if (topSpec) {

        document.getElementById('kpi-top-spec').innerText = topSpec[0];

        document.getElementById('kpi-top-spec-count').innerText =
            `${topSpec[1].total} asignados`;
    }

    // TABLA
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    data
        .filter(row => ['High', 'Critical', ''].includes(row.Prioridad))
        .forEach(row => {
            const openRequest = row['Open Request'];
            const assignmentDate = row['AssignmentDate'];
            const requestResolved = row['RequestResolved'];
            const priority = row['Prioridad'];
            console.log(priority);
            const slaResponse = GetDifferenceWorkingDays(openRequest, assignmentDate);
            const slaResponseClass = getResponseSLAClass(openRequest, assignmentDate);

            const slaSolution = GetDifferenceWorkingDays(openRequest, requestResolved);
            const slaSolutionClass = getSolutionSLAClass(openRequest, requestResolved, priority);
            tbody.innerHTML += `
                    <tr>
                        <td class="text-blue-400 font-mono font-bold break-words max-w-xs"> ${row['Ticket Number']} </td>
                        <td>${row['Dispatcher']}</td>
                        <td>${row['Assigned to']}</td>
                        <td>${row.Dealer}</td>
                        <td>${row.Asset}</td>
                        <td>
                            <div class="status-pill ${getPriorityClass(row.Prioridad)}">
                            ${row.Prioridad}
                            </div>
                        </td>
                        <td> ${row['Next Steps']} </td>
                        <td> 
                        <div class=" status-pill ${slaResponseClass}">${slaResponse}</div>
                        </td>
                        <td> 
                        <div class=" status-pill ${slaSolutionClass}">${slaSolution}</div>
                        </td>
                        
                    </tr>
                    `;
        });
    // Actualizar Gráficas

    const sKeys = Object.keys(specs).sort();
    charts.spec.data.labels = sKeys;
    charts.spec.data.datasets[0].data = sKeys.map(k => specs[k].progress);
    charts.spec.data.datasets[1].data = sKeys.map(k => specs[k].open);
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