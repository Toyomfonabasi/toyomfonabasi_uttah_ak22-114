let cart = [];


function addToCart(productName, productPrice) {

    let existingProduct = cart.find(item => item.name === productName);


    if(existingProduct){

        existingProduct.quantity++;

    }

    else{

        cart.push({

            name: productName,
            price: productPrice,
            quantity: 1

        });

    }


    displayCart();

}




function changeQuantity(index, amount){

    cart[index].quantity += amount;


    if(cart[index].quantity <= 0){

        cart.splice(index,1);

    }


    displayCart();

}




function displayCart(){

    let cartItems = document.getElementById("cart-items");


    cartItems.innerHTML = "";


    let total = 0;



    if(cart.length === 0){

        cartItems.innerHTML = "<p>Your cart is empty.</p>";

    }


    else{


        cart.forEach(function(item,index){


            total += item.price * item.quantity;


            cartItems.innerHTML += `

            <div class="cart-product">

            <p>
            ${item.name}
            <br>
            ₦${item.price.toLocaleString()}
            </p>


            <button onclick="changeQuantity(${index},-1)">
            -
            </button>


            <span>
            ${item.quantity}
            </span>


            <button onclick="changeQuantity(${index},1)">
            +
            </button>


            </div>

            `;


        });


    }



    document.getElementById("total").innerHTML =
    "Total: ₦" + total.toLocaleString();

}




function checkout(){


    document.getElementById("checkout-form").style.display="block";


}

function searchProducts(){

    let input = document
    .getElementById("searchBox")
    .value
    .toLowerCase();


    let products =
    document.getElementsByClassName("product-card");


    for(let i=0;i<products.length;i++){


        let name =
        products[i]
        .getElementsByTagName("h3")[0]
        .innerHTML
        .toLowerCase();



        if(name.includes(input)){

            products[i].style.display="block";

        }

        else{

            products[i].style.display="none";

        }

    }

}

function placeOrder(event){

event.preventDefault();



let customer =
document.getElementById("customerName").value;


let phone =
document.getElementById("phone").value;


let address =
document.getElementById("address").value;



let total = 0;


let items = "";



cart.forEach(function(product){


total += product.price * product.quantity;


items += 
product.name +
" x " +
product.quantity +
"<br>";


});



let orderID =
"LM" + Date.now();



let order = {


orderID: orderID,

customer: customer,

phone: phone,

address: address,

items: items,

total: total


};



localStorage.setItem(
"latestOrder",
JSON.stringify(order)
);



cart = [];



window.location.href =
"confirmation.html";


}