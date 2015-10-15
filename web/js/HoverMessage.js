var HoverMessage = function (text) {

    var self = this;

    this.element = document.createElement("div");
    this.element.className = "hoverMessage";
    this.element.textContent = text;
    this.container = document.createElement("div");
    this.container.className = "hoverContainer";
    this.container.appendChild(this.element);

    this.container.addEventListener("mouseout", function (event) {
        var e = event.toElement || event.relatedTarget;
        if (e.parentNode == this || e == this) return;
        self.detach();
    });

};

HoverMessage.prototype.attach = function (screenX, screenY) {

    var e = this.container,
        w = Math.min(400, window.innerWidth/2);
    document.body.appendChild(e);
    e.style.width = (w = Math.min(e.offsetWidth, window.innerWidth/2)) + "px";
    e.style.top = (screenY - e.offsetHeight + 15) + "px";
    e.style.left = Math.min(window.innerWidth - w - 10, screenX - w/2) + "px";

};

HoverMessage.prototype.detach = function () {

    if (!this.element.parentNode) return;

    this.container.parentNode.removeChild(this.container);

};