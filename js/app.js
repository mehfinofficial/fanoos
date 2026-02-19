let currentDateFilter = "today";
let currentInvoice = null;
let cart = [];
let selectedInventoryProductId = null;
let editingProductId = null;

document.addEventListener("DOMContentLoaded", () => {
    enforceConnectivity();
});

function scrollToTopSmooth() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}


function formatCurrency(num) {
    return "₹" + Number(num).toLocaleString("en-IN");
}



document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("customerName")
    .addEventListener("input", searchCustomers);

    const APP_VERSION = "v1.0.0";

document.getElementById("splashVersion")
    .innerText = APP_VERSION;

    // SPLASH LOGO SWITCH
const splashLogo = document.getElementById("splashLogo");

if (localStorage.getItem("theme") === "dark") {
    splashLogo.src = "logo/Fanooswhite.png";
} else {
    splashLogo.src = "logo/Fanoosblack.png";
}


    

    renderDashboard();
    renderProducts();
renderSales();
renderCustomers();

const customerSearch = document.getElementById("customerSearch");
if (customerSearch) {
    customerSearch.addEventListener("input", renderCustomers);
}



document.getElementById("salesSearch")
    .addEventListener("input", renderSales);


    const themeToggle = document.getElementById("themeToggle");

const headerLogo = document.getElementById("headerLogo");

if (localStorage.getItem("theme") === "dark") {
    document.body.setAttribute("data-theme", "dark");
    themeToggle.checked = true;
    headerLogo.src = "logo/Fanooswhite.png";
} else {
    headerLogo.src = "logo/Fanoosblack.png";
}


themeToggle.addEventListener("change", () => {

    const headerLogo = document.getElementById("headerLogo");

    if (themeToggle.checked) {
        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        headerLogo.src = "logo/Fanooswhite.png";
    } else {
        document.body.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
        headerLogo.src = "logo/Fanoosblack.png";
    }
});


    document.getElementById("importFile")
        .addEventListener("change", importData);
// Hide splash after small delay
setTimeout(() => {
    document.getElementById("splashScreen")
        .classList.add("hide");
}, 1200);

});




function switchScreen(id, title) {



    document.querySelectorAll(".screen")
        .forEach(s => s.classList.remove("active"));

    document.getElementById(id).classList.add("active");
    document.getElementById("screenTitle").innerText = title;

    window.scrollTo({ top: 0, behavior: "smooth" });
}


function renderDashboard() {
     const erp = getERP();

    const lowStockProducts = erp.products.filter(p => p.stock <= p.minStock);

const lowStockPanel = document.getElementById("lowStockPanel");

if (lowStockProducts.length === 0) {

    lowStockPanel.innerHTML = `
        <div class="stock-card success">
            All products are sufficiently stocked.
        </div>
    `;

} else {

    lowStockPanel.innerHTML = `
        <div class="stock-card warning">
            <h4>Low Stock Alert</h4>
            <ul>
                ${lowStockProducts.map(p =>
                    `<li>${p.name} (Stock: ${p.stock})</li>`
                ).join("")}
            </ul>
        </div>
    `;
}


   

    document.getElementById("totalProducts")
        .innerText = erp.products.length;

    const lowStock = erp.products.filter(p => p.stock <= p.minStock);

    document.getElementById("lowStockCount")
        .innerText = lowStock.length;

  const now = new Date();
const month = now.getMonth();
const year = now.getFullYear();

const monthlySales = erp.sales.filter(s => {
    const date = new Date(s.createdAt);
    return date.getMonth() === month && date.getFullYear() === year;
});

const totalRevenue = monthlySales.reduce((sum, sale) => sum + sale.grandTotal, 0);
const monthlyProfit = monthlySales.reduce(
    (sum, sale) => sum + sale.totalProfit,
    0
);

document.getElementById("totalRevenue").innerText = formatCurrency(totalRevenue);
document.getElementById("totalProfit").innerText = formatCurrency(monthlyProfit);

document.getElementById("monthlyNet").innerText = formatCurrency(monthlyProfit);



const nowDate = new Date();
let filteredSales = [];

if (currentDateFilter === "today") {

    const todayStr = nowDate.toDateString();

    filteredSales = erp.sales.filter(s =>
        new Date(s.createdAt).toDateString() === todayStr
    );

} else if (currentDateFilter === "7days") {

    const past = new Date();
    past.setDate(nowDate.getDate() - 6);

    filteredSales = erp.sales.filter(s =>
        new Date(s.createdAt) >= past
    );

} else if (currentDateFilter === "30days") {

    const past = new Date();
    past.setDate(nowDate.getDate() - 29);

    filteredSales = erp.sales.filter(s =>
        new Date(s.createdAt) >= past
    );
}

const todayRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
const todayProfit = filteredSales.reduce((sum, s) => sum + s.totalProfit, 0);
let productsSoldCount = 0;

filteredSales.forEach(sale => {
    sale.items.forEach(item => {
        productsSoldCount += item.quantity;
    });
});

document.getElementById("productsSoldToday")
    .innerText = productsSoldCount;

// Today Net = Today Profit
document.getElementById("todayNet").innerText = formatCurrency(todayProfit);

let cashTotal = 0;
let upiTotal = 0;

filteredSales.forEach(s => {
    if (s.paymentMethod === "Cash") {
        cashTotal += s.grandTotal;
    } else if (s.paymentMethod === "UPI") {
        upiTotal += s.grandTotal;
    }
});

document.getElementById("todayRevenueValue")
    .innerText = formatCurrency(todayRevenue);

document.getElementById("cashValue")
    .innerText = formatCurrency(cashTotal);

document.getElementById("upiValue")
    .innerText = formatCurrency(upiTotal);

document.getElementById("profitValue")
    .innerText = formatCurrency(todayProfit);

renderRevenueChart();


}


