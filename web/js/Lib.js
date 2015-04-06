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
            try {
                return callback(null, JSON.parse(xhr.responseText) || {})
            } catch (e) {
                return callback(
                    "<h1>Unable to parse server response</h1><p>" + xhr.responseText + "</p>",
                    null
                );
            }
        } else if (xhr.readyState === 4) {
            callback(xhr.responseText + ", " + xhr.status + ": " + xhr.statusText);
        }
    };

    xhr.send(JSON.stringify(data));

};