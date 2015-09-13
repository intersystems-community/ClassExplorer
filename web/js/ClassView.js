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
    this.logic = new Logic(parent);

    this.links = [];
    this.objects = [];

    this.PAPER_SCALE = 1;
    this.MIN_PAPER_SCALE = 0.2;
    this.MAX_PAPER_SCALE = 4;

    this.CLASS_DOC_PATH = "/csp/documatic/%25CSP.Documatic.cls";
    this.SYMBOL_12_WIDTH = 6.6;

    this.HIGHLIGHTED_VIEW = null;
    this.SEARCH_INDEX = 0;

    this.init();

};

ClassView.prototype.highlightElement = function (jointElement) {

    if (this.HIGHLIGHTED_VIEW || (!jointElement && this.HIGHLIGHTED_VIEW)) {
        this.HIGHLIGHTED_VIEW.unhighlight();
        this.HIGHLIGHTED_VIEW = null;
    }

    if (!jointElement) return;
    var view = this.paper.findViewByModel(jointElement);
    if (!view) return;

    view.highlight();
    this.HIGHLIGHTED_VIEW = view;

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
    this.HIGHLIGHTED_VIEW = null;
    this.SEARCH_INDEX = 0;
    this.cacheUMLExplorer.elements.diagramSearch.value = "";

};

ClassView.prototype.openClassDoc = function (className, nameSpace) {

    window.open(
        this.CLASS_DOC_PATH + "?LIBRARY=" + encodeURIComponent(nameSpace)
            + "&CLASSNAME=" + encodeURIComponent(className),
        "_blank"
    );

};

/**
 * Render help info
 */
ClassView.prototype.renderInfoGraphic = function () {

    this.cacheUMLExplorer.classTree.SELECTED_NAME =
        this.cacheUMLExplorer.elements.className.textContent =
            "Welcome to Caché UML explorer!";

    location.hash = "{\"type\":\"help\"}";

    this.showLoader();
    this.render({
        basePackageName: "Welcome to Caché UML explorer!",
        classes: {
            "Shared object": {
                super: "Super object",
                classType: "Serial",
                parameters: {
                    "Also inherit Super object": {}
                },
                methods: {},
                properties: {}
            },
            "Class name": {
                super: "Super object",
                ABSTRACT: 1,
                FINAL: 1,
                HIDDEN: 1,
                NAMESPACE: "SAMPLES",
                PROCEDUREBLOCK: 0,
                SYSTEM: 4,
                methods: {
                    "Abstract public method": {
                        abstract: 1
                    },
                    "Class method": {
                        classMethod: 1
                    },
                    "Client method": {
                        clientMethod: 1
                    },
                    "Final method": {
                        final: 1
                    },
                    "Not inheritable method": {
                        notInheritable: 1
                    },
                    "Private method": {
                        private: 1
                    },
                    "Sql procedure": {
                        sqlProc: 1
                    },
                    "Web method": {
                        webMethod: 1
                    },
                    "ZEN method": {
                        zenMethod: 1
                    },
                    "Method": {
                        returns: "%ReturnType"
                    }
                },
                parameters: {
                    "PARAMETER WITHOUT TYPE": {},
                    "PARAMETER": {
                        type: "Type"
                    }
                },
                properties: {
                    "Public property name": {
                        private: 0
                    },
                    "Private property name": {
                        private: 1
                    },
                    "Public read-only property": {
                        private: 0,
                        readOnly: 1
                    },
                    "Property": {
                        type: "Type of property"
                    },
                    "Other object": {
                        private: 0,
                        type: "Any other object"
                    },
                    "Another object": {
                        private: 1,
                        type: "Not shared object"
                    }
                }
            },
            "Super object": {
                classType: "Persistent",
                methods: {},
                properties: {},
                parameters: {
                    "(This class is %Persistent)": {}
                }
            },
            "HELP": {
                parameters: {
                    "See the basics here!": {}
                }
            },
            "Registered class": {
                $classType: "Registered"
            },
            "Persistent class (one)": {
                $classType: "Persistent"
            },
            "Serial class": {
                $classType: "Serial"
            },
            "DataType class (many)": {
                $classType: "DataType"
            },
            "Associated object": {
                properties: {
                    "Association": {
                        type: "Class name"
                    }
                }
            }
        },
        association: {
            "Registered class": {
                "Serial class": {}
            },
            "Serial class": {
                "Persistent class (one)": {}
            },
            "DataType class (many)": {
                "Registered class": {}
            }
        },
        aggregation: {
            "Persistent class (one)": {
                "DataType class (many)": {
                    left: "*",
                    right: 1
                }
            }
        },
        composition: {},
        //aggregation: {
        //    "Class name": {
        //        "Shared object": "1..1"
        //    }
        //},
        inheritance: {
            "Class name": { "Super object": 1 },
            "Shared object": { "Super object": 1 }
        },
        restrictPackage: 1
    });

    this.removeLoader();

};

