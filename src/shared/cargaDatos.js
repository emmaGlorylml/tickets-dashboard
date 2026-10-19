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

        "Country": item.Country || "",

        "AssignmentDate": getCurrentDate(item.AssignmentDate),

        "Dispatcher": item.Dispatcher || "",

        "RequestResolved": getCurrentDate(item.RequestResolved)
    };
}