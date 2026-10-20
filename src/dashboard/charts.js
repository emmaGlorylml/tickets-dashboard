// =========================
// CHARTS
// =========================

function initCharts() {
    const commonOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { position: 'bottom', labels: { color: COLORS.ui.labels, font: { size: 10 }, padding: 10 } }
        },
        scales: {
            x: { grid: { color: COLORS.ui.axis }, ticks: { color: COLORS.ui.labels, font: { size: 9 } } },
            y: { grid: { color: COLORS.ui.axis }, ticks: { color: COLORS.ui.labels, font: { size: 9 } } }
        }
    };

    charts.spec = new Chart(document.getElementById('chartSpec'), {
        type: 'bar',
        options: { ...commonOptions, indexAxis: 'y' },
        data: {
            labels: [], datasets: [
                { label: 'En progreso', backgroundColor: COLORS.priority.Medium, data: [] },
                { label: 'Abierto', backgroundColor: COLORS.priority.High, data: [] }
            ]
        }
    });

    charts.trend = new Chart(document.getElementById('chartTrend'), {
        type: 'bar',
        options: {
            ...commonOptions,
            scales: {
                x: { stacked: true, grid: { display: false }, ticks: { color: COLORS.ui.labels } },
                y: { stacked: true, grid: { color: COLORS.ui.axis }, ticks: { color: COLORS.ui.labels } }
            }
        },
        data: {
            labels: [],
            datasets: [
                { label: 'Critical', backgroundColor: COLORS.priority.Critical, data: [] },
                { label: 'High', backgroundColor: COLORS.priority.High, data: [] },
                { label: 'Medium', backgroundColor: COLORS.priority.Medium, data: [] },
                { label: 'Low', backgroundColor: COLORS.priority.Low, data: [] }
            ]
        }
    });

    charts.dealer = new Chart(document.getElementById('chartDealer'), {
        type: 'pie',
        options: {
            ...commonOptions,
            scales: { x: { display: false }, y: { display: false } },
            plugins: {
                legend: { position: 'right', labels: { color: COLORS.ui.labels, font: { size: 9 } } }
            }
        },
        data: { labels: [], datasets: [{ label: 'Tickets', backgroundColor: COLORS.chart, borderWidth: 0, data: [] }] }
    });

    charts.nextActions = new Chart(document.getElementById('chartNextActions'), {
        type: 'doughnut',
        options: {
            ...commonOptions,
            cutout: '65%',
            scales: { x: { display: false }, y: { display: false } },
            plugins: {
                legend: { position: 'right', labels: { color: COLORS.ui.labels, font: { size: 9 } } }
            }
        },
        data: { labels: [], datasets: [{ label: 'Frecuencia', backgroundColor: COLORS.chart, borderWidth: 0, data: [] }] }
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