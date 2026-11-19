// =============================
// ABC HUB Shopping Cart
// (SHEET_URL comes from config.js)
// =============================
// ================= EMAILJS CONFIG =================
const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const NOTIFY_EMAIL        = "m.abdulmoiz1810@gmail.com";

if (typeof emailjs !== "undefined") {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

let cart = [];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ================= VISITOR (WELCOME PAGE DETAILS) =================
function getVisitor() {
    try {
        const v = JSON.parse(localStorage.getItem("abcHubVisitor") || "null");
        if (v && v.name && v.email) return v;
    } catch (e) {}

    try {
        if (window.name.indexOf("abcHub:") === 0) {
            const v = JSON.parse(window.name.slice(7));
            if (v && v.name && v.email) return v;
        }
    } catch (e) {}

    return null;
}

function showGreeting() {
    const visitor = getVisitor();
    const el = document.getElementById("visitorGreeting");

    if (visitor && visitor.name && el) {
        const firstName = visitor.name.split(" ")[0];
        el.textContent = "👋 Hi, " + firstName;
    }
}

function prefillCheckout() {
    const visitor = getVisitor();

    if (visitor) {
        document.getElementById("customerName").value  = visitor.name  || "";
        document.getElementById("customerEmail").value = visitor.email || "";
    }
}

// ================= SIGN OUT =================
function signOut() {

    if (!confirm("Sign out and return to the welcome page?")) {
        return;
    }

    try {
        localStorage.removeItem("abcHubVisitor");
        localStorage.removeItem("abcHubCart");
    } catch (e) {}

    window.name = "";
    window.location.replace("welcome.html");
}

// ================= ADD TO CART =================
function addCart(name, price, image) {

    let existing = cart.find(item => item.name === name);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name: name, price: price, image: image, qty: 1 });
    }

    updateCart();
    showToast(name + " added to cart!");
}

