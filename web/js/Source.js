var Source = function () {

    this.URL = window.location.protocol + "//" + window.location.hostname + ":" +
        57773/*build.replace:window.location.port*/ + "/UMLExplorer";

};

/**
 * Return class tree.
 * @param {Source~dataCallback} callback
 */
Source.prototype.getClassTree = function (callback) {

    lib.load(this.URL + "/GetClassTree", null, callback);

};

/**
 * Return method data.
 * @param {string} className
 * @param {string} methodName
 * @param {Source~dataCallback} callback
 */
Source.prototype.getMethod = function (className, methodName, callback) {

    lib.load(
        this.URL + "/GetMethod?className=" + encodeURIComponent(className) + "&methodName="
            + encodeURIComponent(methodName),
        null,
        callback);

};

/**
 * Return class view.
 * @param {string} className
 * @param {Source~dataCallback} callback
 */
Source.prototype.getClassView = function (className, callback) {

    lib.load(this.URL + "/GetClassView?name=" + encodeURIComponent(className), null, callback);

};

/**
 * Return class view.
 * @param {string} packageName
 * @param {Source~dataCallback} callback
 */
Source.prototype.getPackageView = function (packageName, callback) {

    lib.load(this.URL + "/GetPackageView?name=" + encodeURIComponent(packageName), null, callback);

};

/**
 * This callback handles data received directly from server.
 * @callback Source~dataCallback
 * @param {null|{error:string}} error
 * @param data
 */