function exportData() {
    const data = getERP();
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "erp-backup.json";
    a.click();
}

function importData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        localStorage.setItem("ERP_ROOT", e.target.result);
        location.reload();
    };

    reader.readAsText(file);
}




function openProductForm(id = null) {

    if (id) {
        editingProductId = id;   // ✅ correct variable
    } else {
        editingProductId = null;
    }



    // 🔥 hide bottom nav
document.querySelector(".bottom-nav").classList.add("nav-hidden");

// 🔥 prevent background scroll
document.body.classList.add("modal-open");
// 🔥 hide header
document.querySelector(".app-header").classList.add("header-hidden");



    const modal = document.getElementById("productModal");
    modal.classList.remove("hidden");
scrollToTopSmooth();
modal.scrollTop = 0;


    if (id) {
        const erp = getERP();
        const product = erp.products.find(p => p.id === id);

       
        document.getElementById("modalTitle").innerText = "Edit Product";

        document.getElementById("inventoryName").value = product.name;

        document.getElementById("productCategory").value = product.category;
        document.getElementById("productBrand").value = product.brand;
        document.getElementById("productWatt").value = product.watt;
        document.getElementById("productStock").value = product.stock;
        document.getElementById("productMinStock").value = product.minStock;
        document.getElementById("productPurchasePrice").value = product.purchasePrice;
        document.getElementById("productSellingPrice").value = product.sellingPrice;

    } else {
       
        document.getElementById("modalTitle").innerText = "Add Product";
        document.querySelectorAll("#productModal input")
            .forEach(i => i.value = "");
    }
}

function closeProductModal() {

    document.getElementById("productModal").classList.add("hidden");

    // 🔥 slide nav back up
    document.querySelector(".bottom-nav").classList.remove("nav-hidden");

    document.body.classList.remove("modal-open");
    // 🔥 show header again


document.querySelector(".app-header").classList.remove("header-hidden");

    resetInventoryModal(); 
}


function openInventoryModal() {
     resetInventoryModal(); 

    selectedInventoryProductId = null;

    document.getElementById("inventoryExistingInfo").style.display = "none";
    document.getElementById("inventoryName").value = "";

    // 🔥 slide nav down


    openProductForm();

}




function saveProduct() {
    const erp = getERP();



const name = document.getElementById("productName").value.trim();
const category = document.getElementById("productCategory").value.trim();
const brand = document.getElementById("productBrand").value.trim();
const watt = document.getElementById("productWatt").value.trim();
const stock = parseInt(document.getElementById("productStock").value);
const minStock = parseInt(document.getElementById("productMinStock").value);
const purchasePrice = parseFloat(document.getElementById("productPurchasePrice").value);
const sellingPrice = parseFloat(document.getElementById("productSellingPrice").value);


if (!name) {
    showToast("Product Name is required");
    return;
}

if (!category) {
    showToast("Category is required");
    return;
}

if (isNaN(stock) || stock < 0) {
    showToast("Enter valid stock quantity");
    return;
}

if (isNaN(purchasePrice) || purchasePrice <= 0) {
    showToast("Enter valid purchase price");
    return;
}

if (isNaN(sellingPrice) || sellingPrice <= 0) {
    showToast("Enter valid selling price");
    return;
}

const productData = {
    id: editingProductId ? editingProductId : Date.now().toString(),
    name,
    category,
    brand,
    watt,
    stock,
    minStock,
    purchasePrice,
    sellingPrice,
    updatedAt: new Date().toISOString()
};

    if (editingProductId) {
        erp.products = erp.products.map(p =>
            p.id === editingProductId ? productData : p
        );
    } else {
        productData.createdAt = new Date().toISOString();
        erp.products.push(productData);
    }

    saveERP(erp);
    closeProductModal();
    renderProducts();
    renderDashboard();
}

