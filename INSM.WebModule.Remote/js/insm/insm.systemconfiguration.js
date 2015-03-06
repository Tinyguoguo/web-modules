/*
* INSM Channel
* This file contain the INSM Channel function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmChannel(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*
* Sebastian Ekström
* Creuna Sverige AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmSystemConfiguration');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        applicationName: 'System Configuration',
                        enableModuleAccess: false
                    }, options),
                    data: {
                        layouts: [],
                        channels: [],
                        accessLevel: ''
                    },
                    htmlElements: {
                        content: $('<div />')
                    }
                };
                $this.data('insmSystemConfiguration', _plugin);
            }

            if (!$.insmFramework('isInitialized')) {

                // Validate params
                $this.insmRequired({
                    check: {
                        ams: options.ams,
                        ssl: options.ssl
                    }
                });

                $.insmFramework({
                    ams: options.ams,
                    protocol: options.ssl ? 'https' : 'http',
                    version: (manifest.version || 'Development'),
                    app: options.app || 'System Configuration',
                });
            }

            $.insmAccess({
                enableModuleAccessRestriction: _plugin.settings.enableModuleAccess
            });
            var accessLevel = '';

            $.insmFramework('currentUser', {
                success: function () {
                    $.insmAccess('getModuleAccess', {
                        module: _plugin.settings.applicationName.toLowerCase(),
                        success: function (data) {
                            _plugin.data.accessLevel = data.AccessLevel;
                        },
                        denied: function () {
                            $.insmFramework('login', {
                                success: function () {
                                    $this.insmSystemConfiguration(options);
                                }
                            });
                        }
                    }).done(function () {

                        if (_plugin.data.accessLevel == 'Deny') {
                            $.insmPopup({
                                backdropTransparency: false,
                                content: $('<div />').text('Permission denied'),
                                autoOpen: true,
                                showCloseButton: false,
                                backdropClickClose: false
                            });

                            return;
                        }

                        var container = $('<div />').addClass('container');

                        $this.html(
                            $('<div id="insmNotificationContainer" />')
                        );

                        $this.append(
                            $('<div />').addClass('menu').append(
                                $('<a />').addClass('button').text('Channels').click(function () {
                                    $this.find('.menu .button').removeClass('selected');
                                    $(this).addClass('selected');
                                    _plugin.htmlElements.content.empty().text('Loading, please wait...');
                                    _plugin.htmlElements.content.insmChannel({
                                        tableHeaders: _plugin.settings.channelHeaders,
                                        enableEdit: _plugin.data.accessLevel == 'Write' ? true : false
                                    });
                                })
                            ).append(
                                $('<a />').addClass('button').text('Channel Layouts').click(function () {
                                    $this.find('.menu .button').removeClass('selected');
                                    $(this).addClass('selected');
                                    _plugin.htmlElements.content.empty().text('Loading, please wait...');
                                    _plugin.htmlElements.content.insmLayout({
                                        tableHeaders: _plugin.settings.layoutHeaders,
                                        enableEdit: _plugin.data.accessLevel == 'Write' ? true : false
                                    });
                                })
                            ).append(
                                $('<a />').addClass('button').text('Display Layouts').click(function () {
                                    $this.find('.menu .button').removeClass('selected');
                                    $(this).addClass('selected');
                                    _plugin.htmlElements.content.empty().text('Loading, please wait...');
                                    _plugin.htmlElements.content.insmDisplay({
                                        tableHeaders: _plugin.settings.layoutHeaders,
                                        enableEdit: _plugin.data.accessLevel == 'Write' ? true : false
                                    });
                                })
                            ).append(
                                $('<a />').addClass('button').text('Player Engine').click(function () {
                                    $this.find('.menu .button').removeClass('selected');
                                    $(this).addClass('selected');
                                    _plugin.htmlElements.content.empty().text('Loading, please wait...');
                                    _plugin.settings.schedule.enableEdit = _plugin.data.accessLevel == 'Write' ? true : false;
                                    _plugin.htmlElements.content.insmSchedule('destroy').insmSchedule(_plugin.settings.schedule);
                                })
                            ).append(
                                $('<a />').addClass('button').text('Player Engine Store').click(function () {
                                    $this.find('.menu .button').removeClass('selected');
                                    $(this).addClass('selected');
                                    _plugin.htmlElements.content.insmFileManager(_plugin.settings.fileManager);
                                })
                            )
                        );

                        $this.append(
                            $('<div />').addClass('content').append(
                                _plugin.htmlElements.content
                            )
                        );
                    });
                },
                denied: function () {
                    $.insmFramework('login', {
                        success: function () {
                            $this.insmSystemConfiguration(options);
                        }
                    });
                },
                error: function () {

                }
            });

            return $this;
        }
    };

    $.fn.insmSystemConfiguration = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmSystemConfiguration');
        }
    };
})(jQuery);