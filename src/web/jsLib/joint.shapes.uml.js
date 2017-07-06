/* JointJS v0.9.3 - JavaScript diagramming library  2015-02-03


This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * Modified by ZitRo
 */
joint.shapes.uml = {};

joint.shapes.uml.Class = joint.shapes.basic.Generic.extend({

    markup: [
        '<g class="rotatable">',
            '<g class="scalable">',
                '<rect class="uml-class-name-rect"/>',
                '<rect class="uml-class-params-rect"/>',
                '<text class="uml-class-params-label">Parameters</text>',
                '<rect class="uml-class-attrs-rect"/>',
                '<text class="uml-class-attrs-label">Properties</text>',
                '<rect class="uml-class-methods-rect"/>',
                '<text class="uml-class-methods-label">Methods</text>',
                '<rect class="uml-class-queries-rect"/>',
                '<text class="uml-class-queries-label">Queries</text>',
                '<rect class="uml-class-xdatas-rect"/>',
                '<text class="uml-class-xdatas-label">xDatas</text>',
            '</g>',
            '<text class="uml-class-name-text"/>',
            '<text class="uml-class-params-text"/>',
            '<text class="uml-class-attrs-text"/>',
            '<text class="uml-class-methods-text"/>',
            '<text class="uml-class-queries-text"/>',
            '<text class="uml-class-xdatas-text"/>',
            '<g class="tool-remove" event="remove" x="" transform="translate(0,0)"><circle r="11" style="fill: red;"></circle><path transform="scale(.8) translate(-16, -16)" d="M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z"></path><title>Remove class</title></g>',
        '</g>'
    ].join(''),

    HEAD_EMPTY_LINES: 0, // controls number of empty lines in header

    defaults: joint.util.deepSupplement({

        type: 'uml.Class',

        MIN_WIDTH: 100,
        size: { width: 0, height: 300 },

        attrs: {
            rect: { 'width': 0 },

            '.uml-class-name-rect': { 'stroke': 'black', 'stroke-width': 1, 'fill': 'rgb(177, 205, 255)' },
            '.uml-class-params-rect': { 'stroke': 'black', 'stroke-width': 1, 'fill': 'white' },
            '.uml-class-attrs-rect': { 'stroke': 'black', 'stroke-width': 1, 'fill': '#2980b9' },
            '.uml-class-methods-rect': { 'stroke': 'black', 'stroke-width': 1, 'fill': '#2980b9' },
            '.uml-class-queries-rect': { 'stroke': 'black', 'stroke-width': 1, 'fill': '#2980b9' },
            '.uml-class-xdatas-rect': { 'stroke': 'black', 'stroke-width': 1, 'fill': '#2980b9' },

            '.uml-class-name-text': {
                'ref': '.uml-class-name-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle', 'font-weight': 'bold',
                'fill': 'black', 'font-size': 12
            },
            '.uml-class-params-text': {
                'ref': '.uml-class-params-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': 'black', 'font-size': 12
            },
            '.uml-class-attrs-text': {
                'ref': '.uml-class-attrs-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': 'black', 'font-size': 12
            },
            '.uml-class-methods-text': {
                'ref': '.uml-class-methods-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': 'black', 'font-size': 12
            },
            '.uml-class-queries-text': {
                'ref': '.uml-class-queries-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': 'black', 'font-size': 12
            },
            '.uml-class-xdatas-text': {
                'ref': '.uml-class-xdatas-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': 'black', 'font-size': 12
            },
            '.uml-class-attrs-label': {
                ref: '.uml-class-attrs-label', fill: "black", 'font-size': 10,
                xPos: -56
            },
            '.uml-class-methods-label': {
                ref: '.uml-class-methods-label', fill: "black", 'font-size': 10
            },
            '.uml-class-queries-label': {
                ref: '.uml-class-queries-label', fill: "black", 'font-size': 10
            },
            '.uml-class-params-label': {
                ref: '.uml-class-methods-label', fill: "black", 'font-size': 10
            },
            '.uml-class-xdatas-label': {
                ref: '.uml-class-xdatas-label', fill: "black", 'font-size': 10
            }
        },

        name: [],
        params: [],
        attributes: [],
        methods: [],
        queries: [],
        xdatas: [],
        classSigns: []

    }, joint.shapes.basic.Generic.prototype.defaults),

    initialize: function () {

        var o,
            rects = [
                { type: 'name', text: this.getClassName() },
                { type: 'params', text:  (o = this.get('params')||[])    , o: (o.forEach(function(e){e._BLOCK="parameters"}) && o) },
                { type: 'attrs', text:   (o = this.get('attributes')||[]), o: (o.forEach(function(e){e._BLOCK="properties"}) && o) },
                { type: 'methods', text: (o = this.get('methods')||[])   , o: (o.forEach(function(e){e._BLOCK="methods"}) && o) },
                { type: 'queries', text: (o = this.get('queries')||[])   , o: (o.forEach(function(e){e._BLOCK="queries"}) && o) },
                { type: 'xdatas', text: (o = this.get('xdatas')||[])   , o: (o.forEach(function(e){e._BLOCK="xdatas"}) && o) }
            ],
            self = this,
            classSigns = this.get('classSigns'),
            CLASS_TYPE = this.get('classType'),
            SYMBOL_12_WIDTH = this.get('SYMBOL_12_WIDTH') || 6.6,
            i, j, blockWidth, left = 3, top = 3, w, positions = [], sign;

        // set color head according to class type
        var headColor;
        switch (CLASS_TYPE) {
            case "persistent": headColor = "rgb(255,219,170)"; break; // light orange
            case "serial": headColor = "rgb(252,255,149)"; break; // light yellow
            //case "Registered": headColor = "rgb(192,255,170)"; break; // light green
            case "datatype": headColor = "rgb(193,250,255)"; break; // light blue
            case "stream": headColor = "rgb(246,188,255)"; break; // light magenta
            case "view": headColor = "rgb(255,188,188)"; break; // light red
            case "index": headColor = "rgb(228,228,228)"; break; // light gray
        }
        if (headColor) this.attributes.attrs[".uml-class-name-rect"].fill = headColor;

        var subLabelWidth = function (sign) { // object
            return sign.text.length * SYMBOL_12_WIDTH + (sign.icon ? 13 : 0)
        };

        // preserve space for sub-labels
        w = 0; for (i in classSigns) {
            w += subLabelWidth(classSigns[i]);
            i = 1;
        }

        this.defaults.size.width = Math.max(this.defaults.MIN_WIDTH, Math.min(w, 250));
        _.each(rects, function (rect) {
            rect.text.forEach(function (s) {
                var t = s.text.length*SYMBOL_12_WIDTH + 8 + (s.icons ? s.icons.length*10 + 2 : 0);
                if (t > self.defaults.size.width) {
                    self.defaults.size.width = t;
                }
            });
        });

        blockWidth = this.defaults.size.width;

        if (classSigns.length) this.HEAD_EMPTY_LINES = 1;

        // centering algorithm - first, remember position without centering
        j = 0;
        for (i in classSigns) {
            w = classSigns[i].text.length*SYMBOL_12_WIDTH + (classSigns[i].icon ? 13 : 0);
            if (left + w - 3 > blockWidth) { top += 12; left = 3; this.HEAD_EMPTY_LINES++; j++; }
            if (!positions[j]) positions[j] = [];
            positions[j].push({ top: top, left: left, o: classSigns[i] });
            left += w + 3;
        }

        // then draw on position with computed seek by X to center content
        for (i = 0; i < positions.length; i++) { // repeat positions and draw signs
            w = (blockWidth - (sign = positions[i][positions[i].length - 1]).left - subLabelWidth(sign.o)) / 2;
            for (j = 0; j < positions[i].length; j++) {
                sign = positions[i][j];
                this.markup += '<g transform="translate(' + (sign.left + w) + ', ' + sign.top + ')">' +
                    (sign.o.icon ? '<image xlink:href="' + sign.o.icon +
                    '" width="13" height="13"/>' : '') + '<text fill="black" font-size="11" ' +
                    (sign.o.textStyle ? 'style="' + sign.o.textStyle + '"' : '') +
                    ' x="' + (sign.o.icon ? 13 : 0) + '" y="10">' + sign.o.text +
                    '</text></g>';
            }
        }

        this.on('change:name change:attributes change:methods', function () {
            this.updateRectangles();
	        this.trigger('uml-update');
        }, this);

        this.updateRectangles();

        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);

    },

    getClassName: function () {
        var n = this.get('name');
        return n instanceof Array ? n : [{ text: n }];
    },

    updateRectangles: function () {

        var attrs = this.get('attrs'),
            self = this,
            SYMBOL_12_WIDTH = this.get('SYMBOL_12_WIDTH') || 6.6;

        var rects = [
            { type: 'name', text: this.getClassName() },
            { type: 'params', text: this.get('params') },
            { type: 'attrs', text: this.get('attributes') },
            { type: 'methods', text: this.get('methods') },
            { type: 'queries', text: this.get('queries') },
            { type: 'xdatas', text: this.get('xdatas') }
        ];

        var offsetY = 0;

        var dp = self.get("directProps") || {},
            nameClickHandler = dp.nameClickHandler;

        _.each(rects, function(rect) {

            var lines = _.isArray(rect.text) ? rect.text : [{ text: rect.text }];
            if (rect.type === "name") {
                if (self.HEAD_EMPTY_LINES) lines.unshift("");
                for (var i = 0; i < self.HEAD_EMPTY_LINES; i++) lines.unshift({ text: "" });
            }

            var rectHeight = lines.length * 12 + (lines.length ? 10 : 0),
                rectText = attrs['.uml-class-' + rect.type + '-text'],
                rectRect = attrs['.uml-class-' + rect.type + '-rect'],
                rectLabel = attrs['.uml-class-' + rect.type + '-label'];

            rectText.text = lines;

            if (nameClickHandler) {
                if (rect.type === "name") {
                    rectText.clickHandler = nameClickHandler;
                }
            }
            rectRect.transform = 'translate(0,'+ offsetY + ')';
            if (rectLabel) {
                if (lines.length) {
                    rectText.paddingTop = "17px"; rectHeight += 5;
                    rectLabel.transform = 'translate(' + (2) + ','+ (offsetY + 9) + ')';
                } else {
                    rectLabel.display = "none";
                }
            }
            rectRect.height = rectHeight;
            offsetY += rectHeight;

        });

        this.attributes.size.height = offsetY;
        this.attributes.size.width = this.defaults.size.width; // max width assign
        this.attributes.attrs.rect.width = this.defaults.size.width;

    }

});

