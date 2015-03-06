/*
* Försvaret Theme Picker
* This file contain the Försvaret Theme Picker function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').forsvaretThemePicker(settings);
*
* File dependencies:
* jQuery 1.8.2
* jQuery UI 1.8.23
* insmNotification
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function(options) {
            var $this = $(this);
            var _plugin = $this.data('forsvaretThemePicker');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        apiUrl: '',
                        applicationName: 'Försvaret Theme Picker',
                        version: manifest.version,
                        header: true,
                        intervalTimeoutTime: 1000
                    }, options),
                    htmlElements: {
                        header: $('<div />'),
                        themeList: {
                            container: $('<ul />')
                        },
                        settings: {
                            container: $('<div />')
                        }
                    },
                    data: {
                        fullscreenInitialized: false,
                        themes: {
                            
                        }
                    },
                    subscriptions: {
                        start: function() {},
                        stop: function() {}
                    },
                    permissions: {

                    }
                };
                $this.data('forsvaretThemePicker', _plugin);
            }

            if (!$.insmFramework('isInitialized')) {
                $.insmFramework({
                    apiUrl: _plugin.settings.apiUrl,
                    applicationName: _plugin.settings.applicationName,
                    version: _plugin.settings.version,
                    session: (urlDecode($(document).getUrlParam('session')) || '')
                });
            }

            if (!_plugin.settings.regionId) {
                // Read users region tree instead
                _plugin.settings.regionId = $.insmFramework('getUser').regionTree.id;
            } else {
                _plugin.settings.showRegionPicker = false;
            }

            return $this;
        },
        preview: function(options) {
            var $this = $(this);
            var _plugin = $this.data('forsvaretThemePicker');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            } else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview forsvaret-themepicker');


            _plugin.settings.previewTarget.click(function() {
                _plugin.settings.show();
            });

            _plugin.settings.previewTarget.html(
                $('<h2 />').text('Theme Picker')
            );

            return _plugin.settings.previewTarget;
        },
        getTarget: function() {
            var $this = $(this);
            var _plugin = $this.data('forsvaretThemePicker');

            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        fullscreen: function(options) {
            var $this = $(this);
            var _plugin = $this.data('forsvaretThemePicker');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function() {
                    $this.insmSystemDetails('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;


            // Init HTML
            _plugin.settings.target.addClass('forsvaret-themepicker').fadeIn();
            _plugin.settings.target.empty();

            if (_plugin.settings.header) {
                _plugin.settings.target.append(
                    _plugin.htmlElements.header.addClass('header').append(
                        $('<div />').addClass('company-logo'),
                        $('<div />').addClass('module-logo')
                    )
                );
            }

            $this.forsvaretThemePicker('resize');
            
            

            _plugin.settings.target.append(
                _plugin.htmlElements.themeList.container.addClass('themes-container'),
                _plugin.htmlElements.settings.container.addClass('settings-container')
            );

            // TODO: Download themes from module settings and set it to _plugin.data.themes
            $.insmFramework('getModuleSettings', {
                namespace: 'forsvaretThemePicker',
                key: 'themes',
                success: function (themes) {
                    _plugin.data.themes = themes;
                    if (typeof _plugin.data.themes != 'object' || _plugin.data.themes == null) {
                        _plugin.data.themes = {};
                    }
                    $this.forsvaretThemePicker('renderThemeList');
                }
            });

            return _plugin.settings.target;
        },
        resize: function() {
            var $this = $(this);
            var _plugin = $this.data('forsvaretThemePicker');
            if (_plugin) {
                var targetHeight = _plugin.settings.target.height();
                var headerHeight = _plugin.htmlElements.header.outerHeight(true);
                
                _plugin.htmlElements.settings.container.css({
                    height: parseInt(targetHeight - headerHeight) + 'px'
                });
            }

            return $this;
        },
        renderThemeList: function () {
            var $this = $(this);
            var _plugin = $this.data('forsvaretThemePicker');

            _plugin.htmlElements.settings.container.hide();
            _plugin.htmlElements.themeList.container.fadeIn();

            _plugin.htmlElements.themeList.container.empty();
            $.each(_plugin.data.themes, function (index, theme) {
                _plugin.htmlElements.themeList.container.append(
                    $('<li />').addClass('is-clickable').text(theme.name).click(function () {
                        $.each(theme.commands, function (index, command) {
                            $.insmFramework('changePlaylist', {
                                playerId: command.playerId,
                                view: command.view,
                                playlist: command.playlist,
                                success: function () {

                                }
                            });
                        });
                    })
                );
            });

            return $this;
        },
        startSubscriptions: function() {
            var $this = $(this);
            var _plugin = $this.data('forsvaretThemePicker');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function() {
            var $this = $(this);
            var _plugin = $this.data('forsvaretThemePicker');

            if (_plugin) {
                return _plugin.subscriptions.stop();
            }

            return $this;
        },
        setSubscriptions: function(options) {
            var $this = $(this);
            var _plugin = $this.data('forsvaretThemePicker');
            switch (options.view.toLowerCase()) {
                default:
                    throw new Error('View "' + options.view + '" not recognised');
                    break;
            }

            return $this;
        },
        hasSettings: function() {
            return true;
        },
        showSettings: function () {
            var $this = $(this);
            var _plugin = $this.data('forsvaretThemePicker');

            _plugin.htmlElements.themeList.container.hide();
            _plugin.htmlElements.settings.container.fadeIn();
            
            var themeTable = $('<div />').insmInput({
                type: 'table',
                multiSelect: true,
                value: _plugin.data.themes,
                objectDefinition: {
                    name: {
                        displayName: 'Theme Name',
                        type: 'string',
                        required: true
                    },
                    commands: {
                        displayName: 'Commands',
                        type: 'table',
                        required: true,
                        multiSelect: true,
                        objectDefinition: {
                            playerId: {
                                displayName: 'Player ID',
                                type: 'string',
                                required: true
                            },
                            view: {
                                displayName: 'View',
                                type: 'string',
                                value: '1',
                                required: true
                            },
                            playlist: {
                                displayName: 'Playlist Name',
                                type: 'string',
                                required: true
                            }
                        }
                    }
                }
            }).insmInput('edit');

            _plugin.htmlElements.settings.container.empty().append(
                $('<button />').text('Close').click(function () {
                    // Update _plugin.data.themes with new value
                    $this.forsvaretThemePicker('renderThemeList');
                }),
                $('<button />').text('Save').click(function () {
                    var value = themeTable.insmInput('getValue');
                    _plugin.data.themes = value;

                    _plugin.data.themes.sort(function (themeA, themeB) {
                        if (themeA.name > themeB.name) {
                            return 1;
                        }
                        else if (themeA.name < themeB.name) {
                            return -1;
                        }
                        else {
                            return 0;
                        }
                    });

                    // TODO: Implement loading view and show it

                    // Save to module settings
                    $.insmFramework('setModuleSettings', {
                        namespace: 'forsvaretThemePicker',
                        key: 'themes',
                        value: _plugin.data.themes,
                        success: function () {
                            $this.forsvaretThemePicker('renderThemeList');
                        }
                    });
                }),
                themeTable
            );

            //$.each(_plugin.data.themes, function (themeName, commands) {
            //    _plugin.htmlElements.settings.container.append(

            //    );
            //});

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('forsvaretThemePicker');

            $this.forsvaretThemePicker('stopSubscriptions');
            $this.data('forsvaretThemePicker', null).empty();

            return $this;
        }
    };

    $.fn.forsvaretThemePicker = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.forsvaretThemePicker');
        }
    };

})(jQuery);