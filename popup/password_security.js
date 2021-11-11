const LOGIN_URL = "login url";
const REGISTER_URL = "register url"
const request = new Request('https://dev.backend.mona.hospitalonmobile.com/test/backend-analysis', { method: 'GET' })

const backButton = document.querySelector(".back-button");
const buttons = document.querySelector(".popup-content__buttons");
const fields = document.querySelector(".popup-content__fields");
const passDisplay = document.querySelector(".popup-content__password-display")

const loginHandler = (event) => {
    const req = new XMLHttpRequest();
    req.open('GET', 'https://dev.backend.mona.hospitalonmobile.com/test/backend-analysis', false);
    req.send(null);
    if (req.status === 200) {

        backButton.style.display = "flex";
        backButton.style["justify-content"] = "center";
        backButton.style["align-items"] = "center";
        buttons.style.display = "none";
        fields.style.display = "none";
        passDisplay.textContent = req.responseText;
        passDisplay.style.display = "flex";
        passDisplay.style["justify-content"] = "center";
    }
}

const registerHandler = () => {
    const req = new XMLHttpRequest();
    req.open('GET', 'https://dev.backend.mona.hospitalonmobile.com/test/backend-analysis', false);
    req.send(null);
    if (req.status === 200) {
        backButton.style.display = "flex";
        backButton.style["justify-content"] = "center";
        backButton.style["align-items"] = "center";
        buttons.style.display = "none";
        fields.style.display = "none";
        passDisplay.textContent = req.responseText;
        passDisplay.style.display = "flex";
        passDisplay.style["justify-content"] = "center";
    }
}

const backHandler = () => {
    backButton.style.display = "none";
    buttons.style.display = "flex";
    fields.style.display = "flex";
    passDisplay.style.display = "none";
}


document.addEventListener("click", (e) => {
    if (e.target.classList.contains("login")) {

        // fetch('https://dev.backend.mona.hospitalonmobile.com/test/backend-analysis')
        //     .then(response => response.json())
        //     .then(data => alert(response.status));
        loginHandler();
    } else if (e.target.classList.contains("register")) {

        registerHandler()
    } else if (e.target.classList.contains("back")) {
        backHandler();
    }
})
