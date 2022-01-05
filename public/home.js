'use strict';

var userList = window.localStorage.getItem("usernames");
var domainList = window.localStorage.getItem("domains");
var userArray = userList.split("~");
var domainArray = domainList.split("~");


const users = document.querySelectorAll(".user");
const domains = document.querySelectorAll(".domain");
const blocks = document.querySelectorAll(".element-block");

const modal = document.querySelector(".modal");
const userField = document.querySelector(".uname-input");
const domField = document.querySelector(".page-domain");

if (userArray.length > 0) {

    for (var i = 0; i < blocks.length && i < userArray.length; i++) {
        blocks[i].style.display = "flex";
        users[i].textContent = userArray[i];
        domains[i].textContent = domainArray[i];
    }
}

const refreshList = () => {
    if (userArray.length == 0) {
        blocks.forEach(block => {
            block.style.display = "none";
        })
    }
    if (blocks.length > userArray.length - 1) {
        var ind = 0;
        while (ind < userArray.length) {
            blocks[ind].style.display = "flex";
            users[ind].textContent = userArray[ind];
            domains[ind].textContent = domainArray[ind];
            ind++;
        }
        if (userArray[userArray.length - 1].length < 0) {
            blocks[ind].style.display = "none";
            ind++;
        } else {
            blocks[ind].style.display = "flex";
            users[ind].textContent = userArray[ind];
            domains[ind].textContent = domainArray[ind];
            ind++;
        }
        while (ind < blocks.length) {
            blocks[ind].style.display = "none";
            ind++;
        }
    } else {
        for (var i = 0; i < blocks.length && i < userArray.length; i++) {
            blocks[i].style.display = "flex";
            users[i].textContent = userArray[i];
            domains[i].textContent = domainArray[i];
        }
    }
}

const removeHandler = (id) => {
    const id_num = id.split("-")[1];
    const deletedItem = document.getElementById("eb-" + id_num)
    const idx = parseInt(id_num)
    userArray.splice(idx, 1);
    domainArray.splice(idx, 1);
    if (userArray.length > 0) {
        var str = userArray[0];
        for (var i = 1; i < userArray.length; i++) {
            str = str + "~" + userArray[i];
        }
        window.localStorage.setItem("usernames", str);

        var str1 = domainArray[0];
        for (var i = 1; i < domainArray.length; i++) {
            str1 = str1 + "~" + domainArray[i];
        }
        window.localStorage.setItem("domains", str1);
    } else {
        window.localStorage.setItem("domains", "");
        window.localStorage.setItem("usernames", "");
    }
    userList = window.localStorage.getItem("usernames");
    domainList = window.localStorage.getItem("domains");
    refreshList();
}

const addHandler = () => {
    modal.style.display = "block";
}
const credHandler = () => {
    const uname = userField.value;
    const domain = domField.value;

    if (uname.length > 0 && domain.length > 0) {
        var users = window.localStorage.getItem("usernames");

        if (users != null) {
            window.localStorage.setItem("usernames", uname + "~" + users);
        } else {
            window.localStorage.setItem("usernames", uname);
        }

        var doms = window.localStorage.getItem("domains");

        if (doms != null) {
            window.localStorage.setItem("domains", domain + "~" + doms);
        } else {
            window.localStorage.setItem("domains", domain);
        }
    }
    userField.value = "";
    domField.value = "";
    modal.style.display = "none";
    location.reload();
}

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-element")) {
        removeHandler(e.target.id);
    } else if (e.target.classList.contains("add-element")) {
        addHandler();
    } else if (e.target.classList.contains("save-creds")) {
        credHandler();
    } else if (e.target.classList.contains("close")) {
        userField.value = "";
        domField.value = "";
        modal.style.display = "none";
    }
})

