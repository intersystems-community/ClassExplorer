/**
 * Class tree representation.
 * @param {CacheUMLExplorer} parent
 * @param {HTMLElement} treeViewContainer
 * @constructor
 */
var ClassTree = function (parent, treeViewContainer) {

    var self = this;

    this.cacheUMLExplorer = parent;
    this.container = treeViewContainer;
    this.loader = null;
    this.SELECTED_NAME = null;
    this.SELECTED_TYPE = null; // "class" || "package"
    this.SELECTED_ELEMENT = null;
    this.treeObject = null;

    this.cacheUMLExplorer.elements.classTreeSearch.addEventListener("input", function (e) {
        self.searchChanged.call(self, (e.target || e.srcElement).value);
    });

    window.addEventListener("resize", function () {
        self.updateSizes();
    });

    this.updateSizes();

};

ClassTree.prototype.updateSizes = function () {

    var dh = this.cacheUMLExplorer.elements.searchBlock.clientHeight,
        h = window.innerHeight - dh,
        b = this.cacheUMLExplorer.elements.treeViewContainer;

    b.style.paddingTop = 0;
    b.style.marginTop = dh + "px";
    b.style.height = h + "px";

};

ClassTree.prototype.showLoader = function () {

    if (this.loader) return;

    this.cacheUMLExplorer.elements.classTreeSearch.value = "";
    this.treeObject = null;
    this.loader = document.createElement("div");
    this.loader.className = "spinner";
    this.container.appendChild(this.loader);

};

ClassTree.prototype.removeLoader = function () {

    if (!this.loader) return;

    this.cacheUMLExplorer.elements.classTreeSearch.value = "";
    this.loader.parentNode.removeChild(this.loader);
    this.loader = null;

};

ClassTree.prototype.classSelected = function (element, className) {

    if (element !== this.SELECTED_ELEMENT) {
        if (this.SELECTED_ELEMENT) this.SELECTED_ELEMENT.classList.remove("selected");
        this.SELECTED_ELEMENT = element;
    }

    if (!element.classList.contains("selected")) {
        element.classList.add("selected");
        this.cacheUMLExplorer.classView.loadClass(className);
    }

};

ClassTree.prototype.packageSelected = function (element, packageName) {

    if (element !== this.SELECTED_ELEMENT) {
        if (this.SELECTED_ELEMENT) this.SELECTED_ELEMENT.classList.remove("selected");
        this.SELECTED_ELEMENT = element;
    }

    if (!element.classList.contains("selected")) {
        element.classList.add("selected");
        this.cacheUMLExplorer.classView.loadPackage(packageName);
    }

};

ClassTree.prototype.searchChanged = function (query) {

    var o = this.treeObject;

    if (!o) return;
    query = query.toLowerCase();

    var searchClone = function (o, copyFlag) {
        var i, matches = 0, lm, t, clone = {}, cpf;
        for (i in o) {
            lm = 0; cpf = false;
            if (i.toLowerCase().indexOf(query) !== -1) { lm += 1; matches++; cpf = true; }
            if (typeof o[i] === "object") {
                lm += (t = searchClone(o[i], cpf)).matches;
                matches += t.matches;
            } else t = { obj: o[i] };
            if (copyFlag || lm !== 0) clone[i] = t.obj;
        }
        return { matches: matches, obj: clone };
    };

    this.updateTree(searchClone(o).obj || {}, true);

};

/**
 * @param treeObject
 * @param {boolean} [doNotChangeRoot] - Determines to restrict assign of this.treeObject.
 */
ClassTree.prototype.updateTree = function (treeObject, doNotChangeRoot) {

    var self = this,
        div = function () { return document.createElement("div");},
        selectedClassElement = this.SELECTED_NAME ? this.SELECTED_NAME.split(".") : [],
        sce = 0; // selectedClassElement level index

    this.removeLoader();
    this.container.textContent = "";

    var packageClick = function (e) {

        var el = e.target || e.srcElement;

        if (el.className.match(/minimized/)) {
            el.className = el.className.replace(/\s+?minimized/, "");
        } else {
            el.className += " minimized";
        }

    };

    var classClick = function (e) {

        var el = e.target || e.srcElement;

        self.classSelected(el, el.CLASS_NAME);

    };

    var append = function (rootElement, elementName, isPackage, path, level) {

        var sel = selectedClassElement.length
                && sce === level && selectedClassElement[sce] === elementName ? ++sce : null,
            el1 = div(),
            el2, el3, el4;

        if (isPackage) {
            el1.className = "tv-package";
            (el2 = div()).className = "tv-package-name" + (sel ? "" : " minimized");
            el2.textContent = elementName;
            if (sel && sce === selectedClassElement.length) {
                el2.className += " selected";
                self.SELECTED_ELEMENT = el2;
            }
            (el3 = div()).className = "tv-package-content";
            el1.appendChild(el2); el1.appendChild(el3);
            el2.addEventListener("click", packageClick);
            el2.appendChild(el4 = div());
            el4.className = "tv-rightListIcon icon list";
            el4.addEventListener("click", function () {
                self.packageSelected(el2, (path ? path + "." : path) + elementName);
            });
        } else {
            if (sel) self.SELECTED_ELEMENT = el1;
            el1.className = "tv-class-name" + (sel ? " selected" : "");
            el1.textContent = elementName;
            el1.addEventListener("click", classClick);
            el1.CLASS_NAME = path + (path ? "." : "") + elementName;
        }

        rootElement.appendChild(el1);

        return el3 ? el3 : null;

    };

    var build = function (rootElement, object, path, level) {

        var i, element, rec,
            arr = [];

        for (i in object) {
            arr.push({ name: i, val: object[i] });
        }

        arr.sort(function (a, b) {
            if (typeof a.val !== typeof b.val) return typeof a.val === "object" ? -1 : 1;
            return a.name > b.name ? 1 : -1;
        });

        for (i in arr) {
            element = arr[i];
            if (rec = append(
                    rootElement,
                    element.name,
                    typeof element.val === "object",
                    path.join("."),
                    level
                )) {
                build(rec, element.val, path.concat([element.name]), level + 1);
            }
        }

    };

    build(this.container, treeObject, [], 0);

    if (!doNotChangeRoot) this.treeObject = treeObject;

};