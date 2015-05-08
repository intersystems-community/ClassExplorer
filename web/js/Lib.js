var Lib = function () {},
    lib = new Lib();

/**
 * @param {string} url
 * @param {object} data
 * @param {function} callback
 * @private
 */
Lib.prototype.load = function (url, data, callback) {

    var xhr = new XMLHttpRequest();

    xhr.open(data ? "POST" : "GET", url);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            return callback(null, JSON.parse(xhr.responseText) || {});
        } else if (xhr.readyState === 4) {
            callback(xhr.responseText + ", " + xhr.status + ": " + xhr.statusText);
        }
    };

    xhr.send(data ? JSON.stringify(data) : undefined);

};

/**
 * Return number of readable properties in object.
 * @param object
 */
Lib.prototype.countProperties = function (object) {

    var c = 0, p;

    for (p in object) {
        c++;
    }

    return c;

};