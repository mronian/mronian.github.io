let validWebsites = ['https://gumroad.com']

const GUMROAD_MODAL_CLASSNAME = 'gumroad-modal';
const GUMROAD_MODAL_CONTENT_CLASSNAME = 'gumroad-modal-content';
const GUMROAD_IFRAME_CLASSNAME = 'gumroad-iframe-product';
const GUMROAD_MODAL_IFRAME_ID = 'gumroad-modal-iframe-id';
const GUMROAD_MODAL_CLOSE_BUTTON_CLASSNAME = 'close-gumroad-modal';
const MODAL_LOADER_CLASSNAME = "modal-loader";

insertModalCss = () => {

    let gumroadModalCss = ' \
        .' + GUMROAD_MODAL_CLASSNAME + ' { \
            z-index: 3; \
            display: none; \
            position: fixed; \
            left: 0; \
            top: 0; \
            width: 100%; \
            height: 100%; \
            overflow: auto; \
            background-color: rgb(0,0,0); \
            background-color: rgba(0,0,0,0.4); \
        }'

    let gumroadModalContentCss = ' \
        .' + GUMROAD_MODAL_CONTENT_CLASSNAME + '{ \
            background-color: #fefefe; \
            padding: 20px; \
            margin: 4em; \
            border-radius: 0.5em; \
        } \
    '

    let modalCloseCss = ' \
        .' + GUMROAD_MODAL_CLOSE_BUTTON_CLASSNAME + ' { \
            color: #aaa; \
            float: right; \
            font-size: 28px; \
            font-weight: bold; \
        } \
        .' + GUMROAD_MODAL_CLOSE_BUTTON_CLASSNAME + ':hover, .' + GUMROAD_MODAL_CLOSE_BUTTON_CLASSNAME + ':focus { \
            color: black; \
            text-decoration: none; \
            cursor: pointer; \
        } \
    '

    let style = document.createElement("style");
    style.innerHTML = gumroadModalCss + gumroadModalContentCss + modalCloseCss;
    document.head.appendChild(style);
}

insertButtonCss = () => {

    let buttonCss = '\
        a.gumroad-button { \
            font-family: Arial; \
            font-size: 15px; \
            text-decoration: none !important; \
            display: inline-block !important; \
            border: 0.5px solid #d0d0d0; \
            border-radius: 4px !important; \
            color: #3c3c3c !important; \
            padding: 1em; \
        } \
        a.gumroad-button:hover { \
            background: #e4e4e4; \
        }'

    let loaderCss = '\
        .loader { \
            border: 16px solid #f3f3f3; \
            border-top: 16px solid #3498db; \
            border-radius: 50%; \
            width: 120px; \
            height: 120px; \
            animation: spin 2s linear infinite; \
            -webkit-animation: spin 2s linear infinite; \
            margin: auto; \
            margin-top: 5em; \
        } \
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } \
        }';

    let gumroadIFrameCss = ' \
    .' + GUMROAD_IFRAME_CLASSNAME + '{ \
        width: 100%; \
        height: 100%; \
        border: 0px; \
    }'

    let style = document.createElement("style");
    style.innerHTML = buttonCss + loaderCss + gumroadIFrameCss;
    document.head.appendChild(style);
}

getAllGumroadLinkObjects = () => {
    let candidateLinks = document.querySelectorAll('a:not(.not-gumroad-overlaylink)');

    let validLinks = [];
    for (let i = 0; i < candidateLinks.length; i++) {
        let candidateLink = candidateLinks[i];
        let isValid = false;
        for (let j = 0; j < validWebsites.length; j++) {
            if (candidateLink.href.includes(validWebsites[j])) {
                isValid = true;
                break;
            }
        }

        if (isValid) {
            validLinks.push(candidateLink);
        }
    }

    return validLinks;
}

getLoadingElement = (className) => {
    let loadingDiv = document.createElement("div");
    loadingDiv.className = "loader " + className;
    return loadingDiv;
}

getAllGumroadDivObjects = () => {
    return document.querySelectorAll('div.gumroad-embed');
}

