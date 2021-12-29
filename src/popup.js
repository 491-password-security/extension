'use strict';

import './popup.css';
import crypto from 'crypto-helper-ku';
import { io } from 'socket.io-client';

const Number = crypto.Number;
const MOD = crypto.constants.MOD;
const GEN = crypto.constants.GEN;
const MOD_1 = MOD.subtract(new Number('1'));

var count = 0;
var password = ""

const backButtons = document.querySelectorAll(".back-button");
const buttons = document.querySelector(".popup-content__buttons");
const fields = document.querySelector(".popup-content__fields");
const passDisplay = document.querySelector(".pass-display");
const masterPass = document.querySelector(".password-input");
const domFields = document.querySelectorAll(".page-domain");
const passGeneration = document.querySelector(".generate-pass__password");
const passLength = document.querySelector(".pass-slider");
const lengthOutput = document.querySelector(".pass-length");
const passwordDisplayTab = document.querySelector(".password-display-tab");
const progressBar = document.querySelector(".progress-bar");

const loginPage = document.querySelector(".login-page");
const getPage = document.querySelector(".get-pass");
const generatePage = document.querySelector(".generate-pass");
const savePage = document.querySelector(".save-pass");
const navBar = document.querySelector(".tab-nav-container");
// Get all the tabs
const tabs = document.querySelectorAll('.tab');

tabs.forEach(clickedTab => {
  // Add onClick event listener on each tab
  clickedTab.addEventListener('click', () => {
    // Remove the active class from all the tabs (this acts as a "hard" reset)
    tabs.forEach(tab => {
      tab.classList.remove('active');
    });

    // Add the active class on the clicked tab
    clickedTab.classList.add('active');
    const clickedTabBGColor = getComputedStyle(clickedTab).getPropertyValue('color');

    if (clickedTab.id == "tab-1") {
      loginPage.style.display = "none";
      getPage.style.display = "block";
      generatePage.style.display = "none";
      savePage.style.display = "none";
      // backButtons.style.display = "none";
      passDisplay.style.display = "none";
    } else if (clickedTab.id == "tab-2") {
      loginPage.style.display = "none";
      getPage.style.display = "none";
      generatePage.style.display = "block";
      savePage.style.display = "none";
      // backButtons.style.display = "none";
      passDisplay.style.display = "none";
    } else if (clickedTab.id == "tab-3") {
      loginPage.style.display = "none";
      getPage.style.display = "none";
      generatePage.style.display = "none";
      savePage.style.display = "block";
      // backButtons.style.display = "none";
      passDisplay.style.display = "none";
    } else if (clickedTab.id == "tab-4") {
      chrome.tabs.create({ url: chrome.runtime.getURL("home.html") });
      loginPage.style.display = "none";
      getPage.style.display = "none";
      generatePage.style.display = "none";
      savePage.style.display = "block";
      // backButtons.style.display = "none";
      passDisplay.style.display = "none";
    }
    // console.log(clickedTabBGColor);
    // document.body.style.background = clickedTabBGColor;
  });
});

function OPRF(serverUrl, pwd, finalFunc) {
  const socket = io(serverUrl);
  socket.on("connect", () => {
    let r = GEN.modPow(crypto.util.getBoundedBigInt(MOD), MOD);
    let r_inv = r.modInverse(MOD_1);
    while (r_inv.hex == 0) { // ensure r is invertible
      r = GEN.modPow(crypto.util.getBoundedBigInt(MOD), MOD);
      r_inv = r.modInverse(MOD_1);
    }
    let a = crypto.util.groupHash(pwd).modPow(r, MOD);

    socket.on("respondOPRF", (b) => {
      b = new Number(b, 16);
      let result = crypto.util.hash(pwd + b.modPow(r_inv, MOD).hex);
      finalFunc(result);
    })

    socket.emit("beginOPRF", a.hex)
  });
}

