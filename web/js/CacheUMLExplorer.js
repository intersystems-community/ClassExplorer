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
        classViewContainer: classViewContainer
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