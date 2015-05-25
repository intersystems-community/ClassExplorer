var Source = function (cacheUMLExplorer) {

    this.URL = window.location.protocol + "//" + window.location.hostname + ":" +
        57773/*build.replace:window.location.port*/ + "/UMLExplorer";

    this.cue = cacheUMLExplorer;

};

/**
 * Return class tree.
 * @param {Source~dataCallback} callback
 */
Source.prototype.getClassTree = function (callback) {

    lib.load(
        this.URL + "/GetClassTree"
            + (this.cue.NAMESPACE ? "?namespace=" + encodeURIComponent(this.cue.NAMESPACE) : ""),
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
        callback);

};

/**
 * Return class view.
 * @param {string} className
 * @param {Source~dataCallback} callback
 */
Source.prototype.getClassView = function (className, callback) {

    lib.load(
        this.URL + "/GetClassView?name=" + encodeURIComponent(className)
            + (this.cue.NAMESPACE ? "&namespace=" + encodeURIComponent(this.cue.NAMESPACE) : ""),
        null,
        callback);

};

/**
 * Return class view.
 * @param {string} packageName
 * @param {Source~dataCallback} callback
 */
Source.prototype.getPackageView = function (packageName, callback) {

    lib.load(
        this.URL + "/GetPackageView?name=" + encodeURIComponent(packageName)
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