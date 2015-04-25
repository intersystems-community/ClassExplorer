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

    var self = this;

    this.classTree.showLoader();
    this.source.getClassTree(function (err, data) {
        if (!err) self.classTree.updateTree(data);
    });

};