function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;

    const erp = getERP();
    erp.products = erp.products.filter(p => p.id !== id);
    saveERP(erp);

    renderProducts();
    renderDashboard();
}

function renderProducts() {
const erp = getERP();
erp.products.sort((a, b) => a.name.localeCompare(b.name));
const list = document.getElementById("productsList");

    list.innerHTML = "";

    const search = document.getElementById("productSearch").value?.toLowerCase() || "";

    const filtered = erp.products.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search)
    );

    filtered.forEach(product => {

        const lowStock = product.stock <= product.minStock;
        let stockStatus = "In Stock";
let stockClass = "stock-normal";

if (product.stock === 0) {
    stockStatus = "Out of Stock";
    stockClass = "stock-out";
} else if (product.stock <= product.minStock) {
    stockStatus = "Low Stock";
    stockClass = "stock-low";
}


        const div = document.createElement("div");
        div.className = "product-card" + (lowStock ? " low-stock" : "");

        div.innerHTML = `
            <div class="product-top">
                <strong>${product.name}</strong>
                <div class="product-actions">
                    <button onclick="openProductForm('${product.id}')">Edit</button>
                    <button onclick="deleteProduct('${product.id}')">Delete</button>
                </div>
            </div>
            <p class="product-meta">
    ${product.brand || ""} ${product.watt ? "• " + product.watt : ""}
</p>

            <div class="product-row">
    <p>Stock: ${product.stock}</p>
    <span class="stock-badge ${stockClass}">
        ${stockStatus}
    </span>
</div>

           <p class="product-price">₹${product.sellingPrice}</p>

        `;

        list.appendChild(div);
    });
}

document.getElementById("productSearch")
    .addEventListener("input", renderProducts);


   function startNewSale() {

    const erp = getERP();
const nextInvoice = erp.invoiceCounter || 1;

document.getElementById("saleInvoiceNumber").innerText = "INV-" + nextInvoice;

    cart = [];

    const overlay = document.getElementById("saleOverlay");
    overlay.classList.add("active");

    document.querySelector(".bottom-nav")
    .classList.add("nav-hidden");



    document.getElementById("cartList").innerHTML = "";
    document.getElementById("saleSubtotal").innerText = "0";
    document.getElementById("saleTotal").innerText = "0";
    document.getElementById("saleDiscount").value = "";
    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("paymentMethod").value = "Cash";


    populateProductDropdown();
}


function closeSaleSheet() {

    document.getElementById("saleOverlay")
        .classList.remove("active");

    document.querySelector(".bottom-nav")
        .classList.remove("nav-hidden");


        document.getElementById("customerSuggestions").innerHTML = "";

}


function populateProductDropdown() {
    const erp = getERP();
    const select = document.getElementById("saleProductSelect");
    select.innerHTML = "";

    erp.products.forEach(product => {
        if (product.stock > 0) {
            const option = document.createElement("option");
            option.value = product.id;
            option.innerText = `${product.name} (Stock: ${product.stock})`;
            select.appendChild(option);
        }
    });
}


let selectedProductId = null;



function searchProducts() {

    const erp = getERP();
    const query = document
        .getElementById("saleProductSearch")
        .value.toLowerCase();

    const suggestionsBox = document
        .getElementById("productSuggestions");

    suggestionsBox.innerHTML = "";

    if (!query) return;

    const matches = erp.products
        .filter(p =>
            p.stock > 0 &&
            p.name.toLowerCase().includes(query)
        )
        .slice(0, 6); // limit results

    matches.forEach(product => {

        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerText = `${product.name} (Stock: ${product.stock})`;

        div.onclick = () => {
            document.getElementById("saleProductSearch").value = product.name;
            selectedProductId = product.id;
            suggestionsBox.innerHTML = "";
        };

        suggestionsBox.appendChild(div);
    });
}



