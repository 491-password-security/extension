'use strict';




var userList = window.localStorage.getItem("usernames");
var domainList = window.localStorage.getItem("domains");
var userArray = userList.split("~");
var domainArray = domainList.split("~");


const users = document.querySelectorAll(".user");
const domains = document.querySelectorAll(".domain");
const blocks = document.querySelectorAll(".element-block");
console.log("aaa")
if (userArray.length > 0) {

    for (var i = 0; i < blocks.length; i++) {
        blocks[i].style.display = "flex";
        users[i].textContent = userArray[i];
        domains[i].textContent = domainArray[i];
    }
}



