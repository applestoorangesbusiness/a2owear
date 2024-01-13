const form = document.getElementById("password-reset-form");
const submitButton = document.getElementById("submit-button");
const incorrectCredentials = document.getElementById("incorrect-credentials");
const networkError = document.getElementById("network-error");
const success = document.getElementById("success");

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

    incorrectCredentials.classList.add("disabled");
})

form.addEventListener("submit", event => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const newPassword = document.getElementById("new-password").value;
    const code = document.getElementById("code").value;

    const formData = {
        email: email,
        newPassword: newPassword,
        code: code
    }

    fetch(serverURL + '/resetPassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    incorrectCredentials.classList.remove("disabled");
                } else if (response.status === 500) {
                    networkError.classList.remove("disabled");
                }
                throw Error(response);
            }
            networkError.classList.add("disabled");
            form.classList.add("disabled");
            success.classList.remove("disabled");
        })
        .catch((error) => {
            console.error(error);
        });
})