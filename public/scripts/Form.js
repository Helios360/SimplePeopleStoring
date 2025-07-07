document.addEventListener("DOMContentLoaded", function () {
    const password = document.getElementById("password");
    const confirm = document.getElementById("confirm");

    // Create a span element to show feedback
    const message = document.createElement("span");
    message.id = "password-message";
    confirm.parentNode.appendChild(message);

    function checkPasswordMatch() {
        if (confirm.value === "") {
            message.textContent = "";
            return;
        }

        if (password.value === confirm.value) {
            message.textContent = "✔️ Les mots de passe correspondent";
            message.style.color = "green";
        } else {
            message.textContent = "❌ Les mots de passe ne correspondent pas";
            message.style.color = "red";
        }
    }

    password.addEventListener("input", checkPasswordMatch);
    confirm.addEventListener("input", checkPasswordMatch);
});