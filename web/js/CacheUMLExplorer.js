/**
 * UML class diagram visualization tool for InterSystems products.
 * @author ZitRo
 * @see http://zitros.tk
 * @param {HTMLElement} treeViewContainer
 * @param {HTMLElement} classViewContainer
 * @constructor
 */
var CacheUMLExplorer = function (treeViewContainer, classViewContainer) {

    this.elements = {
        className: document.getElementById("className"),
        treeViewContainer: treeViewContainer,
        classViewContainer: classViewContainer,
        zoomInButton: document.getElementById("button.zoomIn"),
        zoomOutButton: document.getElementById("button.zoomOut"),
        zoomNormalButton: document.getElementById("button.zoomNormal")
    };

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

    enableSVGDownload(this.classTree);

};