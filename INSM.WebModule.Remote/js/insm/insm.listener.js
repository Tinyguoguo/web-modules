/*
* INSM Listener
* This file contain the INSM Listener function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmListener(settings);
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
            var _plugin = $this.data('insmListener');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        onEvent: function (context, parameters) {

                        },
                        init: function(context) {
                            
                        }
                    }, options)
                };
                $this.data('insmListener', _plugin);
            }

            _plugin.settings.init($this);

            return $this;
        },
        onEvent: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmListener');
            if (_plugin) {
                _plugin.settings.onEvent($this, options);
            }
            return $this;
        }
    };

    $.fn.insmListener = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmListener');
        }
    };
})(jQuery);