
const root = document.documentElement;
const menuBtn = document.getElementById('menu');
const navEl = document.getElementById('nav_el');

menuBtn.addEventListener('click', () => {
    menuBtn.children[0].children[0].classList.toggle('cross');
    navEl.classList.toggle('open');
});

const [form, formCont, formWrapper, formEl, noLinkErr, shortenBtn] = ['form', 'container', 'formWrapper', 'formEl', 'noLinkError', 'shortenBtn'].map((el)=>{
    return document.getElementById(`${el}`);
});
const linkIn = document.querySelector('#formEl input');

let [oldFDH, newFDH] = [0, 0];
/* newFDH = newFormDivH */
newFDH = Math.round(formWrapper.getBoundingClientRect().height);
oldFDH = newFDH;
root.style.setProperty('--formH', `${Math.round(newFDH / 2)}px`);
// console.log(newFDH);
window.addEventListener('resize', () => {
    newFDH = Math.round(formWrapper.getBoundingClientRect().height);
    if (newFDH !== oldFDH) {
        oldFDH = newFDH;
        root.style.setProperty('--formH', `${Math.round(newFDH / 2)}px`);
        // console.log(newFDH);
    }
});

linkIn.addEventListener("input",()=>{
    if(linkIn.classList.contains("error")){
        linkIn.classList.remove("error");
        noLinkErr.classList.remove("show");
        noLinkErr.textContent = 'Please add a link';
    }
});
formEl.addEventListener("submit", (e) => {
    e.preventDefault();
});
shortenBtn.addEventListener("click", () => {
    if (linkIn.value === "") {
        console.log(noLinkErr.textContent);
        noLinkErr.classList.add("show");
        linkIn.classList.add('error');
    }
    else {
        console.log(linkIn.value);
        shortenBtn.textContent = '';
        shortenBtn.textContent = 'Shortening..';
        fetch(`https://api.shrtco.de/v2/shorten?url=${linkIn.value}`)
            .then((response) => response.json())
            .then((json) => loadResult(linkIn.value,json))
            .finally(() => {
                shortenBtn.textContent = 'Shorten It!';
            });
    }
});

let id = 21, linkHistory = [];

function loadResult(inLink, resObj){
    // console.log(resObj.ok);
    if(resObj.ok){
        let short_link = resObj.result.full_short_link3;
        console.log(short_link);

        saveLinkHistory(resObj);

        let btnID = `btn_${id}`;
        let divEl = `<div class="flex-cc linkHistory">
        <span>${inLink}</span>
        <div class="flex-cc">
            <span>${short_link}</span>
            <button id="${btnID}" class="copyBtn" onclick="copyShortLink(${btnID})">Copy</button>
        </div>
    </div>`;
        formCont.insertAdjacentHTML('beforeend',divEl);
        id++;
    }
    else{
        noLinkErr.textContent = 'Bad URL..! Check your URL.';
        console.log(noLinkErr.textContent);
        noLinkErr.classList.add("show");
        linkIn.classList.add('error');
        // for(var z=0;z<=1;z++){
        //     var tick = function(z) {
        //         return function() {
        //             noLinkErr.classList.toggle("show");
        //             if(z==1){
        //                 noLinkErr.textContent = 'Please add a link';
        //             }
        //         };
        //     };
        //     setTimeout(tick(z), 1600 * z);
        // }
       
    }
}


function saveLinkHistory(resObj){
    let crtLink = {
        original_link: resObj.result.original_link,
        short_link: resObj.result.full_short_link3
    }
    linkHistory.push(crtLink);
    console.log(linkHistory);
    sessionStorage.setItem("auto_save", JSON.stringify(linkHistory));
}
if (sessionStorage.getItem("auto_save")) {
    // Restore the contents of the text field
    linkHistory = JSON.parse(sessionStorage.getItem("auto_save"));
    loadLinkHistory(linkHistory);
}
function loadLinkHistory(linkHistory){
    for(let i=0;i<linkHistory.length;i++){
        let btnID = `btn_${id}`;
        let [inLink, short_link] = [linkHistory[i].original_link, linkHistory[i].short_link];
        let divEl = `<div class="flex-cc linkHistory">
        <span>${inLink}</span>
        <div class="flex-cc">
            <span>${short_link}</span>
            <button id="${btnID}" class="copyBtn" onclick="copyShortLink(${btnID})">Copy</button>
        </div>
    </div>`;
        formCont.insertAdjacentHTML('beforeend',divEl);
        id++;
    }
}


function copyShortLink(btnCopied){
    // console.log(typeof btnId, btnId);
    // let btnCopied = document.getElementById(btnId);
    let link = btnCopied.previousElementSibling.textContent;
    let txtEl = document.createElement('input');
    txtEl.value =  `${link}`;
    txtEl.id = 'txtField';
    document.body.append(txtEl);
    let txtElSel = document.getElementById(txtEl.id);
    txtElSel.select();
    txtElSel.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(txtElSel);
    if(!btnCopied.classList.contains('copied')){
        btnCopied.classList.add('copied');
        btnCopied.textContent = 'Copied.!';
    }
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
// Get the text field that we're going to track
let field = document.getElementById("field");

// See if we have an autosave value
// (this will only happen if the page is accidentally refreshed)
if (sessionStorage.getItem("autosave")) {
  // Restore the contents of the text field
  field.value = sessionStorage.getItem("autosave");
}

// Listen for changes in the text field
field.addEventListener("change", function() {
  // And save the results into the session storage object
  sessionStorage.setItem("autosave", field.value);
});
*/

// https://app.shrtco.de/
// https://api.shrtco.de/v2/shorten?url=example.org/very/long/link.html

// {
//     "ok": true,
//     "result": {
//         "code": "KCveN",
//         "short_link": "shrtco.de/KCveN",
//         "full_short_link": "https://shrtco.de/KCveN",
//         "short_link2": "9qr.de/KCveN",
//         "full_short_link2": "https://9qr.de/KCveN",
//         "share_link": "shrtco.de/share/KCveN",
//         "full_share_link": "https://shrtco.de/share/KCveN", "original_link": "http://example.org/very/long/link.html"
//     }
// }