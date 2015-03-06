/*
* INSM Helper
* This file contain the INSM Helper function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmHelper(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmHelper');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        data: {},
                        method: function () {

                        }
                    }, options),
                    data: {
                        layouts: []
                    },
                    htmlElements: {
                        layoutTable: $('<div />')
                    }
                };
                $this.data('insmHelper', _plugin);
            }

            return $this;
        },
        get: function () {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmHelper');

            return _plugin.settings.method(_plugin.settings.data);
        }
    };

    $.fn.insmHelper = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmHelper');
        }
    };
})(jQuery);