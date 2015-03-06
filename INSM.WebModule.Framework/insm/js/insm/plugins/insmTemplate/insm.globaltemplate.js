/*
* INSM Global Plugin Template
* This file contains the INSM Global Plugin Template plugin. 
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmGlobalPluginTemplate(options);
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function(options) {
            var $this = $('html').get(0);
            var _plugin = $this.data('insmGlobalPluginTemplate');

            // This method is for initialization only. Defined variables in the _plugin object can be reached in
            // other methods using "$this.data('insmGlobalPluginTemplate')".

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        firstOption: false,
                        secondOption: "Default text",
                        callbackMethod: function () {

                        }
                    }, options)
                };
                $this.data('insmGlobalPluginTemplate', _plugin);
            }

            if (_plugin.settings.someOption) {
                $.insmGlobalPluginTemplate('customMethod');
            }

            return $;
        },
        customMethod: function (options) {
            var $this = $('html').get(0);
            var _plugin = $this.data('insmGlobalPluginTemplate');
            

            return $;
        },
        destroy: function () {
            var $this = $('html').get(0);
            var _plugin = $this.data('insmGlobalPluginTemplate');

            // This method is for clean up. Make sure intervals and timeouts are cleared and anything else that might still be used in the background.

            $this.data('insmGlobalPluginTemplate', null).empty();

            return $;
        }
    };

    $.insmGlobalPluginTemplate = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmGlobalPluginTemplate');
        }
    };

})(jQuery);