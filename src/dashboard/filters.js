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