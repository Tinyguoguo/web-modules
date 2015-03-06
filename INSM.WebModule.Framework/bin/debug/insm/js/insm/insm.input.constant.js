/*
* INSM Asset
* This file contain the INSM Input Boolean function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputConstant(settings);
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
            var _plugin = $this.data('insmInputConstant');

            _plugin = {
                settings: $.extend({
                    type: "Constant",
                    autoIncrement: true,
                    required: true,
                    onUpdate: function(currentValue){}
                }, options)
            };

            $this.data('insmInputConstant', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputConstant');

            $this.html(_plugin.settings.currentValue);
            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputConstant');
            
            $this.html(_plugin.settings.currentValue);
            return $this;
        },
        getValue: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInputConstant');

            return _plugin.settings.currentValue;
        },
        validate: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInputConstant');

            if(_plugin.settings.required === true && typeof $this.insmInputConstant("getValue") === 'undefined'){
                return false;
            } else {
                return true;
            }
        },
        destroy: function(){

        }
    };

    $.fn.insmInputConstant = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputConstant');
        }
    };
})(jQuery);