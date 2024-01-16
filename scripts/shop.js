const designsE = document.getElementById("designs");
let products;
let designs;
let images;
let slideIndex = 0;
let clicked = true;

async function getProducts() {
    // Try to get cached data from local storage
    let cachedData = localStorage.getItem('productsCache');
    if (cachedData !== "undefined" && cachedData) {
        cachedData = JSON.parse(cachedData);
        products = cachedData;
    }

    // Fetch new data from the server
    try {
        const response = await fetch(serverURL + "/products");
        if (!response.ok) {
            throw new Error(`An error has occurred: ${response.status}`);
        }
        const data = await response.json();

        // Update local storage and UI with new data
        localStorage.setItem('productsCache', JSON.stringify(data));
        products = data;
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

async function getDesigns() {
    // Try to get cached data from local storage
    let cachedData = localStorage.getItem('designsCache');
    if (cachedData !== "undefined" && cachedData) {
        cachedData = JSON.parse(cachedData);
        displayDesigns(cachedData);
        designs = cachedData;
    }

    // Fetch new data from the server
    try {
        const response = await fetch(serverURL + "/designs");
        if (!response.ok) {
            throw new Error(`An error has occurred: ${response.status}`);
        }
        const data = await response.json();

        // Update local storage and UI with new data
        if (JSON.stringify(cachedData) !== JSON.stringify(data)) {
            localStorage.setItem('designsCache', JSON.stringify(data));
            displayDesigns(data);
            designs = data;
        }
    } catch (error) {
        console.error("Error fetching designs:", error);
    }
}

function createDesign(thisDesign) {
    const div = document.createElement("div");
    div.classList.add("design");

    const img = document.createElement("img");
    img.src = `https://applestooranges.s3.amazonaws.com/${spaceToDashLower(thisDesign.name)}.png`;
    img.alt = thisDesign.name;
    img.width = thisDesign.width;
    img.height = thisDesign.height;

    const h1 = document.createElement("h1");
    h1.innerHTML = thisDesign.name;

    div.appendChild(img);
    div.appendChild(h1);

    div.addEventListener("click", () => {
        let productSelectValue = "";
        let modSelectValues = {};
        let stillPopedup = true;
        let thisProduct;

        const popupE = document.createElement("div");
        popupE.classList.add("popup");
        popupE.id = "shop-popup";

        const carouselDiv = document.createElement("div");
        carouselDiv.classList.add("carousel-div");

        let thisProductImages = [];
        updateCarouselDiv("", {});

        const popupRight = document.createElement("div");
        popupRight.classList.add("right");

        document.body.classList.add("disabled");

        function removeShopPopup() {
            popupE.remove();
            popUpShade.removeEventListener("click", removeShopPopup, false);
            stillPopedup = false;
        }

        popUpShade.addEventListener("click", removeShopPopup, false);

        const h1 = document.createElement("h1");
        h1.innerHTML = thisDesign.name;

        function updateProductImages(filterProductName, filterProductMods) {
            thisProductImages = [];
            products.forEach(product => {
                if (filterProductName !== "" && product.name !== filterProductName) {
                    return;
                }
                if (JSON.stringify(product.mods[0]) !== JSON.stringify({})) {
                    product.mods.forEach(mod => {
                        mod.options.forEach(option => {
                            if (spaceToDashLower(mod.name) in filterProductMods && filterProductMods[spaceToDashLower(mod.name)] !== "" && filterProductMods[spaceToDashLower(mod.name)] !== spaceToDashLower(option)) {
                                return;
                            }
                            for (let i = 1; i <= mod.images; i++) {
                                let productURL = `https://applestooranges.s3.amazonaws.com/${spaceToDashLower(thisDesign.name)}-${spaceToDashLower(product.name)}-${spaceToDashLower(option)}-${i}.jpg`;
                                thisProductImages.push(productURL);
                            }
                        });
                    });
                } else {
                    let productURL = `https://applestooranges.s3.amazonaws.com/${spaceToDashLower(thisDesign.name)}-${spaceToDashLower(product.name)}.jpg`;
                    thisProductImages.push(productURL);
                }
            });
            thisProductImages.sort(() => (Math.random() > .5) ? 1 : -1);
        }

        function plusDivs(n, className, wasClicked) {
            showDivs(slideIndex += n, className);
            clicked = wasClicked;
        }

        function periodicallyShift() {
            if (!stillPopedup) {
                return;
            }
            if (!clicked) {
                plusDivs(1, "product-image", false);
            } else {
                clicked = false;
            }
            setTimeout(periodicallyShift, 5000)
        }

        function updateCarouselDiv(filterProductName, filterProductMods) {
            updateProductImages(filterProductName, filterProductMods);
            carouselDiv.innerHTML = "";
            let first = true;
            thisProductImages.forEach(imageURL => {
                const img = document.createElement("img");
                img.src = imageURL;
                img.classList.add("product-image");
                if (first) {
                    first = false;
                } else {
                    img.classList.add("disabled");
                }
                carouselDiv.appendChild(img);
            })

            if (thisProductImages.length > 1) {
                const leftButton = document.createElement("button");
                leftButton.classList.add("left");
                leftButton.innerHTML = "&#10094;";
                leftButton.addEventListener("click", () => {
                    plusDivs(-1, "product-image", true);
                });

                const rightButton = document.createElement("button");
                rightButton.classList.add("right");
                rightButton.innerHTML = "&#10095;";
                rightButton.addEventListener("click", () => {
                    plusDivs(1, "product-image", true);
                });

                carouselDiv.appendChild(leftButton);
                carouselDiv.appendChild(rightButton);
            }
        }

        const buttonAmountPrice = document.createElement("div");
        buttonAmountPrice.id = "button-amount-price";

        let USDollar = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        const price = document.createElement("p");

        const ticker1 = document.createElement("div");
        ticker1.classList.add("disabled", "ticker", "hide-on-small");

        const ticker2 = document.createElement("div");
        ticker2.classList.add("disabled", "ticker", "show-on-small");

        const minus1 = createMinusIcon("");

        const amount1 = document.createElement("p");
        amount1.innerHTML = "1";

        const plus1 = createPlusIcon("");

        const minus2 = createMinusIcon("");

        const amount2 = document.createElement("p");
        amount2.innerHTML = "1";

        const plus2 = createPlusIcon("");

        ticker1.appendChild(minus1);
        ticker1.appendChild(amount1);
        ticker1.appendChild(plus1);

        ticker2.appendChild(minus2);
        ticker2.appendChild(amount2);
        ticker2.appendChild(plus2);

        function updatePrice(productSelect) {
            products.forEach(product => {
                if (product.name === productSelect.value) {
                    price.innerHTML = USDollar.format((product.price + product.price * product.discount / 100) * parseInt(amount1.innerHTML, 10));
                }
            })
            if (productSelect.value === "") {
                price.innerHTML = "";
            }
        }

        let increaseTickerAmount = () => {
            console.log(3);
        };
        let decreaseTickerAmount = () => { };
        minus1.addEventListener("click", decreaseTickerAmount, false);
        minus2.addEventListener("click", decreaseTickerAmount, false);
        plus1.addEventListener("click", increaseTickerAmount, false);
        plus2.addEventListener("click", increaseTickerAmount, false);

        const outOfStockMessage = document.createElement("p");

        function productChosen(productSelect) {
            popupRight.querySelectorAll(".mod-select").forEach(modSelect => {
                modSelect.remove();
            })
            modSelectValues = {};
            updateCarouselDiv(productSelect.value, modSelectValues);
            products.forEach(product => {
                if (product.name === productSelect.value) {
                    if (product.stock > 1) {
                        buttonAmountPrice.classList.remove("disabled");
                        outOfStockMessage.classList.add("disabled");

                        let modSelects = createModSelects(product.mods);

                        updatePrice(productSelect);
                        ticker1.classList.remove("disabled");
                        ticker2.classList.remove("disabled");

                        minus1.removeEventListener("click", decreaseTickerAmount, false);
                        minus2.removeEventListener("click", decreaseTickerAmount, false);
                        plus1.removeEventListener("click", increaseTickerAmount, false);
                        plus2.removeEventListener("click", increaseTickerAmount, false);

                        let thisMaxItemAmount = maxItemAmount;

                        increaseTickerAmount = () => {
                            let total = parseInt(amount1.innerHTML, 10);
                            if (total < thisMaxItemAmount) {
                                total++;
                                amount1.innerHTML = total;
                                amount2.innerHTML = total;
                            } else {
                                amount1.innerHTML = thisMaxItemAmount;
                                amount2.innerHTML = thisMaxItemAmount;
                            }
                            updatePrice(productSelect);
                        }

                        decreaseTickerAmount = () => {
                            let total = parseInt(amount1.innerHTML, 10);
                            if (total > 1) {
                                total--;
                                amount1.innerHTML = total;
                                amount2.innerHTML = total;
                            }
                            updatePrice(productSelect);
                        }


                        minus1.addEventListener("click", decreaseTickerAmount, false);
                        minus2.addEventListener("click", decreaseTickerAmount, false);
                        plus1.addEventListener("click", increaseTickerAmount, false);
                        plus2.addEventListener("click", increaseTickerAmount, false);

                        if (modSelects.length == 0) {
                            return;
                        }
                        modSelects.forEach(modSelect => {
                            ticker2.before(modSelect);
                        })
                    } else {
                        buttonAmountPrice.classList.add("disabled");
                        outOfStockMessage.classList.remove("disabled");
                    }
                }
            })

            if (productSelect.value === "") {
                price.innerHTML = "";
                ticker1.classList.add("disabled");
                ticker2.classList.add("disabled");
                outOfStockMessage.classList.add("disabled");
            }

            checkIfFilledOut();

            productSelectValue = productSelect.value;
        }

        function createProductSelect() {
            const productSelect = document.createElement("select");
            productSelect.name = "select";
            productSelect.id = "product-select";

            const defaultOption = new Option("Product", "");
            defaultOption.selected = "selected";

            productSelect.appendChild(defaultOption);
            products.forEach(product => {
                const option = new Option(product.name, product.name);
                productSelect.appendChild(option);
            });

            productSelect.addEventListener("change", () => {
                productChosen(productSelect);
            });

            return productSelect;
        }

        function createModSelects(mods) {
            let modSelects = [];
            if (JSON.stringify(mods[0]) === JSON.stringify({})) {
                return modSelects;
            }
            mods.forEach(mod => {
                const modSelect = document.createElement("select");
                modSelect.name = "select";
                modSelect.classList.add("mod-select");

                const defaultOption = new Option(mod.name, "");
                defaultOption.selected = "selected";

                modSelect.appendChild(defaultOption);
                mod.options.forEach(option => {
                    const optionE = new Option(option, spaceToDashLower(option));
                    modSelect.appendChild(optionE);
                });

                modSelect.addEventListener("change", () => {
                    modSelectValues[spaceToDashLower(mod.name)] = modSelect.value;
                    if (mod.images > 0) { updateCarouselDiv(productSelectValue, modSelectValues) }

                    checkIfFilledOut();
                });

                modSelects.push(modSelect);
            })
            return modSelects;
        }

        function checkIfFilledOut() {
            let filledOut = true;
            popupRight.querySelectorAll("select").forEach(selector => {
                if (selector.value === "") {
                    filledOut = false;
                    return;
                }
            })

            if (filledOut) {
                addToCartButton.classList.remove("disabled");
            } else {
                addToCartButton.classList.add("disabled");
            }
        }

        const addToCartButton = document.createElement("button");
        addToCartButton.innerHTML = "Add to Cart";
        addToCartButton.classList.add("disabled");

        addToCartButton.addEventListener("click", async () => {
            await addToCart(productSelectValue, thisDesign.name, modSelectValues, parseInt(amount1.innerHTML, 10));
            removeShopPopup();
            popUpShade.remove();
            openShoppingCartMenu();
        })

        buttonAmountPrice.appendChild(addToCartButton);
        buttonAmountPrice.appendChild(ticker1);
        buttonAmountPrice.appendChild(price);

        outOfStockMessage.innerHTML = "Out of stock";
        outOfStockMessage.classList.add("disabled", "out-of-stock-message");

        popupRight.appendChild(h1);
        popupRight.appendChild(createProductSelect());
        popupRight.appendChild(ticker2);
        popupRight.appendChild(buttonAmountPrice);
        popupRight.appendChild(outOfStockMessage);

        popupE.appendChild(carouselDiv);
        popupE.appendChild(popupRight);

        document.body.appendChild(popUpShade);
        document.body.appendChild(popupE);
        periodicallyShift();
    })

    return div;
}

function displayDesigns(designsData) {
    designsE.innerHTML = ''; // Clear existing content
    designsData.forEach(thisDesign => {
        designsE.appendChild(createDesign(thisDesign));
    });
}

//Window load
window.addEventListener("load", getProducts);
window.addEventListener("load", getDesigns);

window.addEventListener("load", async () => {
    htmlFolderLocation = ".";
    setUpSignUp();
    await getCart();
    updateShoppingCartMenu();
})