/**
 * Visualization for classes.
 * @constructor
 */
var ClassView = function (parent, container) {

    this.container = container;
    this.cacheClassExplorer = parent;

    this.graph = null;
    this.paper = null;
    this.loader = null;
    this.logic = new Logic(parent);

    this.links = [];
    this.objects = [];

    this.PAPER_SCALE = 1;
    this.MIN_PAPER_SCALE = 0.2;
    this.MAX_PAPER_SCALE = 4;
    this.GRID_SIZE = 22;

    this.CLASS_DOC_PATH = "/csp/documatic/%25CSP.Documatic.cls";
    this.SYMBOL_12_WIDTH = 6.6;

    this.HIGHLIGHTED_VIEW = null;
    this.SEARCH_INDEX = 0;

    /**
     * This name has influence on "save view" function.
     * @type {string}
     */
    this.CURRENT_RENDER_NAME = "";

    this.viewSaving = false;

    /**
     * Not to perform save too frequently, this variable is used to control saving frequency.
     * @type {number}
     */
    this.saveTimeout = 0;

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
    this.cacheClassExplorer.elements.diagramSearch.value = "";

};

ClassView.prototype.openClassDoc = function (className, nameSpace) {

    window.open(
        this.CLASS_DOC_PATH + "?LIBRARY=" + encodeURIComponent(nameSpace)
            + "&CLASSNAME=" + encodeURIComponent(className),
        "_blank"
    );

};

/**
 * This function is useful when there is a need to render any user content.
 * @param data
 * @param fitSize
 */
ClassView.prototype.injectView = function (data, fitSize) {

    if (typeof fitSize === "undefined") fitSize = true;

    this.showLoader();
    this.render(data);
    this.paper.setOrigin(0.5, 0.5);
    this.removeLoader();

    if (!fitSize) return;

    var content = this.paper.getContentBBox();
    this.container.style.width = (content.width + 1) + "px";
    this.container.style.height = (content.height + 1) + "px";
    this.updateSizes();

};

/**
 * Render help info
 */
