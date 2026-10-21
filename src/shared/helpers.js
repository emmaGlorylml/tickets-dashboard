// =========================
// HELPERS
// =========================

function GetDifferenceWorkingDays(openRequest, assignmentDate) {
    const startDate = new Date(openRequest);
    const endDate = assignmentDate
        ? new Date(assignmentDate)
        : new Date();

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    let businessDays = 0;
    let current = new Date(startDate);

    while (current < endDate) {
        current.setDate(current.getDate() + 1);

        const day = current.getDay();

        if (day !== 0 && day !== 6) {
            businessDays++;
        }
    }

    return `${businessDays} Day${businessDays !== 1 ? "s" : ""}`;
}

function getResponseSLAClass(isInSLAReponse) {
    return isInSLAReponse
        ? COLORS.tailwind.Low
        : COLORS.tailwind.Critical;
}

function getSolutionSLAClass(InSLAResolved) {
    let classTailwind = InSLAResolved ? COLORS.tailwind.Low : COLORS.tailwind.Critical;

    return classTailwind;
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