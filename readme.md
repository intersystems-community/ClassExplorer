# ObjectScript Class Explorer
 [![Quality Gate Status](https://community.objectscriptquality.com/api/project_badges/measure?project=intersystems_iris_community%2FClassExplorer&metric=alert_status)](https://community.objectscriptquality.com/dashboard?id=intersystems_iris_community%2FClassExplorer)
 
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

## Docker Quick Demo

1. Clone the repository and run `docker-compose up -d --build` to bring up ClassExplorer to a docker container.
2. Check `localhost:52773/ClassExplorer/` in a little while - it should have the app already.

## Full Installation from XML File

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

## Development

### Local

To build project, you need [NodeJS](https://nodejs.org) platform to be installed. Then, clone source
code and run <code>npm install</code> from the root of the project. This will install all necessary
modules from NPM for the project.

After that and each next time just run <code>npm run gulp</code> command from the project root.
This will generate <code>build</code> directory, where you will find XML file ready to import.

One can import/export the built source to the local Cache/URIS instance (see `import.bat`):

```
./import.bat
```

This will bring `ClassExplorer-v*.*.*.xml` to the `build` directory, which you can then package with `npm run zip`.

### Using docker

:warning: incomplete procedure

```Shell
docker build -f .\Dockerfile-build-npm -t build-npm .
docker run --rm -d --name build-npm build-npm
docker cp build-npm:/opt/irisapp/
docker stop build-npm
```

### ZPM

[ZPM](https://github.com/intersystems-community/zpm) is the package manager for InterSystems products. Currently,
the release pipeline for it is manual. The ZPM release should happen once the package is uploaded
to [InterSystems OpenExchange](https://openexchange.intersystems.com/) with the "ZPM" option checked in. This
should grab **manually moved** files from `build-for-zpm/ClassExplorer` directory for the release.

Locally, one can run and test the application using Docker:

0. Before each release, **manually** patch the version in the `module.xml` file.
1. Run `docker-compose up -d --build` in the repository root to bring up ClassExplorer to a docker container.
2. Check `localhost:52773/ClassExplorer/` in a little while - it should have the app already.
3. Run `docker-compose exec iris iris session iris` and then type `zn "IRISAPP" zpm` to start ZPM session in the "IRISAPP" namespace.
4. Type `load /irisdev/app` to test whether ZPM can parse the repository root.
5. Type `classexplorer package` to try to compile the package. It should say something like `Module package generated: /tmp/dirymgtBA/classexplorer-1.20.0.tgz`.
6. Configure the test registry to publish the package `repo -n registry -r -url https://test.pm.community.intersystems.com/registry/ -user test -pass test` (type `search` to see the registries list).
7. Finally publish the package `classexplorer publish`.
8. Further steps to test it: [https://community.intersystems.com/post/testing-packages-zpm](https://community.intersystems.com/post/testing-packages-zpm)

## Related Discussion

See the detailed description and discussion  [in this article](https://community.intersystems.com/node/407056).
Have a look at [InterSystems Developer Community](community.intersystems.com) to learn about InterSystems technology, sharing solutions and staying up-to-date on the latest developments.

## License

[MIT](LICENSE) © [Nikita Savchenko](https://nikita.tk)