ClassView.prototype.renderInfoGraphic = function () {

    this.cacheClassExplorer.classTree.SELECTED_NAME =
        this.cacheClassExplorer.elements.className.textContent =
            "Welcome to Caché Class explorer!";

    this.showLoader();
    this.render({
        basePackageName: "Welcome to Caché Class explorer!",
        classes: {
            "Need Help?": {
                properties: {
                    "Click the \"?\" button above!": {}
                }
            }
        }
    });

    this.removeLoader();

    this.cacheClassExplorer.updateURL();

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

    var f = function (p) {
        return filter.hasOwnProperty(p) || (data.classes[p] || {})["isDataType"] ||
            lib.obj(((data.classes[p] || {}).Super || "").split(",")).hasOwnProperty("%DataType");
    };

    if (this.cacheClassExplorer.settings.showDataTypesOnDiagram)
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
 * Returns array of signs to render or empty array.
 *
 * @param classMetaData
 */
ClassView.prototype.getClassSigns = function (classMetaData) {

    var signs = [];

    if (!this.cacheClassExplorer.settings.showClassIcons) return signs;

    //if (ct = classMetaData["$classType"]) {
    //    if (ct !== "Serial" && ct !== "Registered" && ct !== "Persistent" && ct !== "DataType") {
    //        signs.push({
    //            icon: lib.image.greenPill,
    //            text: ct,
    //            textStyle: "fill:rgb(130,0,255)"
    //        });
    //    }
    //}
    if (classMetaData["Abstract"]) signs.push({
        icon: lib.image.crystalBall,
        text: "Abstract",
        textStyle: "fill:rgb(130,0,255)"
    });
    if (classMetaData["Final"]) signs.push({
        icon: lib.image.blueFlag,
        text: "Final",
        textStyle: "fill:rgb(130,0,255)"
    });
    if (classMetaData["System"]) signs.push({
        icon: lib.image.chip,
        text: "System/" + classMetaData["System"]
    });
    if (classMetaData["ProcedureBlock"] === 0) signs.push({
        icon: lib.image.moleculeCubeCross,
        text: "NotProcBlock"
    });
    if (classMetaData["Hidden"]) signs.push({
        icon: lib.image.ghost,
        text: "Hidden"
    });

    return signs;

};

/**
 * Returns array of icons according to method metadata.
 *
 * @param property
 */
ClassView.prototype.getPropertyIcons = function (property) {

    var icons = [];

    if (!this.cacheClassExplorer.settings.showPropertyIcons)
        return [{ src: lib.image[(property["Private"] ? "minus" : "plus") + "Simple"] }];

    if (typeof property["Private"] !== "undefined") {
        icons.push({ src: lib.image[property["Private"] ? "minus" : "plus"] });
    }
    if (property["Abstract"]) icons.push({ src: lib.image.crystalBall });
    if (property["ClientMethod"]) icons.push({ src: lib.image.user });
    if (property["Final"]) icons.push({ src: lib.image.blueFlag });
    if (property["NotInheritable"]) icons.push({ src: lib.image.redFlag });
    if (property["SqlProc"]) icons.push({ src: lib.image.table });
    if (property["WebMethod"]) icons.push({ src: lib.image.earth });
    if (property["ZenMethod"]) icons.push({ src: lib.image.zed });
    if (property["ReadOnly"]) icons.push({ src: lib.image.eye });
    if (property["index"]) {
        icons.push(
            property["index"]["Unique"] ? { src: lib.image.keyRed }
            : (property["index"]["PrimaryKey"] || property["index"]["IDKey"])
            ? { src: lib.image.keyGreen } : { src: lib.image.keyYellow }
        );
    }

    return icons;

};

/**
 * @param prop
 * @param {string} type = ["parameter", "property", "method", "query"]
 * @returns {string}
 */
ClassView.prototype.getPropertyHoverText = function (prop, type) {

    var ind, i, desc = "",
        indexText = {
            "IdKey": function () { return "IdKey"; },
            "Type": function (type) { return "Type="+type; },
            "Internal": function () { return "Internal"; },
            "Extent": function () { return "Extent"; },
            "PrimaryKey": function () { return "PrimaryKey"; },
            "Unique": function () { return "Unique"; }
        },
        propText = {
            "Calculated": 1,
            "Final": 1,
            "Identity": 1,
            "InitialExpression": function (data) {
                return (data === "\"\"")
                    ? ""
                    : "<span class=\"syntax-keyword\">InitialExpression</span>="
                        + lib.highlightCOS(data + "")
            },
            "Internal": 1,
            "MultiDimensional": 1,
            "NoModBit": 1,
            "NotInheritable": 1,
            "Private": 1,
            "ReadOnly": 1,
            "Relationship": function (data, p) {
                return "<span class=\"syntax-keyword\">Relationship</span> [ Cardinality="
                    + p["Cardinality"] + ", Inverse=" + p["Inverse"] + " ]";
            },
            "Required": 1,
            "SqlComputed": function (data, p) {
                return p["SqlComputeCode"]
                    ? "<span class=\"syntax-keyword\">SqlComputed</span> [ SqlComputeCode={"
                        + lib.highlightCOS(p["SqlComputeCode"]) + "} ]"
                    : "";
            },
            "Transient": 1,
            // -- methods
            "Abstract": 1,
            // "ClassMethod": 1, - they're underlined
            "ClientMethod": 1,
            "CodeMode": function (data) {
                return data === "code" ? "" : "<span class=\"syntax-keyword\">CodeMode</span>="
                    + "<span class=\"syntax-string\">" + data + "</span>";
            },
            "ForceGenerate": 1,
            "NoContext": 1,
            "NotForProperty": 1,
            "ReturnResultsets": 1,
            "SoapAction": function (data) {
                return data === "[default]" ? ""
                    : "<span class=\"syntax-keyword\">SoapAction</span>="
                        + "<span class=\"syntax-string\">" + data + "</span>";
            },
            "Default": function (data) {
                return "Default = " + lib.highlightCOS(data + "");
            },
            "SqlProc": 1,
            "WebMethod": 1,
            "ZenMethod": 1,
            // -- parameters
            "Encoded": 1,
            // -- queries
            "SqlView": 1,
            // -- xDatas
            "MimeType": function (data) {
                return "MimeType = " + data;
            },
            // -- class
            "ClientDataType": function (data, p) {
                return !p["isDataType"] ? ""
                    : "<span class=\"syntax-keyword\">ClientDataType</span>="
                    + "<span class=\"syntax-string\">" + data + "</span>";
            },
            "CompileAfter": function (data) {
                return "<span class=\"syntax-keyword\">CompileAfter</span>="
                    + data.split(",").map(function (e) {
                        return "<span class=\"syntax-names\">" + e + "</span>"
                    }).join(", ");
            },
            "DdlAllowed": 1,
            "Deployed": 1,
            "Dynamic": 1,
            "Inheritance": function (data) {
                return data === "left" ? ""
                    : "<span class=\"syntax-keyword\">Inheritance</span>="
                        + "<span class=\"syntax-string\">" + data + "</span>";
            },
            "Language": function (data) {
                return data === "cache" ? ""
                    : "<span class=\"syntax-keyword\">Language</span>="
                + "<span class=\"syntax-string\">" + data + "</span>";
            },
            "LegacyInstanceContext": 1,
            // ModificationLevel ?
            "NoExtent": 1,
            "OdbcType": function (data, p) {
                return !p["isOdbcType"] ? ""
                    : "<span class=\"syntax-keyword\">OdbcType</span>="
                        + "<span class=\"syntax-string\">" + data + "</span>";
            },
            "ProcedureBlock": function (data) {
                return data ? "" : "<span class=\"syntax-keyword\">Not ProcedureBlock</span>";
            },
            "SoapBindingStyle": function (data, p) {
                return !p["isSoapBindingStyle"] ? ""
                    : "<span class=\"syntax-keyword\">SoapBindingStyle</span>="
                        + "<span class=\"syntax-string\">" + data + "</span>";
            },
            "SoapBodyUse": function (data, p) {
                return !p["isSoapBodyUse"] ? ""
                    : "<span class=\"syntax-keyword\">SoapBodyUse</span>="
                        + "<span class=\"syntax-string\">" + data + "</span>";
            },
            "SqlCategory": function (data, p) {
                return !p["isSqlCategory"] ? ""
                    : "<span class=\"syntax-keyword\">SqlCategory</span>="
                        + "<span class=\"syntax-string\">" + data + "</span>";
            },
            "SqlRowIdPrivate": 1,
            "System": function (data) {
                return !data ? ""
                    : "<span class=\"syntax-keyword\">System</span>="
                        + "<span class=\"syntax-string\">" + data + "</span>"
            }
        };

    if (type === "class" && prop["TimeChanged"] && prop["TimeCreated"]) {
        desc += "<span class=\"syntax-keyword\">Changed</span>: "
            + "<span class=\"syntax-string nowrap\">" + prop["TimeChanged"] + "</span>, "
            + "<span class=\"syntax-keyword\">Created</span>: "
            + "<span class=\"syntax-string nowrap\">" + prop["TimeCreated"] + "</span><br/>";
    }

    if (ind = prop["index"]) {
        desc += "<span class=\"syntax-keyword\">INDEX</span> <span class=\"syntax-string\">"
            + ind["Name"] + "</span> " + (function () {
                var txt = [];
                for (i in ind) {
                    if (indexText[i] && ind[i]) txt.push(indexText[i](ind[i]));
                }
                return txt.join(", ");
            })()
            + "\n";
    }

    var txt = [], val;
    for (i in prop) {
        if (propText[i] && (prop[i] || i === "InitialExpression" || i === "ProcedureBlock" || i === "Default")) {
            val = propText[i] === 1
                ? "<span class=\"syntax-keyword\">" + i + "</span>"
                : propText[i](prop[i], prop);
            if (val !== "") txt.push(val);
        }
    }
    if (txt.length) desc += txt.join(", ");

    // Display FormalSpec in methods?

    if (desc && prop["Description"]) desc += "<hr/>";
    desc += prop["Description"] || "";

    if (desc && type) {
        desc = "<span class=\"underlined\"><span class=\"syntax-keyword\">" + lib.capitalize(type)
            + "</span> <span class=\"syntax-other\">" + (prop["Name"] || "") + "</span></span>"
            + ("<br/>") + desc;
    }

    return desc;

};

/**
 * @param {string} name
 * @param classMetaData
 * @param saved - Object with saved data.
 * @returns {joint.shapes.uml.Class}
 */
ClassView.prototype.createClassInstance = function (name, classMetaData, saved) {

    var classParams = classMetaData["parameters"],
        classProps = classMetaData["properties"],
        classMethods = classMetaData["methods"],
        classQueries = classMetaData["queries"],
        classXDatas = classMetaData["xdatas"],
        keyWordsArray = [name],
        self = this;

    var setup = {
        name: [{
            text: name,
            clickHandler: function () {
                self.openClassDoc(name, self.cacheClassExplorer.NAMESPACE);
            },
            hover: self.getPropertyHoverText(classMetaData, "class"),
            styles: {
                cursor: "help"
            }
        }],
        params: (function (params) {
            var arr = [], n;
            for (n in params) {
                keyWordsArray.push(n);
                arr.push({
                    name: n,
                    text: n + (params[n]["Type"] ? ": " + params[n]["Type"] : ""),
                    hover: self.getPropertyHoverText(params[n], "parameter"),
                    icons: self.getPropertyIcons(params[n])
                });
            }
            return arr;
        })(classParams),
        attributes: (function (ps) {
            var arr = [], n;
            for (n in ps) {
                keyWordsArray.push(n);
                arr.push({
                    name: n,
                    text: n + (ps[n]["Type"] ? ": " + ps[n]["Type"] : ""),
                    hover: self.getPropertyHoverText(ps[n], "property"),
                    icons: self.getPropertyIcons(ps[n])
                });
            }
            return arr;
        })(classProps),
        methods: (function (met) {
            var arr = [], n;
            for (n in met) {
                keyWordsArray.push(n);
                arr.push({
                    name: n,
                    text: n + (met[n]["ReturnType"] ? ": " + met[n]["ReturnType"] : ""),
                    styles: (function (t) {
                        return t ? { textDecoration: "underline" } : {}
                    })(met[n]["ClassMethod"]),
                    clickHandler: (function (n) {
                        return function () { self.showMethodCode(name, n); }
                    })(n),
                    hover: self.getPropertyHoverText(met[n], "method"),
                    icons: self.getPropertyIcons(met[n])
                });
            }
            return arr;
        })(classMethods),
        queries: (function (qrs) {
            var arr = [], n;
            for (n in qrs) {
                keyWordsArray.push(n);
                arr.push({
                    name: n,
                    text: n + (qrs[n]["Type"] ? ": " + qrs[n]["Type"] : ""),
                    icons: self.getPropertyIcons(qrs[n]),
                    hover: self.getPropertyHoverText(qrs[n], "query"),
                    clickHandler: (function (q, className) {
                        return function () { self.showQuery(className, q); }
                    })(qrs[n], name)
                });
            }
            return arr;
        })(classQueries),
        xdatas: (function (xds) {
            var arr = [], n;
            for (n in xds) {
                keyWordsArray.push(n);
                arr.push({
                    name: n,
                    text: n + (xds[n]["MimeType"] ? ": " + xds[n]["MimeType"] : ""),
                    hover: self.getPropertyHoverText(xds[n], "xdata"),
                    icons: self.getPropertyIcons(xds[n]),
                    clickHandler: (function (d, className) {
                        return function () { self.showXData(className, d); }
                    })(xds[n], name)
                });
            }
            return arr;
        })(classXDatas),
        classSigns: this.getClassSigns(classMetaData),
        classType: classMetaData.ClassType || "registered",
        SYMBOL_12_WIDTH: self.SYMBOL_12_WIDTH
    };

    if (saved && saved.position) setup.position = saved.position;

    var classInstance = new joint.shapes.uml.Class(setup);

    classInstance.on("change:position", function () {
        self.prepareToSave();
    });

    classInstance.SEARCH_KEYWORDS = keyWordsArray.join(",").toLowerCase();
    classInstance.NAME = name;
    this.objects.push(classInstance);
    this.graph.addCell(classInstance);

    return classInstance;

};

ClassView.prototype.prepareToSave = function () {

    if (!this.viewSaving) return;

    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(this.saveView.bind(this), 700);

};

ClassView.prototype.showMethodCode = function (className, methodName) {

    var self = this;

    this.cacheClassExplorer.source.getMethod(className, methodName, function (err, data) {
        if (err || data.error) {
            self.cacheClassExplorer.UI.displayMessage("Unable to get method \"" + methodName + "\"!");
            return;
        }
        self.showPanel({
            header: className + ": " + methodName + "("
            + (data["arguments"] || "").replace(/,/g, ", ").replace(/:/g, ": ") + ")"
            + (data["returns"] ? ": " + data["returns"] : ""),
            comment: data["description"],
            body: lib.highlightCOS(data["code"] || "")
        });
    });

};

ClassView.prototype.showQuery = function (className, queryData) {

    queryData = queryData || {};

    this.showPanel({
        header: "##class(" + className + ")." + queryData["Name"] + "("
            + (queryData["FormalSpec"] || "").replace(/,/g, ", ").replace(/:/g, ": ") + ")",
        comment: queryData["Description"],
        body: lib.highlightSQL(queryData["SqlQuery"] || "")
    });

};

/**
 * @param {string} className
 * @param {string} xData
 */
ClassView.prototype.showXData = function (className, xData) {

    xData = xData || "";

    this.showPanel({
        header: "##class(" + className + ")." + xData["Name"] + (xData["MimeType"] ? " (" + xData["MimeType"] + ")" : xData["MimeType"]),
        comment: xData["Description"],
        body: lib.highlightXML(xData["Data"] || "")
    });

};

/**
 * Show panel filled with given HTML contents.
 * @param {string} data.header
 * @param {string} [data.comment]
 * @param {string} data.body
 */
ClassView.prototype.showPanel = function (data) {

    var els = this.cacheClassExplorer.elements;

    data = data || {};

    els.methodLabel.textContent = data.header || "";
    els.methodDescription.innerHTML = data.comment || "";
    els.methodCode.innerHTML = data.body || "";
    els.methodViewBounds.style.height =
        els.classView.offsetHeight - els.methodViewBounds.offsetTop + "px";
    els.methodCodeView.classList.add("active");

};

ClassView.prototype.hideMethodCode = function () {

    this.cacheClassExplorer.elements.methodCodeView.classList.remove("active");

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
            self.confirmRender(data); self.cacheClassExplorer.UI.removeMessage();
        }, 25);
    });
    bOff.addEventListener("click", function () {
        self.cacheClassExplorer.UI.removeMessage();
    });

    c.appendChild(c1);
    c.appendChild(cS);
    c.appendChild(c2);
    c2.appendChild(bOk);
    c2.appendChild(bOff);
    load.appendChild(lt);
    load.appendChild(spinner);
    this.cacheClassExplorer.UI.displayMessage(c, false);

};

