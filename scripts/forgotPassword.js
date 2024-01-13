const form = document.getElementById("forgot-password-form");
const submitButton = document.getElementById("submit-button");
const networkError = document.getElementById("network-error");
const emailSent = document.getElementById("email-sent");

form.addEventListener("input", () => {
    let complete = true;
    form.querySelectorAll("input").forEach(input => {
        if (input.value === "") {
            complete = false;
        }
    });

    if (complete) {
        submitButton.classList.remove("disabled");
    } else {
        submitButton.classList.add("disabled");
    }
})

form.addEventListener("submit", event => {
    event.preventDefault();

    const email = document.getElementById("email").value;

    const formData = {
        email: email
    }

    fetch(serverURL + '/forgotPasswordEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 500) {
                    networkError.classList.remove("disabled");
                }
                throw Error(response);
            }
            networkError.classList.add("disabled");
            form.classList.add("disabled");
            emailSent.classList.remove("disabled");
        })
        .catch((error) => {
            console.error(error);
        });
})