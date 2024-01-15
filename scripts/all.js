const serverURL = "https://drawourpets-35dc297e02d2.herokuapp.com";
//const serverURL = "http://localhost:16332"
const newLineE = document.createElement("br");
const accountButtonE = document.getElementById("account-button");
const accountIconE = document.getElementById("account-icon");
const accountListItemE = document.getElementById("account-list-item");
const smallAccountListItemE = document.getElementById("small-account-list-item");
const popUpShade = document.createElement("div");
popUpShade.id = "pop-up-shade";
const signUpPopupE = document.createElement("div");
signUpPopupE.classList.add("popup");
signUpPopupE.id = "sign-up-popup";
let logInE;
let signUpE;
let htmlFolderLocation;
let user;
let password;
let cart = [];
let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});
const maxItemAmount = 10;

function showSignUp() { };
function showLogIn() { };
function openPopUp() { };
function closePopUp() { };
let removePasswordMessageBoxE = () => { };
let resetMessageBoxEListener = () => {
    signUpPopupE.addEventListener("click", removePasswordMessageBoxE);
    signUpPopupE.removeEventListener("click", resetMessageBoxEListener);
};

//Shopping Cart Menu
const shoppingCartMenu = document.getElementById("shopping-cart");
const shoppingCartMenuShadowE = document.createElement("div");
const shoppingCartItemsDiv = document.getElementById("shopping-cart-items");
shoppingCartMenuShadowE.id = "shopping-cart-menu-shadow";
shoppingCartMenuShadowE.addEventListener("click", closeShoppingCartMenu);

async function updateShoppingCartMenu() {
    checkoutLocation = htmlFolderLocation + "/checkout.html";

    shoppingCartItemsDiv.querySelectorAll("div").forEach(shoppingCartItem => {
        shoppingCartItem.remove();
    })


    const h1 = shoppingCartMenu.querySelector("h1") ? shoppingCartMenu.querySelector("h1") : document.createElement("h1");
    if (cart.length == 0) {
        h1.innerHTML = "Your Cart is Empty";
    } else {
        h1.innerHTML = "Shopping Cart";
    }

    shoppingCartItemsDiv.before(h1);

    cart.forEach((item, i) => {
        let itemE = document.createElement("div");

        const p = document.createElement("p");
        let adjectives = item.mods ? ("size" in item.mods ? dashToSpaceCamel(item.mods.size) : "") + ("color" in item.mods ? " " + dashToSpaceCamel(item.mods.color) : "") : "";
        p.innerHTML = `${adjectives !== "" ? adjectives + " " : ""}${item.design} ${item.product}`;

        const img = document.createElement("img");
        img.src = `https://applestooranges.s3.amazonaws.com/${spaceToDashLower(item.design)}-${spaceToDashLower(item.product)}${item.mods ? ("color" in item.mods ? "-" + spaceToDash(item.mods.color) + "-1" : "") : ""}.jpg`;

        const ticker = document.createElement("div");
        ticker.id = "ticker";

        const minus = createMinusIcon("");
        const amount = document.createElement("p");
        amount.innerHTML = item.amount;
        const plus = createPlusIcon("");

        minus.addEventListener("click", async () => {
            if (item.amount > 1) {
                item.amount -= 1;
                amount.innerHTML = item.amount;
                cart[i] = item;
                await updateShoppingCartMenu();
                if (user) {
                    await updateCartItemAt(item, user.email, i);
                }
            }
        })

        plus.addEventListener("click", async () => {
            if (item.amount < maxItemAmount) {
                item.amount += 1;
                amount.innerHTML = item.amount;
                cart[i] = item;
                await updateShoppingCartMenu();
                if (user) {
                    await updateCartItemAt(item, user.email, i);
                }
            }
        })

        ticker.appendChild(minus);
        ticker.appendChild(amount);
        ticker.appendChild(plus);

        const trashIconBig = createTrashIcon("2x");
        trashIconBig.classList.add("hide-on-small");
        const trashIcon = createTrashIcon("lg");
        trashIcon.classList.add("show-on-small");

        let j = i;

        async function deleteShoppingCartItem() {
            if (user) {
                await deleteCartItemAt(j);
            } else {
                cart.splice(j, 1);
                localStorage.setItem("cartCache", JSON.stringify(cart));
            }
            await updateShoppingCartMenu();
        }

        trashIconBig.addEventListener("click", deleteShoppingCartItem);
        trashIcon.addEventListener("click", deleteShoppingCartItem);

        itemE.appendChild(img);
        itemE.appendChild(p);
        itemE.appendChild(ticker);
        itemE.appendChild(trashIconBig);
        itemE.appendChild(trashIcon);

        shoppingCartItemsDiv.appendChild(itemE);
    })

    let checkoutButtonAndPrice;

    if (document.getElementById("checkout-button-and-price")) {
        checkoutButtonAndPrice = document.getElementById("checkout-button-and-price");

        const price = checkoutButtonAndPrice.querySelector("p");

        price.innerHTML = USDollar.format(await getCartPrice(cart));
    } else {
        checkoutButtonAndPrice = document.createElement("div");
        checkoutButtonAndPrice.id = "checkout-button-and-price";

        const checkoutButton = document.createElement("button");
        checkoutButton.innerHTML = "Checkout";
        checkoutButton.id = "checkout-button";

        checkoutButton.addEventListener("click", () => {
            window.location = htmlFolderLocation + "/checkout.html";
        });

        const price = document.createElement("p");

        checkoutButtonAndPrice.appendChild(checkoutButton);
        checkoutButtonAndPrice.appendChild(price);

        shoppingCartMenu.appendChild(checkoutButtonAndPrice);

        price.innerHTML = USDollar.format(await getCartPrice(cart));
    }

    if (cart.length < 1) {
        checkoutButtonAndPrice.classList.add("disabled");
    } else {
        checkoutButtonAndPrice.classList.remove("disabled");
    }
}