/**
 * Filter some inherits.
 *
 * @param data
 */
ClassView.prototype.filterInherits = function (data) {

    if (!data || !data.inheritance) return;

    var p1, p2, toFilter = ["inheritance", "composition", "aggregation"], filter = {
        "%Library.Persistent": true,
        "%Persistent": true,
        "%Library.SerialObject": true,
        "%SerialObject": true,
        "%Library.RegisteredObject": true,
        "%RegisteredObject": true,
        "%Library.DataType": true,
        "%DataType": true
    };

    // inheritance: { "ClassName": { "IHCN": 1, ... }, ... }
    // inherit isDataType & classType if not set for inherited classes
    //var rec = function (className) {
    //    if (!(cls = data.classes[className])) return { isDataType: null, classType: null };
    //    var c, res = { isDataType: cls.isDataType || null, classType: cls.classType || null}, resi, cls;
    //    if (className === "%DeepSee.ListingTable") console.log("-------", res);
    //    if (data.inheritance[className]) {
    //        for (c in data.inheritance[className]) {
    //            resi = undefined;
    //            if (data.classes[c]) {
    //                if (data.classes[c].isDataType) resi = {
    //                    isDataType: data.classes[c].isDataType,
    //                    classType: data.classes[c].classType || null
    //                }; else if (data.classes[c].classType) {
    //                    res.classType = data.classes[c].classType;
    //                }
    //            }
    //            if (!resi) resi = rec(c);
    //            if (className === "Aviation.Cubes.Aircraft.Listing") console.log(c, resi);
    //            if (res.isDataType === null) { res.isDataType = resi.isDataType; }
    //            if (res.classType === null) { res.classType = resi.classType; }
    //        }
    //    }
    //    if (res.isDataType !== null && !cls.isDataType) { cls.isDataType = res.isDataType; }
    //    if (res.classType !== null && !cls.classType) { cls.classType = res.classType; }
    //    return res;
    //};
    //for (p1 in data.classes) {
    //    rec(p1);
    //}

    var f = function (p) {
        return filter.hasOwnProperty(p) || (data.classes[p] || {})["isDataType"] ||
            lib.obj(((data.classes[p] || {}).super || "").split(",")).hasOwnProperty("%DataType");
    };

    if (this.cacheUMLExplorer.settings.showDataTypesOnDiagram)
        return;

    toFilter.forEach(function (p) {
        for (p1 in data[p]) { // classes
            for (p2 in data[p][p1]) { // inherits
                if (f(p2)) delete data[p][p1][p2];
            }
        }
    });

    for (p1 in data.classes) {
        if (f(p1)) delete data.classes[p1];
    }

};

/**
 * Returns array of signs to render or empry array.
 *
 * @param classMetaData
 */
ClassView.prototype.getClassSigns = function (classMetaData) {

    var signs = [], ct;

    // todo: preprocess class type before diagram load
    //if (classMetaData["classType"] || sup) {
    //    ct = classMetaData["classType"];
    //    if (sup.hasOwnProperty("%Library.Persistent") || sup.hasOwnProperty("%Persistent")) {
    //        ct = "Persistent";
    //    }
    //    if (sup.hasOwnProperty("%Library.SerialObject") || sup.hasOwnProperty("%SerialObject")) {
    //        ct = "Serial";
    //    }
    //    if (
    //            sup.hasOwnProperty("%Library.RegisteredObject")
    //            || sup.hasOwnProperty("%RegisteredObject")
    //        ) {
    //        ct = "Registered";
    //    }
    //    if (sup.hasOwnProperty("%Library.DataType") || sup.hasOwnProperty("%DataType")) {
    //        ct = "Datatype";
    //    }
    //    if (ct) {
    //        CT = ct;
    //        signs.push({
    //            icon: lib.image.greenPill,
    //            text: lib.capitalize(ct),
    //            textStyle: "fill:rgb(130,0,255)"
    //        });
    //    }
    //}
    if (ct = classMetaData["$classType"]) {
        if (ct !== "Serial" && ct !== "Registered" && ct !== "Persistent" && ct !== "DataType") {
            signs.push({
                icon: lib.image.greenPill,
                text: ct,
                textStyle: "fill:rgb(130,0,255)"
            });
        }
    }
    if (classMetaData["ABSTRACT"]) signs.push({
        icon: lib.image.crystalBall,
        text: "Abstract",
        textStyle: "fill:rgb(130,0,255)"
    });
    if (classMetaData["FINAL"]) signs.push({
        icon: lib.image.blueFlag,
        text: "Final",
        textStyle: "fill:rgb(130,0,255)"
    });
    if (classMetaData["SYSTEM"]) signs.push({
        icon: lib.image.chip,
        text: "System/" + classMetaData["SYSTEM"]
    });
    if (classMetaData["PROCEDUREBLOCK"] === 0) signs.push({
        icon: lib.image.moleculeCubeCross,
        text: "NotProcBlock"
    });
    if (classMetaData["HIDDEN"]) signs.push({
        icon: lib.image.ghost,
        text: "Hidden"
    });

    return signs;

};