ClassView.prototype.confirmRender = function (data) {

    var self = this, p, pp, className,
        LINK_TEXT_MARGIN = 22,
        uml = joint.shapes.uml, relFrom, relTo,
        classes = {}, connector;

    if (this.cacheClassExplorer.PRIMARY) this.switchViewSave(!!data.savedView);

    this.filterInherits(data);

    // Reset view and zoom again because it may cause visual damage to icons.
    // Don't ask me why. Just believe we need this peace of code.
    this.zoom(null);
    this.resetView();
    this.cacheClassExplorer.setSubLabel();

    if (!data["classes"]) {
        console.error("Wrong data: no 'classes' property.", data);
        return;
    }

    for (className in data["classes"]) {
        classes[className] = {
            instance: this.createClassInstance(
                className,
                data["classes"][className],
                ((data.savedView || {}).classes || {})[className]
            )
        };
    }

    var link = function (type) {
        var name = type === "inheritance" ? "Generalization" :
                type === "aggregation" ? "Aggregation" : type === "composition" ? "Composition"
                : "Association",
            linkData;
        for (p in data[type]) {
            relFrom = (classes[p] || {}).instance;
            for (pp in data[type][p]) {
                relTo = (classes[pp] || {}).instance;
                if (!relTo) {
                    classes[pp] = {
                        instance: relTo = self.createClassInstance(
                            pp,
                            {},
                            ((data.savedView || {}).classes || {})[pp]
                        )
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
                            if (link.left) arr.push(getLabel(link.left, LINK_TEXT_MARGIN));
                            if (link.right) arr.push(getLabel(link.right, -LINK_TEXT_MARGIN));
                            return arr;
                        })(linkData = data[type][p][pp] || {})
                    }));
                    if (linkData.from) {
                        connector._fromClass = linkData.from;
                        connector._fromClass.instance = relTo;
                    }
                    if (linkData.to) {
                        connector._toClass = linkData.to;
                        connector._toClass.instance = relFrom;
                    }
                    self.links.push(connector);
                    connector.on("all", function (e) {
                        if (e !== "remove") return;
                        self.cacheClassExplorer.setSubLabel(
                            "*Some links are removed on this diagram.",
                            "color:red"
                        );
                    });
                }
            }
        }
    };

    link("inheritance");
    link("composition");
    link("aggregation");
    link("association");

    if (!data.savedView) {
        joint.layout.DirectedGraph.layout(this.graph, {
            setLinkVertices: false,
            nodeSep: this.GRID_SIZE*5,
            rankSep: this.GRID_SIZE*5,
            edgeSep: this.GRID_SIZE,
            rankDir: data.layoutDirection || "TB"
        });
    }

    this.updateSizes();

    for (var i in this.links) {
        this.paper.findViewByModel(this.links[i]).update();
    }

    var bb = this.paper.getContentBBox(),
        q = this.paper;

    this.paper.setOrigin(
        q.options.width/2 - bb.width/2,
        q.options.height/2 - Math.min(q.options.height/2 - 100, bb.height/2)
    );

    if (data.savedView) this.restoreView(data.savedView);

    this.onRendered();

};