joint.shapes.uml.ClassView = joint.dia.ElementView.extend({

    initialize: function() {

        joint.dia.ElementView.prototype.initialize.apply(this, arguments);

	this.listenTo(this.model, 'uml-update', function() {
            this.update();
            this.resize();
        });
    }
});

joint.shapes.uml.Abstract = joint.shapes.uml.Class.extend({

    defaults: joint.util.deepSupplement({
        type: 'uml.Abstract',
        attrs: {
            '.uml-class-name-rect': { fill : '#e74c3c' },
            '.uml-class-params-rect': { fill : '#c0392b' },
            '.uml-class-attrs-rect': { fill : '#c0392b' },
            '.uml-class-methods-rect': { fill : '#c0392b' }
        }
    }, joint.shapes.uml.Class.prototype.defaults),

    getClassName: function() {
        return ['<<Abstract>>', this.get('name')];
    }

});
joint.shapes.uml.AbstractView = joint.shapes.uml.ClassView;

joint.shapes.uml.Interface = joint.shapes.uml.Class.extend({

    defaults: joint.util.deepSupplement({
        type: 'uml.Interface',
        attrs: {
            '.uml-class-name-rect': { fill : '#f1c40f' },
            '.uml-class-attrs-rect': { fill : '#f39c12' },
            '.uml-class-methods-rect': { fill : '#f39c12' }
        }
    }, joint.shapes.uml.Class.prototype.defaults),

    getClassName: function() {
        return ['<<Interface>>', this.get('name')];
    }

});
joint.shapes.uml.InterfaceView = joint.shapes.uml.ClassView;

