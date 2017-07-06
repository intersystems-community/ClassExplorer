var Source = function (cacheUMLExplorer) {

    this.URL = window.location.protocol + "//" + window.location.hostname + ":" +
        57772/*build.replace:window.location.port*/ + "/ClassExplorer";

    this.cue = cacheUMLExplorer;

};

/**
 * Return class tree.
 * @param {boolean} includeMapped
 * @param {Source~dataCallback} callback
 */
Source.prototype.getClassTree = function (includeMapped, callback) {

    var ns = (this.cue.NAMESPACE ? "?namespace=" + encodeURIComponent(this.cue.NAMESPACE) : "");

    lib.load(
        this.URL + "/GetClassTree"
            + ns
            + (ns ? "&" : "?") + "mapped=" + (includeMapped ? "1" : "0"),
        null,
        callback
    );

};

/**
 * Return namespaces & current namespace.
 * @param {Source~dataCallback} callback
 */
Source.prototype.getNamespacesInfo = function (callback) {

    lib.load(this.URL + "/GetAllNamespacesList", null, callback);

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
            + encodeURIComponent(methodName)
            + (this.cue.NAMESPACE ? "&namespace=" + encodeURIComponent(this.cue.NAMESPACE) : ""),
        null,
        callback
    );

};

Source.prototype.saveView = function (packageName, data) {

    lib.load(
        this.URL + "/SaveView?name=" + encodeURIComponent(packageName),
        data,
        function () { console.log("View saved."); }
    );

};

Source.prototype.resetView = function (packageName) {

    lib.load(
        this.URL + "/ResetView?name=" + encodeURIComponent(packageName)
    );

};

/**
 * Return package view.
 * @param {string} packageName
 * @param {string} level
 * @param {Source~dataCallback} callback
 */
Source.prototype.getPackageView = function (packageName, level, callback) {

    lib.load(
        this.URL + "/GetPackageView?name=" + encodeURIComponent(packageName)
            + "&level=" + encodeURIComponent(level)
            + (this.cue.NAMESPACE ? "&namespace=" + encodeURIComponent(this.cue.NAMESPACE) : ""),
        null,
        callback
    );

};

/**
 * Return arbitrary class list view.
 * @param {string[]} classList
 * @param {string} level
 * @param {Source~dataCallback} callback
 */
Source.prototype.getArbitraryView = function (classList, level, callback) {

    lib.load(
        this.URL + "/GetArbitraryView?list=" + encodeURIComponent(classList.join(","))
            + "&level=" + encodeURIComponent(level)
            + (this.cue.NAMESPACE ? "&namespace=" + encodeURIComponent(this.cue.NAMESPACE) : ""),
        null,
        callback
    );

};

/**
 * This callback handles data received directly from server.
 * @callback Source~dataCallback
 * @param {null|{error:string}} error
 * @param data
 */