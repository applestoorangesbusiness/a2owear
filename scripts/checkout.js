const stripe = Stripe("pk_live_51OWmciLC6GNfguQ7DYSri3A8PIewzevg7oGoPHJ8qHmLyPuWa2Av5nBTUHdY1MNdjwplxTHU05tI207lDOYTaMZ2008jX9t585");
//const stripe = Stripe("pk_test_51OWmciLC6GNfguQ7OzE3AsnlS0MlnfsktHWWzBcEp9N2XRwBRpxOel5yLEa3x04Cu1DAGmF7sP2HbnXetu0AUXVx00pUZs30WN");
cart = JSON.parse(localStorage.getItem("cartCache"));
let index = 0;
let tax = 0;
let price;


function previousForm() {
    index -= 1;
    forms.forEach(element => {
        element.classList.add("disabled");
    })
    forms[index].classList.remove("disabled");

    if (index == 0) {
        previousButton.classList.add("disabled");
        nextButton.classList.remove("disabled");
        completePurchaseButton.classList.add("disabled");
    }
}

function nextForm() {
    index += 1;
    forms.forEach(element => {
        element.classList.add("disabled");
    })
    forms[index].classList.remove("disabled");

    if (index == forms.length - 1) {
        previousButton.classList.remove("disabled");
        nextButton.classList.add("disabled");
        completePurchaseButton.classList.remove("disabled");
    }
}

function updateCart() {
    cart = JSON.parse(localStorage.getItem("cartCache"));
}

async function updatePrice() {
    let products = getProductNames(cart);
    price = (await getCartPrice(products));
}

async function updateFormFields() {
    let productNames = getProductNames(cart);
    const response = await fetch(serverURL + "/createCheckoutSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: productNames }),
    });

    const { clientSecret } = await response.json();

    const checkout = await stripe.initEmbeddedCheckout({
        clientSecret,
    });

    // Mount Checkout
    checkout.mount('#checkout-element');
}

//Window on load
window.addEventListener("load", async () => {
    updateCart();
    await updatePrice();
    await updateFormFields();
});