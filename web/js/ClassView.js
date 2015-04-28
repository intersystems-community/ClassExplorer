/**
 * Visualization for classes.
 * @constructor
 */
var ClassView = function (parent, container) {

    this.container = container;
    this.cacheUMLExplorer = parent;

    this.graph = null;
    this.paper = null;
    this.loader = null;

    this.links = [];
    this.objects = [];

    this.PAPER_SCALE = 1;
    this.MIN_PAPER_SCALE = 0.2;
    this.MAX_PAPER_SCALE = 4;

    this.CLASS_DOC_PATH = "/csp/documatic/%25CSP.Documatic.cls";

    this.init();

};

ClassView.prototype.showLoader = function (html) {

    var d2;

    if (this.loader) this.removeLoader();

    this.resetView();

    this.loader = document.createElement("div");

    if (html) {
        this.loader.appendChild(d2 = document.createElement("div"));
        d2.innerHTML = html;
        this.loader.className = "centralText";
    } else {
        this.loader.className = "spinner";
    }
    this.container.appendChild(this.loader);

};

ClassView.prototype.removeLoader = function () {

    if (!this.loader) return;
    this.loader.parentNode.removeChild(this.loader);
    this.loader = null;

};

ClassView.prototype.resetView = function () {

    this.links = [];
    this.objects = [];
    this.paper.setOrigin(0, 0);
    this.graph.clear();

};

ClassView.prototype.openClassDoc = function (className, nameSpace) {

    window.open(
        this.CLASS_DOC_PATH + "?LIBRARY=" + encodeURIComponent(nameSpace)
            + "&CLASSNAME=" + encodeURIComponent(className),
        "_blank"
    );

};

/**
 * @param {string} name
 * @param classMetaData
 * @returns {joint.shapes.uml.Class}
 */
ClassView.prototype.createClassInstance = function (name, classMetaData) {

    var attrArr, methArr, nameArr,
        classParams = classMetaData["parameters"],
        classProps = classMetaData["properties"],
        classMethods = classMetaData["methods"],
        self = this;

    var insertString = function (array, string, extraString) {
        string.match(/.{1,44}/g).forEach(function (p) {
            array.push(p + (extraString ? extraString : ""));
        });
    };

    return new joint.shapes.uml.Class({
        name: nameArr = (classMetaData["ABSTRACT"] ? ["<<Abstract>>", name] : [name]),
        attributes: attrArr = (function (params, ps) {
            var arr = [], n;
            for (n in params) {
                insertString(arr, n + (params[n]["type"] ? ": " + params[n]["type"] : ""));
            }
            for (n in ps) {
                insertString(
                    arr,
                    (ps[n]["private"] ? "- " : "+ ") + n
                        + (ps[n]["type"] ? ": " + ps[n]["type"] : "")
                );
            }
            return arr;
        })(classParams, classProps),
        methods: methArr = (function (met) {
            var arr = [], n;
            for (n in met) {
                insertString(
                    arr,
                    (met[n]["private"] ? "- " : "+ ") + n
                        + (met[n]["returns"] ? ": " + met[n]["returns"] : ""),
                    (met[n]["classMethod"] ?
                        "\x1b" + JSON.stringify({STYLES:{
                            textDecoration: "underline"
                        }}) : "")
                );
            }
            return arr;
        })(classMethods),
        directProps: {
            nameClickHandler: function () {
                self.openClassDoc(name, classMetaData["NAMESPACE"]);
            }
        },
        size: {
            width: 300,
            height: Math.max(nameArr.length*12.1, 0) + Math.max(attrArr.length*12.1, 0)
                + Math.max(methArr.length*12.1, 0) + 30
        }
    });

};

ClassView.prototype.render = function (data) {

    var p, pp, className, classInstance,
        uml = joint.shapes.uml, relFrom, relTo,
        classes = {}, connector;

    if (!data["classes"]) {
        console.error("Wrong data: no 'classes' property.", data);
        return;
    }

    for (className in data["classes"]) {
        classInstance = this.createClassInstance(className, data["classes"][className]);
        this.objects.push(classInstance);
        classes[className] = {
            instance: classInstance
        };

        this.graph.addCell(classInstance);

    }

    for (p in data["inheritance"]) {
        relFrom = (classes[p] || {}).instance;
        for (pp in data["inheritance"][p]) {
            relTo = (classes[pp] || {}).instance;
            if (relFrom && relTo) {
                this.graph.addCell(connector = new uml.Generalization({
                    source: { id: relFrom.id },
                    target: { id: relTo.id },
                    router: { name: "manhattan" },
                    connector: { name: "rounded" }
                }));
                this.links.push(connector);
            }
        }
    }

    for (p in data["aggregation"]) {
        relTo = (classes[p] || {}).instance;
        for (pp in data["aggregation"][p]) {
            relFrom = (classes[pp] || {}).instance;
            if (relFrom && relTo) {
                this.graph.addCell(connector = new uml.Aggregation({
                    source: { id: relFrom.id },
                    target: { id: relTo.id },
                    router: { name: "manhattan" },
                    connector: { name: "rounded" }
                }));
                this.links.push(connector);
            }
        }
    }

    joint.layout.DirectedGraph.layout(this.graph, {
        setLinkVertices: false,
        nodeSep: 100,
        rankSep: 100
    });

    this.updateSizes();

    for (var i in this.links) {
        this.paper.findViewByModel(this.links[i]).update();
    }

    var bb = this.paper.getContentBBox(), q = this.paper;
    this.paper.setOrigin(
        q.options.width/2 - bb.width/2,
        q.options.height/2 - Math.min(q.options.height/2 - 100, bb.height/2)
    );

};

