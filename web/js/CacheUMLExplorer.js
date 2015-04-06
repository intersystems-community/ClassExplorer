/**
 * UML class diagram visualization tool for InterSystems products.
 * @author ZitRo
 * @see http://zitros.tk
 * @param {HTMLElement} treeViewContainer
 * @constructor
 */
var CacheUMLExplorer = function (treeViewContainer) {

    this.source = new Source();
    this.classTree = new ClassTree(treeViewContainer);

    this.init();

};

CacheUMLExplorer.prototype.init = function () {

    var self = this;

    this.source.getClassTree(function (err, data) {
        if (!err) self.classTree.updateTree(data);
    });

};