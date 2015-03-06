/*
* INSM Ams Settings
* This file contain the INSM Ams Settings function.
* 
* This file may only be used by Instoremedia AB or it's customers and partners.
* 
* Called by $('identifier').insmAmsSettings(settings);
*
* File dependencies:
* jQuery 1.6.1
* jQuery bbq plugin v1.2.1
* jQuery dynatree
* 
* Author:
* Tobias Rahm, Mikael Berglund
* Instoremedia AB 
*/

(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmAmsSettings');
            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        amsSettings: $('<div />', { "class": "amsSettings" })
                    },
                    data: {
                        amsSettings: null
                    },
                    settings: $.extend({
                        framework: null,
                        regionId: 1,
                        applicationName: 'Ams Settings',
                        ssl: false,
                        ams: '',
                        version: manifest.version,
                        headers: {
                            Key: {
                                output: function (setting) {
                                    return setting.Key;
                                },
                                sort: function (a, b) {
                                    if (a.Key.toLowerCase() < b.Key.toLowerCase()) {
                                        return 1;
                                    }
                                    return -1;
                                }
                            },
                            Name: {
                                output: function (setting) {
                                    return setting.Name;
                                },
                                sort: function (a, b) {
                                    if (a.Name.toLowerCase() < b.Name.toLowerCase()) {
                                        return 1;
                                    }
                                    return -1;
                                }
                            },
                            Description: {
                                output: function (setting) {
                                    return setting.Description;
                                },
                                sort: function (a, b) {
                                    if (a.Description.toLowerCase() < b.Description.toLowerCase()) {
                                        return 1;
                                    }
                                    return -1;
                                }
                            },
                            Value: {
                                tdClass: function (setting) {
                                    if (setting.Value != setting.DefaultValue) {
                                        return 'highlight';
                                    }
                                    return '';
                                },
                                output: function (setting) {
                                    return setting.Value;
                                },
                                sort: function (a, b) {
                                    if (!a.Value)
                                        a.Value = '0';
                                    if (!b.Value)
                                        b.Value = '0';
                                    if (a.Value.toLowerCase() < b.Value.toLowerCase()) {
                                        return 1;
                                    }
                                    return -1;
                                }
                            },
                            DefaultValue: {
                                tdClass: function (setting) {
                                    if (setting.DefaultValue != setting.Value) {
                                        return 'highlight';
                                    }
                                    return '';
                                },
                                output: function (setting) {
                                    return setting.DefaultValue;
                                },
                                sort: function (a, b) {
                                    a = $.extend({}, a);
                                    b = $.extend({}, b);

                                    if (!a.DefaultValue)
                                        a.DefaultValue = '';
                                    if (!b.DefaultValue)
                                        b.DefaultValue = '';
                                    if (a.DefaultValue.toLowerCase() < b.DefaultValue.toLowerCase()) {
                                        return 1;
                                    }
                                    else if (a.DefaultValue.toLowerCase() > b.DefaultValue.toLowerCase()) {
                                        return -1;
                                    }
                                    return 0;
                                }
                            },
                            Default: {
                                output: function (setting) {
                                    if (setting.DefaultValue != setting.Value) {
                                        return 'No';
                                    }
                                    return 'Yes';
                                },
                                sort: function (a, b) {
                                    if (_plugin.settings.headers.Default.output(a) < _plugin.settings.headers.Default.output(b)) {
                                        return 1;
                                    }
                                    else if (_plugin.settings.headers.Default.output(a) > _plugin.settings.headers.Default.output(b)) {
                                        return -1;
                                    }
                                    return 0;
                                }
                            },
                            Type: {
                                attr: 'Type',
                                output: function (setting) {
                                    return setting.Type;
                                },
                                sort: function (a, b) {
                                    if (a.Type.toLowerCase() < b.Type.toLowerCase()) {
                                        return 1;
                                    }
                                    return -1;
                                }
                            },
                            Section: {
                                attr: 'Section',
                                output: function (setting) {
                                    return setting.Section;
                                },
                                sort: function (a, b) {
                                    if (a.Section.toLowerCase() < b.Section.toLowerCase()) {
                                        return 1;
                                    }
                                    return -1;
                                }
                            },
                            Role: {
                                attr: 'Role',
                                output: function (setting) {
                                    return setting.Role;
                                },
                                sort: function (a, b) {
                                    if (a.Role.toLowerCase() < b.Role.toLowerCase()) {
                                        return 1;
                                    }
                                    return -1;
                                }
                            },
                            Kind: {
                                attr: 'Kind',
                                output: function (setting) {
                                    return setting.Kind;
                                },
                                sort: function (a, b) {
                                    if (a.Kind.toLowerCase() < b.Kind.toLowerCase()) {
                                        return 1;
                                    }
                                    return -1;
                                }
                            }
                        }
                    }, options)
                };
                $this.data('insmAmsSettings', _plugin);
            }

            var frameworkNotificationHandle = $.insmNotification({
                type: 'load',
                text: 'Initializing Instoremedia',
                duration: 0
            });

            if (!_plugin.settings.framework) {
                if (!$.insmFramework('isInitialized')) {
                    $.insmFramework({
                        ams: _plugin.settings.ams,
                        app: _plugin.settings.applicationName,
                        version: _plugin.settings.version,
                        protocol: (_plugin.settings.ssl ? 'https' : 'http'),
                        session: (urlDecode($(document).getUrlParam('session')) || '')
                    });
                }
            }

            $.when($.insmFramework('initialized')).done(function (data) {
                frameworkNotificationHandle.update({
                    type: 'successful',
                    text: 'Initializing Instoremedia successful'
                });
                _plugin.framework = $.insmFramework('getDeprecatedFramework');

                $.insmFramework('amsSettings', {
                    success: function (data) {
                        _plugin.data.amsSettings = data;
                        // Init HTML
                        $this.append(_plugin.htmlElements.amsSettings).addClass('nowrap');

                        // Init Views
                        $this.insmAmsSettings('displayAppSettings');
                    },
                    error: function (data) {
                    },
                    denied: function (data) {
                        $.insmFramework('login', {
                            success: function () {
                                $this.insmAmsSettings(options);
                            }
                        });
                    }
                });
            });

            return $this;
        },
        displayAppSettings: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmAmsSettings');

            // Clear container
            _plugin.htmlElements.amsSettings.empty();

            // Draw App settings
            _plugin.htmlElements.amsSettings.insmTablesorter({
                headers: _plugin.settings.headers,
                data: _plugin.data.amsSettings
            });
        }
    };

    $.fn.insmAmsSettings = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmAmsSettings');
        }
    };
})(jQuery);