ClassView.prototype.switchViewSave = function ( saving ) {

    if (typeof saving === "undefined") saving = !this.viewSaving;
    this.viewSaving = !!saving;
    this.cacheClassExplorer.elements.saveViewIcon.src = lib.image["pin" + (saving ? "Active" : "")];

};

ClassView.prototype.saveView = function () {

    if (!this.CURRENT_RENDER_NAME || !this.cacheClassExplorer.NAMESPACE) return;

    var self = this,
        name = this.cacheClassExplorer.NAMESPACE + ":" + this.CURRENT_RENDER_NAME;

    var saved = {
        classes: {},
        zoom: this.PAPER_SCALE,
        origin: {
            x: Math.round(self.paper.options.origin.x),
            y: Math.round(self.paper.options.origin.y)
        }
    };

    this.graph.getElements().forEach(function (element) {
        if (!element.NAME) return;
        saved.classes[element.NAME] = {
            position: element.attributes.position
        }
    });

    this.cacheClassExplorer.source.saveView(name, saved);

};

ClassView.prototype.restoreView = function (data) {

    // data.classes are parsed during class creation
    if (data.zoom) { // do not swap with origin set
        this.PAPER_SCALE = data.zoom;
        this.zoom(0);
    }
    if (data.origin && data.origin.x && data.origin.y) this.paper.setOrigin(data.origin.x, data.origin.y);

};

