//Carousel

let slideIndex = 0;
let clicked = true;

function plusDivs(n, className, wasClicked) {
    showDivs(slideIndex += n, className);
    clicked = wasClicked;
}

function periodicallyShift() {
    if (!clicked) {
        plusDivs(1, "featured-product", false);
    } else {
        clicked = false;
    }
    setTimeout(periodicallyShift, 5000)
}

periodicallyShift();

//Window load
window.addEventListener("load", async () => {
    htmlFolderLocation = "./html";
    setUpSignUp();
    await getCart();
    updateShoppingCartMenu();
})