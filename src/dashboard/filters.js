// =========================
// PAÍSES Y DEALERS
// =========================

const dealersByCountry = {
    "República Dominicana": ["A.B. German", "Mivisa"],
    "Bolivia": ["Autored"],
    "Colombia": ["GGS Colombia"],
    "Salvador": ["Betantecnica"],
    "Guatemala": ["Betatecnica"],
    "Perú": ["Corporación Cárdenas"],
    "Venezuela": ["Corporación Cárdenas"],
    "Panamá": ["Suplesa", "Datacom"],
    "Paraguay": ["Diesa"],
    "Ecuador": ["Trade", "Tecs"],
    "Brazil": ["GGS Brazil"],
    "LATAM": ["GGS Dealers"],
    "México": ["GGS México"],
    "Uruguay": ["Permaquim"],
    "Chile": ["Permaquim"],
    "Argentina": ["Permaquim"],
    "Costa Rica": ["Suplesa"],
    "Trinidad y Tobago": ["Tridium"],
    "Belice": ["Tridium"],
    "Curazao": ["Tridium"]
};

// =========================
// FILTROS
// =========================

function populateFilterOptions() {

    const countries = new Set();
    const prios = new Set();

    rawData.forEach(row => {

        if (row.Prioridad) {
            prios.add(row.Prioridad);
        }

        countries.add(extractCountry(row.Country));
    });

    fillSelect("filter-country", countries);
    fillSelect("filter-prio", prios);

    // Inicializar dealers según el país seleccionado
    updateDealerOptions();
}

function fillSelect(id, values) {

    const el = document.getElementById(id);

    el.innerHTML = "";
    el.add(new Option("Todos", "all"));

    Array.from(values)
        .sort((a, b) => a.localeCompare(b))
        .forEach(value => {
            el.add(new Option(value, value));
        });
}

function applyFilters() {

    const dF = document.getElementById("filter-dealer").value;
    const cF = document.getElementById("filter-country").value;
    const pF = document.getElementById("filter-prio").value;

    const filtered = rawData.filter(row => {

        const matchesDealer =
            dF === "all" || row.Dealer === dF;

        const matchesCountry =
            cF === "all" ||
            extractCountry(row.Country) === cF;

        const matchesPrio =
            pF === "all" || row.Prioridad === pF;

        return matchesDealer && matchesCountry && matchesPrio;
    });

    renderDashboard(filtered);
}

function updateDealerOptions() {

    const country =
        document.getElementById("filter-country").value;

    const dealerSelect =
        document.getElementById("filter-dealer");

    // Si se selecciona "Todos", mostrar todos los dealers
    if (country === "all") {

        const allDealers = new Set(
            Object.values(dealersByCountry).flat()
        );

        fillSelect("filter-dealer", allDealers);
        return;
    }

    // Obtener únicamente los dealers del país seleccionado
    const dealers = dealersByCountry[country] || [];

    fillSelect("filter-dealer", new Set(dealers));
}