/*
* INSM Plugin Name
* This file contain the INSM Plugin Name function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmPluginTemplate(settings);
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPluginTemplate');

            if (!_plugin) {
                _plugin = {
                    htmlElements: {

                    },
                    data: {

                    },
                    settings: $.extend({

                    }, options)
                };
                $this.data('insmPluginTemplate', _plugin);
            }

            
            return $this;
        },
        pluginMethodExample1: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPluginTemplate');

            $this.fadeOut(1000, function () {
                $this.fadeIn();
            });

            // Return $this for chaining
            return $this;
        },
        pluginMethodExample2: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPluginTemplate');

            if (!options.value1 || options.value2) {

                // Handle any errors like this
                throw new Error("Missing required parameters");
            }

            var returnValue = options.value1 + options.value2;

            // Return calculated value
            return returnValue;
        }
    };

    $.fn.insmPluginTemplate = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPluginTemplate');
        }
    };
})(jQuery);