
var links = [].slice.apply(document.getElementsByTagName('a'));
links = links.map(function (element) {
    // Return an anchor's href attribute, stripping any URL fragment (hash '#').
    // If the html specifies a relative path, chrome converts it to an absolute
    // URL.
    var href = element.href;
    var hashIndex = href.indexOf('#');
    if (hashIndex >= 0) {
        href = href.substr(0, hashIndex);
    }
    return href;
});

links.sort();

// Remove duplicates and invalid URLs.
var kBadPrefix = 'javascript';
for (var i = 0; i < links.length;) {
    if (((i > 0) && (links[i] == links[i - 1])) ||
        (links[i] == '') ||
        (kBadPrefix == links[i].toLowerCase().substr(0, kBadPrefix.length))) {
        links.splice(i, 1);
    } else {
        ++i;
    }
}

chrome.extension.sendRequest(links);