function addToCart() {
    const erp = getERP();
    const productId = selectedProductId;

    const quantity = parseInt(document.getElementById("saleQuantity").value);

    if (!quantity || quantity <= 0) return showToast("Invalid quantity");

    const product = erp.products.find(p => p.id === productId);

    if (product.stock < quantity)
        return showToast("Not enough stock!");

    const existing = cart.find(c => c.productId === productId);

    if (existing) {
        existing.quantity += quantity;
        existing.total = existing.quantity * existing.price;
    } else {
        cart.push({
            productId,
            name: product.name,
            quantity,
            price: product.sellingPrice,
            total: quantity * product.sellingPrice
        });
    }

 if (product.stock <= product.minStock) {
    showToast("⚠ Low stock: " + product.name);
}


    renderCart();
    document.getElementById("saleProductSearch").value = "";
selectedProductId = null;
document.getElementById("saleQuantity").value = "";



}


function renderCart() {
    const cartList = document.getElementById("cartList");
    cartList.innerHTML = "";


    
    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.total;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            ${item.name} x${item.quantity} = ₹${item.total}
            <button onclick="removeCartItem(${index})">X</button>
        `;
        cartList.appendChild(div);
    });

    document.getElementById("saleSubtotal").innerText = subtotal;
  let discount = parseFloat(document.getElementById("saleDiscount").value) || 0;
const type = document.getElementById("discountType").value;

if (type === "percent") {
    discount = subtotal * (discount / 100);
}

const total = subtotal - discount;



animateTotal("saleTotal", total);


}


function removeCartItem(index) {
    cart.splice(index, 1);
    renderCart();
}


function saveSale() {
    if (cart.length === 0) {
    showToast("Add items before saving sale.");
    return;
}


    const paymentMethod = document.getElementById("paymentMethod").value;

    const erp = getERP();


const invoiceNumber = erp.invoiceCounter || 1;
erp.invoiceCounter = invoiceNumber + 1;


    const subtotal = cart.reduce((sum, i) => sum + i.total, 0);

const discount = parseFloat(document.getElementById("saleDiscount").value) || 0;
const grandTotal = subtotal - discount;

const sale = {
    id: Date.now().toString(),
    customerName: document.getElementById("customerName").value || "Customer",
    customerPhone: document.getElementById("customerPhone").value,
    items: cart,
    subTotal: subtotal,
    paymentMethod: paymentMethod,
    discount: discount,
    grandTotal: grandTotal,
    invoiceNumber: invoiceNumber,
    totalProfit: cart.reduce((sum, item) => {
        const product = erp.products.find(p => p.id === item.productId);
        return sum + ((item.price - product.purchasePrice) * item.quantity);
    }, 0),
    createdAt: new Date().toISOString()
};



// Reduce stock safely
for (let item of cart) {

    const product = erp.products.find(p => p.id === item.productId);

    if (!product) continue;

    if (product.stock < item.quantity) {
        showToast("Not enough stock for " + product.name);
        return;
    }
}

// If all checks passed, reduce stock
cart.forEach(item => {

    const product = erp.products.find(p => p.id === item.productId);

    if (product) {
        product.stock -= item.quantity;   // 🔥 ACTUAL REDUCTION
    }
});

    erp.sales.push(sale);

    


// Reset cart & form but keep sheet open
cart = [];
selectedProductId = null;

document.getElementById("saleProductSearch").value = "";
document.getElementById("saleQuantity").value = "";
document.getElementById("saleDiscount").value = "";
document.getElementById("customerName").value = "";
document.getElementById("customerPhone").value = "";
document.getElementById("paymentMethod").value = "Cash";

// Generate next invoice number
document.getElementById("saleInvoiceNumber").innerText =
    "INV-" + erp.invoiceCounter;

// Re-render empty cart
renderCart();



currentInvoice = sale;
showSuccessOverlay();

saveERP(erp);
renderProducts();
renderSales();
renderCustomers();
renderDashboard();


}


function renderSales() {
    const erp = getERP();
    const list = document.getElementById("salesList");
    list.innerHTML = "";

const sorted = [...erp.sales].sort(
    (a,b) => new Date(b.createdAt) - new Date(a.createdAt)
);

// 🔍 GET SEARCH VALUE
const search = document.getElementById("salesSearch")?.value?.toLowerCase() || "";

// 🔍 FILTER SALES
const filtered = sorted.filter(s =>
    (s.customerName || "").toLowerCase().includes(search) ||
    (s.customerPhone || "").includes(search)
);

filtered.forEach(sale => {


        const div = document.createElement("div");
        div.className = "product-card";

        div.innerHTML = `
            <div class="product-top">
                <strong>${sale.customerName || "Walk-in Customer"}</strong>
                <button class="primary-btn" onclick="viewSale('${sale.id}')">View</button>

            </div>
            <p>Total: ${formatCurrency(sale.grandTotal)}</p>

            <p>${new Date(sale.createdAt).toLocaleString()}</p>
        `;

        list.appendChild(div);
    });
}


function viewSale(id) {
    document.querySelector(".bottom-nav")
    .classList.add("nav-hidden");

document.body.classList.add("modal-open");

    const erp = getERP();
    const sale = erp.sales.find(s => s.id === id);
    if (!sale) return;

    currentInvoice = sale;

    const container = document.getElementById("invoiceDetails");
    container.innerHTML = "";

let rows = "";

sale.items.forEach(item => {
    rows += `
        <div class="inv-row">
            <div class="inv-item-left">
                <div class="inv-name">${item.name}</div>
                <div class="inv-meta">
                    ${item.quantity} × ${formatCurrency(item.price)}
                </div>
            </div>
            <div class="inv-total">
                ${formatCurrency(item.total)}
            </div>
        </div>
    `;
});

container.innerHTML = `
<div class="invoice-compact">

    <div class="inv-header">
        <div>
            <div class="inv-title">Invoice</div>
            <div class="inv-id">#${sale.invoiceNumber}</div>
        </div>
        <div class="inv-date">
            ${new Date(sale.createdAt).toLocaleDateString()}
        </div>
    </div>

    <div class="inv-customer-grid">
        <div><strong>Customer</strong><br>${sale.customerName || "Walk-in"}</div>
        <div><strong>Payment</strong><br>${sale.paymentMethod}</div>
    </div>

    <div class="inv-items">
        ${rows}
    </div>

    <div class="inv-summary-grid">
        <div>Subtotal</div>
        <div>${formatCurrency(sale.subTotal)}</div>

        <div>Discount</div>
        <div>${formatCurrency(sale.discount)}</div>

        <div class="grand">Total</div>
        <div class="grand">${formatCurrency(sale.grandTotal)}</div>
    </div>

</div>
`;


  document.getElementById("invoiceOverlay")
    .classList.add("active");

document.getElementById("invoiceNumberLabel")
    .innerText = "#" + sale.invoiceNumber;

}


function closeInvoiceSheet() {

    document.getElementById("invoiceOverlay")
        .classList.remove("active");

    document.querySelector(".bottom-nav")
        .classList.remove("nav-hidden");

    document.body.classList.remove("modal-open");
}



function sendInvoiceWhatsApp() {

    if (!currentInvoice) return;

    const phone = currentInvoice.customerPhone;

    if (!phone) {
        showToast("Customer phone missing");
        return;
    }

    let message = "✨ LUMINO LIGHTS ✨\n\n";
    message += "Invoice\n\n";
    message += "Customer: " + (currentInvoice.customerName || "Walk-in") + "\n\n";

    currentInvoice.items.forEach(item => {
        message += `${item.name} x${item.quantity} = ₹${item.total}\n`;
    });

    message += "\nTotal: ₹" + currentInvoice.grandTotal;
    message += "\n\nThank you for shopping with us.";

    const encoded = encodeURIComponent(message);

    const formattedPhone = phone.startsWith("91")
        ? phone
        : "91" + phone;

    window.open(`https://wa.me/${formattedPhone}?text=${encoded}`, "_blank");
}











