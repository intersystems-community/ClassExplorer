/**
 * Visualization for classes.
 * @constructor
 */
var ClassView = function (container) {

    this.container = container;

    this.graph = null;
    this.paper = null;

    this.init();

};

ClassView.prototype.render = function (data) {

    var className, classProps, classMethods, classInstance,
        uml = joint.shapes.uml, attrArr, methArr;

    this.graph.clear();

    if (!data["classes"]) {
        console.error("Wrong data: no 'classes' property.", data);
        return;
    }

    for (className in data["classes"]) {
        classProps = data["classes"][className]["properties"];
        classMethods = data["classes"][className]["methods"];

        classInstance = new uml.Class({
            name: className,
            attributes: attrArr = (function (ps) {
                var arr = [], n, s;
                for (n in ps) {
                    s = (ps[n]["private"] ? "- " : "+ ") + n + ": " + ps[n]["type"];
                    s.match(/.{1,32}/g).forEach(function (p) {
                        arr.push(p);
                    });
                }
                return arr;
            })(classProps),
            methods: methArr = (function (ps) {
                var arr = [], n, s;
                for (n in ps) {
                    s = "+ " + n + (ps[n]["returns"] ? ": " + ps[n]["returns"] : "");
                    s.match(/.{1,32}/g).forEach(function (p) {
                        arr.push(p);
                    });
                }
                return arr;
            })(classMethods),
            size: { width: 220, height: Math.max(attrArr.length*14, 12) + Math.max(methArr.length*14, 12) + 30 }
        });

        //classInstance.resize(320, 240);

        this.graph.addCell(classInstance);

    }

    joint.layout.DirectedGraph.layout(this.graph, {
        setLinkVertices: false,
        nodeSep: 100,
        rankSep: 100
    });

};

ClassView.prototype.init = function () {

    this.graph = new joint.dia.Graph;

    this.paper = new joint.dia.Paper({
        el: this.container,
        width: this.container.offsetWidth,
        height: this.container.offsetHeight,
        gridSize: 30,
        model: this.graph,
        origin: {
            x: 100,
            y: 100
        }
    });

    //var classes = {
    //
    //    mammal: new uml.Interface({
    //        position: { x:300  , y: 50 },
    //        size: { width: 240, height: 100 },
    //        name: 'Mammal',
    //        attributes: ['dob: Date'],
    //        methods: ['+ setDateOfBirth(dob: Date): Void','+ getAgeAsDays(): Numeric']
    //    }),
    //
    //    person: new uml.Abstract({
    //        position: { x:300  , y: 300 },
    //        size: { width: 240, height: 100 },
    //        name: 'Person',
    //        attributes: ['firstName: String','lastName: String'],
    //        methods: ['+ setName(first: String, last: String): Void','+ getName(): String']
    //    }),
    //
    //    bloodgroup: new uml.Class({
    //        position: { x:20  , y: 190 },
    //        size: { width: 220, height: 100 },
    //        name: 'BloodGroup',
    //        attributes: ['bloodGroup: String'],
    //        methods: ['+ isCompatible(bG: String): Boolean']
    //    }),
    //
    //    address: new uml.Class({
    //        position: { x:630  , y: 190 },
    //        size: { width: 160, height: 100 },
    //        name: 'Address',
    //        attributes: ['houseNumber: Integer','streetName: String','town: String','postcode: String'],
    //        methods: []
    //    }),
    //
    //    man: new uml.Class({
    //        position: { x:200  , y: 500 },
    //        size: { width: 180, height: 50 },
    //        name: 'Man'
    //    }),
    //
    //    woman: new uml.Class({
    //        position: { x:450  , y: 500 },
    //        size: { width: 180, height: 50 },
    //        name: 'Woman',
    //        methods: ['+ giveABrith(): Person []']
    //    })
    //
    //
    //};
    //
    //_.each(classes, function(c) { graph.addCell(c); });
    //
    //var relations = [
    //    new uml.Generalization({
    //        source: { id: classes.man.id },
    //        target: { id: classes.person.id },
    //        router: { name: 'manhattan' },
    //        connector: { name: 'rounded' }
    //    }),
    //    new uml.Generalization({ source: { id: classes.woman.id }, target: { id: classes.person.id }}),
    //    new uml.Implementation({ source: { id: classes.person.id }, target: { id: classes.mammal.id }}),
    //    new uml.Aggregation({ source: { id: classes.person.id }, target: { id: classes.address.id }}),
    //    new uml.Composition({ source: { id: classes.person.id }, target: { id: classes.bloodgroup.id }})
    //];
    //
    //_.each(relations, function(r) { graph.addCell(r); });

};