(function () {
  // let domain = "http://46.101.218.223";
  let domain = "http://localhost";
  let saveEndPoint = "/save-password-share";
  let getEndPoint = "/get-password-share"
  let ls;
  let portList = [":5001", ":5002", ":5003"];

  var uName = "";
  var randPwd;

  var lastPage = "";

  randPwd = crypto.util.random(passLength.value);
  passGeneration.value = randPwd;

  const loginPage = document.querySelector(".login-page");
  const getPage = document.querySelector(".get-pass");
  const generatePage = document.querySelector(".generate-pass");
  const savePage = document.querySelector(".save-pass");
  const navBar = document.querySelector(".tab-nav-container");


  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    let url = tabs[0].url.split("/")[2];
    domFields.forEach(domField => {
      domField.value = url;
    })

  });

  const setInvisible = () => {
    loginPage.style.display = "none";
    getPage.style.display = "none";
    generatePage.style.display = "none";
    savePage.style.display = "none";
  }

  const loginHandler = (event) => {
    const nameField = document.querySelector('.uname-input');
    lastPage = "get";
    var shares = [];
    var randPwdInsallah;
    if (nameField.value.length > 0) {
      uName = nameField.value;
    }

    ls = domFields[0].value;

    const hashed = crypto.util.hash(uName + ls);

    for (let index = 0; index < 2; index++) {

      // progressBar.style.display = "flex";
      // passwordDisplayTab.style.display = "flex";

      OPRF(domain + portList[index], password, (oprf_result) => {
        const req = new XMLHttpRequest();
        req.onreadystatechange = function () {
          if (req.readyState == XMLHttpRequest.DONE) {
            if (req.status == 200) {
              const encrypted = req.responseText.split(":");
              const iv = encrypted[1];
              const ciphertext = encrypted[0];
              try {
                const share = crypto.aes.decrypt(oprf_result, iv, ciphertext);
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
          if (shares.length >= 2) {
            randPwdInsallah = crypto.ss.combine(shares);
            passDisplay.value = randPwdInsallah;
          }
        } catch (error) {
          alert(error);
        }
      })
    }

    backButtons.forEach(backButton => {
      backButton.style.display = "flex";
      backButton.style["justify-content"] = "center";
      backButton.style["align-items"] = "center";
    });

    setInvisible();

    navBar.style.display = "none";
    passDisplay.style.display = "flex";

    //passField.value = "";
    nameField.value = "";

  }

  const registerHandler = () => {
    const passField = document.querySelector('.password-input');
    const nameField = document.querySelectorAll('.uname-input')[1];
    lastPage = "save";
    const shares = crypto.ss.share(randPwd, 2, 3);

    if (nameField.value.length > 0) {
      uName = nameField.value;
    }

    ls = domFields[1].value;
    alert(nameField.value)

    // read password
    const hashed = crypto.util.hash(uName + ls);
    alert(uName)
    // distribute shares
    for (let index = 0; index < shares.length; index++) {
      // compute encryption key with oprf
      OPRF(domain + portList[index], password, (oprf_result) => {
        alert(oprf_result)
        const encrypted = crypto.aes.encrypt(oprf_result, shares[index]);
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
      })
    }

    backButtons.forEach(backButton => {
      backButton.style.display = "flex";
      backButton.style["justify-content"] = "center";
      backButton.style["align-items"] = "center";
    });
    setInvisible();
    // progressBar.style.display = "flex";
    // passwordDisplayTab.style.display = "flex";
    navBar.style.display = "none";
    passDisplay.value = randPwd;
    passDisplay.style.display = "flex";
    passField.value = "";
    nameField.value = "";

  }

  const backHandler = () => {
    backButtons.forEach(backButton => {
      backButton.style.display = "none";
    });
    navBar.style.display = "flex";
    if (lastPage == "save") {
      savePage.style.display = "flex";
    }
    else {
      getPage.style.display = "flex";
    }

    passDisplay.style.display = "none";
    // passDisplay.display.value = " ";
    passDisplay.value = "";
  }

  const copyHandler = () => {
    passDisplay.select();
    document.execCommand("copy");
  }

  const masterPasswordHandler = () => {
    if (masterPass.value.length > 0) {
      password = masterPass.value;
      setInvisible();

      navBar.style.display = "flex";
      getPage.style.display = "flex";
    }
  }

  const copyGenPwd = () => {
    passGeneration.select();
    document.execCommand("copy");
  }
  const refreshHandler = () => {
    randPwd = crypto.util.random(passLength.value);
    passGeneration.value = randPwd;
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
    } else if (e.target.classList.contains("login-button")) {
      masterPasswordHandler();
    } else if (e.target.classList.contains("refresh-password")) {
      refreshHandler();
    } else if (e.target.classList.contains("copy-password")) {
      copyGenPwd();
    }
  })

  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("pass-slider")) {
      lengthOutput.textContent = passLength.value;
    }
  })

})();
