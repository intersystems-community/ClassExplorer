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
    this.MAX_PAPER_SCALE = 5;

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

/**
 * @param {string} name
 * @param classMetaData
 * @returns {joint.shapes.uml.Class}
 */
ClassView.prototype.createClassInstance = function (name, classMetaData) {

    var attrArr, methArr,
        classParams = classMetaData["parameters"],
        classProps = classMetaData["properties"],
        classMethods = classMetaData["methods"];

    var insertString = function (array, string) {
        string.match(/.{1,44}/g).forEach(function (p) {
            array.push(p);
        });
    };

    return new joint.shapes.uml.Class({
        name: name,
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
        methods: methArr = (function (ps) {
            var arr = [], n;
            for (n in ps) {
                insertString(arr, "+ " + n + (ps[n]["returns"] ? ": " + ps[n]["returns"] : ""));
            }
            return arr;
        })(classMethods),
        size: {
            width: 300,
            height: Math.max(attrArr.length*12.1, 15) + Math.max(methArr.length*12.1, 15) + 40
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

    joint.layout.DirectedGraph.layout(this.graph, {
        setLinkVertices: false,
        nodeSep: 100,
        rankSep: 100
    });

    this.updateSizes();

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
    if (typeof delta === "number") {
        this.PAPER_SCALE += delta *Math.min(
                0.5,
                Math.abs(this.PAPER_SCALE - (delta < 0 ? this.MIN_PAPER_SCALE : this.MAX_PAPER_SCALE))/2
            );
    } else {
        this.PAPER_SCALE = 1;
    }
    this.paper.scale(this.PAPER_SCALE, this.PAPER_SCALE);
    scaleDelta = this.PAPER_SCALE - scaleOld;
    this.paper.setOrigin(
        this.paper.options.origin.x
            - scaleDelta*this.cacheUMLExplorer.elements.classViewContainer.offsetWidth/2,
        this.paper.options.origin.y
            - scaleDelta*this.cacheUMLExplorer.elements.classViewContainer.offsetHeight/2
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
        gridSize: 30,
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

    //var classes = {
    //
    //    mammal: new uml.Interface({
    //        position: { x:300  , y: 50 },
    //        size: { width: 240, height: 100 },
    //        name: 'Mammal',
    //        attributes: ['dob: Date'],
    //        methods: ['+ setDateOfBirth(dob: Date): Void','+ getAgeAsDays(): Numeric']
    //    }),
    //
    //    person: new uml.Abstract({
    //        position: { x:300  , y: 300 },
    //        size: { width: 240, height: 100 },
    //        name: 'Person',
    //        attributes: ['firstName: String','lastName: String'],
    //        methods: ['+ setName(first: String, last: String): Void','+ getName(): String']
    //    }),
    //
    //    bloodgroup: new uml.Class({
    //        position: { x:20  , y: 190 },
    //        size: { width: 220, height: 100 },
    //        name: 'BloodGroup',
    //        attributes: ['bloodGroup: String'],
    //        methods: ['+ isCompatible(bG: String): Boolean']
    //    }),
    //
    //    address: new uml.Class({
    //        position: { x:630  , y: 190 },
    //        size: { width: 160, height: 100 },
    //        name: 'Address',
    //        attributes: ['houseNumber: Integer','streetName: String','town: String','postcode: String'],
    //        methods: []
    //    }),
    //
    //    man: new uml.Class({
    //        position: { x:200  , y: 500 },
    //        size: { width: 180, height: 50 },
    //        name: 'Man'
    //    }),
    //
    //    woman: new uml.Class({
    //        position: { x:450  , y: 500 },
    //        size: { width: 180, height: 50 },
    //        name: 'Woman',
    //        methods: ['+ giveABrith(): Person []']
    //    })
    //
    //
    //};
    //
    //_.each(classes, function(c) { graph.addCell(c); });
    //
    //var relations = [
    //    new uml.Generalization({
    //        source: { id: classes.man.id },
    //        target: { id: classes.person.id },
    //        router: { name: 'manhattan' },
    //        connector: { name: 'rounded' }
    //    }),
    //    new uml.Generalization({ source: { id: classes.woman.id }, target: { id: classes.person.id }}),
    //    new uml.Implementation({ source: { id: classes.person.id }, target: { id: classes.mammal.id }}),
    //    new uml.Aggregation({ source: { id: classes.person.id }, target: { id: classes.address.id }}),
    //    new uml.Composition({ source: { id: classes.person.id }, target: { id: classes.bloodgroup.id }})
    //];
    //
    //_.each(relations, function(r) { graph.addCell(r); });

};