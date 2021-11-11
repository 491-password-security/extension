const LOGIN_URL = "login url";
const REGISTER_URL = "register url"
const request = new Request('https://dev.backend.mona.hospitalonmobile.com/test/backend-analysis', { method: 'GET' })

const loginHandler = (event) => {
    const req = new XMLHttpRequest();
    req.open('GET', 'https://dev.backend.mona.hospitalonmobile.com/test/backend-analysis', false);
    req.send(null);
    if (req.status === 200) {
        alert(req.responseText);
    }
}

const registerHandler = () => {
    const req = new XMLHttpRequest();
    req.open('GET', 'https://dev.backend.mona.hospitalonmobile.com/test/backend-analysis', false);
    req.send(null);
    if (req.status === 200) {
        alert(req.status);
    }
}

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("login")) {

        // fetch('https://dev.backend.mona.hospitalonmobile.com/test/backend-analysis')
        //     .then(response => response.json())
        //     .then(data => alert(response.status));
        loginHandler();
    } else if (e.target.classList.contains("register")) {

        registerHandler()
    }
})