function setUpSignUp() {
    class signUpPopupDiv {
        constructor() {
            this.divE = document.createElement("div");
            this.title = document.createElement("h1");
            this.formE = document.createElement("form");
            this.submitE = document.createElement("button");
            this.toggleE = document.createElement("p");
            this.errorE = document.createElement("div");

            this.formE.action = "";
            this.submitE.type = "submit";
            this.submitE.value = "Submit";
            this.errorE.classList.add("error-message", "disabled");

            this.divE.appendChild(this.title);
            this.divE.appendChild(this.formE);
            this.divE.appendChild(this.errorE);
        }

        createForm(fields) {
            const form = document.createElement("form");
            fields.forEach(field => form.appendChild(createFormField(field)));
            const submitButton = this.createSubmitButton();
            form.appendChild(submitButton);
            return form;
        }

        createErrorElement() {
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("error-message", "disabled");
            return errorDiv;
        }

        createSubmitButton() {
            const button = document.createElement("button");
            button.type = "submit";
            button.textContent = "Submit";
            return button;
        }
    }

    function createFormField(type, idPrefix, placeholder, isRequired, labelContent) {
        const id = idPrefix + '-' + type;

        const label = document.createElement("label");
        label.htmlFor = id;
        label.textContent = labelContent;

        const input = document.createElement("input");
        input.type = type;
        input.id = id;
        input.placeholder = placeholder;
        input.required = isRequired;

        return { label, input };
    }

    function addFieldsToForm(form, fields) {
        fields.forEach(field => {
            const { label, input } = createFormField(field.type, field.idPrefix, field.placeholder, field.isRequired, field.labelContent);
            form.appendChild(label);
            form.appendChild(input);
        });
    }

    logInE = new signUpPopupDiv();
    signUpE = new signUpPopupDiv();

    {
        logInE.divE.id = "log-in-div";
        logInE.title.innerHTML = "Log In";
        addFieldsToForm(logInE.formE,
            [
                {
                    type: "email",
                    idPrefix: "log-in",
                    placeholder: "johnsmith@gmail.com",
                    isRequired: true,
                    labelContent: "Email"
                },
                {
                    type: "password",
                    idPrefix: "log-in",
                    placeholder: "Password123!",
                    isRequired: true,
                    labelContent: "Password"
                }
            ]);
        logInE.formE.id = "log-in-form";

        const forgotPassword = document.createElement("a");
        forgotPassword.innerHTML = "Forgot password?"
        forgotPassword.href = htmlFolderLocation + "/forgotPassword.html";

        logInE.formE.appendChild(forgotPassword);
        logInE.formE.appendChild(logInE.submitE);
        logInE.submitE.innerHTML = "Log In";
        logInE.toggleE.innerHTML = "Don't have an account? Sign up <a onclick=\"showSignUp()\">here.</a>";
        logInE.formE.appendChild(logInE.toggleE);

        logInE.formE.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default form submission

            logInE.errorE.classList.add("disabled");

            const formData = {
                email: document.getElementById('log-in-email').value,
                password: document.getElementById('log-in-password').value
            };

            let thisClosePopUp = closePopUp;

            fetch(serverURL + '/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
                .then(response => {
                    if (!response.ok) {
                        if (response.status === 401) {
                            // Incorrect email or password
                            logInE.errorE.innerHTML = "Incorrect email or password";
                            logInE.errorE.classList.remove("disabled");
                            throw new Error("LoginError");
                        } else {
                            // Other HTTP errors
                            logInE.errorE.innerHTML = "Server error, please try again later";
                            logInE.errorE.classList.remove("disabled");
                            throw new Error("ServerError");
                        }
                    }
                    return response.json();
                })
                .then(async data => {
                    logInE.errorE.classList.add("disabled");
                    logInE.formE.reset();
                    thisClosePopUp();
                    user = data;
                    localStorage.setItem("user", JSON.stringify(user));
                    cart.forEach(async item => {
                        await addToCart(item.product, item.design, (item.mods ? item.mods : {}));
                    });
                    signIn();
                    await updateShoppingCartMenu()
                })
                .catch((error) => {
                    if (error.message !== "LoginError") {
                        console.error("error.message: " + error.message);
                        // Handle network or server errors
                        logInE.errorE.innerHTML = "Network error, please try again later";
                        logInE.errorE.classList.remove("disabled");
                    }
                    console.error('Error:', error);
                });

        });
    }
    {
        signUpE.divE.id = "sign-up-div";
        signUpE.title.innerHTML = "Sign Up";
        addFieldsToForm(signUpE.formE,
            [
                {
                    type: "fname",
                    idPrefix: "sign-up",
                    placeholder: "John",
                    isRequired: true,
                    labelContent: "First Name"
                },
                {
                    type: "lname",
                    idPrefix: "sign-up",
                    placeholder: "Smith",
                    isRequired: false,
                    labelContent: "Last Name (Optional)"
                },
                {
                    type: "email",
                    idPrefix: "sign-up",
                    placeholder: "johnsmith@gmail.com",
                    isRequired: true,
                    labelContent: "Email"
                },
                {
                    type: "password",
                    idPrefix: "sign-up",
                    placeholder: "Password123!",
                    isRequired: true,
                    labelContent: "Password"
                }
            ]);
        signUpE.formE.id = "sign-up-form";
        signUpE.formE.appendChild(signUpE.submitE);
        const passwordMessageBoxE = document.createElement("div");
        passwordMessageBoxE.id = "password-message-box";
        passwordMessageBoxE.style.display = "none";
        const minimumPasswordLengthE = document.createElement("p");
        const uppercasePasswordE = document.createElement("p");
        const lowercasePasswordE = document.createElement("p");
        minimumPasswordLengthE.innerHTML = "Must be at least 8 characters long.";
        lowercasePasswordE.innerHTML = "Must contain one lowercase letter.";
        uppercasePasswordE.innerHTML = "Must contain one uppercase letter.";
        passwordMessageBoxE.appendChild(minimumPasswordLengthE);
        passwordMessageBoxE.appendChild(lowercasePasswordE);
        passwordMessageBoxE.appendChild(uppercasePasswordE);
        signUpE.submitE.before(passwordMessageBoxE);
        signUpE.submitE.innerHTML = "Sign Up";
        signUpE.toggleE.innerHTML = "Already have an account? Log in <a onclick=\"showLogIn()\">here.</a>";
        signUpE.formE.appendChild(signUpE.toggleE);

        const passwordInputE = signUpE.formE.childNodes[7];
        const atLeast8 = /^.{8,}$/;
        const lowercase = /[a-z]/;
        const uppercase = /[A-Z]/;
        passwordInputE.addEventListener("input", (event) => {
            const password = passwordInputE.value;
            if (atLeast8.test(password)) {
                minimumPasswordLengthE.classList.add("complete")
            } else {
                minimumPasswordLengthE.classList.remove("complete")
            }
            if (lowercase.test(password)) {
                lowercasePasswordE.classList.add("complete")
            } else {
                lowercasePasswordE.classList.remove("complete")
            }
            if (uppercase.test(password)) {
                uppercasePasswordE.classList.add("complete")
            } else {
                uppercasePasswordE.classList.remove("complete")
            }
        });

        passwordInputE.addEventListener("click", () => {
            signUpPopupE.removeEventListener("click", removePasswordMessageBoxE);
            signUpPopupE.addEventListener("click", resetMessageBoxEListener);
            passwordMessageBoxE.style = "display: inline-block;";
        });

        signUpE.formE.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default form submission

            logInE.errorE.classList.add("disabled");

            const password = document.getElementById('sign-up-password').value;
            if (password.length > 64) {
                signUpE.errorE.innerHTML = "Password too long";
                signUpE.errorE.classList.remove("disabled");
            } else if (!/^[A-Za-z0-9!@#$%^&*]+$/.test(password)) {
                signUpE.errorE.innerHTML = "Password contains invalid characters";
                signUpE.errorE.classList.remove("disabled");
            } else if (atLeast8.test(password) && lowercase.test(password) && uppercase.test(password)) {
                const formData = {
                    fname: document.getElementById('sign-up-fname').value,
                    lname: document.getElementById('sign-up-lname').value,
                    email: document.getElementById('sign-up-email').value,
                    password: password
                };

                let thisClosePopUp = closePopUp;

                fetch(serverURL + '/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                })
                    .then(response => {
                        if (!response.ok) {
                            if (response.status === 409) {
                                // Email in use
                                signUpE.errorE.innerHTML = 'Email already in use';
                                signUpE.errorE.classList.remove("disabled");
                                throw new Error('EmailInUse');
                            } else {
                                // Other HTTP errors
                                signUpE.errorE.innerHTML = "Server error, please try again later";
                                signUpE.errorE.classList.remove("disabled");
                                throw new Error("ServerError");
                            }
                        }
                        return response.json();
                    })
                    .then(async (data) => {
                        signUpE.errorE.classList.add("disabled");
                        signUpE.formE.reset();
                        thisClosePopUp();
                        user = data;
                        localStorage.setItem("user", JSON.stringify(user));
                        cart.forEach(async item => {
                            await addToCart(item.product, item.design, (item.mods ? item.mods : {}));
                        });
                        signIn();
                        await updateShoppingCartMenu();
                        // Handle success here (e.g., showing a success message)
                    })
                    .catch((error) => {
                        if (error.message !== "EmailInUse") {
                            console.error("error.message: " + error.message);
                            // Handle network or server errors
                            signUpE.errorE.innerHTML = "Network error, please try again later";
                            signUpE.errorE.classList.remove("disabled");
                        }
                    });
            } else {
                signUpE.errorE.innerHTML = "Password does not reach requirements";
                signUpE.errorE.classList.remove("disabled");
            }
        });
    }
}

