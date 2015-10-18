var Logic = function (parent) {

    this.umlExplorer = parent;

};

/**
 * Modify data, add relations, connections, helpers.
 *
 * @param {{basePackageName: string, classes: object<string,*>, restrictPackage: number}} data
 */
Logic.prototype.process = function (data) {

    var self = this,
        cls, clsName;

    this.data = data;

    data.classes["%Persistent"] = data.classes["%Library.Persistent"] = {
        $classType: "Persistent"
    };
    data.classes["%SerialObject"] = data.classes["%Library.SerialObject"] = {
        $classType: "Serial"
    };
    data.classes["%Library.RegisteredObject"] = data.classes["%RegisteredObject"] = {
        $classType: "Registered"
    };
    data.classes["%Library.DataType"] = data.classes["%DataType"] = {
        $classType: "DataType"
    };

    if (!this.data.inheritance) this.data.inheritance = {};
    for (clsName in data.classes) {
        cls = data.classes[clsName];
        if (cls.Super) cls.Super.split(",").forEach(function (name) {
            self.inherits(clsName, name);
        });
        if (cls.parameters && !this.umlExplorer.settings.showParameters) delete cls.parameters;
        if (cls.properties && !this.umlExplorer.settings.showProperties) delete cls.properties;
        if (cls.methods && !this.umlExplorer.settings.showMethods) delete cls.methods;
        if (cls.queries && !this.umlExplorer.settings.showQueries) delete cls.queries;
    }

    this.alignClassTypes(); // call after inheritance scheme done

    if (!this.umlExplorer.settings.showDataTypesOnDiagram) {
        for (clsName in data.classes) {
            if (/%Library\..*/.test(clsName)) delete data.classes[clsName];
        }
    }

    this.fillAssociations();
    this.fillIndices();

    delete data.classes["%Persistent"];
    delete data.classes["%Library.Persistent"];
    delete data.classes["%SerialObject"];
    delete data.classes["%Library.SerialObject"];
    delete data.classes["%Library.RegisteredObject"];
    delete data.classes["%RegisteredObject"];
    delete data.classes["%Library.DataType"];
    delete data.classes["%DataType"];

};

Logic.prototype.fillIndices = function () {

    var className, cls, indexName, j, index, props, propName;

    for (className in this.data.classes) {
        cls = this.data.classes[className];
        for (indexName in cls.indices) {
            index = cls.indices[indexName];
            props = index["Properties"].split(",");
            for (j in props) {
                if (cls.properties[propName = props[j].match(/[^\(]+/)[0]]) {
                    cls.properties[propName].index = index;
                } else {
                    console.warn(
                        "No property", propName, "defined in", className,"to assign index",
                        indexName, "to."
                    );
                }
            }
        }
    }

};

Logic.prototype.fillAssociations = function () {

    var self = this,
        className, properties, propertyName, po, assoc, compos, aggr;

    if (!(assoc = this.data.association)) assoc = this.data.association = {};
    if (!(compos = this.data.composition)) compos = this.data.composition = {};
    if (!(aggr = this.data.aggregation)) aggr = this.data.aggregation = {};

    for (className in this.data.classes) {
        properties = this.data.classes[className]["properties"];
        if (!properties) continue;
        for (propertyName in properties) {
            po = properties[propertyName];
            if (po["Cardinality"] === "one") {
                if (!aggr[po["Type"]]) aggr[po["Type"]] = {};
                aggr[po["Type"]][className] = {
                    left: "many",
                    right: "one"
                };
            } else if (po["Cardinality"] === "parent") {
                if (!compos[po["Type"]]) compos[po["Type"]] = {};
                compos[po["Type"]][className] = {
                    left: "child",
                    right: "parent"
                };
            } else if (self.data.classes[po["Type"]] && !po["Cardinality"]) {
                if (!assoc[po["Type"]]) assoc[po["Type"]] = {};
                assoc[po["Type"]][className] = {};
            }
        }
    }

};

/**
 * @private
 * @param {string} className
 * @param {string} inhName
 */
Logic.prototype.inherits = function (className, inhName) {

    if (!this.data.inheritance[className]) this.data.inheritance[className] = {};
    if (!this.data.inheritance[className][inhName]) {
        this.data.inheritance[className][inhName] = 1;
    } else {
        return;
    }

    if (!this.data.classes[inhName]) {
        this.data.classes[inhName] = {};
    }

};

/**
 * @private
 * @param {string} className
 * @returns {string[]} - derived class names
 */
Logic.prototype.getDerivedClasses = function (className) {

    var arr = [];

    for (var a in this.data.inheritance) {
        if (this.data.inheritance[a][className]) arr.push(a);
    }

    return arr;

};

Logic.prototype.getNonInheritingClasses = function () {

    var arr = [];

    for (var className in this.data.classes) {
        if (!this.data.inheritance[className]) arr.push(className);
    }

    return arr;

};

/**
 * Correcting Cache's class keyword "ClassType".
 * @param classType
 * @returns {*}
 */
Logic.prototype.getNormalClassType = function (classType) {

    if (classType === "datatype") return "DataType";
    else if (classType === "serial") return "Serial";
    else if (classType === "persistent") return "Persistent";
    else return lib.capitalize(classType); // (Registered), Stream, View, Index

};

/**
 * Fills $classType
 * @private
 */
Logic.prototype.alignClassTypes = function () {

    var self = this;

    var extendDerivedClasses = function (className, classObj, root) {
        (root ? self.getNonInheritingClasses() : self.getDerivedClasses(className)).forEach(
            function (derivedClassName) {
            var derivedObj = self.data.classes[derivedClassName];
            if (!derivedObj.$classType) { // not assigned yet
                // try to get class type from parent
                if (classObj.$classType) derivedObj.$classType = classObj.$classType;
                // reassign class type from classType property
                if (derivedObj.ClassType)
                    derivedObj.$classType = self.getNormalClassType(derivedObj.ClassType);
            }
            extendDerivedClasses(derivedClassName, derivedObj);
        });
    };

    extendDerivedClasses("", {}, true);

};