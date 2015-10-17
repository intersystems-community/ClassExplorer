var HoverMessage = function (text, clickHandler) {

    var self = this;

    this.clickHandler = typeof clickHandler === "function" ? clickHandler : function () {};
    this.element = document.createElement("div");
    this.element.className = "hoverMessage";
    this.element.innerHTML = text;
    this.container = document.createElement("div");
    this.container.className = "hoverContainer";
    this.container.appendChild(this.element);

    this.container.addEventListener("mouseout", function (event) {
        var e = event.toElement || event.relatedTarget;
        if (e && ((function check (e, t) { // if one of the parents is this object
                if (e === t) return true;
                if (!e.parentNode) return false;
                return check(e.parentNode, t);
            })(e, this))) return;
        self.detach();
    });
    this.container.addEventListener("click", function () {
        self.clickHandler();
    });

};

HoverMessage.prototype.attach = function (screenX, screenY) {

    var e = this.container, w;

    document.body.appendChild(e);
    e.style.width = (w = Math.min(e.offsetWidth, window.innerWidth/2)) + "px";
    e.style.top = (screenY - e.offsetHeight + 15) + "px";
    e.style.left = Math.min(window.innerWidth - w - 10, screenX - w/2) + "px";

};

HoverMessage.prototype.detach = function () {

    if (!this.element.parentNode) return;

    this.container.parentNode.removeChild(this.container);

};