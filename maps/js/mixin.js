var options  = Em.Mixin.create({
    gatherOptions: function () {
        var options = {};
        var uiOptions = this.get('uiOptions') || [];

        uiOptions.forEach(function (key) {
            if (this.get(key) !== undefined) {
                this.setProp(options, key, this.get(key));
            }
        }, this);

        var uiEvents = this.get('uiEvents') || [];

        uiEvents.forEach(function (event) {
            var callback = this.get(event);

            if (callback && $.isFunction(callback)) {
                this.setProp(options, event, $.proxy(callback, this));
            }
        }, this);
        return options;
    },

    setProp: function(obj, path, value) {
        var keys = path.split('.'),
            key,
            lastKey,
            objRef;

        lastKey = keys.pop();
        objRef = obj;
        while ((key = keys.shift())) {
            if (obj[key])
                obj = obj[key];
            else {
                obj[key] = {};
                obj = obj[key];
            }
        }
        obj[lastKey] = value;
    }

});

App.C = Ember.Object.extend(options, {
    uiOptions: ['obj.prop'],
    uiEvents: ['obj.ev'],

    obj: {
        prop: 'name',
        ev: function() {
            console.log('this is sparta!');
        }
    },

    init: function() {
        this._super();

        console.log(this.gatherOptions());
    }
});