var gulp = require("gulp"),
    fs = require("fs"),
    clean = require("gulp-clean"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    wrap = require("gulp-wrap"),
    stripComments = require("gulp-strip-comments"),
    addsrc = require('gulp-add-src'),
    minifyCSS = require("gulp-minify-css"),
    htmlReplace = require("gulp-html-replace"),
    header = require("gulp-header"),
    replace = require("gulp-replace"),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer-core'),
    pkg = require("./package.json"),
    zip = require("gulp-zip"),
    rename = require("gulp-rename");

var banner = [
    "",
    "/*! <%= pkg.name %>",
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

gulp.task("gatherLibs", ["clean"], function () {
    return gulp.src([
            "web/jsLib/joint.js",
            "web/jsLib/joint.shapes.uml.js"
        ])
        .pipe(uglify({
            output: {
                ascii_only: true,
                width: 30000,
                max_line_len: 30000
            },
            preserveComments: "some"
        }))
        .pipe(addsrc.append([
            "web/jsLib/joint.layout.DirectedGraph.min.js"
        ]))
        .pipe(stripComments({ safe: true }))
        .pipe(concat("CacheUMLExplorer.js"))
        .pipe(replace(//g, "\\x0B"))
        .pipe(replace(/\x1b/g, "\\x1B"))
        .pipe(gulp.dest("build/web/js/"));
});

gulp.task("gatherScripts", ["clean", "gatherLibs"], function () {
    return gulp.src("web/js/*.js")
        .pipe(concat("CacheUMLExplorer.js"))
        .pipe(replace(/[^\s]+\/\*build.replace:(.*)\*\//g, "$1"))
        .pipe(wrap("CacheUMLExplorer = (function(){<%= contents %> return CacheUMLExplorer;}());"))
        .pipe(uglify({
            output: {
                ascii_only: true,
                width: 30000,
                max_line_len: 30000
            },
            preserveComments: "some"
        }))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(addsrc.prepend("build/web/js/CacheUMLExplorer.js"))
        .pipe(concat("CacheUMLExplorer.js"))
        .pipe(replace(/\x1b/g, "\\x1B"))
        .pipe(gulp.dest("build/web/js/"));
});

gulp.task("gatherCSS", ["clean"], function () {
    return gulp.src("web/css/*.css")
        .pipe(concat("CacheUMLExplorer.css"))
        .pipe(postcss([ autoprefixer({ browsers: ["last 3 version"] }) ]))
        .pipe(minifyCSS({ keepSpecialComments: 0 }))
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

gulp.task("copyLICENSE", ["clean"], function (){
    return gulp.src("LICENSE")
        .pipe(gulp.dest("build/"));
});

gulp.task("copyREADME", ["clean"], function (){
    return gulp.src("readme.md")
        .pipe(gulp.dest("build/"));
});

gulp.task("exportCacheXML", [
    "clean", "gatherCSS", "gatherScripts", "addHTMLFile", "copyLICENSE", "copyREADME"
], function () {
    return gulp.src("cache/projectTemplate.xml")
        .pipe(replace(/\{\{replace:HTML}}/, fs.readFileSync("build/web/index.html", "utf-8")))
        .pipe(replace(
            /\{\{replace:css}}/,
            function () { return fs.readFileSync("build/web/css/CacheUMLExplorer.css", "utf-8"); }
        ))
        .pipe(replace(
            /\{\{replace:js}}/,
            function () { return fs.readFileSync("build/web/js/CacheUMLExplorer.js", "utf-8"); }
        ))
        .pipe(rename(function (path) { path.basename = "CacheUMLExplorer-v" + pkg["version"]; }))
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