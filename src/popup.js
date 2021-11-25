'use strict';

import './popup.css';
import crypto from 'crypto-helper-ku';

(function () {
  let domain = "http://46.101.218.223";
  let saveEndPoint = "/save-password-share";
  let getEndPoint = "/get-password-share"

  let portList = [":5001", ":5002", ":5003"];
  const ls = "facebook.com";
  const uName = "qwertyuıo";

  const backButton = document.querySelector(".back-button");
  const buttons = document.querySelector(".popup-content__buttons");
  const fields = document.querySelector(".popup-content__fields");
  const passDisplay = document.querySelector(".popup-content__password-display");

  const loginHandler = (event) => {
    const passField = document.querySelector('.password-input');
    var shares = [];
    var password = "aa";
    var randPwdInsallah;

    if (passField.value.length > 0) {
      password = passField.value;
    }
    const hashed = crypto.hash(uName + ls);

    for (let index = 0; index < 2; index++) {

      const req = new XMLHttpRequest();
      req.onreadystatechange = function () {
        if (req.readyState == XMLHttpRequest.DONE) {
          if (req.status == 200) {
            const encrypted = req.responseText.split(":");
            const iv = encrypted[1];
            const ciphertext = encrypted[0];
            try {
              const share = crypto.decrypt(crypto.hash(password), iv, ciphertext);
              shares.push(share);
              alert(share);
            } catch (error) {

            }

          } else {
            alert("Port failed: " + portList[index]);
          }
        }
      }
      try {
        req.open('GET', domain + portList[index] + getEndPoint + '/' + hashed, false);
        req.send(null);
      } catch (error) {
        alert(error);
      }

    }
    if (shares.length >= 2) {
      randPwdInsallah = crypto.combine(shares);
    } else {
      randPwdInsallah = "Incorrect password! (this is not your password)";
    }


    backButton.style.display = "flex";
    backButton.style["justify-content"] = "center";
    backButton.style["align-items"] = "center";
    buttons.style.display = "none";
    fields.style.display = "none";
    passDisplay.textContent = randPwdInsallah;
    passDisplay.style.display = "flex";
    passDisplay.style["justify-content"] = "center";
    passField.value = "";
  }

  const registerHandler = () => {
    const passField = document.querySelector('.password-input');
    const randPwd = crypto.random(32);
    const shares = crypto.share(randPwd, 2, 3);
    const hashed = crypto.hash(uName + ls);
    var password = "";

    if (passField.value.length > 0) {
      password = passField.value;
    }
    for (let index = 0; index < shares.length; index++) {
      const encrypted = crypto.encrypt(crypto.hash(password), shares[index]);
      const req = new XMLHttpRequest();
      req.onreadystatechange = function () {
        if (req.readyState == XMLHttpRequest.DONE) {
          if (req.status == 200) {
            alert(encrypted.iv + "||||||| " + encrypted.ciphertext);
          } else {
            alert("Port failed: " + portList[index]);
          }
        }
      }
      req.open('GET', domain + portList[index] + saveEndPoint + '/' + hashed + '/' + encrypted.ciphertext + '/' + encrypted.iv);
      req.send(null);
    }
    backButton.style.display = "flex";
    backButton.style["justify-content"] = "center";
    backButton.style["align-items"] = "center";
    buttons.style.display = "none";
    fields.style.display = "none";
    passDisplay.textContent = randPwd;
    passDisplay.style.display = "flex";
    passDisplay.style["justify-content"] = "center";
    passDisplay.style.width = "200px";
    passField.value = "";

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
