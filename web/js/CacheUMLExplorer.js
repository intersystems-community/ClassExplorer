/**
 * UML class diagram visualization tool for InterSystems products.
 * @author ZitRo
 * @see http://zitros.tk
 * @param {HTMLElement} treeViewContainer
 * @param {HTMLElement} classViewContainer
 * @constructor
 */
var CacheUMLExplorer = function (treeViewContainer, classViewContainer) {

    var id = function (e) { return document.getElementById(e); };

    this.elements = {
        uiBody: id("ui-body"),
        className: id("className"),
        treeViewContainer: treeViewContainer,
        classViewContainer: classViewContainer,
        zoomInButton: id("button.zoomIn"),
        zoomOutButton: id("button.zoomOut"),
        zoomNormalButton: id("button.zoomNormal"),
        helpButton: id("button.showHelp"),
        infoButton: id("button.showInfo"),
        methodCodeView: id("methodCodeView"),
        closeMethodCodeView: id("closeMethodCodeView"),
        methodLabel: id("methodLabel"),
        methodCode: id("methodCode"),
        classView: id("classView"),
        svgContainer: id("svgContainer"),
        methodDescription: id("methodDescription"),
        methodViewBounds: id("methodViewBounds"),
        namespaces: id("namespaces"),
        classTreeSearch: id("classTreeSearch"),
        searchBlock: id("searchBlock")
    };

    this.UI = new UI(this);
    this.source = new Source(this);
    this.classTree = new ClassTree(this, treeViewContainer);
    this.classView = new ClassView(this, classViewContainer);
    this.NAMESPACE = null;

    this.init();

};

/**
 * Render namespaces.
 * @param nsData
 */
CacheUMLExplorer.prototype.updateNamespaces = function (nsData) {

    var ns, e;

    this.NAMESPACE = nsData["currentNamespace"];
    this.elements.namespaces.textContent = "";

    for (ns in nsData.namespaces || {}) {
        e = document.createElement("option");
        e.setAttribute("value", ns);
        e.textContent = ns;
        if (ns === nsData.currentNamespace) e.setAttribute("selected", "");
        this.elements.namespaces.appendChild(e);
    }

};

/**
 * @param {string} namespace
 */
CacheUMLExplorer.prototype.setNamespace = function (namespace) {

    var self = this;

    this.NAMESPACE = namespace;

    self.classTree.container.textContent = "";
    self.classTree.showLoader();
    this.source.getClassTree(function (err, data) {
        if (!err) self.classTree.updateTree(data);
    });

};

CacheUMLExplorer.prototype.updateURL = function () {

    var obj = {
        name: this.classTree.SELECTED_NAME,
        type: this.classTree.SELECTED_TYPE
    };

    if (this.NAMESPACE) obj["namespace"] = this.NAMESPACE;

    location.hash = JSON.stringify(obj);

};

CacheUMLExplorer.prototype.restoreFromURL = function () {

    var hash = (location.hash || "").substr(1),
        obj;

    try { obj = JSON.parse(hash); } catch (e) { obj = {}; }

    if (obj.namespace) this.NAMESPACE = obj.namespace;
    if (obj.type === "class") {
        this.classView.loadClass(obj.name);
    } else if (obj.type === "package") {
        this.classView.loadPackage(obj.name);
    } else {
        this.classView.renderInfoGraphic();
    }

    return obj;

};

CacheUMLExplorer.prototype.init = function () {

    var self = this,
        restored;

    restored = this.restoreFromURL();
    this.classTree.showLoader();
    this.source.getClassTree(function (err, data) {
        if (!err) self.classTree.updateTree(data);
    });
    this.source.getNamespacesInfo(function (err, data) {
        if (restored && restored.namespace) data.currentNamespace = restored.namespace;
        if (!err) self.updateNamespaces(data);
    });

    this.elements.infoButton.addEventListener("click", function () {
        self.UI.displayMessage(
            "Cach&eacute; UML explorer v"
            + "[NOT-BUILT]"/*build.replace:"pkg.version"*/
            + "<br/>for InterSystems Cach&eacute;"
            + "<br/>By Nikita Savchenko"
            + "<br/><a target=\"_blank\" href=\"https://github.com/intersystems-ru/UMLExplorer\">"
            + "Project page</a> / <a target=\"_blank\" "
            + "href=\"https://github.com/intersystems-ru/UMLExplorer/issues\">Bug tracker</a>"
            + "<br/><br/>Enjoy!"
        );
    });
    this.elements.namespaces.addEventListener("change", function (e) {
        var el = e.target || e.srcElement,
            ns = el.options[el.selectedIndex].value;
        if (ns !== self.NAMESPACE) {
            self.setNamespace(ns);
        }
    });

    enableSVGDownload(this.classTree);

};