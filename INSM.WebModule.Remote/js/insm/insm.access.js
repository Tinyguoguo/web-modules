/*
* INSM Access
* This file contain the INSM Access function.
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $.insmAccess(options);
*
* Author:
* Mikael Berglund
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmAccess');

            if (!$.insmFramework('isInitialized')) {
                $.insmNotification({
                    type: 'error',
                    text: 'Framework not initialized before calling Access'
                });
                return $this;
            }

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        enableModuleAccessRestriction: false
                    }, options)
                };
                $this.data('insmAccess', _plugin);
            }
            return $this;
        },
        getModuleAccess: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmAccess');

            if (!_plugin) {
                $.insmNotification({
                    type: 'error',
                    text: 'INSM Access not initialized in when calling getModuleAccess'
                });
                return new $.Deferred().reject();
            }
            if (_plugin.settings.enableModuleAccessRestriction) {
                return $.insmFramework('access', {
                    method: 'get',
                    actiontype: 'module',
                    actionSubType: options.module,
                    success: function (data) {
                        options.success(data);
                    },
                    error: function (message) {
                        $.insmNotification({
                            type: 'error',
                            text: message
                        });
                    },
                    denied: function () {
                        if (typeof options.denied == 'function') {
                            options.denied();
                        }
                    }
                });
            }
            else {
                options.success({
                    AccessLevel: 'Write'
                });
                return new $.Deferred().resolve();
            }
        }
    };
    $.insmAccess = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAccess');
        }
    };
})(jQuery);
