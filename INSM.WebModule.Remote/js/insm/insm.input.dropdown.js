/*
* INSM Asset
* This file contain the INSM Input Boolean function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputDropdown(settings);
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
            var _plugin = $this.data('insmInputDropdown');
            _plugin = {
                settings: $.extend({
                    type: "Dropdown",
                    currentValue: null,
                    required: true,
                    values: [],
                    onUpdate: function(currentValue){}
                }, options),
                htmlElements: {
                    dropDown: $("<select/>")
                }
            };
            $this.data('insmInputDropdown', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDropdown');
            $this.empty();
            $this.text(_plugin.settings.values[$this.insmInputDropdown('getValue')]);
            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDropdown');
            $this.empty();
            _plugin.htmlElements.dropDown = $("<select/>");
            _plugin.htmlElements.dropDown.append($('<option selected="selected" value="select">select</select>'));
            
            $.each(_plugin.settings.values, function (key, value) {
                _plugin.htmlElements.dropDown.append($("<option/>", {
                    value: key,
                    text: value
                })); 
            });
        
            $this.append(_plugin.htmlElements.dropDown);
            if (_plugin.settings.currentValue !== null) {
                _plugin.htmlElements.dropDown.val(_plugin.settings.currentValue);
            }

            _plugin.htmlElements.dropDown.change(function (event) {
                if (event.currentTarget.value !== "select") {
                    _plugin.settings.currentValue = event.currentTarget.value;
                } else {
                    _plugin.settings.currentValue = null;
                }
                _plugin.settings.onUpdate($this.insmInputDropdown('getValue'));
            });

            return $this;
        },
        getValue: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInputDropdown');
            return _plugin.settings.currentValue;
        },
        validate: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInputDropdown');

            if (_plugin.settings.required === true && typeof $this.insmInputDropdown("getValue") !== 'string' && $this.insmInputDropdown("getValue") != '') {
                _plugin.htmlElements.dropDown.insmHighlight({
                    type: 'error'
                });
                return false;
            }else{
                return true;
            }
        },
        destroy: function(){

        }
    };

    $.fn.insmInputDropdown = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputDropdown');
        }
    };
})(jQuery);