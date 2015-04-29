/**
 * User interface functions.
 * @param {CacheUMLExplorer} cacheUMLExplorer
 * @constructor
 */
var UI = function (cacheUMLExplorer) {

    this.cacheUMLExplorer = cacheUMLExplorer;
    this.BODY = cacheUMLExplorer.elements.uiBody;

    /**
     * @type {HTMLElement}
     * @private
     */
    this.messageElement = null;

};

/**
 * Display hovering message.
 *
 * @param {string} text
 * @param {boolean} [removeByClick] - Define whether user be able to remove message by clicking on
 *                                    it.
 */
UI.prototype.displayMessage = function (text, removeByClick) {

    this.removeMessage();

    var self = this,
        d1 = document.createElement("div"),
        d2 = document.createElement("div"),
        d3 = document.createElement("div");

    d1.className = "central message";
    d1.style.opacity = 0;
    d3.innerHTML = text;
    d2.appendChild(d3);
    d1.appendChild(d2);
    this.BODY.appendChild(d1);
    this.messageElement = d1;
    setTimeout(function () { if (d1) d1.style.opacity = 1; }, 25);
    if (removeByClick === undefined || removeByClick) d1.addEventListener("click", function () {
        self.removeMessage();
    });

};

UI.prototype.removeMessage = function () {

    if (this.messageElement) {
        this.messageElement.parentNode.removeChild(this.messageElement);
        this.messageElement = null;
    }

};