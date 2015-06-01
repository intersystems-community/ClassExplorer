/*
 * @see https://github.com/NYTimes/svg-crowbar - A bit of used code from here, thanks to it's author.
 */
var enableSVGDownload = function (classView) {

    var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

    window.URL = (window.URL || window.webkitURL);

    var prefix = {
        xmlns: "http://www.w3.org/2000/xmlns/",
        xlink: "http://www.w3.org/1999/xlink",
        svg: "http://www.w3.org/2000/svg"
    };

    function getSources(doc, emptySvgDeclarationComputed) {

        var svgInfo = [],
            svgs = doc.querySelectorAll("#svgContainer > svg");

        [].forEach.call(svgs, function (svg) {

            var par = svg.parentNode;
            svg = svg.cloneNode(true);
            par.appendChild(svg);
            var gGroup = svg.childNodes[0];

            svg.setAttribute("version", "1.1");

            // removing attributes so they aren't doubled up
            svg.removeAttribute("xmlns");
            svg.removeAttribute("xlink");

            // These are needed for the svg
            if (!svg.hasAttributeNS(prefix.xmlns, "xmlns")) {
                svg.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
            }

            if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
                svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
            }

            svg.setAttribute("width", gGroup.getBBox().width);
            svg.setAttribute("height", gGroup.getBBox().height);
            gGroup.setAttribute("transform", "");

            setInlineStyles(svg, emptySvgDeclarationComputed);

            var source = (new XMLSerializer()).serializeToString(svg);
            var rect = svg.getBoundingClientRect();
            svgInfo.push({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                class: svg.getAttribute("class"),
                id: svg.getAttribute("id"),
                childElementCount: svg.childElementCount,
                source: [doctype + source]
            });

            par.removeChild(svg);

        });
        return svgInfo;
    }

    document.getElementById("button.downloadSVG").addEventListener("click", function () {

        var emptySvg = document.createElementNS(prefix.svg, 'svg');
        document.body.appendChild(emptySvg);
        var emptySvgDeclarationComputed = getComputedStyle(emptySvg);
        var source = getSources(document, emptySvgDeclarationComputed)[0];
        var filename = (classView || {}).SELECTED_NAME || "classDiagram";
        var img = new Image();
        var url = window.URL.createObjectURL(new Blob(source.source, { "type" : 'image/svg+xml;charset=utf-8' }));
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.setAttribute("width", source.width);
        canvas.setAttribute("height", source.height);
        document.body.appendChild(canvas);

        img.onload = function () {
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL("image/png");
            var a = document.createElement("a");
            a.setAttribute("download", filename + ".png");
            a.setAttribute("href", dataURL/*url*/);
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                a.parentNode.removeChild(a);
                document.body.removeChild(emptySvg);
                canvas.parentNode.removeChild(canvas);
                window.URL.revokeObjectURL(url);
            }, 10);
        };

        img.src = url;

    });

    function setInlineStyles(svg, emptySvgDeclarationComputed) {

        function explicitlySetStyle (element) {
            var cSSStyleDeclarationComputed = getComputedStyle(element);
            var i, len, key, value;
            var computedStyleStr = "";
            for (i=0, len=cSSStyleDeclarationComputed.length; i<len; i++) {
                key=cSSStyleDeclarationComputed[i];
                value=cSSStyleDeclarationComputed.getPropertyValue(key);

                // weird fix for weird bug in chrome: css rewrites w/h tag attributes!
                if (value === "auto" && (key === "width" || key === "height")) continue;

                if (value!==emptySvgDeclarationComputed.getPropertyValue(key)) {
                    computedStyleStr+=key+":"+value+";";
                }
            }
            element.setAttribute('style', computedStyleStr);
        }
        function traverse(obj){
            var tree = [];
            tree.push(obj);
            visit(obj);
            function visit(node) {
                if (node && node.hasChildNodes()) {
                    var child = node.firstChild;
                    while (child) {
                        if (child.nodeType === 1 && child.nodeName != 'SCRIPT'){
                            tree.push(child);
                            visit(child);
                        }
                        child = child.nextSibling;
                    }
                }
            }
            return tree;
        }
        // hardcode computed css styles inside svg
        var allElements = traverse(svg);
        var i = allElements.length;
        while (i--){
            explicitlySetStyle(allElements[i]);
        }
    }


};