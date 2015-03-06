/*
* INSM Setup
* This file contains the INSM Setup plugin.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmSetup(settings);
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
            var _plugin = $this.data('insmSetup');
                        
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        apiUrl: '',
                        applicationName: 'Setup',
                        version: manifest.version,
                        header: true
                    }, options),
                    htmlElements: {
                        header: $('<div />'),
                        content: {
                            container: $('<div />').addClass('module-wrapper'),
                            header: {
                                container: $('<div />').addClass('sub-header'),
                                title: $('<h2 />'),
                                backButton: $('<a />').text('Back').addClass('back')
                            },
                            views: {
                                container: $('<div />').addClass('content'),
                                playerId: {
                                    container: $('<div />'),
                                    text: $('<p />'),
                                    input: {
                                        container: $('<div />').addClass('input-container'),
                                        id: $('<input type="text" />'),
                                        unconfiguredListTitle: $('<p />').text('Suggestions'),
                                        unconfiguredList: $('<ul />').addClass('unconfigured-players-list')
                                    }
                                },
                                playerName: {
                                    container: $('<div />'),
                                    text: $('<p />'),
                                    input: {
                                        container: $('<div />').addClass('input-container'),
                                        name: $('<input type="text" maxlength="32" />'),
                                        button: $('<button />').text('Continue')
                                    }
                                },
                                screenLayout: {
                                    container: $('<div />'),
                                    text: $('<p />'),
                                    input: {
                                        container: $('<div />').addClass('input-container'),
                                        layouts: $('<div />'),
                                        button: $('<button />').text('Continue')
                                    }
                                },
                                regionPicker: {
                                    container: $('<div />').addClass('region-picker'),
                                    text: $('<p />'),
                                    input: {
                                        container: $('<div />').addClass('input-container'),
                                        region: {
                                            list: $('<div />')
                                        }
                                    }
                                },
                                summary: {
                                    container: $('<div />'),
                                    text: $('<p />'),
                                    table: {
                                        container: $('<table />'),
                                        id: $('<td />'),
                                        name: $('<td />'),
                                        screenLayout: $('<td />'),
                                        location: $('<td />'),
                                        wrapper: $('<div />').addClass('table-wrapper'),
                                        button: $('<button />').text('Setup another player')
                                    }
                                }
                            }
                        }
                    },
                    data: {
                        player: {
                            id: null,
                            name: null,
                            screenLayout: {},
                            regionId: 0
                        },
                        skipRegionPicker: true,
                        unconfiguredPlayers: {

                        },
                        unconfiguredPlayersFiltered: {

                        }
                    },
                    subscriptions: {
                        start: function() {},
                        stop: function() {}
                    },
                    permissions: {

                    }
                };
                $this.data('insmSetup', _plugin);
            }

            
            return $this;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');
            
            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            } else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview setup');


            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            _plugin.settings.previewTarget.html(
                $('<h2 />').text('Setup')
            );

            return _plugin.settings.previewTarget;
        },
        fullscreen: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function() {
                    $this.insmSetup('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;

            // Init HTML
            _plugin.settings.target.addClass('setup').fadeIn();
            _plugin.settings.target.empty();

            if (_plugin.settings.header) {
                _plugin.settings.target.append(
                    _plugin.htmlElements.header.addClass('header').append(
                        $('<div />').addClass('company-logo'),
                        $('<div />').addClass('module-logo')
                    )
                );
            }
            
            _plugin.settings.target.append(
                _plugin.htmlElements.content.container.append(
                    _plugin.htmlElements.content.header.container.append(
                        _plugin.htmlElements.content.header.backButton,
                        _plugin.htmlElements.content.header.title
                    ),
                    _plugin.htmlElements.content.views.container.append(
                        _plugin.htmlElements.content.views.playerId.container.append(
                            _plugin.htmlElements.content.views.playerId.text,
                            _plugin.htmlElements.content.views.playerId.input.container.append(
                                _plugin.htmlElements.content.views.playerId.input.id,
                                _plugin.htmlElements.content.views.playerId.input.unconfiguredListTitle,
                                _plugin.htmlElements.content.views.playerId.input.unconfiguredList
                            )
                        ),
                        _plugin.htmlElements.content.views.playerName.container.append(
                            _plugin.htmlElements.content.views.playerName.text,
                            _plugin.htmlElements.content.views.playerName.input.container.append(
                                _plugin.htmlElements.content.views.playerName.input.name,
                                _plugin.htmlElements.content.views.playerName.input.button,
                                $('<div />').addClass('clear')
                            )
                        ),
                        _plugin.htmlElements.content.views.screenLayout.container.append(
                            _plugin.htmlElements.content.views.screenLayout.text,
                            _plugin.htmlElements.content.views.screenLayout.input.container.append(
                                _plugin.htmlElements.content.views.screenLayout.input.layouts,
                                _plugin.htmlElements.content.views.screenLayout.input.button,
                                $('<div />').addClass('clear')
                            )
                        ),
                        _plugin.htmlElements.content.views.regionPicker.container.append(
                            _plugin.htmlElements.content.views.regionPicker.text,
                            _plugin.htmlElements.content.views.regionPicker.input.container.append(
                                _plugin.htmlElements.content.views.regionPicker.input.region.list
                            )
                        ),
                        _plugin.htmlElements.content.views.summary.container.append(
                            _plugin.htmlElements.content.views.summary.text,
                            _plugin.htmlElements.content.views.summary.table.wrapper.append(
                                _plugin.htmlElements.content.views.summary.table.container.append(
                                    $('<tr />').append(
                                        $('<th />').text('ID'),
                                        _plugin.htmlElements.content.views.summary.table.id
                                    ),
                                    $('<tr />').append(
                                        $('<th />').text('Name'),
                                        _plugin.htmlElements.content.views.summary.table.name
                                    ),
                                    $('<tr />').append(
                                        $('<th />').text('Screen layout'),
                                        _plugin.htmlElements.content.views.summary.table.screenLayout
                                    ),
                                    $('<tr />').append(
                                        $('<th />').text('Location'),
                                        _plugin.htmlElements.content.views.summary.table.location
                                    )
                                ),
                                _plugin.htmlElements.content.views.summary.table.button
                            )
                        )
                    )
                )
            );

            // Check if we have a player id in url
            // If so => populate the player object and skip to page 3 

            // Download available screen layouts
            
            
            // Register on hashChange
            $.insmHashChange('register', {
                applicationName: _plugin.settings.applicationName,
                callback: function (hash) {
                    var setup = hash[_plugin.settings.applicationName];
                    if (setup) {
                        if (setup.view) {
                            switch (setup.view.toLowerCase()) {
                                case 'playerid':
                                    $this.insmSetup('renderPlayerIdView');
                                    break;
                                case 'playername':
                                    $this.insmSetup('renderPlayerNameView');
                                    break;
                                case 'screenlayout':
                                    $this.insmSetup('renderScreenLayoutView');
                                    break;
                                case 'regionpicker':
                                    $this.insmSetup('renderRegionPickerView');
                                    break;
                                case 'summary':
                                    $this.insmSetup('renderSummaryView');
                                    break;
                                default:
                                    $this.insmSetup('renderPlayerIdView');
                                    break;
                            }

                        }
                        else {
                            hash[_plugin.settings.applicationName].view = 'playerId';
                            $.insmHashChange('updateHash', hash);

                        }
                    }
                    else {
                        $this.insmSetup('renderPlayerIdView');
                    }
                }
            });

            var hash = $.insmHashChange('get');
            if (hash[_plugin.settings.applicationName]) {
                $.insmHashChange('updateHash', hash);
            } else {
                $this.insmSetup('renderPlayerIdView');
            }

            return _plugin.settings.target;
        },
        renderPlayerIdView: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');

            $this.insmSetup('setSubscriptions', {
                view: 'playerID'
            });
            
            _plugin.htmlElements.content.header.container.hide();
            _plugin.htmlElements.content.views.container.children().hide();
            _plugin.htmlElements.content.views.playerId.container.fadeIn();
            _plugin.htmlElements.content.views.playerId.text.html('Please provide the player ID');
            
            _plugin.htmlElements.content.views.playerId.input.id.insmInputPlaceholder('destroy').insmInputPlaceholder({
                text: 'Player ID'
            }).click(function() {
                _plugin.settings.target.animate({
                    scrollTop: _plugin.htmlElements.content.views.playerId.input.id.offset().top
                }, 2000);
            });
            
            _plugin.htmlElements.content.views.playerId.input.id.unbind('keyup');

            _plugin.htmlElements.content.views.playerId.input.id.keyup(function () {
                $this.insmSetup('runUnconfiguredListFilter');
                $this.insmSetup('updateUnconfiguredList');
            });

            _plugin.data.player = {
                id: null,
                name: null,
                screenLayout: {},
                regionId: 0
            };

            $this.insmSetup('resize');
            
            return $this;
        },
        renderPlayerNameView: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');

            if (!_plugin.data.player.id) {
                $this.insmSetup('renderPlayerIdView');
                return;
            }

            _plugin.htmlElements.content.views.playerName.input.name.val('').insmInputPlaceholder('destroy').insmInputPlaceholder({
                text: 'Player name'
            });
            if (_plugin.data.player.name) {
                _plugin.htmlElements.content.views.playerName.input.name.val(_plugin.data.player.name);
            }
            
            _plugin.htmlElements.content.header.title.text(_plugin.data.player.id);

            _plugin.htmlElements.content.header.backButton.unbind('click');
            _plugin.htmlElements.content.header.backButton.click(function () {
                var hash = $.insmHashChange('get');
                if (hash[_plugin.settings.applicationName] && hash[_plugin.settings.applicationName].view !== 'playerId') {
                    hash[_plugin.settings.applicationName].view = 'playerId';
                    $.insmHashChange('updateHash', hash);
                } else {
                    $this.insmSetup('renderPlayerIdView');
                }
            });

            _plugin.htmlElements.content.header.container.fadeIn();
            _plugin.htmlElements.content.views.container.children().hide();
            _plugin.htmlElements.content.views.playerName.container.fadeIn();
            _plugin.htmlElements.content.views.playerName.text.html('Please choose a name for the screen. A short describing name is recommended e.g. "Left window", "Cash register" or "Promotion wall"');

            _plugin.htmlElements.content.views.playerName.input.name.unbind('keypress');
            _plugin.htmlElements.content.views.playerName.input.name.keypress(function (e) {
                if (e.keyCode == 13) {
                    _plugin.htmlElements.content.views.playerName.input.button.trigger('click');
                }
            })

            _plugin.htmlElements.content.views.playerName.input.button.unbind('click');
            _plugin.htmlElements.content.views.playerName.input.button.click(function () {
                

                _plugin.htmlElements.content.views.playerName.input.name
                if (_plugin.htmlElements.content.views.playerName.input.name.val().length == 0) {
                    _plugin.htmlElements.content.views.playerName.input.name.insmHighlight({
                        type: 'error'
                    });
                    return;
                }
                
                var playerName = _plugin.htmlElements.content.views.playerName.input.name.val();

                if (!playerName.match(/^[\s\.\-_0-9A-Z]*$/i)) {
                    _plugin.htmlElements.content.views.playerName.input.name.insmHighlight({
                        type: 'error'
                    });
                    $.insmNotification({
                        type: 'error',
                        message: 'Player name may only contain alphanumeric characters (A-Za-z0-9), space ( ), dash (-) and underscore (_).'
                    });
                    return;
                }

                _plugin.data.player.name = playerName;

                var hash = $.insmHashChange('get');
                if (hash[_plugin.settings.applicationName] && hash[_plugin.settings.applicationName].view !== 'screenLayout') {
                    hash[_plugin.settings.applicationName].view = 'screenLayout';
                    $.insmHashChange('updateHash', hash);
                } else {
                    $this.insmSetup('renderScreenLayoutView');
                }
            });

            $this.insmSetup('resize');

            return $this;
        },
        renderScreenLayoutView: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');

            if (!_plugin.data.player.name) {
                $this.insmSetup('renderPlayerNameView');
                return;
            }

            _plugin.htmlElements.content.header.backButton.unbind('click');
            _plugin.htmlElements.content.header.backButton.click(function () {
                var hash = $.insmHashChange('get');
                if (hash[_plugin.settings.applicationName] && hash[_plugin.settings.applicationName].view !== 'playerName') {
                    hash[_plugin.settings.applicationName].view = 'playerName';
                    $.insmHashChange('updateHash', hash);
                } else {
                    $this.insmSetup('renderPlayerNameView');
                }
            });

            _plugin.htmlElements.content.header.title.text(_plugin.data.player.id);
            _plugin.htmlElements.content.header.container.show();
            _plugin.htmlElements.content.views.container.children().hide();
            _plugin.htmlElements.content.views.screenLayout.container.fadeIn();
            _plugin.htmlElements.content.views.screenLayout.text.html('Please choose the screen layout to use');

            if ($.isEmptyObject(_plugin.data.player.screenLayout)) {
                _plugin.htmlElements.content.views.screenLayout.input.button.attr('disabled', 'disabled');
            }

            _plugin.htmlElements.content.views.screenLayout.input.button.click(function () {
                var hash = $.insmHashChange('get');
                if (hash[_plugin.settings.applicationName] && hash[_plugin.settings.applicationName].view !== 'regionPicker') {
                    hash[_plugin.settings.applicationName].view = 'regionPicker';
                    $.insmHashChange('updateHash', hash);
                } else {
                    $this.insmSetup('renderRegionPickerView');
                }
            });

            var availableScreenLayouts = [{
                name: 'Landscape',
                resolution: {
                    width: 1920,
                    height: 1080
                },
                displayLayoutId: 1,
                channelLayoutId: 1,
                channelId: 1
            }, {
                name: 'Portrait',
                resolution: {
                    width: 1080,
                    height: 1920
                },
                displayLayoutId: 1,
                channelLayoutId: 1,
                channelId: 1
            }];

            _plugin.htmlElements.content.views.screenLayout.input.layouts.empty();
            $.each(availableScreenLayouts, function (index, layout) {
                var layoutDiv = $('<div />');
                _plugin.htmlElements.content.views.screenLayout.input.layouts.append(
                    layoutDiv.insmScreenLayout(layout).addClass('is-clickable').click(function () {
                        _plugin.htmlElements.content.views.screenLayout.input.button.removeAttr('disabled');
                        _plugin.htmlElements.content.views.screenLayout.input.layouts.children().removeClass('is-selected');
                        $(this).addClass('is-selected');
                        _plugin.data.player.screenLayout = layout;

                        _plugin.htmlElements.content.container.animate({
                            scrollTop: _plugin.htmlElements.content.container.height()
                        }, 500);
                    })
                );

                if (_plugin.data.player.screenLayout.name == layout.name &&
                    _plugin.data.player.screenLayout.displayLayoutId == layout.displayLayoutId &&
                    _plugin.data.player.screenLayout.channelLayoutId == layout.channelLayoutId &&
                    _plugin.data.player.screenLayout.channelId == layout.channelId) {
                    
                    layoutDiv.addClass('is-selected');
                }
            });

            $this.insmSetup('resize');

            return $this;
        },
        renderRegionPickerView: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');
            
            if ($.isEmptyObject(_plugin.data.player.screenLayout)) {
                $this.insmSetup('renderScreenLayoutView');
                return;
            }

            var user = $.insmFramework('getUser');

            if (user.regionTree.children.length > 0) {
                _plugin.data.skipRegionPicker = false;
            }

            if (_plugin.data.skipRegionPicker) {
                _plugin.data.player.region = user.regionTree;
                $this.insmSetup('renderSummaryView');
                return;
            }

            _plugin.htmlElements.content.header.backButton.unbind('click');
            _plugin.htmlElements.content.header.backButton.click(function () {
                var hash = $.insmHashChange('get');
                if (hash[_plugin.settings.applicationName] && hash[_plugin.settings.applicationName].view !== 'screenLayout') {
                    hash[_plugin.settings.applicationName].view = 'screenLayout';
                    $.insmHashChange('updateHash', hash);
                } else {
                    $this.insmSetup('renderScreenLayoutView');
                }
            });

            _plugin.htmlElements.content.header.title.text(_plugin.data.player.id);
            _plugin.htmlElements.content.header.container.show();
            _plugin.htmlElements.content.views.container.children().hide();
            _plugin.htmlElements.content.views.regionPicker.container.fadeIn();
            _plugin.htmlElements.content.views.regionPicker.text.html('Where is the screen located?');

            // This should be a new plugin.
            _plugin.htmlElements.content.views.regionPicker.input.region.list.insmRegionPickerList('destroy').insmRegionPickerList({
                regions: user.regionTree.children,
                onSelect: function (region) {
                    _plugin.data.player.region = region;
                    $this.insmSetup('renderSummaryView');
                }
            });

            $this.insmSetup('resize');

            return $this;
        },
        renderSummaryView: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');

            if ($.isEmptyObject(_plugin.data.player.region)) {
                $this.insmSetup('renderRegionPickerView');
                return;
            }

            _plugin.htmlElements.content.header.backButton.unbind('click');
            _plugin.htmlElements.content.header.backButton.click(function () {
                var hash = $.insmHashChange('get');
                
                if (_plugin.data.skipRegionPicker) {
                    var hash = $.insmHashChange('get');
                    if (hash[_plugin.settings.applicationName] && hash[_plugin.settings.applicationName].view !== 'screenLayout') {
                        hash[_plugin.settings.applicationName].view = 'screenLayout';
                        $.insmHashChange('updateHash', hash);
                    } else {
                        $this.insmSetup('renderScreenLayoutView');
                    }
                }
                else {
                    if (hash[_plugin.settings.applicationName] && hash[_plugin.settings.applicationName].view !== 'regionPicker') {
                        hash[_plugin.settings.applicationName].view = 'regionPicker';
                        $.insmHashChange('updateHash', hash);
                    } else {
                        $this.insmSetup('renderRegionPickerView');
                    }
                }
            });

            _plugin.htmlElements.content.header.title.text(_plugin.data.player.id);
            _plugin.htmlElements.content.header.container.show();
            _plugin.htmlElements.content.views.container.children().hide();
            _plugin.htmlElements.content.views.summary.container.fadeIn();


            var loader = $('<div />');
            _plugin.htmlElements.content.views.summary.text.empty().append(
                loader.insmLoader()
            );

            _plugin.htmlElements.content.views.summary.table.container.hide();
            _plugin.htmlElements.content.views.summary.table.button.hide();
            
            $.insmFramework('tmpSavePlayer', {
                upid: _plugin.data.player.id,
                name: _plugin.data.player.name,
                //description: options.description,
                regionid: _plugin.data.player.region.id,
                displayLayoutId: _plugin.data.player.screenLayout.displayLayoutId,
                channelLayoutId: _plugin.data.player.screenLayout.channelLayoutId,
                channels: '{"1":' + _plugin.data.player.screenLayout.channelId + '}',
                unauthorized: function (message) {
                    // Maybe this should never happen?
                    loader.insmLoader('destroy');
                    _plugin.htmlElements.content.views.summary.text.html('Unsuficcient access to player, setup was cancelled.');
                    _plugin.htmlElements.content.views.summary.table.container.hide();

                    _plugin.htmlElements.content.views.summary.table.button.fadeIn();
                    _plugin.htmlElements.content.views.summary.table.button.unbind('click');
                    _plugin.htmlElements.content.views.summary.table.button.click(function () {
                        _plugin.htmlElements.content.views.playerId.input.id.val('');

                        _plugin.data.player = {
                            id: null,
                            name: null,
                            screenLayout: {},
                            regionId: 0
                        };

                        var hash = $.insmHashChange('get');
                        if (hash[_plugin.settings.applicationName] && hash[_plugin.settings.applicationName].view !== 'playerId') {
                            hash[_plugin.settings.applicationName].view = 'playerId';
                            $.insmHashChange('updateHash', hash);
                        } else {
                            $this.insmSetup('renderPlayerIdView');
                        }
                    });

                },
                success: function () {
                    loader.insmLoader('destroy');
                    _plugin.htmlElements.content.views.summary.text.html('The setup has been completed!');
                    _plugin.htmlElements.content.views.summary.table.container.fadeIn();
                    _plugin.htmlElements.content.views.summary.table.id.text(_plugin.data.player.id);
                    _plugin.htmlElements.content.views.summary.table.name.text(_plugin.data.player.name);
                    _plugin.htmlElements.content.views.summary.table.screenLayout.text(_plugin.data.player.screenLayout.name);
                    _plugin.htmlElements.content.views.summary.table.location.text(_plugin.data.player.region.name);

                    _plugin.htmlElements.content.views.summary.table.button.fadeIn();
                    _plugin.htmlElements.content.views.summary.table.button.unbind('click');
                    _plugin.htmlElements.content.views.summary.table.button.click(function () {

                        _plugin.htmlElements.content.views.playerId.input.id.val('');

                        _plugin.data.player = {
                            id: null,
                            name: null,
                            screenLayout: {},
                            regionId: 0
                        };

                        var hash = $.insmHashChange('get');
                        if (hash[_plugin.settings.applicationName] && hash[_plugin.settings.applicationName].view !== 'playerId') {
                            hash[_plugin.settings.applicationName].view = 'playerId';
                            $.insmHashChange('updateHash', hash);
                        } else {
                            $this.insmSetup('renderPlayerIdView');
                        }
                    });
                }
            });
            
            $this.insmSetup('resize');

            return $this;
        },
        resize: function() {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');
            if (_plugin) {
                var totalHeight = _plugin.settings.target.height();
                var headerHeight = _plugin.htmlElements.header.outerHeight(true);

                var contentContainerHeight = parseInt(totalHeight - headerHeight);
                _plugin.htmlElements.content.container.css({
                    height: contentContainerHeight + 'px'
                });

                var viewsContainerMargin = _plugin.htmlElements.content.views.container.outerHeight(true) - _plugin.htmlElements.content.views.container.height();

                _plugin.htmlElements.content.views.container.css({
                    height: parseInt(contentContainerHeight - viewsContainerMargin) + 'px'
                });

                _plugin.htmlElements.content.views.playerId.container.css({
                    height: parseInt(contentContainerHeight - viewsContainerMargin) + 'px'
                });

                var textHeight = _plugin.htmlElements.content.views.playerId.text.outerHeight(true);
                
                var inputContainerMargin = _plugin.htmlElements.content.views.playerId.input.container.outerHeight(true) - _plugin.htmlElements.content.views.playerId.input.container.height();

                _plugin.htmlElements.content.views.playerId.input.container.css({
                    height: parseInt(contentContainerHeight - viewsContainerMargin - textHeight - inputContainerMargin) +'px'
                });

                var height = parseInt(contentContainerHeight - viewsContainerMargin - textHeight - inputContainerMargin - _plugin.htmlElements.content.views.playerId.input.id.outerHeight(true) - _plugin.htmlElements.content.views.playerId.input.unconfiguredListTitle.outerHeight(true));

                if (height < 50) {
                    height = 50
                }

                _plugin.htmlElements.content.views.playerId.input.unconfiguredList.css({
                    height:  height + 'px'
                });
            }

            return $this;
        },
        startSubscriptions: function() {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function() {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');

            if (_plugin) {
                return _plugin.subscriptions.stop();
            }

            return $this;
        },
        setSubscriptions: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');

            _plugin.subscriptions.start = function () {
                $.insmService('register', {
                    subscriber: _plugin.settings.applicationName,
                    type: 'unconfiguredplayers',
                    update: function (players) {
                        var listHasBeenUpdated = false;
                        var currentlyUnconfiguredPlayers = [];
                        $.each(players, function (index, player) {
                            currentlyUnconfiguredPlayers.push(player.id);
                            if (!_plugin.data.unconfiguredPlayers[player.id]) {
                                _plugin.data.unconfiguredPlayers[player.id] = $.extend(true, {}, player);
                                listHasBeenUpdated = true;
                            }
                        });

                        $.each(_plugin.data.unconfiguredPlayers, function (id, player) {
                            if ($.inArray(id, currentlyUnconfiguredPlayers) == -1) {
                                delete _plugin.data.unconfiguredPlayers[id];
                                listHasBeenUpdated = true;
                            }
                        });

                        if (listHasBeenUpdated) {
                            $this.insmSetup('runUnconfiguredListFilter');
                            $this.insmSetup('updateUnconfiguredList');
                        }
                    },
                    reset: function () {
                        _plugin.data.unconfiguredPlayers = {};
                    }
                });
            };

            $this.insmSetup('stopSubscriptions');
            $this.insmSetup('startSubscriptions');

            _plugin.subscriptions.stop = function () {
                $.insmService('unregister', {
                    subscriber: _plugin.settings.applicationName,
                    type: 'unconfiguredplayers'
                });
            };

            return $this;
        },
        updateUnconfiguredList: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');
            
            _plugin.htmlElements.content.views.playerId.input.unconfiguredList.empty();
            $.each(_plugin.data.unconfiguredPlayersFiltered, function (id, player) {
                var playerLi = $('<li />');
                if (_plugin.data.player.id == player.id) {
                    playerLi.addClass('is-selected');
                }
                _plugin.htmlElements.content.views.playerId.input.unconfiguredList.append(
                    playerLi.text(player.id).addClass('is-clickable').click(function () {
                        _plugin.data.player.id = player.id;
                        _plugin.data.player.name = player.name;

                        var hash = $.insmHashChange('get');
                        if (hash[_plugin.settings.applicationName] && hash[_plugin.settings.applicationName].view !== 'playerName') {
                            hash[_plugin.settings.applicationName].view = 'playerName';
                            $.insmHashChange('updateHash', hash);
                        } else {
                            $this.insmSetup('renderPlayerNameView');
                        }

                    })
                );
            });

            var searchString = _plugin.htmlElements.content.views.playerId.input.id.val();
            

            if (!_plugin.data.unconfiguredPlayersFiltered[searchString.toLowerCase()]) {
                if (searchString.length > 0) {
                    var value = _plugin.htmlElements.content.views.playerId.input.id.val();
                    if (value.match(/^[0-9A-F]{12}$/i)) {
                        _plugin.htmlElements.content.views.playerId.input.unconfiguredList.append(
                            $('<li />').text('Add ' + searchString + ' manually').addClass('is-clickable').click(function () {
                                var loader = $('<div />');

                                _plugin.htmlElements.content.views.playerId.container.hide();
                                _plugin.htmlElements.content.views.playerId.container.after(
                                    loader.insmLoader()
                                );

                                $.insmFramework('getPlayer', {
                                    upid: searchString,
                                    success: function (player) {
                                        loader.insmLoader('destroy');
                                        // Maybe populate the player

                                        _plugin.data.player = {
                                            id: null,
                                            name: null,
                                            screenLayout: {},
                                            regionId: 0
                                        };

                                        _plugin.data.player.id = player.upid;
                                        _plugin.data.player.name = player.name;

                                        // TODO: When more information is available screenLayout and regionId should be populated as well.
                                        // For now just display a notification
                                        $.insmNotification({
                                            type: 'information',
                                            message: 'This player is already in the system.'
                                        });

                                        var hash = $.insmHashChange('get');
                                        if (hash[_plugin.settings.applicationName] && hash[_plugin.settings.applicationName].view !== 'playerName') {
                                            hash[_plugin.settings.applicationName].view = 'playerName';
                                            $.insmHashChange('updateHash', hash);
                                        } else {
                                            $this.insmSetup('renderPlayerNameView');
                                        }
                                    },
                                    unauthorized: function () {
                                        _plugin.htmlElements.content.views.playerId.container.fadeIn();
                                        loader.insmLoader('destroy');
                                        $.insmNotification({
                                            type: 'warning',
                                            message: 'You do not have permission to setup that player.'
                                        });
                                    },
                                    invalid: function (message) {

                                        _plugin.data.player = {
                                            id: null,
                                            name: null,
                                            screenLayout: {},
                                            regionId: 0
                                        };

                                        _plugin.data.player.id = searchString;

                                        var hash = $.insmHashChange('get');
                                        if (hash[_plugin.settings.applicationName] && hash[_plugin.settings.applicationName].view !== 'playerName') {
                                            hash[_plugin.settings.applicationName].view = 'playerName';
                                            $.insmHashChange('updateHash', hash);
                                        } else {
                                            $this.insmSetup('renderPlayerNameView');
                                        }
                                    }
                                });




                            })
                        );
                    }
                    else if ($.isEmptyObject(_plugin.data.unconfiguredPlayersFiltered)) {
                        _plugin.htmlElements.content.views.playerId.input.unconfiguredList.append(
                            $('<li />').text('No suggestions found').addClass('is-italic is-centered')
                        );
                    }
                }
            }

            

            return $this;
        },
        runUnconfiguredListFilter: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');

            _plugin.data.unconfiguredPlayersFiltered = {};

            var searchString = _plugin.htmlElements.content.views.playerId.input.id.val();

            if (searchString) {
                $.each(_plugin.data.unconfiguredPlayers, function (id, player) {
                    if (id.toLowerCase().indexOf(searchString.toLowerCase()) >= 0) {
                        _plugin.data.unconfiguredPlayersFiltered[id.toLowerCase()] = player;
                    }
                })
            }
            else {
                _plugin.data.unconfiguredPlayersFiltered = _plugin.data.unconfiguredPlayers;
            }

            return $this;
        },
        hasSettings: function() {
            return false;
        },
        onClose: function (options) {
            options.success();
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSetup');

            $this.insmSetup('stopSubscriptions');
            $this.data('insmSetup', null).empty();

            return $this;
        }
    };

    $.fn.insmSetup = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmSetup');
        }
    };

})(jQuery);