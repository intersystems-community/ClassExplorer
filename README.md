# ObjectScript Class Explorer

An UML class explorer for InterSystems products: IRIS, Ensemble, HealthShare, Caché. Read more about class explorer [on InterSystems Developer Community](https://community.intersystems.com/post/cach%C3%A9-class-explorer-%E2%80%94-exploring-cach%C3%A9-uml-notation).

##### Key features

+ Build class diagrams for arbitrary list of classes;
+ Build diagrams for whole package or subpackage;
+ Edit diagrams after build;
+ Switch between strict UML notation and designed view;
+ Export diagrams as an image;
+ See Class methods, properties, parameters, SQL queries, xDatas and more;
+ See any keywords and related information by hovering over everything with pointer;
+ Check which fields are connected by hovering over link; 
+ View methods code, sql queries and xDatas with syntax highlighting;
+ Zoom in and out;
+ Search on diagram or in class tree;
+ Explore!

## Screenshots

![Demo](https://cloud.githubusercontent.com/assets/4989256/14227108/bad7a9ae-f8fd-11e5-85c6-06e746d281be.png)

## Installation

To install latest Caché Class Explorer, you just need to import ClassExplorer package. Download the
archive from [latest releases](https://github.com/intersystems-ru/UMLExplorer/releases), and then import
<code>Cache/CacheClassExplorer-vX.X.X.xml</code> file.

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
modules from NPM for the project.

After that and each next time just run <code>npm run gulp</code> command from the project root.
This will generate <code>build</code> directory, where you will find XML file ready to import.

## Related Discussion

See the detailed description and discussion  [in this article](https://community.intersystems.com/node/407056).
Have a look at [InterSystems Developer Community](community.intersystems.com) to learn about InterSystems technology, sharing solutions and staying up-to-date on the latest developments.