// ================= TOAST NOTIFICATION =================
function showToast(message) {

    let toast = document.getElementById("cart-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "cart-toast";
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: gold;
            color: #111;
            padding: 14px 24px;
            border-radius: 8px;
            font-weight: bold;
            font-family: 'Poppins', sans-serif;
            box-shadow: 0 5px 20px rgba(0,0,0,.4);
            z-index: 99999;
            transition: opacity .4s ease, transform .4s ease;
        `;
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    clearTimeout(toast._hideTimeout);
    toast._hideTimeout = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
    }, 2000);
}

// ================= UPDATE CART =================
function updateCart() {

    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const total = document.getElementById("total");

    let rows = "";
    let totalPrice = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {

        totalItems += item.qty;
        totalPrice += item.price * item.qty;

        rows += `
        <tr>
            <td>
                <img src="${item.image}" width="60" height="60" alt="" style="border-radius:8px;">
            </td>
            <td>${item.name}</td>
            <td>
                <button onclick="decreaseQty(${index})">−</button>
                ${item.qty}
                <button onclick="increaseQty(${index})">+</button>
            </td>
            <td>$${(item.price * item.qty).toFixed(2)}</td>
            <td>
                <button onclick="removeItem(${index})">🗑</button>
            </td>
        </tr>
        `;
    });

    cartItems.innerHTML = rows;
    cartCount.textContent = totalItems;
    total.textContent = totalPrice.toFixed(2);

    saveCart();
}
// ==========================================
// ABC HUB - SETTINGS (change the URL ONLY here)
// ==========================================
// Paste your Google Apps Script "Web app URL" (must end with /exec).
// Both welcome.html and index.html read this one value.


// ================= SAVE / LOAD CART =================
function saveCart() {
    try {
        localStorage.setItem("abcHubCart", JSON.stringify(cart));
    } catch (e) {}
}

function loadCart() {
    try {
        const saved = localStorage.getItem("abcHubCart");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                cart = parsed;
            }
        }
    } catch (e) {
        cart = [];
    }
    updateCart();
}

// ================= QTY CONTROLS =================
function increaseQty(index) {
    cart[index].qty++;
    updateCart();
}

function decreaseQty(index) {
    if (cart[index].qty > 1) {
        cart[index].qty--;
    } else {
        cart.splice(index, 1);
    }
    updateCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}

// ================= OPEN / CLOSE CART =================
function toggleCart() {
    let box = document.getElementById("cart-box");
    box.style.display = (box.style.display === "block") ? "none" : "block";
}

// ================= CHECKOUT =================
function showCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    prefillCheckout();
    document.getElementById("checkout-form").style.display = "flex";
}

// ================= SAVE ORDER TO GOOGLE SHEET =================
// Returns true if the request was sent, false if the sheet is not set up.
// Throws if the network fails.
async function sendOrderToSheet(order) {

    const url = String(typeof SHEET_URL !== "undefined" ? SHEET_URL : "").trim();

    if (url.indexOf("https://script.google.com/") !== 0) {
        console.warn("SHEET_URL is not set in config.js. Order was NOT saved to Google Sheet.");
        return false;
    }

    const request = fetch(url, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(order)
    });

    // Wait for the request, but never longer than 6 seconds
    await Promise.race([
        request,
        new Promise(function (resolve) { setTimeout(resolve, 6000); })
    ]);

    return true;
}

// ================= PLACE ORDER =================
async function placeOrder() {

    const name    = document.getElementById("customerName").value.trim();
    const email   = document.getElementById("customerEmail").value.trim();
    const phone   = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();
    const btn     = document.getElementById("placeOrderBtn");

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    if (name === "" || email === "" || phone === "" || address === "") {
        alert("Please fill all details.");
        return;
    }

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (phone.replace(/\D/g, "").length < 7) {
        alert("Please enter a valid phone number.");
        return;
    }

    let orderList = "";
    let orderTotal = 0;

    cart.forEach(item => {
        orderTotal += item.price * item.qty;
        orderList += "- " + item.name + " x" + item.qty + " : $" + (item.price * item.qty).toFixed(2) + "\n";
    });

    const orderId = "ORD-" + Date.now().toString(36).toUpperCase();

    btn.disabled = true;
    btn.textContent = "Placing order...";

    // ---------- Save order in Google Sheet ----------
    try {
        await sendOrderToSheet({
            type: "order",
            orderId: orderId,
            name: name,
            email: email,
            phone: phone,
            address: address,
            products: orderList.trim().replace(/\n/g, " | "),
            total: orderTotal.toFixed(2)
        });
    } catch (err) {
        console.error("Could not save order to Google Sheet:", err);
        alert("Could not place your order. Please check your internet and try again.");
        btn.disabled = false;
        btn.textContent = "Place Order";
        return;
    }

    // ---------- Send notification email (EmailJS) ----------
    if (EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" ||
        EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID" ||
        EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY") {

        console.warn("EmailJS is not configured yet. Edit the EMAILJS values at the top of script.js.");

    } else if (typeof emailjs === "undefined") {

        console.error("EmailJS SDK did not load. Check the <script> tag in index.html and your internet connection.");

    } else {

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_email: NOTIFY_EMAIL,
            order_id: orderId,
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            customer_address: address,
            order_details: orderList,
            order_total: orderTotal.toFixed(2)
        }).then(function () {
            console.log("Order notification email sent.");
        }).catch(function (error) {
            console.error("Order email failed to send:", error);
        });
    }

    alert(
        "🎉 Order Placed Successfully!\n\n" +
        "Order ID : " + orderId +
        "\nCustomer : " + name +
        "\nEmail : " + email +
        "\nPhone : " + phone +
        "\nAddress : " + address +
        "\n\nProducts Ordered :\n" + orderList +
        "\nTotal : $" + orderTotal.toFixed(2) +
        "\n\nThank you for shopping at ABC HUB!"
    );

    // ---------- Reset ----------
    cart = [];
    updateCart();

    document.getElementById("checkout-form").style.display = "none";
    document.getElementById("customerPhone").value = "";
    document.getElementById("customerAddress").value = "";
    document.getElementById("cart-box").style.display = "none";

    btn.disabled = false;
    btn.textContent = "Place Order";

    prefillCheckout();
}

// ================= LOAD ON PAGE OPEN =================
window.addEventListener("load", function () {
    loadCart();
    showGreeting();
    prefillCheckout();
});