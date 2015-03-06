/*
* INSM Plugin Template
* This file contains the INSM Plugin Template plugin. 
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmPluginTemplate(options);
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmPluginTemplate');

            // This method is for initialization only. Defined variables in the _plugin object can be reached in
            // other methods using "$this.data('insmPluginTemplate')".

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        firstOption: false,
                        secondOption: "Default text",
                        callbackMethod: function () {

                        }
                    }, options)
                };
                $this.data('insmPluginTemplate', _plugin);
            }

            return $this;
        },
        customMethod: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPluginTemplate');

            if (options.example) {
                _plugin.settings.target.html('This is just an example.');
            }
            else {
                _plugin.settings.target.html('And this would just happen if example is false or not set.');
            }

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPluginTemplate');

            // This method is for clean up. Make sure intervals and timeouts are cleared and anything else that might still be used in the background.

            $this.data('insmPluginTemplate', null).empty();

            return $this;
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