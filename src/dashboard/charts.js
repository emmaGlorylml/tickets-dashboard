// =========================
// CHARTS
// =========================

function initCharts() {
    const commonOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { position: 'bottom', labels: { color: HELP_COLORS['Labels'], font: { size: 10 }, padding: 10 } }
        },
        scales: {
            x: { grid: { color: HELP_COLORS['Ejes'] }, ticks: { color: HELP_COLORS['Labels'], font: { size: 9 } } },
            y: { grid: { color: HELP_COLORS['Ejes'] }, ticks: { color: HELP_COLORS['Labels'], font: { size: 9 } } }
        }
    };

    charts.spec = new Chart(document.getElementById('chartSpec'), {
        type: 'bar',
        options: { ...commonOptions, indexAxis: 'y' },
        data: {
            labels: [], datasets: [
                { label: 'En progreso', backgroundColor: PRIO_COLORS['Medium'], data: [] },
                { label: 'Abierto', backgroundColor: PRIO_COLORS['High'], data: [] }
            ]
        }
    });

    charts.trend = new Chart(document.getElementById('chartTrend'), {
        type: 'bar',
        options: {
            ...commonOptions,
            scales: {
                x: { stacked: true, grid: { display: false }, ticks: { color: HELP_COLORS['Labels'] } },
                y: { stacked: true, grid: { color: HELP_COLORS['Ejes'] }, ticks: { color: HELP_COLORS['Labels'] } }
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
                legend: { position: 'right', labels: { color: HELP_COLORS['Labels'], font: { size: 9 } } }
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
                legend: { position: 'right', labels: { color: HELP_COLORS['Labels'], font: { size: 9 } } }
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