removePasswordMessageBoxE = () => {
    document.getElementById("password-message-box").style = "display: none;";
}

function showSignUp() {
    logInE.divE.remove();
    signUpPopupE.appendChild(signUpE.divE);

    signUpPopupE.addEventListener("click", removePasswordMessageBoxE);
}

function showLogIn() {
    signUpE.divE.remove();
    signUpPopupE.appendChild(logInE.divE);

    signUpPopupE.removeEventListener("click", removePasswordMessageBoxE);
}

function openPopUp() {
    document.body.classList.add("disabled");
    document.body.appendChild(popUpShade);
    document.body.appendChild(signUpPopupE);
    signUpPopupE.appendChild(logInE.divE);

    window.addEventListener('keydown', closePopUpIfKey, false);
}

function closePopUp() {
    window.removeEventListener("keydown", closePopUpIfKey, false);
    document.body.classList.remove("disabled");
    logInE.divE.remove();
    signUpE.divE.remove();
    signUpPopupE.remove();
    popUpShade.remove();
}

function closePopUpIfKey(e) {
    if (e.key === "Escape") {
        closePopUp();
    }
}

accountButtonE ? accountButtonE.addEventListener("click", openPopUp) : {};
accountIconE ? accountIconE.addEventListener("click", openPopUp) : {};

