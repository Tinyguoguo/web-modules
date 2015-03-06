/*
* INSM Dataset Editor
* This file contain the INSM Data Type function.
* The script display a list of all players in an Instoremedia Assets Management Server (AMS).
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmDataType(settings);
*
* File dependencies:
* jQuery 1.6.1
* Fancybox 1.3.4
* GetUrlParam 2.1
* insm.framework
* insm.utilities
* insm.tooltip
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmDataType');
            //If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    framework: null
                };
                $this.data('insmDataType', _plugin);
            }
        },
        display: function (options) {
            switch (options.type) {
                case 'string':
                    return function (value) {
                        return value;
                    }
                    break;
                case 'bool':
                    return function (value) {
                        if (value) {
                            return $('<input type="checkbox" />').attr('checked', 'checked');
                        }
                        else {
                            return $('<input type="checkbox" />');
                        }
                    }
                    break;
                default:
                    $.insmNotification({
                        type: 'error',
                        text: 'Type "' + options.type + '" not recognised in INSM Data Type'
                    });
                    break;
            }
        },
        inputField: function (options) {

        }
    };

    $.insmDataType = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmDataType');
        }
    };

})(jQuery);