/**
 * Returns array of icons according to method metadata.
 *
 * @param method
 */
ClassView.prototype.getMethodIcons = function (method) {

    var icons = [];

    icons.push({ src: lib.image[method["private"] ? "minus" : "plus"] });
    if (method["abstract"]) icons.push({ src: lib.image.crystalBall });
    if (method["clientMethod"]) icons.push({ src: lib.image.user });
    if (method["final"]) icons.push({ src: lib.image.blueFlag });
    if (method["notInheritable"]) icons.push({ src: lib.image.redFlag });
    if (method["sqlProc"]) icons.push({ src: lib.image.table });
    if (method["webMethod"]) icons.push({ src: lib.image.earth });
    if (method["zenMethod"]) icons.push({ src: lib.image.zed });
    if (method["readOnly"]) icons.push({ src: lib.image.eye });

    return icons;

};

/**
 * @param {string} name
 * @param classMetaData
 * @returns {joint.shapes.uml.Class}
 */
ClassView.prototype.createClassInstance = function (name, classMetaData) {

    var classParams = classMetaData["parameters"],
        classProps = classMetaData["properties"],
        classMethods = classMetaData["methods"],
        keyWordsArray = [name],
        self = this;

    var classInstance = new joint.shapes.uml.Class({
        name: [{
            text: name,
            clickHandler: function () {
                self.openClassDoc(name, classMetaData["NAMESPACE"]);
            },
            styles: {
                cursor: "help"
            }
        }],
        params: (function (params) {
            var arr = [], n;
            for (n in params) {
                keyWordsArray.push(n);
                arr.push({
                    text: n + (params[n]["type"] ? ": " + params[n]["type"] : "")
                });
            }
            return arr;
        })(classParams),
        attributes: (function (ps) {
            var arr = [], n;
            for (n in ps) {
                keyWordsArray.push(n);
                arr.push({
                    text: n + (ps[n]["type"] ? ": " + ps[n]["type"] : ""),
                    icons: self.getMethodIcons(ps[n])
                });
            }
            return arr;
        })(classProps),
        methods: (function (met) {
            var arr = [], n;
            for (n in met) {
                keyWordsArray.push(n);
                arr.push({
                    text: n + (met[n]["returns"] ? ": " + met[n]["returns"] : ""),
                    styles: (function (t) {
                        return t ? { textDecoration: "underline" } : {}
                    })(met[n]["classMethod"]),
                    clickHandler: (function (n) {
                        return function () { self.showMethodCode(name, n); }
                    })(n),
                    icons: self.getMethodIcons(met[n])
                });
            }
            return arr;
        })(classMethods),
        classSigns: this.getClassSigns(classMetaData),
        classType: classMetaData.$classType,
        SYMBOL_12_WIDTH: self.SYMBOL_12_WIDTH
    });

    classInstance.SEARCH_KEYWORDS = keyWordsArray.join(",").toLowerCase();
    this.objects.push(classInstance);
    this.graph.addCell(classInstance);

    return classInstance;

};

ClassView.prototype.showMethodCode = function (className, methodName) {

    var self = this,
        els = this.cacheUMLExplorer.elements;

    this.cacheUMLExplorer.source.getMethod(className, methodName, function (err, data) {
        if (err || data.error) {
            self.cacheUMLExplorer.UI.displayMessage("Unable to get method \"" + methodName + "\"!");
            return;
        }
        els.methodLabel.textContent = className + ": " + methodName + "("
            + (data["arguments"] || "").replace(/,/g, ", ").replace(/:/g, ": ") + ")"
            + (data["returns"] ? ": " + data["returns"] : "");
        els.methodDescription.innerHTML = data["description"] || "";
        els.methodCode.innerHTML = lib.highlightCOS(data["code"] || "");
        els.methodViewBounds.style.height =
            els.classView.offsetHeight - els.methodViewBounds.offsetTop + "px";
        els.methodCodeView.classList.add("active");
    });

};

