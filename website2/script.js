

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


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();



function addToCart(productName, productPrice) {
    const price = Number(productPrice);

    if (!productName || !Number.isFinite(price) || price < 0) {
        alert("Invalid product information.");
        return;
    }

    const existingProduct = cart.find(
        item => item.name === productName
    );

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }

    displayCart();
}




function changeQuantity(index, amount) {
    if (!cart[index]) return;

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    displayCart();
}



function displayCart() {
    const cartItems = document.getElementById("cart-items");
    const totalElement = document.getElementById("total");

    if (!cartItems || !totalElement) return;

    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        cartItems.textContent = "Your cart is empty.";
    } else {
        cart.forEach(function(item, index) {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            const productDiv = document.createElement("div");
            productDiv.className = "cart-product";

            const productInfo = document.createElement("p");
            productInfo.textContent =
                item.name + " - ₦" +
                item.price.toLocaleString("en-NG") +
                " each";

            const decreaseButton = document.createElement("button");
            decreaseButton.type = "button";
            decreaseButton.textContent = "-";
            decreaseButton.addEventListener("click", function() {
                changeQuantity(index, -1);
            });

            const quantity = document.createElement("span");
            quantity.textContent = " " + item.quantity + " ";

            const increaseButton = document.createElement("button");
            increaseButton.type = "button";
            increaseButton.textContent = "+";
            increaseButton.addEventListener("click", function() {
                changeQuantity(index, 1);
            });

            productDiv.appendChild(productInfo);
            productDiv.appendChild(decreaseButton);
            productDiv.appendChild(quantity);
            productDiv.appendChild(increaseButton);

            cartItems.appendChild(productDiv);
        });
    }

    totalElement.textContent =
        "Total: ₦" + total.toLocaleString("en-NG");
}




function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty. Add a product before checking out.");
        return;
    }

    const checkoutForm = document.getElementById("checkout-form");

    if (!checkoutForm) {
        alert("Checkout form could not be found.");
        return;
    }

    checkoutForm.style.display = "block";

    checkoutForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}




function searchProducts() {
    const searchBox = document.getElementById("searchBox");

    if (!searchBox) return;

    const input = searchBox.value.toLowerCase().trim();
    const products = document.getElementsByClassName("product-card");

    for (let i = 0; i < products.length; i++) {
        const heading = products[i].querySelector("h3");

        const productName = heading
            ? heading.textContent.toLowerCase()
            : "";

        products[i].style.display =
            productName.includes(input) ? "" : "none";
    }
}



// PLACE ORDER IN FIRESTORE


async function placeOrder(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const customerInput = document.getElementById("customerName");
    const phoneInput = document.getElementById("phone");
    const addressInput = document.getElementById("address");

    if (!customerInput || !phoneInput || !addressInput) {
        alert("Checkout form fields are missing. Please check your HTML.");
        return;
    }

    const customer = customerInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();

    if (!customer || !phone || !address) {
        alert("Please complete all customer information.");
        return;
    }

    const total = cart.reduce(function(sum, product) {
        return sum + product.price * product.quantity;
    }, 0);

    const orderID = "LM" + Date.now();

    const products = cart.map(function(product) {
        return {
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            subtotal: product.price * product.quantity
        };
    });

    const order = {
        orderID: orderID,
        customer: customer,
        phone: phone,
        address: address,
        products: products,
        total: total,
        status: "New",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const submitButton =
        event.submitter ||
        document.querySelector('#checkout-form button[type="submit"]');

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Saving Order...";
    }

    try {
        // Save the order to the Firestore "orders" collection.
        const documentReference = await db
            .collection("orders")
            .add(order);

        // Save a copy for the confirmation page.
        const savedOrder = {
            ...order,
            items: products.map(function(product) {
                return product.name + " x " + product.quantity;
            }).join(", "),
            firestoreID: documentReference.id,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(
            "latestOrder",
            JSON.stringify(savedOrder)
        );

        // Empty the cart only after Firestore confirms the save.
        cart = [];
        displayCart();

        // Go to the order confirmation page.
        window.location.href = "confirmation.html";

    } catch (error) {
        console.error("Order saving failed:", error);

        let message = "Your order could not be saved.";

        if (error.code === "permission-denied") {
            message +=
                "\nFirebase rejected the request. Check your Firestore security rules.";
        } else if (error.code === "unavailable") {
            message +=
                "\nThe database is temporarily unavailable. Check your internet connection.";
        } else if (error.code === "failed-precondition") {
            message +=
                "\nThe database configuration needs attention.";
        } else {
            message +=
                "\n" + (error.message || "Unknown error.");
        }

        alert(message);

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Place Order";
        }
    }
}




document.addEventListener("DOMContentLoaded", function() {
    displayCart();
});