popUpShade.addEventListener("click", closePopUp);

function showDivs(n, className) {
    var i;
    var x = document.getElementsByClassName(className);
    if (n > x.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = x.length };
    for (i = 0; i < x.length; i++) {
        x[i].classList.add("disabled");
    }
    x[slideIndex - 1].classList.remove("disabled");
}

//Side Nav
const sideNavE = document.getElementById("side-nav");
const sideNavShadowE = document.createElement("div");
sideNavShadowE.id = "side-nav-shadow";
sideNavShadowE.addEventListener("click", closeSideNav);

function openSideNav() {
    sideNavE.style.width = "12rem";
    document.body.appendChild(sideNavShadowE);
}

function closeSideNav() {
    sideNavE.style.width = "0";
    sideNavShadowE.remove();
}

function HTMLCollectionToArray(HTMLCollection) {
    return ([].slice.call(HTMLCollection));
}

function signIn() {
    if (!user) {
        user = (localStorage.getItem("user") == undefined ? null : JSON.parse(localStorage.getItem("user")))
    }
    if (user) {
        cart = user.cart;
        localStorage.setItem("cartCache", JSON.stringify(cart));
        localStorage.setItem("user", JSON.stringify(user));
        accountButtonE ? accountButtonE.remove() : {};
        accountIconE ? accountIconE.remove() : {};

        [accountListItemE, smallAccountListItemE].forEach(accountListItem => {
            accountListItem.classList.add("signed-in");

            const accountNameDivE = document.createElement("div");
            accountNameDivE.classList.add("dropdown");

            const accountNameE = document.createElement("span");
            accountNameE.innerHTML = user.fname;

            const signOutButtonContainer = document.createElement("div");
            signOutButtonContainer.classList.add("sign-out-button-container");
            signOutButtonContainer.style.display = "none";

            const signOutButton = document.createElement("p");
            signOutButton.innerHTML = "Sign Out";

            signOutButton.addEventListener("click", async () => {
                user = null;
                localStorage.removeItem('user');
                cart = [];
                localStorage.setItem("cartCache", JSON.stringify([]));
                await updateShoppingCartMenu();
                HTMLCollectionToArray(document.getElementsByClassName("dropdown")).forEach(accountNameDiv => {
                    accountNameDiv.remove();
                })
                HTMLCollectionToArray(document.getElementsByClassName("signed-in")).forEach(accountListItemEE => {
                    accountListItemEE.classList.remove("signed-in");
                })
                accountListItemE.appendChild(accountButtonE)
                smallAccountListItemE.appendChild(accountIconE);
            })

            signOutButtonContainer.appendChild(signOutButton);

            accountNameDivE.appendChild(accountNameE);
            accountNameDivE.appendChild(signOutButtonContainer);

            function giveBodyHideSignOutButton() {
                document.body.removeEventListener("click", giveBodyHideSignOutButton, false);
                document.body.addEventListener("click", hideSignOutButton, false);
            }

            function displaySignOutButton() {
                signOutButtonContainer.style.display = "block";
                document.body.removeEventListener("click", hideSignOutButton, false);
                document.body.addEventListener("click", giveBodyHideSignOutButton, false);
            }

            function hideSignOutButton() {
                signOutButtonContainer.style.display = "none";
            }

            accountNameDivE.addEventListener("click", displaySignOutButton);
            accountNameDivE.addEventListener("mouseenter", displaySignOutButton);
            accountNameDivE.addEventListener("mouseleave", hideSignOutButton);
            document.body.addEventListener("click", hideSignOutButton, false);

            accountListItem.appendChild(accountNameDivE);
        });
    } else {
        cart = JSON.parse(localStorage.getItem("cartCache"));
    }
}

