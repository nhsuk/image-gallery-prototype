/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*/
var galleries = [document.querySelector(".first"), document.querySelector(".second"), document.querySelector(".third")];

// Automatic gallery
function tabsGallery(galleryDiv) {
    var tablist = galleryDiv.querySelectorAll('[role="tablist"]')[0];
    var tabs;
    var panels;
    var delay = determineDelay();

    generateArrays();

    function generateArrays() {
        tabs = galleryDiv.querySelectorAll('[role="tab"]');
        panels = galleryDiv.querySelectorAll('[role="tabpanel"]');
    };

    function randomSelect(){
        var len = tabs.length;
        var ran = Math.floor(Math.random() * len);

        deactivateTabs();

        // Remove tabindex attribute
        tabs[ran].setAttribute('tabindex', '0');

        // Set the tab as selected
        tabs[ran].setAttribute('aria-selected', 'true');

        // Apply the selected class
        tabs[ran].classList.add("nhsuk-gallery-image-thumbnail_selected");

        // Get the value of aria-controls (which is an ID)
        var controlsID = tabs[ran].getAttribute('aria-controls');
        var imageID = "#".concat(controlsID);

        // Remove hidden attribute from tab panel to make it visible
        galleryDiv.querySelector(imageID).removeAttribute('hidden');
    };

    randomSelect();

    // For easy reference
    var keys = {
        end: 35,
        home: 36,
        left: 37,
        up: 38,
        right: 39,
        down: 40
    };

    // Add or substract depending on key pressed
    var direction = {
        37: -1,
        38: -1,
        39: 1,
        40: 1
    };

    // Bind listeners
    for (let i = 0; i < tabs.length; ++i) {
        addListeners(i);
    };

    function addListeners(index) {
        tabs[index].addEventListener('click', clickEventListener);
        tabs[index].addEventListener('keydown', keydownEventListener);
        tabs[index].addEventListener('keyup', keyupEventListener);

        // Build an array with all tabs (<button>s) in it
        tabs[index].index = index;
    };

    // When a tab is clicked, activateTab is fired to activate it
    function clickEventListener(event) {
        var tab = event.target;
        activateTab(tab, false);
    };

    // Handle keydown on tabs
    function keydownEventListener(event) {
        var key = event.keyCode;

        switch (key) {
            case keys.end:
                event.preventDefault();
                // Activate last tab
                activateTab(tabs[tabs.length - 1]);
                break;
            case keys.home:
                event.preventDefault();
                // Activate first tab
                activateTab(tabs[0]);
                break;

            // Up and down are in keydown
            // because we need to prevent page scroll >:)
            case keys.up:
            case keys.down:
                determineOrientation(event);
                break;
        };
    };

    // Handle keyup on tabs
    function keyupEventListener(event) {
        var key = event.keyCode;

        switch (key) {
            case keys.left:
            case keys.right:
                determineOrientation(event);
                break;
        };
    };

    // When a tablist’s aria-orientation is set to vertical,
    // only up and down arrow should function.
    // In all other cases only left and right arrow function.
    function determineOrientation(event) {
        var key = event.keyCode;
        var vertical = tablist.getAttribute('aria-orientation') == 'vertical';
        var proceed = false;

        if (vertical) {
            if (key === keys.up || key === keys.down) {
                event.preventDefault();
                proceed = true;
            };
        }
        else {
            if (key === keys.left || key === keys.right) {
                proceed = true;
            };
        };

        if (proceed) {
            switchTabOnArrowPress(event);
        };
    };

    // Either focus the next, previous, first, or last tab
    // depening on key pressed
    function switchTabOnArrowPress(event) {
        var pressed = event.keyCode;

        for (let x = 0; x < tabs.length; x++) {
            tabs[x].addEventListener('focus', focusEventHandler);
        };

        if (direction[pressed]) {
            var target = event.target;
            if (target.index !== undefined) {
                if (tabs[target.index + direction[pressed]]) {
                    tabs[target.index + direction[pressed]].focus();
                    activateTab(tabs[target.index + direction[pressed]]);
                }
                else if (pressed === keys.left || pressed === keys.up) {
                    focusLastTab();
                }
                else if (pressed === keys.right || pressed == keys.down) {
                    focusFirstTab();
                };
            };
        };
    };

    // Make a guess
    function focusFirstTab() {
        tabs[0].focus();
        activateTab(tabs[0]);
    };

    // Make a guess
    function focusLastTab() {
        tabs[tabs.length - 1].focus();
        activateTab(tabs[tabs.length - 1]);
    };

    // Activates any given tab panel
    function activateTab(tab, setFocus) {
        setFocus = setFocus || true;
        // Deactivate all other tabs
        deactivateTabs();

        // Remove tabindex attribute
        tab.setAttribute('tabindex', '0');

        // Set the tab as selected
        tab.setAttribute('aria-selected', 'true');

        // Apply the selected class
        tab.classList.add("nhsuk-gallery-image-thumbnail_selected");

        // Get the value of aria-controls (which is an ID)
        var controlsID = tab.getAttribute('aria-controls');
        var imageID = "#".concat(controlsID);

        // Remove hidden attribute from tab panel to make it visible
        galleryDiv.querySelector(imageID).removeAttribute('hidden');

        // Set focus when required
        if (setFocus) {
            tab.focus();
        };
    };

    // Deactivate all tabs and tab panels
    function deactivateTabs() {
        for (let t = 0; t < tabs.length; t++) {
            tabs[t].setAttribute('tabindex', '-1');
            tabs[t].setAttribute('aria-selected', 'false');
            tabs[t].removeEventListener('focus', focusEventHandler);
            tabs[t].classList.remove("nhsuk-gallery-image-thumbnail_selected");
        };

        for (let p = 0; p < panels.length; p++) {
            const sumamry = panels[p].querySelector(".nhsuk-details__summary");
            const details = panels[p].querySelector("details");
            const openAttr = details.getAttribute("open") !== null;
            if (openAttr === true) {
                sumamry.click();
            }

            panels[p].setAttribute('hidden', 'hidden');
        };
    };

    // Determine whether there should be a delay
    // when user navigates with the arrow keys
    function determineDelay() {

        // Needed here because prototype 1 and 2 are not tabs
        if (typeof(tablist) == "undefined") {

            return 300;
        }

        var hasDelay = tablist.hasAttribute('data-delay');

        var delay = 0;

        if (hasDelay) {
            var delayValue = tablist.getAttribute('data-delay');
            if (delayValue) {
                delay = delayValue;
            }
            else {
                // If no value is specified, default to 300ms
                delay = 300;
            };
        };

        return delay;
    };

    //
    function focusEventHandler(event) {
        var target = event.target;

        setTimeout(checkTabFocus, delay, target);
    };

    // Only activate tab on focus if it still has focus after the delay
    function checkTabFocus(target) {
        let focused = galleryDiv.activeElement;

        if (target === focused) {
            activateTab(target, false);
        };
    };
}

