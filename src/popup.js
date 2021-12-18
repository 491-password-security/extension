'use strict';

import './popup.css';
import crypto from 'crypto-helper-ku';
import { io } from 'socket.io-client';

const Number = crypto.Number;

(function () {
  let domain = "http://46.101.218.223";
  let saveEndPoint = "/save-password-share";
  let getEndPoint = "/get-password-share"
  let ls
  let portList = [":5001", ":5002", ":5003"];

  var uName = "";

  const backButtons = document.querySelectorAll(".back-button");
  const buttons = document.querySelector(".popup-content__buttons");
  const fields = document.querySelector(".popup-content__fields");
  const passDisplay = document.querySelector(".pass-display");

  const loginHandler = (event) => {
    const nameField = document.querySelector('.uname-input');
    const passField = document.querySelector('.password-input');
    var shares = [];
    var password = "";
    var randPwdInsallah;
    if (nameField.value.length > 0) {
      uName = nameField.value;
    }
    if (passField.value.length > 0) {
      password = passField.value;
    }
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      let url = tabs[0].url;
      // use `url` here inside the callback because it's asynchronous!
      ls = url;
      const hashed = crypto.util.hash(uName + ls);

      for (let index = 0; index < 2; index++) {

        const req = new XMLHttpRequest();
        req.onreadystatechange = function () {
          if (req.readyState == XMLHttpRequest.DONE) {
            if (req.status == 200) {
              const encrypted = req.responseText.split(":");
              const iv = encrypted[1];
              const ciphertext = encrypted[0];
              try {
                const share = crypto.aes.decrypt(crypto.util.hash(password), iv, ciphertext);
                shares.push(share);
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
        randPwdInsallah = crypto.ss.combine(shares);
      } else {
        randPwdInsallah = "Incorrect password! (this is not your password)";
      }

      backButtons.forEach(backButton => {
        backButton.style.display = "flex";
        backButton.style["justify-content"] = "center";
        backButton.style["align-items"] = "center";
      });
      buttons.style.display = "none";
      fields.style.display = "none";
      passDisplay.value = randPwdInsallah;
      passDisplay.style.display = "flex";
      //passDisplay.style["justify-content"] = "center";
      passField.value = "";
      nameField.value = "";
    });

  }

  const registerHandler = () => {
    const passField = document.querySelector('.password-input');
    const nameField = document.querySelector('.uname-input');
    const randPwd = crypto.util.random(32);
    const shares = crypto.ss.share(randPwd, 2, 3);

    var password = "";

    if (nameField.value.length > 0) {
      uName = nameField.value;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      let url = tabs[0].url;
      // use `url` here inside the callback because it's asynchronous!
      ls = url;
      const socket = io("http://localhost:5001");

      
      socket.on("connect", () => {
        let receiver = new crypto.ObliviousTransferReceiver(0, null, null);
        socket.emit("initOT", 'hello');

        socket.on("serverKey", (serverKey) => {
          let key = new Number(serverKey, 16)
          receiver.generateKeys(key);
          socket.emit("clientKey", receiver.keys[receiver.choice].hex);
        });

        socket.on("ciphertexts", (ciphertexts) => {
          let e_0 = ciphertexts[0].map(c => new Number(c, 16));
          let e_1 = ciphertexts[1].map(c => new Number(c, 16));
          let result = receiver.readMessage([e_0, e_1]);
          alert(result.decimal)
        });
      });


      const hashed = crypto.util.hash(uName + ls);
      if (passField.value.length > 0) {
        password = passField.value;
      }
      for (let index = 0; index < shares.length; index++) {
        const encrypted = crypto.aes.encrypt(crypto.util.hash(password), shares[index]);
        const req = new XMLHttpRequest();
        req.onreadystatechange = function () {
          if (req.readyState == XMLHttpRequest.DONE) {
            if (req.status == 200) {
            } else {
              alert("Port failed: " + portList[index]);
            }
          }
        }
        req.open('GET', domain + portList[index] + saveEndPoint + '/' + hashed + '/' + encrypted.ciphertext + '/' + encrypted.iv);
        req.send(null);
      }
      backButtons.forEach(backButton => {
        backButton.style.display = "flex";
        backButton.style["justify-content"] = "center";
        backButton.style["align-items"] = "center";
      });
      buttons.style.display = "none";
      fields.style.display = "none";
      passDisplay.value = randPwd;
      passDisplay.style.display = "flex";
      //passDisplay.style["justify-content"] = "center";
      //passDisplay.style.width = "200px";
      passField.value = "";
      nameField.value = "";
    });

  }

  const backHandler = () => {
    backButtons.forEach(backButton => {
      backButton.style.display = "none";
    });
    buttons.style.display = "flex";
    fields.style.display = "flex";

    passDisplay.style.display = "none";
    passDisplay.display.value = "";
  }

  const copyHandler = () => {
    passDisplay.select();
    document.execCommand("copy");
  }

  const homeHandler = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("home.html") });
  }

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("login")) {

      loginHandler();
    } else if (e.target.classList.contains("register")) {

      registerHandler()
    } else if (e.target.classList.contains("back")) {
      backHandler();
    } else if (e.target.classList.contains("copy")) {
      copyHandler();
    } else if (e.target.classList.contains("home-button")) {
      homeHandler();
    }
  })

})();