//Fetch requests
async function getProductImages() {
    fetch(serverURL + '/productImages', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            // Handle success here (e.g., showing a success message)
        })
        .catch((error) => {
            if (error.message !== "EmailInUse") {
                console.error("error.message: " + error.message);
                // Handle network or server errors
                signUpE.errorE.innerHTML = "Network error, please try again later";
                signUpE.errorE.classList.remove("disabled");
            }
        });
}

async function addToCart(product, design, mods, amount) {
    if (!amount || typeof amount !== "number" || amount < 1) {
        amount = 1;
    } else if (amount > maxItemAmount) {
        amount = maxItemAmount;
    }
    if (!mods) {
        mods = {};
    }
    if (user) {
        fetch(serverURL + "/addToCart", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: user.email,
                item: {
                    product: product,
                    design: design,
                    mods: mods,
                    amount: amount
                }
            })
        })
            .then(response => {
                return response.json();
            })
            .then(async data => {
                cart = data;
                user.cart = cart;
                localStorage.setItem("cartCache", JSON.stringify(cart));
                localStorage.setItem("user", JSON.stringify(user));
                await updateShoppingCartMenu();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } else {
        cart.push({
            product: product,
            design: design,
            mods: mods
        });
        localStorage.setItem("cartCache", JSON.stringify(cart));
        await updateShoppingCartMenu();
    }
    return;
}