ClassView.prototype.loadPackage = function (packageName, restoring) {

    var self = this;

    this.cacheClassExplorer.classTree.uncheckAll();
    this.cacheClassExplorer.classTree.SELECTED_NAME = packageName;
    this.cacheClassExplorer.classTree.setSelectedClassList([]);
    this.cacheClassExplorer.classTree.SELECTED_TYPE = "package";
    if (!restoring)
        this.cacheClassExplorer.classTree.SELECTED_LEVEL =
            this.cacheClassExplorer.elements.settings["dependencyLevel"].value;
    this.showLoader();
    this.cacheClassExplorer.source.getPackageView(
        packageName,
        this.cacheClassExplorer.classTree.SELECTED_LEVEL + "",
        function (err, data) {
            //console.log(data);
            self.removeLoader();
            if (err) {
                self.showLoader("Unable to get package " + packageName);
                console.error.call(console, err);
            } else {
                self.render(data);
            }
        }
    );

    this.cacheClassExplorer.elements.className.textContent = packageName;
    this.CURRENT_RENDER_NAME = "PACKAGE:" + packageName;
    this.cacheClassExplorer.updateURL();

};

/**
 * Loads arbitrary list of classes.
 * @param {String[]} classList
 * @param {boolean} [restoring] - If restoring from URL, do not re-write settings.
 */
