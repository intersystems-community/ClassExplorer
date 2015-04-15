var gulp = require("gulp"),
    fs = require("fs"),
    clean = require("gulp-clean"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    wrap = require("gulp-wrap"),
    minifyCSS = require("gulp-minify-css"),
    htmlReplace = require("gulp-html-replace"),
    header = require("gulp-header"),
    replace = require("gulp-replace"),
    pkg = require("./package.json"),
    zip = require("gulp-zip"),
    rename = require("gulp-rename");

var banner = [
    "/** <%= pkg.name %>",
    " ** <%= pkg.description %>",
    " ** @author <%= pkg.author %>",
    " ** @version <%= pkg.version %>",
    " ** @license <%= pkg.license %>",
    " ** @see https://github.com/ZitRos/CacheUMLExplorer",
    " **/",
    ""
].join("\n");

gulp.task("clean", function () {
    return gulp.src("build", {read: false})
        .pipe(clean());
});

gulp.task("gatherScripts", ["clean"], function () {
    return gulp.src([
            "web/jsLib/joint.min.js",
            "web/jsLib/joint.shapes.uml.js",
            "web/jsLib/joint.layout.DirectedGraph.min.js",
            "web/js/*.js"
        ])
        .pipe(concat("CacheUMLExplorer.js"))
        .pipe(replace(/\/\*\{\{replace:version}}\*\//, "\"" + pkg["version"] + "\""))
        //.pipe(wrap("CacheUMLExplorer = (function(){<%= contents %> return CacheUMLExplorer;}());"))
        .pipe(uglify({
            output: {
                ascii_only: true,
                width: 30000,
                max_line_len: 30000
            }
        }))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest("build/web/js/"));
});

//gulp.task("concatScripts", ["gatherScripts"], function () {
//    return gulp.src([
//            "web/jsLib/joint.min.js",
//            "web/jsLib/joint.layout.DirectedGraph.min.js",
//            "web/jsLib/joint.shapes.uml.js",
//            "build/web/js/CacheUMLExplorer.js"
//        ])
//        .pipe(concat("CacheUMLExplorer.js"))
//        .pipe(gulp.dest("build/web/js/"));
//});

gulp.task("gatherCSS", ["clean"], function () {
    return gulp.src("web/css/*.css")
        .pipe(concat("CacheUMLExplorer.css"))
        .pipe(minifyCSS())
        .pipe(gulp.dest("build/web/css/"));
});

gulp.task("addHTMLFile", ["clean"], function () {
    return gulp.src("web/index.html")
        .pipe(htmlReplace({
            "css": "css/CacheUMLExplorer.css",
            "js": "js/CacheUMLExplorer.js"
        }))
        .pipe(gulp.dest("build/web/"));
});

gulp.task("addHTMLZIPFile", ["clean", "gatherScripts", "gatherCSS"], function () {
    var jsRepl = "<script type='text/javascript'>" + fs.readFileSync("build/web/js/CacheUMLExplorer.js", "utf-8") + "</script>",
        cssRepl = "<style type='text/css'>" + fs.readFileSync("build/web/css/CacheUMLExplorer.css") + "</style>";
    return gulp.src("web/index.html")
        .pipe(concat("ZIPindex.html"))
        .pipe(replace(/<!\-\- build:js \-\->(.|\r|\n)*<!\-\- endbuild \-\->/, function () { return jsRepl; }))
        .pipe(replace(/<!\-\- build:css \-\->(.|\r|\n)*<!\-\- endbuild \-\->/, function () { return cssRepl; }))
        .pipe(gulp.dest("build/web"));
});

gulp.task("copyLICENSE", ["clean"], function (){
    return gulp.src("LICENSE")
        .pipe(gulp.dest("build/"));
});

gulp.task("copyREADME", ["clean"], function (){
    return gulp.src("readme.md")
        .pipe(gulp.dest("build/"));
});

gulp.task("exportCacheXML", [
    "clean", "gatherCSS", "addHTMLFile", "addHTMLZIPFile", "copyLICENSE", "copyREADME"
], function () {
    return gulp.src("cache/projectTemplate.xml")
        .pipe(
        replace(/\{\{replace:HTML}}/,
            fs.readFileSync("build/web/ZIPindex.html", "utf-8"))
        )
        .pipe(rename(function (path) { path.basename += "-v" + pkg["version"]; }))
        .pipe(gulp.dest("build/Cache"));
});

gulp.task("zipRelease", ["exportCacheXML"], function () {
    return gulp.src("build/**/*")
        .pipe(zip("CacheUMLExplorer-v" + pkg["version"] + ".zip", {
            comment: "Cach? UML explorer v" + pkg["version"] + " by Nikita Savchenko\n\n" +
            "+ WEBModule folder holds packed JS/CSS files to integrate CacheUMLExplorer to any WEB " +
            "application;\n" +
            "+ Cache folder holds XML file to import to InterSystems Cache.\n\n" +
            "For further information about installation and information, check README.md file."
        }))
        .pipe(gulp.dest("build"));
});

gulp.task("desktop", ["default"], function () {
    return gulp.src("build/Cache/*")
        .pipe(gulp.dest("C:/Users/ZitRo/Desktop"));
});

gulp.task("default", ["zipRelease"]);