function deleteSale() {

    if (!currentInvoice) return;

    if (!confirm("Delete this sale? Stock will be restored.")) return;

    const erp = getERP();

    // 🔁 Restore stock
    currentInvoice.items.forEach(item => {
        const product = erp.products.find(p => p.id === item.productId);
        if (product) {
            product.stock += item.quantity;
        }
    });

    // 🗑 Remove sale
    erp.sales = erp.sales.filter(s => s.id !== currentInvoice.id);

    saveERP(erp);

    // 🔄 Refresh UI
    closeViewSaleModal();
    renderSales();
    renderProducts();
    renderDashboard();

    showToast("Sale deleted and stock restored.");
}


function printDailyReport() {

    const erp = getERP();
    const todayDate = new Date();
    const today = todayDate.toDateString();

    const filteredSales = erp.sales.filter(s =>
        new Date(s.createdAt).toDateString() === today
    );

    let totalRevenue = 0;
    let totalProfit = 0;

    let rows = "";

    filteredSales.forEach(sale => {

        totalRevenue += sale.grandTotal;
        totalProfit += sale.totalProfit;

        sale.items.forEach(item => {
            rows += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.total}</td>
                </tr>
            `;
        });

    });

    const html = `
    <html>
    <head>
        <title>Daily Closing Report</title>
        <style>
            @page {
                margin: 40px;
            }

            body {
                font-family: "Segoe UI", Arial, sans-serif;
                color: #111;
            }

            .container {
                max-width: 850px;
                margin: auto;
            }

            .header {
                text-align: center;
                margin-bottom: 25px;
            }

            .header h1 {
                margin: 0;
                font-size: 24px;
                letter-spacing: 2px;
            }

            .header p {
                margin: 4px 0;
                font-size: 14px;
                color: #444;
            }

            .line {
                border-top: 2px solid #000;
                margin: 20px 0;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }

            th {
                text-align: left;
                padding-bottom: 6px;
            }

            th:nth-child(2),
            td:nth-child(2) {
                text-align: center;
            }

            th:nth-child(3),
            td:nth-child(3) {
                text-align: right;
            }

            tbody td {
                padding: 6px 0;
            }

            .summary {
                margin-top: 30px;
                font-size: 15px;
            }

            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
            }

            .net {
                font-weight: bold;
                font-size: 17px;
                margin-top: 8px;
            }

        </style>
    </head>
    <body>

        <div class="container">

            <div class="header">
                <h1>FANOOS LIGHTING</h1>
                <p>Daily Closing Report</p>
                <p>${today}</p>
            </div>

            <div class="line"></div>

            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>

            <div class="line"></div>

            <div class="summary">
                <div class="summary-row">
                    <span>Total Invoices</span>
                    <span>${filteredSales.length}</span>
                </div>

                <div class="summary-row">
                    <span>Total Revenue</span>
                    <span>₹${totalRevenue}</span>
                </div>

                <div class="summary-row">
                    <span>Total Profit</span>
                    <span>₹${totalProfit}</span>
                </div>

                <div class="summary-row net">
                    <span>Net</span>
                    <span>₹${totalProfit}</span>
                </div>
            </div>

        </div>

    </body>
    </html>
    `;

    const win = window.open('', '', 'width=900,height=700');
    win.document.write(html);
    win.document.close();
    win.print();
}

function renderCustomers() {

    const erp = getERP();
    const list = document.getElementById("customersList");

    if (!list) return;

    list.innerHTML = "";

    const customersMap = {};

    erp.sales.forEach(sale => {

        if (!sale.customerPhone) return;

        if (!customersMap[sale.customerPhone]) {
            customersMap[sale.customerPhone] = {
                name: sale.customerName || "Customer",
                phone: sale.customerPhone,
                totalSpent: 0
            };
        }

        customersMap[sale.customerPhone].totalSpent += sale.grandTotal;
    });

    const customers = Object.values(customersMap);

    const search = document.getElementById("customerSearch")?.value?.toLowerCase() || "";

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search)
    );

    filtered.forEach(customer => {

        const div = document.createElement("div");
        div.className = "product-card";

        div.innerHTML = `
            <div class="product-top">
                <strong>${customer.name}</strong>
                <button onclick="viewCustomerDetails('${customer.phone}')">View</button>
            </div>
            <p>${customer.phone}</p>
            <p>Total Spent: ₹${customer.totalSpent}</p>
        `;

        list.appendChild(div);
    });
}


function viewCustomerDetails(phone) {

    const erp = getERP();
    const sales = erp.sales.filter(s => s.customerPhone === phone);

    switchScreen('salesScreen', 'Sales');

    const list = document.getElementById("salesList");
    list.innerHTML = "";

    sales.forEach(sale => {

        const div = document.createElement("div");
        div.className = "product-card";

        div.innerHTML = `
            <p><strong>Date:</strong> ${new Date(sale.createdAt).toLocaleString()}</p>
            <p><strong>Total:</strong> ${formatCurrency(sale.grandTotal)}</p>
            <button onclick="viewSale('${sale.id}')">Open Invoice</button>
        `;

        list.appendChild(div);
    });
}

function setActive(button) {
    document.querySelectorAll(".nav-item")
        .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");
}

function renderRevenueChart() {
    const erp = getERP();
    const chart = document.getElementById("revenueChart");
    if (!chart) return;

    chart.innerHTML = "";

    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        days.push(d);
    }

const revenueData = days.map(day => {

    const dayStart = new Date(day);
    dayStart.setHours(0,0,0,0);

    const dayEnd = new Date(day);
    dayEnd.setHours(23,59,59,999);

    return erp.sales
        .filter(s => {
            const saleDate = new Date(s.createdAt);
            return saleDate >= dayStart && saleDate <= dayEnd;
        })
        .reduce((sum, s) => sum + s.grandTotal, 0);
});


    const max = Math.max(...revenueData, 1);

days.forEach((day, index) => {

    const value = revenueData[index];
    const height = max === 0 ? 6 : (value / max) * 100;

    const bar = document.createElement("div");
    bar.className = "dashboard-bar";
    bar.setAttribute(
        "data-day",
        day.toLocaleDateString("en-US", { weekday: "short" })
    );

    const span = document.createElement("span");
    span.style.height = height + "%";

    bar.appendChild(span);
    chart.appendChild(bar);
});

}

function setDateFilter(type, btn) {

    currentDateFilter = type;

    document.querySelectorAll(".date-btn")
        .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    renderDashboard();
}

function showSuccessOverlay() {
    document.getElementById("saleSuccessOverlay")
        .classList.add("show");
}

function closeSuccessOverlay() {
    document.getElementById("saleSuccessOverlay")
        .classList.remove("show");
}

function animateTotal(id, value) {
    const el = document.getElementById(id);
    const start = parseFloat(el.innerText) || 0;
    const diff = value - start;

    const duration = 200;
    const steps = 10;
    let step = 0;

    const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        el.innerText = Math.round(start + diff * progress);
        if (step >= steps) clearInterval(interval);
    }, duration / steps);
}

function setQuickQty(val) {
    const qtyInput = document.getElementById("saleQuantity");

    let current = parseInt(qtyInput.value) || 0;

    qtyInput.value = current + val;
}

function searchCustomers() {

    const erp = getERP();

    const query = document
        .getElementById("customerName")
        .value
        .toLowerCase();

    const box = document
        .getElementById("customerSuggestions");

    box.innerHTML = "";

    if (!query) return;

    // Build unique customers from sales
    const customerMap = {};

    erp.sales.forEach(sale => {
        if (!sale.customerName) return;

        const key = sale.customerName.toLowerCase();

        if (!customerMap[key]) {
            customerMap[key] = {
                name: sale.customerName,
                phone: sale.customerPhone
            };
        }
    });

    const matches = Object.values(customerMap)
        .filter(c =>
            c.name.toLowerCase().includes(query)
        )
        .slice(0, 6);

    matches.forEach(customer => {

        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerText = customer.name;

        div.onclick = () => {
            document.getElementById("customerName").value = customer.name;
            document.getElementById("customerPhone").value = customer.phone || "";
            box.innerHTML = "";
        };

        box.appendChild(div);
    });
}





function increaseStock(productId, qty, newPurchasePrice = null) {
    const erp = getERP();
    const product = erp.products.find(p => p.id === productId);

    if (!product) return false;

    product.stock += qty;

    if (newPurchasePrice && newPurchasePrice > 0) {
        product.purchasePrice = newPurchasePrice;
    }

    saveERP(erp);
    return true;
}

function reduceStock(productId, qty) {
    const erp = getERP();
    const product = erp.products.find(p => p.id === productId);

    if (!product || product.stock < qty) return false;

    product.stock -= qty;
    saveERP(erp);
    return true;
}

function showToast(message, type = "success") {

    const toast = document.createElement("div");
    toast.className = "toast " + type;
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}


function searchInventoryProducts() {

    selectedInventoryProductId = null;

    const erp = getERP();
    const query = document
        .getElementById("inventoryName")
        .value.toLowerCase();

    const box = document.getElementById("inventorySuggestions");
    box.innerHTML = "";

    if (!query) return;

    const matches = erp.products
        .filter(p => p.name.toLowerCase().includes(query))
        .slice(0, 6);

    matches.forEach(product => {

        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerText = `${product.name} (Stock: ${product.stock})`;

div.onclick = () => {

    selectedInventoryProductId = product.id;

    // 🔥 ADD THIS
    editingProductId = product.id;

    document.getElementById("inventoryName").value = product.name;
    box.innerHTML = "";

    // 🔥 CHANGE TITLE
    document.getElementById("modalTitle").innerText = "Update Product";

    showInventoryExisting(product);
};


        box.appendChild(div);
    });
}


function showInventoryExisting(product) {
    document.getElementById("inventoryCreateFields").style.display = "none";


    document.getElementById("stockLabel").innerText = "Quantity to Add";

    const info = document.getElementById("inventoryExistingInfo");

    info.innerHTML = `
        Current Stock: ${product.stock}<br>
        Purchase Price: ₹${product.purchasePrice}<br>
        Selling Price: ₹${product.sellingPrice}
    `;

    info.style.display = "block";
}


function saveInventory() {

    if (editingProductId) {

    const erp = getERP();
    const product = erp.products.find(p => p.id === editingProductId);

    if (!product) return;

    product.name = document.getElementById("inventoryName").value.trim();
    product.category = document.getElementById("productCategory").value.trim();
    product.brand = document.getElementById("productBrand").value.trim();
    product.watt = document.getElementById("productWatt").value.trim();
    product.minStock = parseInt(document.getElementById("productMinStock").value) || 0;
    product.purchasePrice = parseFloat(document.getElementById("productPurchasePrice").value);
    product.sellingPrice = parseFloat(document.getElementById("productSellingPrice").value);

    saveERP(erp);

    showToast("Product Updated");

    editingProductId = null;
    closeProductModal();
    renderProducts();
    renderDashboard();
    return;
}


    const erp = getERP();

    const name = document.getElementById("inventoryName").value.trim();
    const qty = parseInt(document.getElementById("productStock").value);
    const purchasePrice = parseFloat(document.getElementById("productPurchasePrice").value);
    const sellingPrice = parseFloat(document.getElementById("productSellingPrice").value);

    if (!name) return showToast("Enter product name", "error");
    if (!qty || qty <= 0) return showToast("Enter valid quantity", "error");
    if (!purchasePrice || purchasePrice <= 0)
        return showToast("Enter purchase price", "error");

    if (selectedInventoryProductId) {

        const product = erp.products.find(p => p.id === selectedInventoryProductId);

        product.stock += qty;
        product.purchasePrice = purchasePrice;

        saveERP(erp);
        showToast("Stock Updated");

    } else {

        const exists = erp.products.find(p =>
            p.name.toLowerCase() === name.toLowerCase()
        );

        if (exists)
            return showToast("Select existing product from suggestions", "error");

        if (!sellingPrice || sellingPrice <= 0)
            return showToast("Enter selling price", "error");

const category = document.getElementById("productCategory").value.trim();
const brand = document.getElementById("productBrand").value.trim();
const watt = document.getElementById("productWatt").value.trim();
const minStock = parseInt(document.getElementById("productMinStock").value) || 0;

erp.products.push({
    id: Date.now().toString(),
    name,
    category,
    brand,
    watt,
    stock: qty,
    minStock,
    purchasePrice,
    sellingPrice,
    createdAt: new Date().toISOString()
});

        saveERP(erp);
        showToast("New Product Added");
    }

    renderProducts();
    renderDashboard();
    closeProductModal();
}

function resetInventoryModal() {

    selectedInventoryProductId = null;
    editingProductId = null;


    // Clear inputs
    document.getElementById("inventoryName").value = "";
    document.getElementById("productCategory").value = "";
    document.getElementById("productBrand").value = "";
    document.getElementById("productWatt").value = "";
    document.getElementById("productMinStock").value = "";
    document.getElementById("productStock").value = "";
    document.getElementById("productPurchasePrice").value = "";
    document.getElementById("productSellingPrice").value = "";

    // Hide existing info card
    document.getElementById("inventoryExistingInfo").style.display = "none";

    // Show creation fields
    document.getElementById("inventoryCreateFields").style.display = "block";

    // Reset stock label
    document.getElementById("stockLabel").innerText = "Initial Stock";
    document.getElementById("modalTitle").innerText = "Add Product";

}

async function checkOnlineStatus() {
    try {
        // Try pinging Google or your API
        const online = await fetch("https://www.google.com", { mode: "no-cors" });
        return true;
    } catch {
        return false;
    }
}

async function enforceConnectivity() {
    const lastPing = localStorage.getItem("last_online_ping");
    const now = Date.now();

    // If never stored, store now
    if (!lastPing) {
        localStorage.setItem("last_online_ping", now);
        return;
    }

    const hoursPassed = (now - Number(lastPing)) / (1000 * 60 * 60);

    if (hoursPassed >= 24) {
        const online = await checkOnlineStatus();

        if (online) {
            // Reset timer
            localStorage.setItem("last_online_ping", now);
        } else {
            // Lock the app
            document.body.innerHTML = `
                <div style="
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    height:100vh;
                    text-align:center;
                    padding:20px;
                    font-family:Inter, sans-serif;">
                    <div>
                        <h2>Internet Required</h2>
                        <p>Please connect to the internet and restart the app.</p>
                    </div>
                </div>
            `;
        }
    }
}

// Run check on startup
enforceConnectivity();