async function getCart() {
    if (user) {
        fetch(serverURL + "/cart", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: user.email
            })
        })
            .then(response => {
                return response.json();
            })
            .then(async data => {
                cart = data;
                user.cart = cart;
                localStorage.setItem("cartCache", JSON.stringify(cart));
                localStorage.setItem("user", JSON.stringify(user));
                await updateShoppingCartMenu();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } else {
        cart = localStorage.getItem("cartCache") ? JSON.parse(localStorage.getItem("cartCache")) : [];
    }
}

async function deleteCartItemAt(index) {
    await fetch(serverURL + '/cartItemAt', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: user.email,
            index: index
        })
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            cart = data;
            localStorage.setItem("cartCache", JSON.stringify(cart));
            if (user) {
                user.cart = cart;
                localStorage.setItem("user", JSON.stringify(user));
            }
        })
        .catch((error) => {
            if (error.message !== "EmailInUse") {
                console.error("error.message: " + error.message);
                // Handle network or server errors
                signUpE.errorE.innerHTML = "Network error, please try again later";
                signUpE.errorE.classList.remove("disabled");
            }
        });
    return;
}

async function getCartPrice(cart) {
    return await fetch(serverURL + "/cartPrice", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cart: cart
        })
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

async function getProductPrice(product) {
    return await fetch(serverURL + "/productPrice", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product: product
        })
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

async function updateCartItemAt(item, email, index) {
    return await fetch(serverURL + "/cartItemAt", {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            item: item,
            email: email,
            index: index
        })
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

//Useful functions
function spaceToDash(string) {
    let newString = "";

    for (let i = 0; i < string.length; i++) {
        if (string[i] == ' ') {
            newString += '-';
        } else {
            newString += string[i];
        }
    }

    return newString;
}

function spaceToDashLower(string) {
    return spaceToDash(string).toLowerCase();
}

function dashToSpace(string) {
    if (string === "t-shirt" || string === "T-Shirt" || string === "T-shirt") {
        return string;
    }

    let newString = "";

    for (let i = 0; i < string.length; i++) {
        if (string[i] == '-') {
            newString += ' ';
        } else {
            newString += string[i];
        }
    }

    return newString;
}

function ToCamelCase(string) {
    let wasNotAlpha = true;
    let newString = "";
    for (let i = 0; i < string.length; i++) {
        const character = string.charAt(i);
        if (wasNotAlpha && /^[a-zA-Z]+$/i.test(character)) {
            wasNotAlpha = false;
            newString += character.toUpperCase();
        } else if (/^[a-zA-Z]+$/i.test(character)) {
            newString += character.toLowerCase();
        } else {
            wasNotAlpha = true;
            newString += character;
        }
    }
    return newString;
}

function dashToSpaceCamel(string) {
    return ToCamelCase(dashToSpace(string));
}

function openShoppingCartMenu() {
    shoppingCartMenu.classList.add("enabled");
    document.body.classList.add("disabled");

    document.body.appendChild(shoppingCartMenuShadowE);
}

function closeShoppingCartMenu() {
    shoppingCartMenu.classList.remove("enabled");
    document.body.classList.remove("disabled");
    shoppingCartMenuShadowE.remove()
}

//DOM Elements
function createIcon(type, size) {
    const i = document.createElement("i");
    i.classList.add("fa-solid", "fa-" + type);
    if (size !== "") {
        i.classList.add("fa-" + size);
    }
    return i;
}

function createTrashIcon(size) {
    return createIcon("trash", size);
}

function createPlusIcon(size) {
    return createIcon("plus", size);
}

function createMinusIcon(size) {
    return createIcon("minus", size);
}

//Window on load
window.addEventListener("load", async () => {
    signIn();
})