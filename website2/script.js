
let cart = [];

const firebaseConfig = {
    apiKey: "AIzaSyCTVnLfVINOp23ijE6W4kC2qKfIue1KtCw",
    authDomain: "netcentric-ec144.firebaseapp.com",
    projectId: "netcentric-ec144",
    storageBucket: "netcentric-ec144.firebasestorage.app",
    messagingSenderId: "1049767742940",
    appId: "1:1049767742940:web:65ebb15cb474c26a24d319",
    measurementId: "G-P76K22FMYM"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function addToCart(productName, productPrice) {
    let existingProduct = cart.find(item => item.name === productName);

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }

    displayCart();
}

function changeQuantity(index, amount) {
    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    displayCart();
}

function displayCart() {
    let cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cart.forEach(function(item, index) {
            total += item.price * item.quantity;

            cartItems.innerHTML += `
                <div class="cart-product">
                    <p>
                        ${item.name}<br>
                        ₦${item.price.toLocaleString()}
                    </p>

                    <button onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            `;
        });
    }

    document.getElementById("total").innerHTML =
        "Total: ₦" + total.toLocaleString();
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty. Add a product before checking out.");
        return;
    }

    document.getElementById("checkout-form").style.display = "block";
    document.getElementById("checkout-form").scrollIntoView({
        behavior: "smooth"
    });
}

function searchProducts() {
    let input = document.getElementById("searchBox").value.toLowerCase();
    let products = document.getElementsByClassName("product-card");

    for (let i = 0; i < products.length; i++) {
        let name = products[i]
            .getElementsByTagName("h3")[0]
            .textContent.toLowerCase();

        products[i].style.display = name.includes(input) ? "block" : "none";
    }
}

async function placeOrder(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const customer = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!customer || !phone || !address) {
        alert("Please complete all customer information.");
        return;
    }

    const total = cart.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0
    );

    const orderID = "LM" + Date.now();

    
    const items = cart.map(product =>
        `${product.name} x ${product.quantity}`
    ).join("<br>");

    
    const products = cart.map(product => ({
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        subtotal: product.price * product.quantity
    }));

    const order = {
        orderID: orderID,
        customer: customer,
        phone: phone,
        address: address,
        items: items,
        total: total
    };

    const submitButton = event.submitter;
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Saving Order...";
    }

    try {
       
        await db.collection("orders").add({
            ...order,
            products: products,
            status: "New",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

     
        localStorage.setItem("latestOrder", JSON.stringify(order));

        cart = [];
        window.location.href = "confirmation.html";

    } catch (error) {
        console.error("Order saving failed:", error);
        alert("Your order could not be saved. Please try again.");

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Place Order";
        }
    }
}