createNewGumroadModal = () => {

    let modal = document.createElement("div");
    modal.className = GUMROAD_MODAL_CLASSNAME;

    // Add a modal content div

    let modalContent = document.createElement("div");
    modalContent.className = GUMROAD_MODAL_CONTENT_CLASSNAME;

    // Add a close button to the modal

    let closeButton = document.createElement("span");
    closeButton.className = GUMROAD_MODAL_CLOSE_BUTTON_CLASSNAME;
    closeButton.innerHTML = '&times;';

    modalContent.append(closeButton);

    let loader = getLoadingElement(MODAL_LOADER_CLASSNAME);
    modalContent.append(loader);

    modal.append(modalContent);

    closeModal = () => {
        modal.style.display = "none";
    }

    closeButton.onclick = function () {
        closeModal();
    }

    // Close modal on clicking outside the modal

    window.onclick = (e) => {
        if (e.target == modal) {
            closeModal();
        }
    }

    // Close modal on pressing ESC

    document.onkeydown = (e) => {
        if (e.keyCode == 27) {
            closeModal();
        }
    }

    return modal;
}

createIFrameFromLink = (href, onLoadCallback = () => { }) => {
    let iframe = document.createElement('iframe');
    iframe.className = GUMROAD_IFRAME_CLASSNAME;
    iframe.src = href;
    iframe.style.visibility = "hidden";
    iframe.onload = () => {
        iframe.style.visibility = "visible";

        // Any additional callbacks
        onLoadCallback();
    }
    return iframe;
}

attachIframe = (linkObject) => {

    let gumroadModalContent = document.querySelector('.' + GUMROAD_MODAL_CONTENT_CLASSNAME);
    let oldFrame = document.querySelector('#' + GUMROAD_MODAL_IFRAME_ID);
    
    // Check if old frame exists and delete it if src needs to be updated

    if (oldFrame && oldFrame.src !== linkObject.href) {
        gumroadModalContent.removeChild(oldFrame);
    }

    // If old iframe does not exist or if the old frame src is not equal to current link href, create a new iframe

    if (!oldFrame || oldFrame.src !== linkObject.href) {
        let loader = document.querySelector('.' + MODAL_LOADER_CLASSNAME);
        loader.style.display = "";

        let removeLoadingDivOnloadCallback = () => {
            loader.style.display = "none";
        }

        let iframe = createIFrameFromLink(linkObject.href, removeLoadingDivOnloadCallback);

        iframe.id = GUMROAD_MODAL_IFRAME_ID;
        gumroadModalContent.append(iframe);
    }
}

convertGumroadLinksToOverlayLinks = () => {
    let allLinkObjects = getAllGumroadLinkObjects();

    for (let i = 0; i < allLinkObjects.length; i++) {
        let linkObject = allLinkObjects[i];
        linkObject.onclick = (e) => {
            e.preventDefault();
            let gumroadModal = document.querySelector('.' + GUMROAD_MODAL_CLASSNAME);
            gumroadModal.style.display = 'block';
        }
        linkObject.onmouseover = (e) => {
            e.preventDefault();
            attachIframe(linkObject);
        }
    }
}

convertGumroadDivsToEmbeddedDivs = () => {
    let allDivObjects = getAllGumroadDivObjects();

    for (let i = 0; i < allDivObjects.length; i++) {
        let divObject = allDivObjects[i];
        let loadingDiv = getLoadingElement();
        divObject.appendChild(loadingDiv);
        
        let removeLoadingDivOnloadCallback = () => {
            divObject.removeChild(loadingDiv);
        }

        let iframe = createIFrameFromLink(divObject.getAttribute('href'), removeLoadingDivOnloadCallback);
        divObject.append(iframe);
    }
}

loadGumroadWidget = () => {
    insertButtonCss();
    insertModalCss();

    let gumroadModal = createNewGumroadModal();
    document.body.append(gumroadModal);

    convertGumroadLinksToOverlayLinks();
    convertGumroadDivsToEmbeddedDivs();
}

if (window.addEventListener) {
    window.addEventListener("load", loadGumroadWidget);
} else if (window.attachEvent) {
    window.attachEvent("onload", loadGumroadWidget);
}