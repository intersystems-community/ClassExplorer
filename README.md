# CacheUMLExplorer
An UML Class explorer for InterSystems Caché. It is able to build UML class diagram for any class or even for whole package in Caché.

## Screenshots

![2015-04-21_214058](https://cloud.githubusercontent.com/assets/4989256/7396518/65ba1924-eeaa-11e4-808b-5f648c0011e4.png)

## Installation

###### Import classes to Caché
To install Caché UML class explorer, download the [latest release](https://github.com/intersystems-ru/UMLExplorer/releases) or build project by yourself. Then import XML file inside <code>Cache</code> directory of archive or directory.

###### Set up WEB application
When you have imported and compiled <b>UMLExplorer package</b> in Caché, make sure the namespace is the same you have imported classes to. Then go to <code>system management portal -> administering -> security -> applications -> web applications</code> and create there a new web application. Fill the <code>name</code> field of it with <code>/UMLExplorer</code> (slash is required) and set the value of <code>dispatch class</code> to <code>UMLExplorer.Router</code>. Click save. Now your WEB application is ready.

###### Use it
Visit <code>[server domain and port]/UMLExplorer/</code> (with slash at end) to enter application.

## Build

To build project, you need [NodeJS](https://nodejs.org) platform to be installed. Then, clone source code and run <code>npm install</code> from the root of the project. This will install all necessary modules from NPM. Also run <code>npm install -g gulp</code> if you have no gulp builder in your modules.

After that and each next time just run <code>gulp</code> command from the project root. This will generate <code>build</code> directory, where you will found all what you need.
