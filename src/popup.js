'use strict';

import './popup.css';
import crypto from 'crypto-helper-ku';

(function () {
  let domain = "http://46.101.218.223";
  let port = ":5000";
  let saveEndPoint = "/save-password-share";
  let getEndPoint = "/get-password-share"

  let portList = [":5001", ":5002", ":5003"];
  const ls = "facebook.com";
  const uName = "PaswordSecurity";


  const LOGIN_URL = "login url";
  const REGISTER_URL = "register url"
  const request = new Request('https://dev.backend.mona.hospitalonmobile.com/test/backend-analysis', { method: 'GET' })

  const backButton = document.querySelector(".back-button");
  const buttons = document.querySelector(".popup-content__buttons");
  const fields = document.querySelector(".popup-content__fields");
  const passDisplay = document.querySelector(".popup-content__password-display");

  const serverList = [];


  const loginHandler = (event) => {
    // const req = new XMLHttpRequest();
    // req.open('GET', 'https://dev.backend.mona.hospitalonmobile.com/test/backend-analysis', false);
    // req.send(null);
    // if (req.status === 200) {
    const passField = document.querySelector('.password-input').value;

    var password = "aa";

    if (passField.length > 0) {
      password = passField;
    }
    const hashed = crypto.hash(uName + ls);

    for (let index = 0; index < 3; index++) {

      const req = new XMLHttpRequest();
      req.onreadystatechange = function () {
        if (req.readyState == XMLHttpRequest.DONE) {
          if (req.status == 200) {
            alert(req.responseText);
          } else {
            alert("Port failed: " + portList[index]);
          }
        }
      }
      req.open('GET', domain + portList[index] + getEndPoint + '/' + hashed);
      req.send(null);

    }

    backButton.style.display = "flex";
    backButton.style["justify-content"] = "center";
    backButton.style["align-items"] = "center";
    buttons.style.display = "none";
    fields.style.display = "none";
    passDisplay.textContent = "crypto.hash(password)";
    passDisplay.style.display = "flex";
    passDisplay.style["justify-content"] = "center";

  }

  const registerHandler = () => {
    const passField = document.querySelector('.password-input').value;
    const randPwd = crypto.random(256);
    const shares = crypto.share(randPwd, 2, 3);
    const hashed = crypto.hash(uName + ls);
    var password = "";

    if (passField.length > 0) {
      password = passField;
    }

    for (let index = 0; index < shares.length; index++) {
      const encrypted = crypto.encrypt(crypto.hash(password), shares[index]);

      const req = new XMLHttpRequest();
      req.open('GET', domain + portList[index] + saveEndPoint + '/' + hashed + '/' + encrypted.ciphertext + '/' + encrypted.iv);
      req.send(null);
      if (req.status === 200) {
        alert(req.responseText);
      } else {
        alert("Port failed: " + portList[index]);
      }

    }
    backButton.style.display = "flex";
    backButton.style["justify-content"] = "center";
    backButton.style["align-items"] = "center";
    buttons.style.display = "none";
    fields.style.display = "none";
    passDisplay.textContent = randPwd;
    passDisplay.style.display = "flex";
    passDisplay.style["justify-content"] = "center";

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

})();
