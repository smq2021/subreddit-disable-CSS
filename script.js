// ==UserScript==
// @name          Reddit Toggle Custom CSS (Greasemonkey 4+ Compatible)
// @description   Persistently disable/re-enable custom subreddit styles via a userscript command
// @author        smq2021
// @version       1.0.1
// @grant         GM.getValue
// @grant         GM.setValue
// @grant         GM.deleteValue
// @grant         GM.registerMenuCommand
// @namespace     https://github.com/smq2021/subreddit-disable-CSS
// @include       http://reddit.com/r/*
// @include       https://reddit.com/r/*
// @include       http://*.reddit.com/r/*
// @include       https://*.reddit.com/r/*
// @run-at        document-start
// ==/UserScript==

console.log('Reddit Toggle Custom CSS script loaded');

// Ensure the script runs only on subreddit pages
const subredditMatch = location.pathname.match(/\/r\/(\w+)/);
if (!subredditMatch) {
    console.log('Not on a subreddit page, exiting script');
    return; // Exit the script if not on a subreddit page
}

const CUSTOM_CSS = 'link[ref^="applied_subreddit_"]';
const DEFAULT_DISABLE_CSS = false;

const SUBREDDIT = subredditMatch[1];
console.log('Subreddit:', SUBREDDIT);

let DISABLE_CSS = DEFAULT_DISABLE_CSS;

// Function to toggle custom CSS
function toggle(customCss) {
    // Toggle the disable status
    const newDisableCss = !DISABLE_CSS;

    console.log('Toggling CSS. Previous state:', DISABLE_CSS, 'New state:', newDisableCss);

    customCss.disabled = newDisableCss;
    DISABLE_CSS = newDisableCss;

    // Save the new state
    if (newDisableCss === DEFAULT_DISABLE_CSS) {
        GM.deleteValue(SUBREDDIT).then(() => {
            console.log('CSS reset to default');
        });
    } else {
        GM.setValue(SUBREDDIT, newDisableCss).then(() => {
            console.log('CSS state saved as:', newDisableCss);
        });
    }
}

// Hide the page initially if CSS is disabled
const { style } = document.documentElement;

GM.getValue(SUBREDDIT, DEFAULT_DISABLE_CSS).then((value) => {
    DISABLE_CSS = value;

    if (DISABLE_CSS) {
        console.log('Disabling CSS and hiding the page initially');
        style.display = 'none'; // Hide the page
    }
});

// Wait until the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');

    const customCss = document.querySelector(CUSTOM_CSS);
    console.log('Custom CSS found:', customCss);

    // If the CSS is disabled, disable the stylesheet and unhide the page
    if (DISABLE_CSS) {
        if (customCss) {
            customCss.disabled = true;
            console.log('Custom CSS disabled');
        }

        style.removeProperty('display');
        console.log('Page display restored');
    }

    // Register the toggle menu if custom CSS exists
    if (customCss) {
        GM.registerMenuCommand('Toggle Custom CSS', () => toggle(customCss));
        console.log('Menu command registered');
    } else {
        console.log('No custom CSS found on this subreddit');
    }
});