joint.shapes.uml.Generalization = joint.dia.Link.extend({
    defaults: {
        type: 'uml.Generalization',
        attrs: { '.marker-target': { d: 'M 20 0 L 0 10 L 20 20 z', fill: 'white' }}
    }
});

joint.shapes.uml.Implementation = joint.dia.Link.extend({
    defaults: {
        type: 'uml.Implementation',
        attrs: {
            '.marker-target': { d: 'M 20 0 L 0 10 L 20 20 z', fill: 'white' },
            '.connection': { 'stroke-dasharray': '3,3' }
        }
    }
});

joint.shapes.uml.Aggregation = joint.dia.Link.extend({
    defaults: {
        type: 'uml.Aggregation',
        attrs: { '.marker-target': { d: 'M 20 10 L 10 15 L 0 10 L 10 5 z', fill: 'white' }}
    }
});

joint.shapes.uml.Composition = joint.dia.Link.extend({
    defaults: {
        type: 'uml.Composition',
        attrs: { '.marker-target': { d: 'M 20 10 L 10 15 L 0 10 L 10 5 z', fill: 'black' }}
    }
});

joint.shapes.uml.Association = joint.dia.Link.extend({
    defaults: {
        type: 'uml.Association',
        attrs: {
            '.marker-target': {
                d: 'M 15 0 L 0 7.5 L 15 15 M 0 7.5 L 15 7.5',
                fill: 'none'
            },
            '.connection': { stroke: "gray" }
        }
    }
});

