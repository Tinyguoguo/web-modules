/*
* INSM Asset
* This file contain the INSM Input Boolean function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputBoolean(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
*
* Authors:
* Tobias Rahm - Instoremedia AB
* Koji Wakayama - Creuna AB
*/

;(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');

            _plugin = {
                settings: $.extend({
                    type: "Boolean",
                    currentValue: false,
                    required: true,
                    onUpdate: function(currentValue){}
                }, options),
                data: {
                    previousValue: null
                }
            };
            
            if (typeof _plugin.settings.currentValue === "string") {
                var myValue = _plugin.settings.currentValue.toLowerCase();
                if (myValue === "true") {
                    _plugin.settings.currentValue = true;
                } else if (myValue === "false") {
                    _plugin.settings.currentValue = false;
                }
            };

            if (typeof _plugin.settings.currentValue === "object") {
                _plugin.settings.currentValue = false;
            };

            if(typeof _plugin.settings.currentValue !== "boolean"){
                throw "Type Error";
            }

            _plugin.data.previousValue = _plugin.settings.currentValue;


            $this.data('insmInputBoolean', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');
            $this.empty();

            var checkBox = $("<input/>",{
                type: "checkbox",
                value: _plugin.settings.currentValue,
                disabled : "disabled"
            });

            if(_plugin.settings.currentValue === true){
                checkBox.prop("checked", "checked");
            } else {
                checkBox.removeProp("checked");
            }

            $this.html(checkBox);

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');
            $this.empty();

            var checkBox = $("<input/>",{
                type: "checkbox"
            });
            
            if(_plugin.settings.currentValue === true) {
                checkBox.attr('checked',  'checked');
            }


            checkBox.on('change', function (event) {
                _plugin.settings.currentValue = $(this).is(':checked');
                _plugin.settings.onUpdate(_plugin.settings.currentValue);
            });

            $this.html(checkBox);

            return $this;
        },
        getValue: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');

            return _plugin.settings.currentValue;
        },
        validate: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');

            return true;
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');

            // clear current value
            _plugin.settings.currentValue = false;

            $this.insmInput('edit');
        },
        reset: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');

            _plugin.settings.currentValue = _plugin.data.previousValue;
            _plugin.settings.onUpdate($this.insmInputBoolean('getValue'));

            return $this;
        },
        destroy: function(){

        }
    };

    $.fn.insmInputBoolean = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputBoolean');
        }
    };
})(jQuery);