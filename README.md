# Cache Class Explorer
An UML Class explorer for InterSystems Caché.

##### Key features
+ Build class diagrams;
+ Build diagrams for any package or subpackage;
+ Edit diagrams after build;
+ Switch between strict UML notation and designed view;
+ Export diagrams as an image;
+ See Class methods, properties, parameters, SQL queries and more;
+ See any keywords and related information by hovering over everything with pointer;
+ View class methods code with syntax highlighting;
+ Zoom in and out;
+ Search on diagram or in class tree;
+ Explore!

## Screenshots

![Demo](https://cloud.githubusercontent.com/assets/4989256/10566777/112646cc-75f9-11e5-95cc-3db82abf1706.png)

## Installation

To install latest Caché Class Explorer, you just need to import ClassExplorer package. Download the
archive from [latest releases](https://github.com/intersystems-ru/UMLExplorer/releases), and then import
<code>Cache/CacheUMLExplorer-vX.X.X.xml</code> file.

###### Web application
Note that importing ClassExplorer.WebAppInstaller class will also create a /ClassExplorer application.
If you want to create WEB application manually, please, do not import this class. Anyway, <b>
importing this class requires %SYS permission.</b>

## Usage
Visit <code>[server domain and port]/ClassExplorer/</code> (slash at end required) to enter
application.

## Build

To build project, you need [NodeJS](https://nodejs.org) platform to be installed. Then, clone source
code and run <code>npm install</code> from the root of the project. This will install all necessary
modules from NPM. Also run <code>npm install -g gulp</code> if you have no gulp builder in your
modules.

After that and each next time just run <code>gulp</code> command from the project root. This will
generate <code>build</code> directory, where you will found all what you need.