ClassView.prototype.loadClasses = function (classList, restoring) {

    var self = this;

    this.cacheClassExplorer.classTree.SELECTED_NAME = classList.join(",");
    this.cacheClassExplorer.classTree.setSelectedClassList(classList);
    this.cacheClassExplorer.classTree.SELECTED_TYPE = "arbitrary";
    if (!restoring)
        this.cacheClassExplorer.classTree.SELECTED_LEVEL =
            this.cacheClassExplorer.elements.settings["dependencyLevel"].value;
    this.showLoader();
    this.cacheClassExplorer.source.getArbitraryView(
        classList,
        this.cacheClassExplorer.classTree.SELECTED_LEVEL + "",
        function (err, data) {
            //console.log(data);
            self.removeLoader();
            if (err) {
                self.showLoader("Unable to get view for " + classList.join(", ") + " classes.");
                console.error.call(console, err);
            } else {
                self.render(data);
            }
        }
    );

    this.cacheClassExplorer.elements.className.textContent =
        this.cacheClassExplorer.classTree.SELECTED_NAME;
    this.CURRENT_RENDER_NAME = "ARBITRARY:" + classList.join(",");
    this.cacheClassExplorer.updateURL();

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
    var sw = this.cacheClassExplorer.elements.classViewContainer.offsetWidth,
        sh = this.cacheClassExplorer.elements.classViewContainer.offsetHeight,
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

    if (delta) this.prepareToSave(); // delta = null,0 when restore triggered

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

    var sw = this.cacheClassExplorer.elements.classViewContainer.offsetWidth,
        sh = this.cacheClassExplorer.elements.classViewContainer.offsetHeight,
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

ClassView.prototype.bindLinkHighlight = function () {

    var self = this,
        highlighted = false,
        fields = [];

    var freeFields = function () {
        fields.forEach(function (f) {
            if (f.classList) f.classList.remove("line-selected");
        });
        fields = [];
    };

    this.paper.on("cell:mouseover", function (e) {
        var link, view, el;
        freeFields();
        link = e.model || null;
        if (!link) return;
        if (link._fromClass && link._fromClass.instance && link._fromClass.in
            && (view = self.paper.findViewByModel(link._fromClass.instance))
            && view.el && view.el._LINE_ELEMENTS && view.el._LINE_ELEMENTS[link._fromClass.in]
            && (el = view.el._LINE_ELEMENTS[link._fromClass.in][link._fromClass.name])) {
            fields.push(el);
        }
        if (link._toClass && link._toClass.instance && link._toClass.in
            && (view = self.paper.findViewByModel(link._toClass.instance))
            && view.el && view.el._LINE_ELEMENTS && view.el._LINE_ELEMENTS[link._toClass.in]
            && (el = view.el._LINE_ELEMENTS[link._toClass.in][link._toClass.name])) {
            fields.push(el);
        }
        fields.forEach(function (f) {
            if (f.classList) {
                f.classList.add("line-selected");
            } else {
                console.warn("Your browser does not support CSS3 classList property.");
            }
        });
        highlighted = !!fields.length;
    });

    this.paper.on("cell:mouseout", function () {
        highlighted = false;
        freeFields();
    });

};

ClassView.prototype.init = function () {

    var p, self = this,
        relP = { x: 0, y: 0, trigger: false };

    this.graph = new joint.dia.Graph;

    this.paper = new joint.dia.Paper({
        el: this.container,
        width: this.container.offsetWidth,
        height: this.container.offsetHeight,
        gridSize: this.GRID_SIZE,
        model: this.graph,
        origin: {
            x: 0,
            y: 0
        }
    });

    this.bindLinkHighlight();

    // enables links re-routing when dragging objects
    this.graph.on("change:position", function (object) {
        if (_.contains(self.objects, object))
            for (p in self.links) {
                var link = self.paper.findViewByModel(self.links[p]);
                if (link) link.update(); // removed links, should be in todo
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
        self.prepareToSave();
    };

    this.cacheClassExplorer.elements.classViewContainer.addEventListener("mousemove", moveHandler);
    this.cacheClassExplorer.elements.classViewContainer.addEventListener("touchmove", moveHandler);
    this.cacheClassExplorer.elements.classViewContainer.addEventListener("mousewheel", function (e) {
        self.zoom(Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))));
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

    if (!this.cacheClassExplorer.elements.treeViewContainer) return; //          DEAD END         \\

    this.cacheClassExplorer.elements.zoomInButton.addEventListener("click", function () {
        self.zoom(1);
    });
    this.cacheClassExplorer.elements.zoomOutButton.addEventListener("click", function () {
        self.zoom(-1);
    });
    this.cacheClassExplorer.elements.zoomNormalButton.addEventListener("click", function () {
        self.zoom(null);
    });
    this.cacheClassExplorer.elements.closeMethodCodeView.addEventListener("click", function () {
        self.hideMethodCode();
    });
    this.cacheClassExplorer.elements.diagramSearch.addEventListener("input", function (e) {
        self.searchOnDiagram((e.target || e.srcElement).value);
    });
    this.cacheClassExplorer.elements.diagramSearch.addEventListener("keydown", function (e) {
        if (e.keyCode === 13) {
            self.SEARCH_INDEX++;
            self.searchOnDiagram((e.target || e.srcElement).value);
        }
    });
    this.cacheClassExplorer.elements.diagramSearchButton.addEventListener("click", function () {
        self.SEARCH_INDEX++;
        self.searchOnDiagram(self.cacheClassExplorer.elements.diagramSearch.value);
    });

};

ClassView.prototype.onRendered = function () {

    if (!this.cacheClassExplorer.PRIMARY) return;

    [].slice.call(document.querySelectorAll(".line-hoverable")).forEach(function (el) {
        var hm = new HoverMessage(el.getAttribute("hovertext"), el["clickHandler"] || null),
            APPEAR_TIMEOUT = 500, tm = 0;
        el.addEventListener("mouseover", function (e) {
            if (tm) clearTimeout(tm);
            tm = setTimeout(function () {
                clearTimeout(tm);
                hm.attach(e.pageX || e.clientX, e.pageY || e.clientY);
            }, APPEAR_TIMEOUT);
        });
        el.addEventListener("mouseout", function () {
            clearTimeout(tm);
        });
    });

};