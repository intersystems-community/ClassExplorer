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
    rename = require("gulp-rename"),
    preprocess = require("gulp-preprocess");

var INSTALLER_CLASS_NAME = "ClassExplorer.Installer";

var banner = [
    "",
    "/*! <%= pkg.name %>",
    " ** <%= pkg.description %>",
    " ** @author <%= pkg.author %>",
    " ** @version <%= pkg.version %>",
    " ** @license <%= pkg.license %>",
    " ** @see https://github.com/ZitRos/CacheClassExplorer",
    " **/",
    ""
].join("\n"),
    context = {
        context: {
            package: pkg
        }
    };

var specialReplace = function () {
    return replace(/[^\s]+\/\*build\.replace:(.*)\*\//g, function (part, match) {
        var s = match.toString();
        return s.replace(/pkg\.([a-zA-Z]+)/g, function (p,a) { return pkg[a]; });
    });
};

gulp.task("clean", function () {
    return gulp.src("build", {read: false})
        .pipe(clean());
});

gulp.task("gatherLibs", ["clean"], function () {
    return gulp.src([
            "src/web/jsLib/jquery.min.js",
            "src/web/jsLib/lodash.min.js",
            "src/web/jsLib/backbone-min.js",
            "src/web/jsLib/joint.js",
            "src/web/jsLib/joint.shapes.uml.js",
            "src/web/jsLib/ImageExporter.js"
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
            "src/web/jsLib/joint.layout.DirectedGraph.min.js"
        ]))
        .pipe(stripComments({ safe: true }))
        .pipe(concat("index.js"))
        .pipe(replace(//g, "\\x0B"))
        .pipe(replace(/\x1b/g, "\\x1B"))
        .pipe(gulp.dest("build/web/js/"));
});

gulp.task("gatherScripts", ["clean", "gatherLibs"], function () {
    return gulp.src("src/web/js/*.js")
        .pipe(concat("index.js"))
        .pipe(specialReplace())
        .pipe(wrap("CacheClassExplorer = (function(){<%= contents %> return CacheClassExplorer;}());"))
        .pipe(uglify({
            output: {
                ascii_only: true,
                width: 30000,
                max_line_len: 30000
            },
            preserveComments: "some"
        }))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(addsrc.prepend("build/web/js/index.js"))
        .pipe(concat("index.js"))
        .pipe(replace(/\x1b/g, "\\x1B"))
        .pipe(gulp.dest("build/web/js/"));
});

gulp.task("gatherCSS", ["clean"], function () {
    return gulp.src("src/web/css/*.css")
        .pipe(concat("index.css"))
        .pipe(postcss([ autoprefixer({ browsers: ["last 3 version"] }) ]))
        .pipe(minifyCSS({ keepSpecialComments: 0 }))
        .pipe(gulp.dest("build/web/css/"));
});

gulp.task("addHTMLFile", ["clean"], function () {
    return gulp.src("src/web/index.html")
        .pipe(htmlReplace({
            "css": "css/index.css",
            "js": "js/index.js"
        }))
        .pipe(gulp.dest("build/web/"));
});

gulp.task("copyLICENSE", ["clean"], function () {
    return gulp.src("LICENSE")
        .pipe(gulp.dest("build/"));
});

gulp.task("copyREADME", ["clean"], function () {
    return gulp.src("readme.md")
        .pipe(gulp.dest("build/"));
});

gulp.task("pre-cls", ["clean"], function () {
    return gulp.src(["src/cls/**/*.cls"])
        .pipe(rename(function (f) {
            f.basename = (f.dirname === "." ? "" : f.dirname + ".") + f.basename;
            f.dirname = ".";
            if (f.basename !== INSTALLER_CLASS_NAME)
                context.context.compileAfter +=
                    (context.context.compileAfter ? "," : "") + f.basename;
        }))
        .pipe(gulp.dest("build/cls/"));
});

gulp.task("cls", ["pre-cls", "copyLICENSE", "copyREADME", "addHTMLFile", "gatherScripts",
        "gatherCSS"], function () {
    return gulp.src(["build/cls/**/*.cls"])
        .pipe(preprocess(context))
        .pipe(gulp.dest("build/cls"));
});

gulp.task("zipRelease", function () {
    return gulp.src(["build/**/*", "!build/web/**/*.*", "!build/cls/**/*.*"])
        .pipe(zip("CacheClassExplorer-v" + pkg["version"] + ".zip", {
            comment: "Cache UML explorer v" + pkg["version"] + " by Nikita Savchenko\n\n" +
            "+ Cache folder holds XML file to import to InterSystems Cache.\n\n" +
            "For further information about installation and information, check README.md file.\n\n"
            + "See https://github.com/intersystems-ru/UMLExplorer"
        }))
        .pipe(gulp.dest("build"));
});

gulp.task("desktop", ["default"], function () {
    return gulp.src("build/Cache/*")
        .pipe(gulp.dest("C:/Users/ZitRo/Desktop"));
});

gulp.task("default", ["cls"]);