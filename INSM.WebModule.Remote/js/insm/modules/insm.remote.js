/*
* INSM Remote
* This file contain the INSM Remote function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmRemote(settings);
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
            var _plugin = $this.data('insmRemote');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        apiUrl: '',
                        applicationName: 'Remote',
                        version: manifest.version,
                        header: true,
                        intervalTimeoutTime: 1000
                    }, options),
                    htmlElements: {
                        header: $('<div />'),
                        views: {
                            playerlist: {
                                container: $('<div />'),
                                header: $('<div />'),
                                title: $('<h3 />'),
                                content: {
                                    container: $('<div />')
                                }
                            },
                            playlists: {
                                container: $('<div />'),
                                header: {
                                    container: $('<div />'),
                                    backButton: $('<button />').text('Back'),
                                    title: $('<h3 />'),
                                    apiIndicator: $('<div />')
                                },
                                content: {
                                    container: $('<div />'),
                                    defaultPlaylistHeader: $('<div />'),
                                    defaultPlaylist: $('<div />'),
                                    alternativePlaylistsHeader: $('<div />'),
                                    alternativePlaylists: $('<div />'),
                                    controls: $('<div />'),
                                    previous: $('<button />'),
                                    pause: $('<button />'),
                                    play: $('<button />'),
                                    next: $('<button />'),
                                    volume: $('<button />'),
                                    volumeBar: $('<div />'),
                                    volumeDigit: $('<div />'),
                                    volumeBarPadding: $('<div />'),
                                    volumeBarContainer: $('<div />'),
                                    mute: $('<button />')
                                }
                            }
                        }
                    },
                    data: {
                        fullscreenInitialized: false,
                        players: {},
                        playlists: {},
                        selectedPlayerId: '',
                        activePlaylistIntervalHandle: null,
                        volumeIntervalHandle: null,
                        userInControl: false,
                        userIsSliding: false
                    },
                    subscriptions: {
                        start: function() {},
                        stop: function() {}
                    },
                    permissions: {

                    }
                };
                $this.data('insmRemote', _plugin);
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
            var _plugin = $this.data('insmRemote');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            } else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview remote');


            _plugin.settings.previewTarget.click(function() {
                _plugin.settings.show();
            });

            _plugin.settings.previewTarget.html(
                $('<h2 />').text('Remote')
            );

            return _plugin.settings.previewTarget;
        },
        getTarget: function() {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        fullscreen: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function() {
                    $this.insmRemote('resize');
                }, 1000);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;


            // Init HTML
            _plugin.settings.target.addClass('remote').fadeIn();
            _plugin.settings.target.empty();

            if (_plugin.settings.header) {
                _plugin.settings.target.append(
                    _plugin.htmlElements.header.addClass('header').append(
                        $('<div />').addClass('company-logo'),
                        $('<div />').addClass('module-logo')
                    )
                );
            }

            _plugin.htmlElements.views.playlists.header.apiIndicator.insmTooltip({
                content: $('<div class="api-indicator" />').append(
                    $('<h2 />').text('Connection status'),
                    $('<table />').append(
                        $('<tr />').append(
                            $('<th />').text('Green light'),
                            $('<td />').text('Direct connection')
                        ),
                        $('<tr />').append(
                            $('<th />').text('Yellow light'),
                            $('<td />').text('Redirected connection')
                        ),
                        $('<tr />').append(
                            $('<th />').text('Red light'),
                            $('<td />').text('No connection')
                        )
                    )
                )
            });

            _plugin.settings.target.addClass('insm-remote').append(
                _plugin.htmlElements.views.playerlist.container.addClass('playerlist').append(
                    _plugin.htmlElements.views.playerlist.header.addClass('header').append(
                        _plugin.htmlElements.views.playerlist.title.text('Available players')
                    ),
                    _plugin.htmlElements.views.playerlist.content.container.addClass('content')
                ),
                _plugin.htmlElements.views.playlists.container.addClass('playlists').append(
                    _plugin.htmlElements.views.playlists.header.container.addClass('header').append(
                        _plugin.htmlElements.views.playlists.header.apiIndicator.addClass('api-indicator'),
                        _plugin.htmlElements.views.playlists.header.backButton.addClass('back'),
                        _plugin.htmlElements.views.playlists.header.title.addClass('title')
                    ),
                    _plugin.htmlElements.views.playlists.content.container.addClass('content'),
                    _plugin.htmlElements.views.playlists.content.controls.addClass('controls').append(
                        _plugin.htmlElements.views.playlists.content.volumeBarContainer.click(function (event) {
                            event.stopPropagation();
                            return false;
                        }).addClass('volume-bar-container').hide().append(
                            _plugin.htmlElements.views.playlists.content.volumeDigit.addClass('volume-digit'),
                            _plugin.htmlElements.views.playlists.content.volumeBarPadding.addClass('padding').append(
                                _plugin.htmlElements.views.playlists.content.volumeBar.addClass('volume-bar').slider({
                                    range: "min",
                                    value: 0,
                                    min: 0,
                                    max: 100,
                                    start: function (event, ui) {
                                        _plugin.htmlElements.views.playlists.content.volumeDigit.removeClass('in-sync');
                                        _plugin.data.userInControl = true;
                                        _plugin.data.userIsSliding = true;
                                    },
                                    slide: function (event, ui) {
                                        _plugin.htmlElements.views.playlists.content.volumeDigit.text(ui.value+' %');
                                    },
                                    stop: function (event, ui) {
                                        var feedbackHandle = $.insmFeedbackOverlay();
                                        _plugin.data.userIsSliding = false;

                                        $.insmFramework('setVolume', {
                                            playerId: _plugin.data.selectedPlayerId,
                                            playerIp: $this.insmRemote('getLocalIpAddress', {
                                                playerId: _plugin.data.selectedPlayerId
                                            }),
                                            value: (parseFloat(ui.value) / 100).toString().replace('.', ','),
                                            error: function(message) {
                                                throw new Error(message);
                                            },
                                            success: function () {
                                                $.insmFramework('getVolumeState', {
                                                    playerId: _plugin.data.selectedPlayerId,
                                                    playerIp: $this.insmRemote('getLocalIpAddress', {
                                                        playerId: _plugin.data.selectedPlayerId
                                                    }),
                                                    error: function (message) {
                                                        throw new Error(message);
                                                    },
                                                    success: function (state) {
                                                        feedbackHandle.remove();
                                                        if (!_plugin.data.userInControl) {
                                                            _plugin.htmlElements.views.playlists.content.volumeBar.slider('value', state.volume);
                                                            _plugin.htmlElements.views.playlists.content.volumeDigit.text(state.volume + ' %');
                                                            if (state.isMuted) {
                                                                _plugin.htmlElements.views.playlists.content.mute.addClass('mute-on');
                                                                _plugin.htmlElements.views.playlists.content.volume.addClass('muted');
                                                            } else {
                                                                _plugin.htmlElements.views.playlists.content.mute.removeClass('mute-on');
                                                                _plugin.htmlElements.views.playlists.content.volume.removeClass('muted');
                                                            }
                                                            _plugin.htmlElements.views.playlists.content.volumeDigit.addClass('in-sync');
                                                        } else if (!_plugin.data.userIsSliding && _plugin.htmlElements.views.playlists.content.volumeBar.slider('value') == state.volume) {
                                                            _plugin.data.userInControl = false;
                                                            _plugin.htmlElements.views.playlists.content.volumeDigit.addClass('in-sync');
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }
                                })
                            ),
                            _plugin.htmlElements.views.playlists.content.mute.addClass('mute').click(function() {
                                var feedbackHandle = $.insmFeedbackOverlay();
                                if (!_plugin.htmlElements.views.playlists.content.mute.hasClass('mute-on')) {
                                    $.insmFramework('mute', {
                                        playerId: _plugin.data.selectedPlayerId,
                                        playerIp: $this.insmRemote('getLocalIpAddress', {
                                            playerId: _plugin.data.selectedPlayerId
                                        }),
                                        error: function(message) {
                                            throw new Error(message);
                                        },
                                        success: function() {
                                            $.insmFramework('getVolumeState', {
                                                playerId: _plugin.data.selectedPlayerId,
                                                playerIp: $this.insmRemote('getLocalIpAddress', {
                                                    playerId: _plugin.data.selectedPlayerId
                                                }),
                                                error: function(message) {
                                                    throw new Error(message);
                                                },
                                                success: function(state) {
                                                    feedbackHandle.remove();
                                                    if (!_plugin.data.userInControl) {
                                                        _plugin.htmlElements.views.playlists.content.volumeBar.slider('value', state.volume);
                                                        _plugin.htmlElements.views.playlists.content.volumeDigit.text(state.volume+' %');
                                                        if (state.isMuted) {
                                                            _plugin.htmlElements.views.playlists.content.mute.addClass('mute-on');
                                                            _plugin.htmlElements.views.playlists.content.volume.addClass('muted');
                                                        } else {
                                                            _plugin.htmlElements.views.playlists.content.mute.removeClass('mute-on');
                                                            _plugin.htmlElements.views.playlists.content.volume.removeClass('muted');
                                                        }
                                                        _plugin.htmlElements.views.playlists.content.volumeDigit.addClass('in-sync');
                                                    } else if (!_plugin.data.userIsSliding && _plugin.htmlElements.views.playlists.content.volumeBar.slider('value') == state.volume) {
                                                        _plugin.data.userInControl = false;
                                                        _plugin.htmlElements.views.playlists.content.volumeDigit.addClass('in-sync');
                                                    }
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    $.insmFramework('unmute', {
                                        playerId: _plugin.data.selectedPlayerId,
                                        playerIp: $this.insmRemote('getLocalIpAddress', {
                                            playerId: _plugin.data.selectedPlayerId
                                        }),
                                        error: function(message) {
                                            throw new Error(message);
                                        },
                                        success: function() {
                                            $.insmFramework('getVolumeState', {
                                                playerId: _plugin.data.selectedPlayerId,
                                                playerIp: $this.insmRemote('getLocalIpAddress', {
                                                    playerId: _plugin.data.selectedPlayerId
                                                }),
                                                error: function(message) {
                                                    throw new Error(message);
                                                },
                                                success: function(state) {
                                                    feedbackHandle.remove();
                                                    if (!_plugin.data.userInControl) {
                                                        _plugin.htmlElements.views.playlists.content.volumeBar.slider('value', state.volume);
                                                        _plugin.htmlElements.views.playlists.content.volumeDigit.text(state.volume + ' %');

                                                        if (state.isMuted) {
                                                            _plugin.htmlElements.views.playlists.content.mute.addClass('mute-on');
                                                            _plugin.htmlElements.views.playlists.content.volume.addClass('muted');
                                                        } else {
                                                            _plugin.htmlElements.views.playlists.content.mute.removeClass('mute-on');
                                                            _plugin.htmlElements.views.playlists.content.volume.removeClass('muted');
                                                        }
                                                        _plugin.htmlElements.views.playlists.content.volumeDigit.addClass('in-sync');
                                                    } else if (!_plugin.data.userIsSliding && _plugin.htmlElements.views.playlists.content.volumeBar.slider('value') == state.volume) {
                                                        _plugin.data.userInControl = false;
                                                        _plugin.htmlElements.views.playlists.content.volumeDigit.addClass('in-sync');
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }

                            })
                        ),
                        _plugin.htmlElements.views.playlists.content.previous.addClass('previous').click(function() {
                            var feedbackHandle = $.insmFeedbackOverlay();
                            $.insmFramework('previous', {
                                playerId: _plugin.data.selectedPlayerId,
                                view: _plugin.data.selectedPlayerView,
                                playerIp: $this.insmRemote('getLocalIpAddress', {
                                    playerId: _plugin.data.selectedPlayerId
                                }),
                                success: function(data) {
                                    feedbackHandle.remove();
                                }
                            });
                        }),
                        _plugin.htmlElements.views.playlists.content.pause.addClass('pause').click(function() {
                            var feedbackHandle = $.insmFeedbackOverlay();
                            $.insmFramework('pause', {
                                playerId: _plugin.data.selectedPlayerId,
                                view: _plugin.data.selectedPlayerView,
                                playerIp: $this.insmRemote('getLocalIpAddress', {
                                    playerId: _plugin.data.selectedPlayerId
                                }),
                                success: function(data) {
                                    feedbackHandle.remove();
                                }
                            });
                        }),
                        _plugin.htmlElements.views.playlists.content.play.addClass('play').click(function() {
                            var feedbackHandle = $.insmFeedbackOverlay();
                            $.insmFramework('resume', {
                                playerId: _plugin.data.selectedPlayerId,
                                view: _plugin.data.selectedPlayerView,
                                playerIp: $this.insmRemote('getLocalIpAddress', {
                                    playerId: _plugin.data.selectedPlayerId
                                }),
                                success: function(data) {
                                    feedbackHandle.remove();
                                }
                            });
                        }),
                        _plugin.htmlElements.views.playlists.content.next.addClass('next').click(function() {
                            var feedbackHandle = $.insmFeedbackOverlay();
                            $.insmFramework('next', {
                                playerId: _plugin.data.selectedPlayerId,
                                view: _plugin.data.selectedPlayerView,
                                playerIp: $this.insmRemote('getLocalIpAddress', {
                                    playerId: _plugin.data.selectedPlayerId
                                }),
                                success: function(data) {
                                    feedbackHandle.remove();
                                }
                            });
                        }),
                        _plugin.htmlElements.views.playlists.content.volume.addClass('volume').click(function() {
                            _plugin.htmlElements.views.playlists.content.volumeBarContainer.stop(true).fadeToggle('fast', function() {
                                $this.insmRemote('resize');
                            });
                        })
                    )
                )
            );

            var systemInfo = $.insmFramework('getSystemInformation');
            if (systemInfo.type == 'Player') {
                _plugin.htmlElements.views.playlists.header.backButton.remove();
            } else {
                _plugin.htmlElements.views.playlists.header.backButton.click(function() {
                    _plugin.htmlElements.views.playlists.content.defaultPlaylist.empty();
                    _plugin.htmlElements.views.playlists.content.alternativePlaylists.empty();

                    var hash = $.insmHashChange('get');
                    if (hash[_plugin.settings.applicationName]) {
                        $.insmHashChange('updateHash', _plugin.settings.applicationName);
                    } else {
                        $this.insmRemote('renderPlayerListView');
                    }
                });
            }

            $.insmHashChange('register', {
                applicationName: _plugin.settings.applicationName,
                callback: function(hash) {
                    var remote = hash[_plugin.settings.applicationName];
                    if (remote) {
                        if (remote.id) {
                            $this.insmRemote('renderPlaylistsView', {
                                playerId: remote.id,
                                view: remote.view
                            });
                        } else if (remote.ip) {
                            throw new Error('IP address not implemented');
                        } else {
                            $this.insmRemote('renderPlayerListView');
                        }
                    }
                }
            });

            var hash = $.insmHashChange('get');
            if (hash[_plugin.settings.applicationName]) {
                $.insmHashChange('updateHash', hash);
            } else {
                $this.insmRemote('renderPlayerListView');
            }

            $this.insmRemote('resize');

            return _plugin.settings.target;
        },
        renderPlayerListView: function() {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            var systemInfo = $.insmFramework('getSystemInformation');
            if (systemInfo.type == 'Player') {
                $this.insmRemote('renderPlaylistsView', {
                    playerId: 'local'
                });
            } else {
                _plugin.htmlElements.views.playlists.container.hide();
                _plugin.htmlElements.views.playerlist.container.fadeIn();

                $this.insmRemote('setSubscriptions', {
                    view: 'playerlist'
                });
            }

            return $this;
        },
        renderPlaylistsView: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            _plugin.htmlElements.views.playerlist.container.hide();
            _plugin.htmlElements.views.playlists.container.fadeIn();

            _plugin.data.selectedPlayerId = options.playerId;
            _plugin.data.selectedPlayerView = options.view;
            
            if (!_plugin.data.players[options.playerId]) {
                _plugin.htmlElements.views.playlists.header.title.insmLoader('destroy');
                _plugin.htmlElements.views.playlists.header.title.insmLoader();

                $.insmFramework('getPlayer', {
                    upid: options.playerId,
                    success: function(player) {
                        _plugin.htmlElements.views.playlists.header.title.text(
                            'Playlists for ' + (player.name || player.upid)
                        );

                        if (player.viewCount > 1) {
                            _plugin.htmlElements.views.playlists.header.title.append(' (view ' + _plugin.data.selectedPlayerView + ')');
                        }

                        _plugin.data.players[player.upid] = player;

                        $this.insmRemote('setSubscriptions', {
                            view: 'playlists'
                        });
                    }
                });
            } else {
                _plugin.htmlElements.views.playlists.header.title.insmLoader('destroy');

                _plugin.htmlElements.views.playlists.header.title.text(
                    'Playlists for ' + _plugin.data.players[options.playerId].name
                );

                if (_plugin.data.players[options.playerId].viewCount > 1) {
                    _plugin.htmlElements.views.playlists.header.title.append(' (view ' + _plugin.data.selectedPlayerView + ')');
                }

                $this.insmRemote('setSubscriptions', {
                    view: 'playlists'
                });
            }

            return $this;
        },
        getPlayingChannel: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            $.insmFramework('getPlayingChannel', {
                playerId: options.playerId,
                success: function(data) {
                    //$.insmNotification({
                    //    type: 'information',
                    //    message: data
                    //});
                }
            });

            return $this;
        },
        resize: function() {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');
            if (_plugin) {
                var container = _plugin.settings.target.insmUtilities('size');
                var header = _plugin.htmlElements.header.insmUtilities('size', { actualSize: true });
                var controls = _plugin.htmlElements.views.playlists.content.controls.insmUtilities('size', { actualSize: true });
                var volumeBar = _plugin.htmlElements.views.playlists.content.volumeBarContainer.insmUtilities('size', { actualSize: true });

                var playerListMargin = parseInt(_plugin.htmlElements.views.playerlist.container.insmUtilities('size', { accontualSize: true }).height - _plugin.htmlElements.views.playerlist.container.insmUtilities('size').height);

                _plugin.htmlElements.views.playerlist.container.css({
                    height: parseInt(container.height - header.height - playerListMargin) + 'px'
                });

                var playlistsMargin = parseInt(_plugin.htmlElements.views.playlists.container.insmUtilities('size', { actualSize: true }).height - _plugin.htmlElements.views.playlists.container.insmUtilities('size').height);
                _plugin.htmlElements.views.playlists.container.css({
                    height: parseInt(container.height - header.height - controls.height - volumeBar.height - playlistsMargin) + 'px'
                });
            }

            return $this;
        },
        startSubscriptions: function() {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            _plugin.subscriptions.start();

            return $this;
        },
        hasSettings: function() {
            return false;
        },
        stopSubscriptions: function() {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            if (_plugin) {
                return _plugin.subscriptions.stop();
            }

            return $this;
        },
        setSubscriptions: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');
            switch (options.view.toLowerCase()) {
            case 'playerlist':
                _plugin.htmlElements.views.playerlist.content.container.insmLoader('destroy');
                _plugin.htmlElements.views.playerlist.content.container.insmLoader();
                _plugin.subscriptions.start = function() {
                    $.insmService('register', {
                        subscriber: _plugin.settings.applicationName,
                        type: 'player',
                        update: function(players) {
                            // Set all players to _plugin.data.players
                            // If players has an update we highlight it
                            var updatedPlayers = {};

                            $.each(players, function (index, player) {
                                if (typeof _plugin.data.players[player.id] === 'undefined') {
                                    _plugin.data.players[player.id] = player;
                                    // Add to playerlist grid

                                    var viewCount = getObjectKeyCount(player.views);
                                    $.each(player.views, function (viewIndex, view) {
                                        var buttonText = player.name;
                                        if (viewCount > 1) {
                                            buttonText += ' (view '+viewIndex+')';
                                        }
                                        _plugin.htmlElements.views.playerlist.content.container.append(
                                            $('<button />').addClass('player').append(
                                                $('<div />').addClass('name').text(buttonText)
                                            ).click(function () {
                                                var hash = $.insmHashChange('get');
                                                if (hash[_plugin.settings.applicationName]) {
                                                    hash[_plugin.settings.applicationName] = {
                                                        id: player.id,
                                                        view: viewIndex
                                                    }
                                                    $.insmHashChange('updateHash', hash);
                                                } else {
                                                    $this.insmRemote('renderPlaylistsView');
                                                }
                                            })
                                        );
                                    });
                                } else {
                                    $.each(player, function (property, value) {
                                        if (!_.isEqual(_plugin.data.players[player.id][property], player[property])) {
                                            _plugin.data.players[player.id] = player;

                                            return false;
                                        }
                                    });
                                }
                            });
                        },
                        reset: function() {
                            _plugin.data.players = {};
                            _plugin.htmlElements.views.playerlist.content.container.empty();
                        },
                        remove: function() {

                        }
                    });
                };

                $this.insmRemote('stopSubscriptions');
                $this.insmRemote('startSubscriptions');

                _plugin.subscriptions.stop = function() {
                    $.insmService('unregister', {
                        subscriber: _plugin.settings.applicationName,
                        type: 'player'
                    });
                };
                break;
            case 'playlists':
                $this.insmRemote('stopSubscriptions');

                _plugin.subscriptions.start = function() {
                    _plugin.htmlElements.views.playlists.content.controls.hide();
                    _plugin.htmlElements.views.playlists.content.container.insmLoader('destroy');

                    _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('green');
                    _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('yellow');
                    _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('red');

                    var checkConnectionDeferred = $this.insmRemote('checkConnection');
                    _plugin.htmlElements.views.playlists.content.container.insmLoader({
                        deferred: checkConnectionDeferred,
                        text: 'Checking connection'
                    });
                    checkConnectionDeferred.done(function () {
                        _plugin.htmlElements.views.playlists.content.defaultPlaylist.empty();
                        _plugin.htmlElements.views.playlists.content.alternativePlaylists.empty();

                        var initializePlaylistsDeferred = $this.insmRemote('initializePlaylists');
                        _plugin.htmlElements.views.playlists.content.container.insmLoader({
                            deferred: initializePlaylistsDeferred,
                            text: 'Loading playlists'
                        });

                        $.when(initializePlaylistsDeferred).done(function () {
                            var initialized = [
                                $this.insmRemote('initializePlayoutState'),
                                $this.insmRemote('initializeVolume')
                            ];

                            _plugin.htmlElements.views.playlists.content.container.insmLoader({
                                deferred: initialized,
                                text: 'Loading playout state'
                            });

                            $.when.apply($, initialized).done(function () {
                                // Remove loader and append playlists
                                _plugin.htmlElements.views.playlists.content.container.insmLoader('destroy');
                                _plugin.htmlElements.views.playlists.content.container.append(
                                    _plugin.htmlElements.views.playlists.content.defaultPlaylistHeader.text('Default playlist').addClass('divider'),
                                    _plugin.htmlElements.views.playlists.content.defaultPlaylist,
                                    _plugin.htmlElements.views.playlists.content.alternativePlaylistsHeader.text('Alternative playlists').addClass('divider'),
                                    _plugin.htmlElements.views.playlists.content.alternativePlaylists
                                );

                                // Show controls
                                _plugin.htmlElements.views.playlists.content.controls.fadeIn();
                                $this.insmRemote('resize');
                            });
                        });
                    });
                };
                _plugin.subscriptions.stop = function() {
                    clearInterval(_plugin.data.activePlaylistIntervalHandle);
                    clearInterval(_plugin.data.volumeIntervalHandle);
                };

                $this.insmRemote('startSubscriptions');
                break;
            default:
                throw new Error('View "' + options.view + '" not recognised');
                break;
            }

            return $this;
        },
        initializePlaylists: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            var playlistsDeferred = new $.Deferred();

            $.insmFramework('getAvailablePlaylists', {
                playerId: _plugin.data.selectedPlayerId,
                playerIp: $this.insmRemote('getLocalIpAddress', {
                    playerId: _plugin.data.selectedPlayerId
                }),
                error: function() {
                    _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('green');
                    _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('yellow');
                    _plugin.htmlElements.views.playlists.header.apiIndicator.addClass('red');
                    _plugin.htmlElements.views.playlists.content.container.insmLoader('destroy');
                    _plugin.htmlElements.views.playlists.content.container.text('Failed to connect to the media player');
                },
                success: function(playlists) {
                    _plugin.data.playlists = {};

                    $this.insmRemote('populatePlaylists', {
                        playlists: playlists
                    });
                    playlistsDeferred.resolve();
                }
            });

            return playlistsDeferred;
        },
        initializePlayoutState: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            var activePlaylistDeferred = new $.Deferred();

            $.insmFramework('getPlayoutState', {
                playerId: _plugin.data.selectedPlayerId,
                view: _plugin.data.selectedPlayerView,
                playerIp: $this.insmRemote('getLocalIpAddress', {
                    playerId: _plugin.data.selectedPlayerId
                }),
                error: function (message) {
                    // This happens now and then but there's no harm so just ignore when it happens
                    if (message !== "Timeout on send command getCurrentPlayoutStateCommand" &&
                        message !== "Timeout on check command getCurrentPlayoutStateCommand" &&
                        message !== "Timeout on check command playTemporaryPlaylist") {
                                                    
                        throw new Error(message);
                    }
                    else {
                        _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('green');
                        _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('red');
                        _plugin.htmlElements.views.playlists.header.apiIndicator.addClass('yellow');

                        _plugin.data.players[_plugin.data.selectedPlayerId].ipAddress = null;
                    }
                },
                success: function (data) {
                    if (data.State == 'Playing') {
                        _plugin.htmlElements.views.playlists.content.play.addClass('is-selected');
                        _plugin.htmlElements.views.playlists.content.pause.removeClass('is-selected');
                    } else {
                        _plugin.htmlElements.views.playlists.content.play.removeClass('is-selected');
                        _plugin.htmlElements.views.playlists.content.pause.addClass('is-selected');
                    }

                    $.each(_plugin.data.playlists, function (name, button) {
                        if (data.ActivePlaylist == name) {
                            _plugin.data.playlists[name].addClass('is-selected');
                        }
                        else {
                            _plugin.data.playlists[name].removeClass('is-selected');
                        }
                    });

                    activePlaylistDeferred.resolve();
                }
            });

            $.when(activePlaylistDeferred).done(function () {
                function activePlaylistLoop() {
                    $.insmFramework('getPlayoutState', {
                        playerId: _plugin.data.selectedPlayerId,
                        view: _plugin.data.selectedPlayerView,
                        playerIp: $this.insmRemote('getLocalIpAddress', {
                            playerId: _plugin.data.selectedPlayerId
                        }),
                        error: function(message) {
                            // This happens now and then but there's no harm so just ignore when it happens
                            if (message !== "Timeout on send command getCurrentPlayoutStateCommand" &&
                                message !== "Timeout on check command getCurrentPlayoutStateCommand" &&
                                message !== "Timeout on check command playTemporaryPlaylist") {

                                throw new Error(message);
                            } else {
                                _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('green');
                                _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('red');
                                _plugin.htmlElements.views.playlists.header.apiIndicator.addClass('yellow');

                                _plugin.data.players[_plugin.data.selectedPlayerId].ipAddress = null;
                            }
                        },
                        success: function (data) {
                            if (data.State == 'Playing') {
                                _plugin.htmlElements.views.playlists.content.play.addClass('is-selected');
                                _plugin.htmlElements.views.playlists.content.pause.removeClass('is-selected');
                            } else {
                                _plugin.htmlElements.views.playlists.content.play.removeClass('is-selected');
                                _plugin.htmlElements.views.playlists.content.pause.addClass('is-selected');
                            }

                            $.each(_plugin.data.playlists, function(name, button) {
                                if (data.ActivePlaylist == name) {
                                    _plugin.data.playlists[name].addClass('is-selected');
                                } else {
                                    _plugin.data.playlists[name].removeClass('is-selected');
                                }
                            });
                            setTimeout(function() {
                                activePlaylistLoop();
                            }, _plugin.settings.intervalTimeoutTime);
                        }
                    });
                };

                activePlaylistLoop();
            });

            return activePlaylistDeferred;
        },
        initializeVolume: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            var volumeDeferred = new $.Deferred();

            $.insmFramework('getVolumeState', {
                playerId: _plugin.data.selectedPlayerId,
                playerIp: $this.insmRemote('getLocalIpAddress', {
                    playerId: _plugin.data.selectedPlayerId
                }),
                error: function (message) {
                    throw new Error(message);
                },
                success: function (state) {
                    if (!_plugin.data.userInControl) {
                        _plugin.htmlElements.views.playlists.content.volumeBar.slider('value', state.volume);
                        _plugin.htmlElements.views.playlists.content.volumeDigit.text(state.volume + ' %');

                        if (state.isMuted) {
                            _plugin.htmlElements.views.playlists.content.mute.addClass('mute-on');
                            _plugin.htmlElements.views.playlists.content.volume.addClass('muted');
                        } else {
                            _plugin.htmlElements.views.playlists.content.mute.removeClass('mute-on');
                            _plugin.htmlElements.views.playlists.content.volume.removeClass('muted');
                        }
                        _plugin.htmlElements.views.playlists.content.volumeDigit.addClass('in-sync');
                    } else if (!_plugin.data.userIsSliding && _plugin.htmlElements.views.playlists.content.volumeBar.slider('value') == state.volume) {
                        _plugin.data.userInControl = false;
                        _plugin.htmlElements.views.playlists.content.volumeDigit.addClass('in-sync');
                    }

                    volumeDeferred.resolve();
                }
            });

            $.when(volumeDeferred).done(function () {
                
                function getVolumeLoop() {
                    $.insmFramework('getVolumeState', {
                        playerId: _plugin.data.selectedPlayerId,
                        playerIp: $this.insmRemote('getLocalIpAddress', {
                            playerId: _plugin.data.selectedPlayerId
                        }),
                        error: function (message) {
                            throw new Error(message);
                        },
                        success: function (state) {
                            if (!_plugin.data.userInControl) {
                                _plugin.htmlElements.views.playlists.content.volumeBar.slider('value', state.volume);
                                _plugin.htmlElements.views.playlists.content.volumeDigit.text(state.volume + ' %');

                                if (state.isMuted) {
                                    _plugin.htmlElements.views.playlists.content.mute.addClass('mute-on');
                                    _plugin.htmlElements.views.playlists.content.volume.addClass('muted');
                                } else {
                                    _plugin.htmlElements.views.playlists.content.mute.removeClass('mute-on');
                                    _plugin.htmlElements.views.playlists.content.volume.removeClass('muted');
                                }
                                _plugin.htmlElements.views.playlists.content.volumeDigit.addClass('in-sync');
                            } else if (!_plugin.data.userIsSliding && _plugin.htmlElements.views.playlists.content.volumeBar.slider('value') == state.volume) {
                                _plugin.data.userInControl = false;
                                _plugin.htmlElements.views.playlists.content.volumeDigit.addClass('in-sync');
                            }

                            setTimeout(function() {
                                getVolumeLoop();
                            }, _plugin.settings.intervalTimeoutTime);
                        }
                    });
                }

                getVolumeLoop();
            });

            return volumeDeferred;
        },
        checkConnection: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            var connectionDeferred = new $.Deferred();
            var localIpAddress = $this.insmRemote('getLocalIpAddress', {
                playerId: _plugin.data.selectedPlayerId
            });
            if (localIpAddress) {
                $.ajax({
                    url: 'http://' + localIpAddress + '/Command.aspx',
                    dataType: 'jsonp',
                    success: function () {
                        _plugin.htmlElements.views.playlists.header.apiIndicator.addClass('green');
                        connectionDeferred.resolve();
                    },
                    error: function () {
                        $.ajax({
                            url: 'http://' + localIpAddress + '/player/Command.aspx',
                            dataType: 'jsonp',
                            success: function () {
                                _plugin.htmlElements.views.playlists.header.apiIndicator.addClass('green');
                                connectionDeferred.resolve();
                            },
                            error: function () {
                                _plugin.htmlElements.views.playlists.header.apiIndicator.addClass('yellow');
                                _plugin.data.players[_plugin.data.selectedPlayerId].ipAddress = null;
                                connectionDeferred.resolve();
                            },
                            timeout: 1000
                        });
                    },
                    timeout: 1000
                });
            } else {
                var systemInfo = $.insmFramework('getSystemInformation');
                if (systemInfo.type == 'Player') {
                    _plugin.htmlElements.views.playlists.header.apiIndicator.addClass('green');
                } else {
                    _plugin.htmlElements.views.playlists.header.apiIndicator.addClass('yellow');
                }
                connectionDeferred.resolve();
            }

            return connectionDeferred;
        },
        populatePlaylists: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            $.each(options.playlists, function (index, playlist) {
                _plugin.data.playlists[playlist.name] = $('<button />');
                if (playlist.default) {
                    _plugin.data.playlists[playlist.name].addClass('default');
                }

                var target;
                if (playlist.default) {
                    target = _plugin.htmlElements.views.playlists.content.defaultPlaylist;
                }
                else {
                    target = _plugin.htmlElements.views.playlists.content.alternativePlaylists;
                }

                target.append(
                    _plugin.data.playlists[playlist.name].text(playlist.name).click(function () {
                        var feedbackHandle = $.insmFeedbackOverlay();
                        $.insmFramework('changePlaylist', {
                            playerIp: $this.insmRemote('getLocalIpAddress', {
                                playerId: _plugin.data.selectedPlayerId
                            }),
                            view: _plugin.data.selectedPlayerView,
                            playerId: _plugin.data.selectedPlayerId,
                            playlist: playlist.name,
                            duration: 60*60,
                            success: function (data) {
                                $.insmFramework('getPlayoutState', {
                                    playerIp: $this.insmRemote('getLocalIpAddress', {
                                        playerId: _plugin.data.selectedPlayerId
                                    }),
                                    view: _plugin.data.selectedPlayerView,
                                    playerId: _plugin.data.selectedPlayerId,
                                    success: function (data) {
                                        feedbackHandle.remove();

                                        if (data.State == 'Playing') {
                                            _plugin.htmlElements.views.playlists.content.play.addClass('is-selected');
                                            _plugin.htmlElements.views.playlists.content.pause.removeClass('is-selected');
                                        } else {
                                            _plugin.htmlElements.views.playlists.content.play.removeClass('is-selected');
                                            _plugin.htmlElements.views.playlists.content.pause.addClass('is-selected');
                                        }

                                        $.each(_plugin.data.playlists, function (name, button) {
                                            if (data.ActivePlaylist == name) {
                                                _plugin.data.playlists[name].addClass('is-selected');
                                            }
                                            else {
                                                _plugin.data.playlists[name].removeClass('is-selected');
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    })
                );
            });

            return $this;
        },
        getLocalIpAddress: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            var localIpAddress = null;
            if (_plugin.data.players[options.playerId]) {
                localIpAddress = _plugin.data.players[_plugin.data.selectedPlayerId].ipAddress;
                if (localIpAddress && _plugin.data.players[_plugin.data.selectedPlayerId].port) {
                    localIpAddress += ':' + _plugin.data.players[_plugin.data.selectedPlayerId].port;
                }
            }
            return localIpAddress;
        },
        onClose: function (options) {
            options.success();
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRemote');

            $this.insmRemote('stopSubscriptions');
            $this.data('insmRemote', null).empty();

            return $this;
        }
    };

    $.fn.insmRemote = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmRemote');
        }
    };

})(jQuery);