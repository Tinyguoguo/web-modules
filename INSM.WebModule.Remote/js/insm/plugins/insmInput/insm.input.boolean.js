/*
* INSM Asset
* This file contain the INSM Input String function.
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
*/

; (function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');

            _plugin = {
                settings: $.extend({
                    type: 'boolean',
                    defaultValue: false,
                    multiValue: false,
                    disabled: false,
                    value: false
                }, options),
                data: {
                    type: null,
                    currentView: null
                }
            };

            if (typeof _plugin.settings.value === "string") {
                var myValue = _plugin.settings.value.toLowerCase();
                if (myValue === "true") {
                    _plugin.settings.value = true;
                } else if (myValue === "false") {
                    _plugin.settings.value = false;
                }
            };
            if (typeof _plugin.settings.value === "object") {
                _plugin.settings.value = false;
            };

            if (typeof _plugin.settings.value !== "boolean") {
                throw new Error("Type Error");
            }
            
            $this.data('insmInputBoolean', _plugin);


            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');
            
            var checkbox = $('<input type="checkbox" disabled />');

            if (_plugin.settings.value === true) {
                checkbox.attr("checked", true);
            } else {
                checkbox.attr("checked", false);
            }

            $this.html(checkbox);

            _plugin.data.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');

            var checkbox = $('<input type="checkbox" />');
            
            if (_plugin.settings.value === true) {
                checkbox.attr("checked", true);
            } else {
                checkbox.attr("checked", false);
            }


            checkbox.change(function (event) {
                if ($(event.target).is(':checked')) {
                    _plugin.settings.value = true;
                }
                else {
                    _plugin.settings.value = false;
                }
            });

            $this.html(checkbox);



            _plugin.data.currentView = 'edit';

            return $this;
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');

            _plugin.settings.value = value;

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');

            return _plugin.settings.value;
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');
            if (_plugin.data.type == "input") {
                _plugin.settings.currentValue = value;
                _plugin.data.element.val(_plugin.settings.currentValue[0])
                _plugin.settings.onUpdate($this.insmInputBoolean('getValue'));
            } else {
                throw new Exception("setValue missing implementation!");
            }
        },
        validate: function () {
            return true;
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');

            switch(_plugin.data.type){
                case 'input':
                    _plugin.data.element.val("");
                break;
                case 'dropdown':
                    _plugin.data.element.children().removeAttr("selected");
                    _plugin.data.element.children().eq(0).attr("selected", "selected");
                break;
            }
            // clear current value
            _plugin.settings.currentValue = [];
            $this.find(".selected").children().remove();
            return $this;

        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputBoolean');
            
            if (_plugin.settings.value != options.value) {
                _plugin.settings.value = options.value;
                switch (_plugin.data.currentView) {
                    case 'view':
                        $this.insmInputBoolean('view');
                        break;
                    case 'edit':
                        $this.insmInputBoolean('edit');
                        break;
                    default:
                        break;
                }
            }

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputBoolean', null);

            return $this;
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