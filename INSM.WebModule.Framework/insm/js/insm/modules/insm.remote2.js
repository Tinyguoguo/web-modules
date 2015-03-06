/*
* INSM Remote
* This file contain the INSM Remote function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmRemote2(settings);
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
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        apiUrl: '',
                        applicationName: 'Remote',
                        version: manifest.version,
                        header: true,
                        intervalTimeoutTime: 10000
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
                        start: function () { },
                        stop: function () { }
                    },
                    permissions: {

                    }
                };
                $this.data('insmRemote2', _plugin);
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
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            } else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview remote');


            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            _plugin.settings.previewTarget.html(
                $('<h2 />').text('Remote')
            );

            return _plugin.settings.previewTarget;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');

            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        fullscreen: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');
            setTimeout(function () {
                $this.insmRemote2('resize');
            }, 1000);
            if (_plugin.data.fullscreenInitialized) {
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
                                        _plugin.htmlElements.views.playlists.content.volumeDigit.text(ui.value + ' %');
                                    },
                                    stop: function (event, ui) {
                                        var feedbackHandle = $.insmFeedbackOverlay();
                                        _plugin.data.userIsSliding = false;

                                        $.insmFramework('setVolume', {
                                            playerId: _plugin.data.selectedPlayerId,
                                            playerIp: $this.insmRemote2('getLocalIpAddress', {
                                                playerId: _plugin.data.selectedPlayerId
                                            }),
                                            value: (parseFloat(ui.value) / 100).toString().replace('.', ','),
                                            error: function (message) {
                                                $this.insmRemote2('errorCallback');
                                            },
                                            success: function () {
                                                $.insmFramework('getVolumeState', {
                                                    playerId: _plugin.data.selectedPlayerId,
                                                    playerIp: $this.insmRemote2('getLocalIpAddress', {
                                                        playerId: _plugin.data.selectedPlayerId
                                                    }),
                                                    error: function (message) {                                                        
                                                        $this.insmRemote2('errorCallback');
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
                            _plugin.htmlElements.views.playlists.content.mute.addClass('mute').click(function () {
                                var feedbackHandle = $.insmFeedbackOverlay();
                                if (!_plugin.htmlElements.views.playlists.content.mute.hasClass('mute-on')) {
                                    $.insmFramework('mute', {
                                        playerId: _plugin.data.selectedPlayerId,
                                        playerIp: $this.insmRemote2('getLocalIpAddress', {
                                            playerId: _plugin.data.selectedPlayerId
                                        }),
                                        error: function (message) {
                                            $this.insmRemote2('errorCallback');
                                        },
                                        success: function () {
                                            $.insmFramework('getVolumeState', {
                                                playerId: _plugin.data.selectedPlayerId,
                                                playerIp: $this.insmRemote2('getLocalIpAddress', {
                                                    playerId: _plugin.data.selectedPlayerId
                                                }),
                                                error: function (message) {
                                                    $this.insmRemote2('errorCallback');
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
                                } else {
                                    $.insmFramework('unmute', {
                                        playerId: _plugin.data.selectedPlayerId,
                                        playerIp: $this.insmRemote2('getLocalIpAddress', {
                                            playerId: _plugin.data.selectedPlayerId
                                        }),
                                        error: function (message) {
                                            $this.insmRemote2('errorCallback');
                                        },
                                        success: function () {
                                            $.insmFramework('getVolumeState', {
                                                playerId: _plugin.data.selectedPlayerId,
                                                playerIp: $this.insmRemote2('getLocalIpAddress', {
                                                    playerId: _plugin.data.selectedPlayerId
                                                }),
                                                error: function (message) {
                                                    $this.insmRemote2('errorCallback');
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
                        _plugin.htmlElements.views.playlists.content.volumeBarContainer.stop(true).fadeToggle('fast', function () {
                            $this.insmRemote2('resize');
                        })
                    )
                )
            );

            var systemInfo = $.insmFramework('getSystemInformation');
            if (systemInfo.type == 'Player') {
                _plugin.htmlElements.views.playlists.header.backButton.remove();
            } else {
                _plugin.htmlElements.views.playlists.header.backButton.click(function () {
                    $this.insmRemote2('stopSubscriptions');
                    _plugin.htmlElements.views.playlists.content.defaultPlaylist.empty();
                    _plugin.htmlElements.views.playlists.content.alternativePlaylists.empty();
                    _plugin.data.selectedPlayerId = null;

                    var hash = $.insmHashChange('get');
                    if (hash[_plugin.settings.applicationName]) {
                        $.insmHashChange('updateHash', _plugin.settings.applicationName);
                    } else {
                        $this.insmRemote2('renderPlayerListView');
                    }
                });
            }

            $.insmHashChange('register', {
                applicationName: _plugin.settings.applicationName,
                callback: function (hash) {
                    var remote = hash[_plugin.settings.applicationName];
                    if (remote) {
                        if (remote.id) {
                            $this.insmRemote2('renderPlaylistsView', {
                                playerId: remote.id,
                                view: remote.view
                            });
                        } else if (remote.ip) {
                            throw new Error('IP address not implemented');
                        } else {
                            $this.insmRemote2('renderPlayerListView');
                        }
                    }
                }
            });

            //var hash = $.insmHashChange('get');
            //if (hash[_plugin.settings.applicationName]) {
            //    $.insmHashChange('updateHash', hash);
            //} else {
            //    $this.insmRemote2('renderPlayerListView');
            //}
            $this.insmRemote2('resize');
            return _plugin.settings.target;
        },
        renderPlayerListView: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');

            var systemInfo = $.insmFramework('getSystemInformation');
            if (systemInfo.type == 'Player') {
                $this.insmRemote2('renderPlaylistsView', {
                    playerId: 'local',
                    url:systemInfo.apiUrl.replace('http://','')
                });
            } else {
                _plugin.htmlElements.views.playlists.container.hide();
                _plugin.htmlElements.views.playerlist.container.fadeIn();

                $this.insmRemote2('setSubscriptions', {
                    view: 'playerlist'
                });
            }

            return $this;
        },
        renderPlaylistsView: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');

            _plugin.htmlElements.views.playerlist.container.hide();
            _plugin.htmlElements.views.playlists.container.fadeIn();
            _plugin.htmlElements.views.playlists.content.controls.hide();
            _plugin.htmlElements.views.playlists.content.container.insmLoader('destroy');
            _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('green');
            _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('yellow');
            _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('red');
            _plugin.data.selectedPlayerId = options.playerId;
            _plugin.data.selectedPlayerView = options.view;
            _plugin.htmlElements.views.playlists.content.container.insmLoader({
                deferred: checkConnectionDeferred,
                text: 'Checking connection'
            });
            var getPlayerDeferred = new $.Deferred();
            var checkConnectionDeferred = new $.Deferred();
            if (!_plugin.data.players[options.playerId] && options.playerId !== 'local') {
                $.insmFramework('getPlayer', {
                    upid: options.playerId,
                    success: function (player) {
  
                        _plugin.data.players[options.playerId] = $.extend({}, player);
                        _plugin.htmlElements.views.playlists.header.title.text(
                        player.name || player.upid
                        );
                        getPlayerDeferred.resolve();
                    },
                    error: function () {

                        $this.insmRemote2('errorCallback');
                    }
                });

            } else if (options.playerId == 'local') {
                _plugin.data.players[options.playerId] = {};
                _plugin.data.players[options.playerId].ipAddress = null
                $.insmFramework('getPlayerName', {
                    success: function (name) {
                        _plugin.htmlElements.views.playlists.header.title.text(
                        name
                        );
                    }
                });
                
                getPlayerDeferred.resolve();
            }
            else {
                _plugin.htmlElements.views.playlists.header.title.text(
                    _plugin.data.players[options.playerId].name ||  _plugin.data.players[options.playerId].upid
                );
                getPlayerDeferred.resolve();               
            }
            $.when(getPlayerDeferred).done(function () {
                $this.insmRemote2('checkConnection').done(function () {
                    checkConnectionDeferred.resolve();
                });
            });            
            $this.insmRemote2('stopSubscriptions');

            checkConnectionDeferred.done(function () {
                if (_plugin.data.selectedPlayerId != options.playerId) {
                    return;
                }
                _plugin.htmlElements.views.playlists.content.container.insmLoader('destroy');
                _plugin.htmlElements.views.playlists.content.defaultPlaylist.empty();
                _plugin.htmlElements.views.playlists.content.alternativePlaylists.empty();
                var initialized = $this.insmRemote2('initializeVolume');
                _plugin.htmlElements.views.playlists.content.container.insmLoader({
                    deferred: initialized,
                    text: 'Loading Volume Data'
                });
                $.when(initialized).done(function () {
                    // If wrong player return;
                    if (_plugin.data.selectedPlayerId != options.playerId) {
                        return;
                    }

                    // Remove loader and append playlists
                    _plugin.htmlElements.views.playlists.content.container.insmLoader('destroy');
                    // Show controls
                    _plugin.htmlElements.views.playlists.content.controls.fadeIn();             
                    if (_plugin.data.players[options.playerId].viewCount > 1) {
                        _plugin.htmlElements.views.playlists.header.title.append(' (view ' + _plugin.data.selectedPlayerView + ')');
                    }
                    $this.insmRemote2('setSubscriptions', {
                        view: 'playlist'
                    });

                    $this.insmRemote2('resize');
                }).fail(function () {
                    $this.insmRemote2('errorCallback');
                });
            });
            return $this;
        },
        getPlayingChannel: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');

            $.insmFramework('getPlayingChannel', {
                playerId: options.playerId,
                success: function (data) {
                    //$.insmNotification({
                    //    type: 'information',
                    //    message: data
                    //});
                }
            });

            return $this;
        },
        resize: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');
            if (_plugin) {
                
                var container = _plugin.settings.target.insmUtilities('size');
                var header = _plugin.htmlElements.header.insmUtilities('size', { actualSize: true });
                var controls = _plugin.htmlElements.views.playlists.content.controls.insmUtilities('size', { actualSize: true });
                var volumeBar = _plugin.htmlElements.views.playlists.content.volumeBarContainer.insmUtilities('size', { actualSize: true });
                var playerListHeader =_plugin.htmlElements.views.playerlist.header.insmUtilities('size',{actualSize:true});
                var playerListMargin = parseInt(_plugin.htmlElements.views.playerlist.content.container.insmUtilities('size', { accontualSize: true }).height - _plugin.htmlElements.views.playerlist.content.container.insmUtilities('size').height);

                _plugin.htmlElements.views.playerlist.container.css({
                    height: parseInt(container.height - header.height - playerListMargin) + 'px'
                });
                _plugin.htmlElements.views.playerlist.content.container.css({
                    height: parseInt(container.height - header.height - playerListMargin - playerListHeader.height - 32) + 'px'
                });
                var playlistsMargin = parseInt(_plugin.htmlElements.views.playlists.container.insmUtilities('size', { actualSize: true }).height - _plugin.htmlElements.views.playlists.container.insmUtilities('size').height);
                _plugin.htmlElements.views.playlists.container.css({
                    height: parseInt(container.height - header.height - controls.height - volumeBar.height - playlistsMargin) + 'px'
                });
            }

            return $this;
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');

            _plugin.subscriptions.start();

            return $this;
        },
        hasSettings: function () {
            return false;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');

            if (_plugin) {
                $.insmService('unregister', {
                    upid: _plugin.data.selectedPlayerId,
                    subscriber: _plugin.settings.applicationName,
                    type: 'playoutState'
                });
                clearInterval(_plugin.data.activePlaylistIntervalHandle);
                clearInterval(_plugin.data.volumeIntervalHandle);
                $.insmService('unregister', {
                    subscriber: _plugin.settings.applicationName,
                    type: 'player'
                });
                //return _plugin.subscriptions.stop();
            }
            return $this;
        },
        setSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');
            switch (options.view.toLowerCase()) {
                case 'playerlist':
                    $this.insmRemote2('stopSubscriptions');
                    _plugin.htmlElements.views.playerlist.content.container.insmLoader('destroy');
                    _plugin.htmlElements.views.playerlist.content.container.insmLoader();
                    _plugin.subscriptions.start = function () {
                        $.insmService('register', {
                            subscriber: _plugin.settings.applicationName,
                            type: 'player',
                            update: function (players) {
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
                                                buttonText += ' (view ' + viewIndex + ')';
                                            }
                                            _plugin.htmlElements.views.playerlist.content.container.append(
                                                $('<li />').addClass('player is-clickable').append(
                                                    $('<div />').addClass('name').text(buttonText)
                                                ).click(function () {                                                 
                                                    _plugin.htmlElements.views.playlists.header.title.text(
                                                         'Player ' + (player.name || player.upid)
                                                    );
                                                    var hash = $.insmHashChange('get');
                                                    if (hash[_plugin.settings.applicationName]) {
                                                        hash[_plugin.settings.applicationName] = {
                                                            id: player.id,
                                                            view: viewIndex
                                                        }
                                                        $.insmHashChange('updateHash', hash);
                                                    } else {
                                                        $this.insmRemote2('renderPlaylistsView');
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
                            reset: function () {
                                _plugin.data.players = {};
                                _plugin.htmlElements.views.playerlist.content.container.empty();
                            },
                            remove: function () {

                            }
                        });
                    };                   
                    $this.insmRemote2('startSubscriptions');                   
                    break;
                case 'playlist':
                    _plugin.subscriptions.start = function () {
                        $.insmService('register', {
                            upid: _plugin.data.selectedPlayerId,
                            subscriber: _plugin.settings.applicationName,
                            type: 'playoutState',
                            update: function () {
                                $.insmFramework('getVolumeState', {
                                    playerId: _plugin.data.selectedPlayerId,
                                    playerIp: $this.insmRemote2('getLocalIpAddress', {
                                        playerId: _plugin.data.selectedPlayerId
                                    }),
                                    error: function (message) {
                                        $this.insmRemote2('errorCallback');
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
                                    }
                                });
                            },
                            reset: function () {
                                _plugin.data.selectedPlayerId = '';
                                _plugin.htmlElements.views.playerlist.content.container.empty();
                            },
                        });
                    };
                        $this.insmRemote2('stopSubscriptions');
                        $this.insmRemote2('startSubscriptions');
                    break;
                default:
                    throw new Error('View "' + options.view + '" not recognised');
                    break;
            }

            return $this;
        },
        errorCallback: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');
            _plugin.htmlElements.views.playlists.content.container.insmLoader('destroy');
            _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('green');
            _plugin.htmlElements.views.playlists.header.apiIndicator.removeClass('yellow');
            _plugin.htmlElements.views.playlists.header.apiIndicator.addClass('red');
            _plugin.htmlElements.views.playlists.content.container.text('Can not connect to the player');
            _plugin.htmlElements.views.playlists.content.controls.hide();
        },
        initializeVolume: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');

            var volumeDeferred = new $.Deferred();
            $.insmFramework('getVolumeState', {
                playerId: _plugin.data.selectedPlayerId,
                playerIp: $this.insmRemote2('getLocalIpAddress', {
                    playerId: _plugin.data.selectedPlayerId
                }),
                error: function (message) {
                    volumeDeferred.reject();
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
            return volumeDeferred;
        },
        checkConnection: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');

            var connectionDeferred = new $.Deferred();

            var localIpAddress = $this.insmRemote2('getLocalIpAddress', {
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
                                if (!_plugin.data.selectedPlayerId) {
                                    return;
                                }
                                _plugin.data.players[_plugin.data.selectedPlayerId].ipAddress = null;
                                var pingDeferred = new $.Deferred();
                                $.insmFramework('playerCommand', {
                                    command: 'isMuted',
                                    success: function (isMuted) {                                    
                                        pingDeferred.resolve();
                                    },
                                    offline: function () {
                                        pingDeferred.reject();                                      
                                    },
                                    playerId: _plugin.data.selectedPlayerId
                                });
                                $.when(pingDeferred).done(function () {
                                    _plugin.htmlElements.views.playlists.header.apiIndicator.addClass('yellow');
                                    connectionDeferred.resolve();
                                }).fail(function () {
                                    $this.insmRemote2('errorCallback');
                                    connectionDeferred.reject();
                                });
                            },
                            timeout: 3000
                        });
                    },
                    timeout: 3000
                });
            } else {
                var systemInfo = $.insmFramework('getSystemInformation');
                if (systemInfo.type == 'Player') {

                    _plugin.htmlElements.views.playlists.header.apiIndicator.addClass('green');
                    connectionDeferred.resolve();
                } else {
                    var pingDeferred = new $.Deferred();
                    $.insmFramework('playerCommand', {
                        command: 'isMuted',
                        success: function (isMuted) {
                            pingDeferred.resolve();
                        },
                        offline: function () {
                            pingDeferred.reject();
                        },
                        playerId: _plugin.data.selectedPlayerId
                    });
                    $.when(pingDeferred).done(function () {
                        _plugin.htmlElements.views.playlists.header.apiIndicator.addClass('yellow');
                        connectionDeferred.resolve();
                    }).fail(function () {
                        $this.insmRemote2('errorCallback');
                        connectionDeferred.reject();
                    });
                }                
            }
            return connectionDeferred;
        },
        
        getLocalIpAddress: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');

            var localIpAddress = null;
            if (_plugin.data.players[options.playerId]) {
                localIpAddress = _plugin.data.players[options.playerId].ipAddress;
                if (localIpAddress && _plugin.data.players[options.playerId].port) {
                    localIpAddress += ':' + _plugin.data.players[options.playerId].port;
                }
            }
            
            return localIpAddress;
        },
        onClose: function (options) {
            options.success();
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmRemote2');

            $this.insmRemote2('stopSubscriptions');
            $this.data('insmRemote2', null).empty();

            return $this;
        }
    };

    $.fn.insmRemote2 = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmRemote2');
        }
    };

})(jQuery);