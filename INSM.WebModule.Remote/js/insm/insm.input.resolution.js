/*
* INSM Asset
* This file contain the INSM Input Boolean function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputResolution(settings);
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
            var _plugin = $this.data('insmInputResolution');

            _plugin = {
                settings: $.extend({
                    currentValue: {
                        Width: 1920,
                        Height: 1080
                    },
                    required: true,
                    initObject: {},
                    onUpdate: function (newValue) { }                   
                }, options)
            };
            $this.data('insmInputResolution', _plugin);
            $this.addClass('input-resolution');

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputResolution');

            $this.text(_plugin.settings.currentValue.Width + " x " + _plugin.settings.currentValue.Height);

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputResolution');

            var inputWidth = $('<div />').insmInput({
                type: 'String',
                currentValue: _plugin.settings.currentValue.Width,
                multiSelect: false,
                onUpdate: function(width) {
                    _plugin.settings.currentValue.Width = width;
                    _plugin.settings.onUpdate(_plugin.settings.currentValue);
                }
            }).insmInput('edit');

            var inputHeight = $('<div />').insmInput({
                type: 'String',
                currentValue: _plugin.settings.currentValue.Height,
                multiSelect: false,
                onUpdate: function(height) {
                    _plugin.settings.currentValue.Height = height;
                    _plugin.settings.onUpdate(_plugin.settings.currentValue);
                }
            }).insmInput('edit');


            var separator = $('<span/>', {
                html: "&times;"
            });

            $this.append(inputWidth, separator, inputHeight);

            return $this;
        },
        getValue: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInputResolution');

            return _plugin.settings.currentValue;
        },
        validate: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInputResolution');

            if(_plugin.settings.required === true && typeof $this.insmInputResolution("getValue") === 'undefined'){
                return false;
            } else {
                return true;
            }
        },
        destroy: function(){

        }
    };


    function createOption(keyValue, vendors, children) {

        var option = $('<option/>', {
            text: keyValue,
            value: keyValue
        });

        option.data("children", children);
        return option;
    }

    $.fn.insmInputResolution = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputResolution');
        }
    };
})(jQuery);