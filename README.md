# CacheUMLExplorer
An UML Class explorer for InterSystems Caché.

##### Key features
+ Build class diagrams;
+ Build diagrams for any package or subpackage;
+ Edit diagrams after build;
+ Export diagrams as an image;
+ View class methods code with syntax highlighting;
+ Zoom in and out, explore big packages and more.

## Screenshots

![Demo](https://cloud.githubusercontent.com/assets/4989256/7898598/7d367720-070d-11e5-9177-dded6abf93e1.png)

## Installation

To install latest Caché UML Explorer, you just need to import UMLExplorer package. Download the
archive from [latest releases](https://github.com/ZitRos/CacheUMLExplorer/releases), and then import
<code>Cache/CacheUMLExplorer-vX.X.X.xml</code> file.

Note that importing UMLExplorer.WebAppInstaller class will also create a /UMLExplorer application.
If you want to create WEB application manually, please, do not import this class. Anyway, <b>
importing this class requires %SYS permission.</b>
## Usage
Visit <code>[server domain and port]/UMLExplorer/</code> (slash at end required) to enter
application.

## Build

To build project, you need [NodeJS](https://nodejs.org) platform to be installed. Then, clone source
code and run <code>npm install</code> from the root of the project. This will install all necessary
modules from NPM. Also run <code>npm install -g gulp</code> if you have no gulp builder in your
modules.

After that and each next time just run <code>gulp</code> command from the project root. This will
generate <code>build</code> directory, where you will found all what you need.