// Statechart

joint.shapes.uml.State = joint.shapes.basic.Generic.extend({

    markup: [
        '<g class="rotatable">',
          '<g class="scalable">',
            '<rect class="uml-state-body"/>',
          '</g>',
          '<path class="uml-state-separator"/>',
          '<text class="uml-state-name"/>',
          '<text class="uml-state-events"/>',
        '</g>'
    ].join(''),

    defaults: joint.util.deepSupplement({

        type: 'uml.State',

        attrs: {
            '.uml-state-body': {
                'width': 200, 'height': 200, 'rx': 10, 'ry': 10,
                'fill': '#ecf0f1', 'stroke': '#bdc3c7', 'stroke-width': 3
            },
            '.uml-state-separator': {
                'stroke': '#bdc3c7', 'stroke-width': 2
            },
            '.uml-state-name': {
                'ref': '.uml-state-body', 'ref-x': .5, 'ref-y': 5, 'text-anchor': 'middle',
                'fill': '#000000', 'font-family': 'Courier New', 'font-size': 14
            },
            '.uml-state-events': {
                'ref': '.uml-state-separator', 'ref-x': 5, 'ref-y': 5,
                'fill': '#000000', 'font-family': 'Courier New', 'font-size': 14
            }
        },

        name: 'State',
        events: []

    }, joint.shapes.basic.Generic.prototype.defaults),

    initialize: function() {

        this.on({
            'change:name': this.updateName,
            'change:events': this.updateEvents,
            'change:size': this.updatePath
        }, this);

        this.updateName();
        this.updateEvents();
        this.updatePath();

        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
    },

    updateName: function() {
        this.attr('.uml-state-name/text', this.get('name'));
    },

    updateEvents: function() {
        this.attr('.uml-state-events/text', this.get('events').join('\n'));
    },

    updatePath: function() {

        var d = 'M 0 20 L ' + this.get('size').width + ' 20';

        // We are using `silent: true` here because updatePath() is meant to be called
        // on resize and there's no need to to update the element twice (`change:size`
        // triggers also an update).
        this.attr('.uml-state-separator/d', d, { silent: true });
    }

});

joint.shapes.uml.StartState = joint.shapes.basic.Circle.extend({

    defaults: joint.util.deepSupplement({

        type: 'uml.StartState',
        attrs: { circle: { 'fill': '#34495e', 'stroke': '#2c3e50', 'stroke-width': 2, 'rx': 1 }}

    }, joint.shapes.basic.Circle.prototype.defaults)

});

joint.shapes.uml.EndState = joint.shapes.basic.Generic.extend({

    markup: '<g class="rotatable"><g class="scalable"><circle class="outer"/><circle class="inner"/></g></g>',

    defaults: joint.util.deepSupplement({

        type: 'uml.EndState',
        size: { width: 20, height: 20 },
        attrs: {
            'circle.outer': {
                transform: 'translate(10, 10)',
                r: 10,
                fill: '#ffffff',
                stroke: '#2c3e50'
            },

            'circle.inner': {
                transform: 'translate(10, 10)',
                r: 6,
                fill: '#34495e'
            }
        }

    }, joint.shapes.basic.Generic.prototype.defaults)

});

joint.shapes.uml.Transition = joint.dia.Link.extend({
    defaults: {
        type: 'uml.Transition',
        attrs: {
            '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z', fill: '#34495e', stroke: '#2c3e50' },
            '.connection': { stroke: '#2c3e50' }
        }
    }
});