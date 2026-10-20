//=========================
//COLORS
//=========================
function getPriorityClass(priority) {

    if (!priority) {
        return "";
    }

    const p = priority.toLowerCase();

    if (p.includes("critical") || p.includes("critica")) {
        return "bg-red-500/70";
    }

    if (p.includes("high") || p.includes("alta")) {
        return "bg-yellow-500/70";
    }

    if (p.includes("medium") || p.includes("media")) {
        return "bg-blue-500/70";
    }

    if (p.includes("low") || p.includes("baja")) {
        return "bg-green-500/70";
    }

    return "";
}

//////////////////////////////////////////////////////////////////////////
const COLORS = {
    priority: {
        Critical: '#EF4444', //Rojo critico
        High: '#F59E0B',     //Amarillo alto
        Medium: '#3B82F6',   //Azul medio
        Low: '#10B981'       //Verde bajo
    },

    chart: [
        '#3B82F6',
        '#6366F1',
        '#8B5CF6',
        '#EC4899',
        '#F43F5E',
        '#10B981',
        '#F59E0B',
        '#06B6D4',
        '#64748B'
    ],

    ui: {
        axis: '#1E293B',
        labels: '#94A3B8',
        background: '#0F172A'
    },

    tailwind: {
        Critical: 'bg-red-500/70',
        High: 'bg-yellow-500/70',
        Medium: 'bg-blue-500/70',
        Low: 'bg-green-500/70'
    }
};