ClassView.prototype.hideMethodCode = function () {

    this.cacheUMLExplorer.elements.methodCodeView.classList.remove("active");

};

ClassView.prototype.render = function (data) {

    var self = this,
        number = lib.countProperties(data["classes"]);

    this.logic.process(data);

    if (number < 30) {
        return self.confirmRender(data);
    }

    var c = document.createElement("div"),
        c1 = document.createElement("h3"),
        cS = document.createElement("h6"),
        c2 = document.createElement("div"),
        load = document.createElement("div"),
        lt = document.createElement("div"),
        spinner = document.createElement("div"),
        bOk = document.createElement("button"),
        bOff = document.createElement("button");

    c1.textContent = "Warning!";
    cS.textContent = "There are a huge number of classes to render (over " + (number - (number % 10))
        + " elements)"
        + (function(n){var s=n<40?".":"!",c=0; while (n>50) { s+="!"; n-=10+c++; } return s; })(number)
        + " Rendering may take a lot of time.";

    bOk.textContent = "Render this!";
    bOk.style.color = "red";
    bOff.textContent = "No, thanks";
    load.style.textAlign = "center";
    spinner.className = "spinner";
    lt.innerHTML = "<br/><br/><br/><br/>Rendering, please wait...";
    lt.style.textAlign = "center";

    bOk.addEventListener("click", function () {
        c.appendChild(load);
        c1.parentNode.removeChild(c1);
        cS.parentNode.removeChild(cS);
        c2.parentNode.removeChild(c2);
        setTimeout(function () {
            self.confirmRender(data); self.cacheUMLExplorer.UI.removeMessage();
        }, 25);
    });
    bOff.addEventListener("click", function () {
        self.cacheUMLExplorer.UI.removeMessage();
    });

    c.appendChild(c1);
    c.appendChild(cS);
    c.appendChild(c2);
    c2.appendChild(bOk);
    c2.appendChild(bOff);
    load.appendChild(lt);
    load.appendChild(spinner);
    this.cacheUMLExplorer.UI.displayMessage(c, false);

};

