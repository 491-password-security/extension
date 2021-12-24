'use strict';

import './popup.css';
import crypto from 'crypto-helper-ku';
import { io } from 'socket.io-client';

const Number = crypto.Number;
const MOD = crypto.constants.MOD;
const GEN = crypto.constants.GEN;

var count = 0;
var password = ""

function beginOPRFRound(socket, bits, index) {
  // if (index % 64 == 0 && index >= 64) {
  //   alert(index)
  // }
  var elem = document.getElementById("myBar");
  var load_msg = document.querySelector(".load-msg");
  load_msg.textContent = "Distributing shares..."
  elem.style.width = 100 * (index / 256) + "%";
  let receiver = new crypto.ObliviousTransferReceiver(parseInt(bits[index]), null, null);
  socket.emit("oprfRound", index)
  if (index == 255) {
    count++;
    if (count == 3) {
      load_msg.textContent = "Done!"
      count = 0;
    }
  }
  return receiver;
}

function OPRF(serverUrl, bits, finalFunc) {
  const socket = io(serverUrl);
  socket.on("connect", () => {
    let receiver;
    let count = 0;
    let client_prod = new Number('1');
    let server_prod;

    // receive OT key from server
    socket.on("serverKey", (serverKey) => {
      let key = new Number(serverKey, 16)
      receiver.generateKeys(key);
      socket.emit("clientKey", receiver.keys[receiver.choice].hex);
    });

    // compute final value at the end of the oprf protocol
    socket.on("serverProd", (serverProdInv) => {
      server_prod = new Number(serverProdInv, 16);
      let exp = server_prod.multiply(client_prod).mod(MOD);
      let oprf_result = GEN.modPow(exp, MOD);
      finalFunc(oprf_result);
    })

    // receive OT ciphertexts from server
    socket.on("ciphertexts", (ciphertexts) => {
      let e_0 = ciphertexts[0].map(c => new Number(c, 16));
      let e_1 = ciphertexts[1].map(c => new Number(c, 16));
      let result = receiver.readMessage([e_0, e_1]);
      client_prod = client_prod.multiply(result).mod(MOD);

      // at the end of the oprf round
      count += 1;
      if (count == 256) {
        // get server prod to finalize protocol
        socket.emit("requestServerProd");
      } else {
        // start next oprf round
        receiver = beginOPRFRound(socket, bits, count);
      }
    });

    // start first  oprf round
    receiver = beginOPRFRound(socket, bits, count);
  });
}

(function () {
  let domain = "http://46.101.218.223";
  let saveEndPoint = "/save-password-share";
  let getEndPoint = "/get-password-share"
  let ls
  let portList = [":5001", ":5002", ":5003"];

  var uName = "";
  var randPwd;

  var lastPage = "";

  const backButtons = document.querySelectorAll(".back-button");
  const buttons = document.querySelector(".popup-content__buttons");
  const fields = document.querySelector(".popup-content__fields");
  const passDisplay = document.querySelector(".pass-display");
  const masterPass = document.querySelector(".password-input");
  const domField = document.querySelector(".page-domain");
  const passGeneration = document.querySelector(".generate-pass__password");
  const passLength = document.querySelector(".pass-slider");
  const lengthOutput = document.querySelector(".pass-length");

  randPwd = crypto.util.random(passLength.value);
  passGeneration.value = randPwd;

  const loginPage = document.querySelector(".login-page");
  const getPage = document.querySelector(".get-pass");
  const generatePage = document.querySelector(".generate-pass");
  const savePage = document.querySelector(".save-pass");

  const nextButton = document.querySelector(".next");

  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    let url = tabs[0].url.split("/")[2];
    domField.value = url;
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

    ls = domField.value;

    const hashed = crypto.util.hash(uName + ls);

    let bits = crypto.codec.hex2Bin(crypto.util.hash(password))

    for (let index = 0; index < 2; index++) {

      OPRF(domain + portList[index], bits, (oprf_result) => {
        const req = new XMLHttpRequest();
        req.onreadystatechange = function () {
          if (req.readyState == XMLHttpRequest.DONE) {
            if (req.status == 200) {
              const encrypted = req.responseText.split(":");
              const iv = encrypted[1];
              const ciphertext = encrypted[0];
              try {
                const share = crypto.aes.decrypt(crypto.util.hash(oprf_result.hex), iv, ciphertext);
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
    passDisplay.style.display = "flex";

    passField.value = "";
    nameField.value = "";

  }

  const registerHandler = () => {
    const passField = document.querySelector('.password-input');
    const nameField = document.querySelector('.uname-input');
    lastPage = "save";
    const shares = crypto.ss.share(randPwd, 2, 3);

    if (nameField.value.length > 0) {
      uName = nameField.value;
    }

    ls = domField.value;
    alert(ls);
    // read password
    const hashed = crypto.util.hash(uName + ls);

    let bits = crypto.codec.hex2Bin(crypto.util.hash(password));

    // distribute shares
    for (let index = 0; index < shares.length; index++) {
      // compute encryption key with oprf
      OPRF(domain + portList[index], bits, (oprf_result) => {
        const encrypted = crypto.aes.encrypt(crypto.util.hash(oprf_result.hex), shares[index]);
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
    passDisplay.value = randPwd;
    passDisplay.style.display = "flex";
    passField.value = "";
    nameField.value = "";

  }

  const backHandler = () => {
    backButtons.forEach(backButton => {
      backButton.style.display = "none";
    });
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