ClassView.prototype.loadClass = function (className) {

    var self = this;

    this.showLoader();
    this.cacheUMLExplorer.source.getClassView(className, function (err, data) {
        //console.log(data);
        self.removeLoader();
        if (err) {
            self.showLoader("Unable to get " + self.cacheUMLExplorer.classTree.SELECTED_CLASS_NAME);
            console.error.call(console, err);
        } else {
            self.cacheUMLExplorer.classView.render(data);
        }
    });

    this.cacheUMLExplorer.elements.className.textContent = className;
    location.hash = "class:" + className;

};

ClassView.prototype.loadPackage = function (packageName) {

    var self = this;

    this.showLoader();
    this.cacheUMLExplorer.source.getPackageView(packageName, function (err, data) {
        //console.log(data);
        self.removeLoader();
        if (err) {
            self.showLoader("Unable to get package " + packageName);
            console.error.call(console, err);
        } else {
            self.cacheUMLExplorer.classView.render(data);
        }
    });

    this.cacheUMLExplorer.elements.className.textContent = packageName;
    location.hash = "package:" + packageName;

};

ClassView.prototype.updateSizes = function () {
    this.paper.setDimensions(this.container.offsetWidth, this.container.offsetHeight);
};

/**
 * Scale view according to delta.
 *
 * @param {number|string} delta
 */
ClassView.prototype.zoom = function (delta) {

    var scaleOld = this.PAPER_SCALE, scaleDelta;
    var sw = this.cacheUMLExplorer.elements.classViewContainer.offsetWidth,
        sh = this.cacheUMLExplorer.elements.classViewContainer.offsetHeight,
        side = delta > 0 ? 1 : -1,
        ox = this.paper.options.origin.x,
        oy = this.paper.options.origin.y;
    if (typeof delta === "number") {
        this.PAPER_SCALE += delta * Math.min(
            0.3,
            Math.abs(this.PAPER_SCALE - (delta < 0 ? this.MIN_PAPER_SCALE : this.MAX_PAPER_SCALE))/2
        );
    } else { this.PAPER_SCALE = 1; }
    this.paper.scale(this.PAPER_SCALE, this.PAPER_SCALE);
    scaleDelta = side *
        (side > 0 ? this.PAPER_SCALE / scaleOld - 1 : (scaleOld - this.PAPER_SCALE) / scaleOld);
    this.paper.setOrigin(
        ox - (sw/2 - ox)*scaleDelta,
        oy - (sh/2 - oy)*scaleDelta
    );

};

ClassView.prototype.init = function () {

    var p, self = this,
        relP = { x: 0, y: 0, trigger: false };

    this.graph = new joint.dia.Graph;

    this.paper = new joint.dia.Paper({
        el: this.container,
        width: this.container.offsetWidth,
        height: this.container.offsetHeight,
        gridSize: 20,
        model: this.graph,
        origin: {
            x: 0,
            y: 0
        }
    });

    // enables links re-routing when dragging objects
    this.graph.on("change:position", function (object) {
        if (_.contains(self.objects, object))
            for (p in self.links) {
                self.paper.findViewByModel(self.links[p]).update();
            }
    });

    this.paper.on("blank:pointerdown", function (e) {
        relP.x = e.pageX; relP.y = e.pageY; relP.trigger = true;
    });

    this.paper.on("blank:pointerup", function (e) {
        if (!relP.trigger) return;
        self.paper.setOrigin(
            self.paper.options.origin.x + e.pageX - relP.x,
            self.paper.options.origin.y + e.pageY - relP.y
        );
        relP.trigger = false;
    });

    window.addEventListener("resize", function () {
        self.updateSizes();
    });

    var moveHandler = function (e) {
        if (!relP.trigger) return;
        self.paper.setOrigin(
            self.paper.options.origin.x + e.pageX - relP.x,
            self.paper.options.origin.y + e.pageY - relP.y
        );
        relP.x = e.pageX; relP.y = e.pageY;
    };

    this.cacheUMLExplorer.elements.classViewContainer.addEventListener("mousemove", moveHandler);
    this.cacheUMLExplorer.elements.classViewContainer.addEventListener("touchmove", moveHandler);
    this.cacheUMLExplorer.elements.classViewContainer.addEventListener("mousewheel", function (e) {
        self.zoom(Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))));
    });
    this.cacheUMLExplorer.elements.zoomInButton.addEventListener("click", function () {
        self.zoom(1);
    });
    this.cacheUMLExplorer.elements.zoomOutButton.addEventListener("click", function () {
        self.zoom(-1);
    });
    this.cacheUMLExplorer.elements.zoomNormalButton.addEventListener("click", function () {
        self.zoom(null);
    });

};