/*
* INSM Popup
* This file contain the INSM Popup plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmPopup(settings);
*
* File dependencies:
* jQuery 1.6.1
* Fancybox 1.3.4
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $('<a />');
            var _plugin = $this.data('insmRebootPlayer');

            _plugin = {
                settings: $.extend({
                    upid: null,
                    module: null,
                    enableModuleAccessCheck: true
                }, options),
                data: {
                    accesslevel: "Deny"
                }
            };

            $this.addClass('button disabled').text('Reboot player').attr('title', 'Write permission needed');
            
            var defGetAccessLevel = $.Deferred();

            $.insmFramework('initialized').done(function () {
                if (!_plugin.settings.enableModuleAccessCheck) {
                    _plugin.settings.accesslevel = "Write";
                    defGetAccessLevel.resolve();
                    return;
                }
                var user = $.insmFramework('user');
                if (user.Admin) {
                    _plugin.data.accesslevel = "Write";
                    defGetAccessLevel.resolve();
                } else {
                    $.insmAccess('getModuleAccess', {
                        module: _plugin.settings.module,
                        success: function (data) {
                            _plugin.data.accesslevel = data.AccessLevel;
                            defGetAccessLevel.resolve();
                        },
                        error: function (message){
                            throw new Error(message);
                        },
                        denied: function (data) {
                            $.insmNotification({
                                text: data.Message,
                                type: 'error',
                            });
                        }
                    });
                }
            });

            defGetAccessLevel.done(function () {
                if (_plugin.data.accesslevel == "Write") {
                    $this.removeClass('disabled').attr('title', '').click(function () {
                        if (confirm("Are you sure you want to reboot player " + _plugin.settings.upid)) {
                            var not = $.insmNotification({
                                text: 'Sending reboot request',
                                type: 'load',
                                duration: 0
                            })
                            $.insmFramework('rebootPlayer', {
                                upid: _plugin.settings.upid,
                                success: function () {
                                    not.update({
                                        text: 'Request sent',
                                        type: 'successful'
                                    });
                                },
                                error: function (message) {
                                    not.update({
                                        text: message,
                                        type: 'error'
                                    });
                                },
                                denied: function (data) {
                                    not.update({
                                        text: data.Message,
                                        type: 'error'
                                    });
                                }
                            });
                        }
                    });
                }
            });

            return $this;
        },
    };

    $.insmRebootPlayer = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmRebootPlayer');
            return null;
        }
    };
})(jQuery);