ClassView.prototype.confirmRender = function (data) {

    var self = this, p, pp, className,
        uml = joint.shapes.uml, relFrom, relTo,
        classes = {}, connector;

    this.filterInherits(data);

    // Reset view and zoom again because it may cause visual damage to icons.
    // Don't ask me why. Just believe we need this peace of code.
    this.zoom(null);
    this.resetView();

    if (!data["classes"]) {
        console.error("Wrong data: no 'classes' property.", data);
        return;
    }

    for (className in data["classes"]) {
        classes[className] = {
            instance: this.createClassInstance(className, data["classes"][className])
        };
    }

    var link = function (type) {
        var name = type === "inheritance" ? "Generalization" :
                type === "aggregation" ? "Aggregation" : type === "composition" ? "Composition"
                : "Association";
        for (p in data[type]) {
            relFrom = (classes[p] || {}).instance;
            for (pp in data[type][p]) {
                relTo = (classes[pp] || {}).instance;
                if (!relTo) {
                    classes[pp] = {
                        instance: relTo = self.createClassInstance(pp, {})
                    };
                }
                if (relFrom && relTo) {
                    self.graph.addCell(connector = new uml[name]({
                        source: { id: type === "inheritance" ? relFrom.id : relTo.id },
                        target: { id: type === "inheritance" ? relTo.id : relFrom.id },
                        router: { name: "manhattan" },
                        connector: { name: "rounded" },
                        labels: (function (link) {
                            var arr = [],
                                getLabel = function (label, pos) {
                                    return {
                                        position: pos,
                                        attrs: {
                                            text: {
                                                text: label,
                                                    fill: 'black',
                                                    "font-size": "10pt"
                                            },
                                            rect: {
                                                fill: "whitesmoke"
                                            }
                                        }
                                    }
                                };
                            if (link.left) arr.push(getLabel(link.left, 10));
                            if (link.right) arr.push(getLabel(link.right, -10));
                            return arr;
                        })(data[type][p][pp] || {})
                    }));
                    self.links.push(connector);
                }
            }
        }
    };

    link("inheritance");
    link("composition");
    link("aggregation");
    link("association");

    joint.layout.DirectedGraph.layout(this.graph, {
        setLinkVertices: false,
        nodeSep: 100,
        rankSep: 100,
        edgeSep: 20
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

    this.cacheUMLExplorer.classTree.SELECTED_NAME = className;
    this.cacheUMLExplorer.classTree.SELECTED_TYPE = "class";
    this.showLoader();
    this.cacheUMLExplorer.source.getClassView(className, function (err, data) {
        //console.log(data);
        self.removeLoader();
        if (err) {
            self.showLoader("Unable to get " + self.cacheUMLExplorer.classTree.SELECTED_NAME);
            console.error.call(console, err);
        } else {
            self.render(data);
        }
    });

    this.cacheUMLExplorer.elements.className.textContent = className;
    this.cacheUMLExplorer.updateURL();

};

ClassView.prototype.loadPackage = function (packageName) {

    var self = this;

    this.cacheUMLExplorer.classTree.SELECTED_NAME = packageName;
    this.cacheUMLExplorer.classTree.SELECTED_TYPE = "package";
    this.showLoader();
    this.cacheUMLExplorer.source.getPackageView(packageName, function (err, data) {
        //console.log(data);
        self.removeLoader();
        if (err) {
            self.showLoader("Unable to get package " + packageName);
            console.error.call(console, err);
        } else {
            self.render(data);
        }
    });

    this.cacheUMLExplorer.elements.className.textContent = packageName;
    this.cacheUMLExplorer.updateURL();

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

/**
 * Focus on joint instance.
 * @param jointInstance
 */
ClassView.prototype.focusOnInstance = function (jointInstance) {

    var bb = jointInstance.getBBox();

    this.focusOnXY(bb.x + bb.width/2, bb.y + bb.height/2);

};

/**
 * Focus on x and y coordinates considering scale.
 * @param {number} x
 * @param {number} y
 */
ClassView.prototype.focusOnXY = function (x, y) {

    var sw = this.cacheUMLExplorer.elements.classViewContainer.offsetWidth,
        sh = this.cacheUMLExplorer.elements.classViewContainer.offsetHeight,
        scale = this.PAPER_SCALE;

    this.paper.setOrigin(
        -(x * scale) + sw/2,
        -(y * scale) + sh/2
    );

};

/**
 * Find text on diagram and focus on element.
 *
 * @param {string} text
 */
ClassView.prototype.searchOnDiagram = function (text) {

    var p, found = [], o;

    if (!text) {
        this.highlightElement(null);
        return;
    }

    text = text.toLowerCase();

    for (p in this.objects) {
        if (this.objects[p].SEARCH_KEYWORDS.indexOf(text) !== -1) {
            found.push(this.objects[p]);
        }
    }

    if (found.length) {
        o = found[this.SEARCH_INDEX % found.length];
        this.focusOnInstance(o);
        this.highlightElement(o);
        return;
    }

    this.highlightElement(null);

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
    this.cacheUMLExplorer.elements.closeMethodCodeView.addEventListener("click", function () {
        self.hideMethodCode();
    });
    this.cacheUMLExplorer.elements.helpButton.addEventListener("click", function () {
        self.renderInfoGraphic();
    });
    this.cacheUMLExplorer.elements.diagramSearch.addEventListener("input", function (e) {
        self.searchOnDiagram((e.target || e.srcElement).value);
    });
    this.cacheUMLExplorer.elements.diagramSearch.addEventListener("keydown", function (e) {
        if (e.keyCode === 13) {
            self.SEARCH_INDEX++;
            self.searchOnDiagram((e.target || e.srcElement).value);
        }
    });
    this.cacheUMLExplorer.elements.diagramSearchButton.addEventListener("click", function () {
        self.SEARCH_INDEX++;
        self.searchOnDiagram(self.cacheUMLExplorer.elements.diagramSearch.value);
    });

    this.SYMBOL_12_WIDTH = (function () {
        var e = document.createElementNS("http://www.w3.org/2000/svg", "text"),
            s = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
            w;
        s.appendChild(e);
        s.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        s.setAttribute("version", "1.1");
        e.setAttribute("font-family", "monospace");
        e.setAttribute("font-size", "12");
        e.textContent = "aBcDeFgGhH";
        document.body.appendChild(s);
        w = e.getBBox().width / 10;
        s.parentNode.removeChild(s);
        return w;
    })();

};