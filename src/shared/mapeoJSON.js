// URL DEL JSON
const JSON_URL = "./tickets.json";

//Variables
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

        "Title": item.Title || "",

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
        
        "RequestResolved": getCurrentDate(item.RequestResolved),

        "InSLAResponse": isInSLAResponse(item.AssignmentDate, item.OpenRequest),

        "InSLAResolved": isInSLAResolve(item.RequestResolved, item.OpenRequest, item.Priority?.Value)
    };
}

//Helpers
const getCurrentDate = (dateValue) => {
    if (!dateValue) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    return String(dateValue).substring(0, 10);
};

function isInSLAResponse(assignmentDate, openRequest) {
    // Si no hay fecha de apertura, no se puede calcular
    if (!openRequest) {
        return false;
    }

    const start = new Date(openRequest);

    // Si la fecha de apertura es inválida
    if (isNaN(start.getTime())) {
        return false;
    }

    // Si no hay fecha de asignación, usar la fecha actual
    const end = assignmentDate
        ? new Date(assignmentDate)
        : new Date();

    // Si la fecha de asignación es inválida
    if (isNaN(end.getTime())) {
        return false;
    }

    let workingDays = 0;
    let current = new Date(start);

    while (current < end) {
        current.setDate(current.getDate() + 1);

        const day = current.getDay(); // 0=Domingo, 6=Sábado

        if (day !== 0 && day !== 6) {
            workingDays++;
        }
    }

    return workingDays <= 2;
}

function isInSLAResolve(requestResolved, openRequest, priority) {
    // Si no hay fecha de apertura, usar hoy
    const start = openRequest
        ? new Date(openRequest)
        : new Date();

    if (isNaN(start.getTime())) {
        return false;
    }

    // Si no hay fecha de resolución, usar hoy
    const end = requestResolved
        ? new Date(requestResolved)
        : new Date();

    if (isNaN(end.getTime())) {
        return false;
    }

    // Prioridad por defecto
    priority = priority ?? "Critical";

    const slaDays = {
        Critical: 5,
        High: 10,
        Medium: 20,
        Low: 40
    };

    const maxDays = slaDays[priority] ?? 5;

    let workingDays = 0;
    let current = new Date(start);

    while (current < end) {
        current.setDate(current.getDate() + 1);

        const day = current.getDay(); // 0=Domingo, 6=Sábado

        if (day !== 0 && day !== 6) {
            workingDays++;
        }
    }

    return workingDays <= maxDays;
}