// Manual gallery
function manualGallery(galleryDiv) {
    var tablist = galleryDiv.querySelectorAll('[role="tablist"]')[0];
    var tabs;
    var panels;

    generateArrays();

    function generateArrays() {
        tabs = galleryDiv.querySelectorAll('[role="tab"]');
        panels = galleryDiv.querySelectorAll('[role="tabpanel"]');
    };

    function randomSelect(){
        var len = tabs.length;
        var ran = Math.floor(Math.random() * len);

        deactivateTabs();

        // Remove tabindex attribute
        tabs[ran].setAttribute('tabindex', '0');

        // Set the tab as selected
        tabs[ran].setAttribute('aria-selected', 'true');

        // Apply the selected class
        tabs[ran].classList.add("nhsuk-gallery-image-thumbnail_selected");

        // Get the value of aria-controls (which is an ID)
        var controlsID = tabs[ran].getAttribute('aria-controls');
        var imageID = "#".concat(controlsID);

        // Remove hidden attribute from tab panel to make it visible
        galleryDiv.querySelector(imageID).removeAttribute('hidden');
    };

    randomSelect();

    // For easy reference
    var keys = {
        end: 35,
        home: 36,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        enter: 13,
        space: 32
    };

    // Add or substract depending on key pressed
    var direction = {
        37: -1,
        38: -1,
        39: 1,
        40: 1
    };

    // Bind listeners
    for (let i = 0; i < tabs.length; ++i) {
        addListeners(i);
    };

    function addListeners(index) {
        tabs[index].addEventListener('click', clickEventListener);
        tabs[index].addEventListener('keydown', keydownEventListener);
        tabs[index].addEventListener('keyup', keyupEventListener);

        // Build an array with all tabs (<button>s) in it
        tabs[index].index = index;
    };

    // When a tab is clicked, activateTab is fired to activate it
    function clickEventListener(event) {
        var tab = event.target;
        activateTab(tab, false);
    };

    // Handle keydown on tabs
    function keydownEventListener(event) {
        var key = event.keyCode;

        switch (key) {
            case keys.end:
                event.preventDefault();
                // Activate last tab
                focusLastTab();
                break;
            case keys.home:
                event.preventDefault();
                // Activate first tab
                focusFirstTab();
                break;

            // Up and down are in keydown
            // because we need to prevent page scroll >:)
            case keys.up:
            case keys.down:
                determineOrientation(event);
                break;
        };
    };

    // Handle keyup on tabs
    function keyupEventListener(event) {
        var key = event.keyCode;

        switch (key) {
            case keys.left:
            case keys.right:
                determineOrientation(event);
                break;
            case keys.enter:
            case keys.space:
                activateTab(event.target);
                break;
        };
    };

    // When a tablist’s aria-orientation is set to vertical,
    // only up and down arrow should function.
    // In all other cases only left and right arrow function.
    function determineOrientation(event) {
        var key = event.keyCode;
        var vertical = tablist.getAttribute('aria-orientation') == 'vertical';
        var proceed = false;

        if (vertical) {
            if (key === keys.up || key === keys.down) {
                event.preventDefault();
                proceed = true;
            };
        }
        else {
            if (key === keys.left || key === keys.right) {
                proceed = true;
            };
        };

        if (proceed) {
            switchTabOnArrowPress(event);
        };
    };

    // Either focus the next, previous, first, or last tab
    // depening on key pressed
    function switchTabOnArrowPress(event) {
        var pressed = event.keyCode;

        if (direction[pressed]) {
            var target = event.target;
            if (target.index !== undefined) {
                if (tabs[target.index + direction[pressed]]) {
                    tabs[target.index + direction[pressed]].focus();
                }
                else if (pressed === keys.left || pressed === keys.up) {
                    focusLastTab();
                }
                else if (pressed === keys.right || pressed == keys.down) {
                    focusFirstTab();
                };
            };
        };
    };

    // Make a guess
    function focusFirstTab() {
        tabs[0].focus();
    };

    // Make a guess
    function focusLastTab() {
        tabs[tabs.length - 1].focus();
    };

    // Activates any given tab panel
    function activateTab(tab, setFocus) {
        setFocus = setFocus || true;
        // Deactivate all other tabs
        deactivateTabs();

        // Remove tabindex attribute
        tab.setAttribute('tabindex', '0');

        // Set the tab as selected
        tab.setAttribute('aria-selected', 'true');

        // Apply the selected class
        tab.classList.add("nhsuk-gallery-image-thumbnail_selected");

        // Get the value of aria-controls (which is an ID)
        var controlsID = tab.getAttribute('aria-controls');
        var imageID = "#".concat(controlsID);

        // Remove hidden attribute from tab panel to make it visible
        galleryDiv.querySelector(imageID).removeAttribute('hidden');

        // Set focus when required
        if (setFocus) {
            tab.focus();
        };
    };

    // Deactivate all tabs and tab panels
    function deactivateTabs() {
        for (let t = 0; t < tabs.length; t++) {
            tabs[t].setAttribute('tabindex', '-1');
            tabs[t].setAttribute('aria-selected', 'false');
            tabs[t].classList.remove("nhsuk-gallery-image-thumbnail_selected");
        };

        for (let p = 0; p < panels.length; p++) {
            const sumamry = panels[p].querySelector(".nhsuk-details__summary");
            const details = panels[p].querySelector("details");
            const openAttr = details.getAttribute("open") !== null;
            if (openAttr === true) {
                sumamry.click();
            }

            panels[p].setAttribute('hidden', 'hidden');
        };
    };

    // Determine whether there should be a delay
    // when user navigates with the arrow keys
    function determineDelay() {

        // Needed here because prototype 1 and 2 are not tabs
        if (typeof(tablist) == "undefined") {

            return 300;
        }

        var hasDelay = tablist.hasAttribute('data-delay');

        var delay = 0;

        if (hasDelay) {
            var delayValue = tablist.getAttribute('data-delay');
            if (delayValue) {
                delay = delayValue;
            }
            else {
                // If no value is specified, default to 300ms
                delay = 300;
            };
        };

        return delay;
    };
}
//

function chooseGallery(gallery) {
    if (gallery.querySelector(".auto")){
        tabsGallery(gallery);
    }
    else{
        manualGallery(gallery);
    }
}

galleries.forEach( gallery => chooseGallery(gallery));
