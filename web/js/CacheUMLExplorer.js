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
        infoButton: id("button.showInfo")
    };

    this.UI = new UI(this);
    this.source = new Source();
    this.classTree = new ClassTree(this, treeViewContainer);
    this.classView = new ClassView(this, classViewContainer);

    this.init();

};

CacheUMLExplorer.prototype.init = function () {

    var self = this,
        hash = location.hash;

    this.classTree.showLoader();
    this.source.getClassTree(function (err, data) {
        if (!err) self.classTree.updateTree(data);
    });

    if (hash) {
        if (hash.indexOf("class:") === 1) {
            this.classView.loadClass(hash.substr(7));
        } else if (hash.indexOf("package:") === 1) {
            this.classView.loadPackage(hash.substr(9));
        }
    }

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

    enableSVGDownload(this.classTree);

};