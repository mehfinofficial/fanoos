function getERP() {
    const data = localStorage.getItem("ERP_ROOT");

    if (!data) {
const defaultData = {
    products: [],
    sales: [],
    activityLog: [],
    invoiceCounter: 1
};

        localStorage.setItem("ERP_ROOT", JSON.stringify(defaultData));
        return defaultData;
    }

    return JSON.parse(data);
}

function saveERP(data) {
    try {
        localStorage.setItem("ERP_ROOT", JSON.stringify(data));
    } catch (e) {
        alert("Storage limit reached! Please export data and clear old records.");
    }
}
