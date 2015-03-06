/*
* INSM Asset
* This file contain the INSM Input Player Playlist Command function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputPlayerPlaylistCommand(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
*
* Authors:
* Tobias Rahm - Instoremedia AB
*/

; (function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylistCommand');
            _plugin = {
                settings: $.extend({
                    type: 'playerPlaylist',
                    required: false,
                    multiSelect: false,
                    disabled: false,
                    value: []
                }, options),
                data: {
                    commands: [],
                    players: [],
                    selected: {
                        player: null,
                        view: null,
                        playlist: null
                    }
                },
                htmlElements: {
                    commands: [],
                    addButton: $('<button />').text('Add')
                }
            };
            
            $this.data('insmInputPlayerPlaylistCommand', _plugin).addClass('insm-input-player-playlist');

            return $this;
        },
        view: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylistCommand');

            if ($.isArray(_plugin.settings.value)) {
                $this.text(_plugin.settings.value.join(", "));
            }
            else {
                $this.text(_plugin.settings.value);
            }

            _plugin.data.currentView = 'view';

            return $this;
        },
        addCommand: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylistCommand');

            if (!options) {
                options = {
                    command: {}
                };
            }

            var value = $.extend({
                player: null,
                viewId: null,
                playlist: null
            }, options.command);
            
            var input = {
                container: $('<div />').addClass('container'),
                player: $('<div />').addClass('is-clickable'),
                viewId: $('<div />'),
                playlist: $('<div />').addClass('is-clickable'),
                remove: $('<a />').text('x').click(function() {
                    $.each(_plugin.htmlElements.commands, function (index, command) {
                        if (command.remove == input.remove) {
                            _plugin.htmlElements.commands.splice(index, 1);
                            input.container.remove();
                            return false;
                        }
                    })
                })
            };

            _plugin.data.commands.push(value);
            _plugin.htmlElements.commands.push(input);


            input.player.insmInputPlayer({
                onChange: function (player) {
                    _plugin.data.selected.player = player;
                    input.viewId.insmInputPlayerView('setValue', {
                        player: player
                    });
                }
            }).insmInputPlayer('edit');

            input.viewId.insmInputPlayerView({
                onChange: function (viewId) {
                    _plugin.data.selected.view = viewId;
                    // Update player playlists
                    input.playlist.insmInputPlayerPlaylist('setValue', {
                        playerId: _plugin.data.selected.player.id,
                        viewId: viewId
                    });
                }
            }).insmInputPlayerView('edit');


            input.playlist.insmInputPlayerPlaylist({
                required: true,
                onChange: function (playlist) {
                    
                }
            }).insmInputPlayerPlaylist('edit');

            _plugin.htmlElements.addButton.before(
                input.container.append(
                    input.remove,
                    input.player,
                    input.viewId,
                    input.playlist
                )
            );
                        

            if (value.player && value.player.id) {
                _plugin.data.selected.player = {
                    id: value.player.id
                };
                input.player.insmInputPlayer('setValue', {
                    player: value.player
                });
                
                input.viewId.show();
                if (value.viewId) {
                    $.each(_plugin.data.players, function (index, player) {
                        if (player.id == value.player.id) {
                            if (!player.views[value.viewId]) {
                                value.viewId = 1;
                            }
                        }
                    });

                    input.viewId.insmInputPlayerView('setValue', {
                        player: value.player,
                        viewId: value.viewId
                    });
                }
            }

            if (value.playlist) {
                input.playlist.insmInputPlayerPlaylist('setValue', {
                    playerId: value.player.id,
                    viewId: value.viewId,
                    playlist: value.playlist
                });
            }

            /*
            input.playerId.click(function () {
                $.insmCombobox({
                    availableValues: _plugin.data.players,
                    onSelect: function (player) {
                        value.playerId = player.id;
                        value.playerName = player.name;
                        value.viewId = null;
                        value.playlist = null;
                        input.viewId.fadeIn();

                        var loader = $('<div />').insmLoader();
                        input.playlist.fadeIn().append(loader);

                        $.insmFramework('getAvailablePlaylists', {
                            playerId: value.playerId,
                            success: function (playlists) {
                                loader.remove();

                                $.each(player.views, function (index, view) {
                                    input.viewId.append(
                                        $('<a />').text(index).click(function () {
                                            input.viewId.children().removeClass('is-selected');
                                            $(this).addClass('is-selected');
                                            value.viewId = index;

                                            // Get playlists
                                            input.playlist.text('playlist selector').click(function () {
                                                $.insmCombobox({
                                                    availableValues: playlists,
                                                    onSelect: function (playlist) {
                                                        input.playlist.text(playlist.name);
                                                        value.playlist = playlist.name;
                                                    }
                                                });
                                            });
                                        })
                                    );
                                });
                            }
                        });

                        

                        input.playerId.text(player.name);
                    }
                });
            });
            */
            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylistCommand');

            $this.empty();

            $.insmFramework('getPlayers', {
                success: function (players) {
                    // Get players
                    _plugin.data.players = players;

                    if (_plugin.settings.multiSelect) {
                        $this.append(
                            _plugin.htmlElements.addButton.click(function () {
                                $this.insmInputPlayerPlaylistCommand('addCommand');
                            })
                        );
                    }
                    else {
                        $this.insmInputPlayerPlaylistCommand('addCommand');
                    }

                    $.each(_plugin.settings.value, function (index, command) {
                        $this.insmInputPlayerPlaylistCommand('addCommand', {
                            command: command
                        });
                    });
                }
            });



            _plugin.data.currentView = 'edit';

            return $this;
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylistCommand');
            

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylistCommand');

            var value = [];

            

            $.each(_plugin.htmlElements.commands, function (index, commandElement) {
                var playerData = commandElement.player.insmInputPlayer('getValue');
                if (playerData) {
                    var playerObject = {
                        id: playerData.id,
                        name: playerData.name,
                        views: playerData.views
                    };
                    value.push({
                        player: playerObject,
                        viewId: commandElement.viewId.insmInputPlayerView('getValue'),
                        playlist: commandElement.playlist.insmInputPlayerPlaylist('getValue'),
                    });
                }
            });
            
            return value;
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylistCommand');

            _plugin.htmlElements.addButton.insmHighlight({
                type: 'error'
            });

            return $this;
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylistCommand');
            _plugin.settings.value = value;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylistCommand');

            var valid = true;
            if (_plugin.htmlElements.commands.length > 0) {
                $.each(_plugin.htmlElements.commands, function (index, command) {
                    if (!command.player.insmInputPlayer('validate')) {
                        valid = false;
                    }
                    if (!command.viewId.insmInputPlayerView('validate')) {
                        valid = false;
                    }
                    if (!command.playlist.insmInputPlayerPlaylist('validate')) {
                        valid = false;
                    }
                });
            }
            else {
                $this.insmInputPlayerPlaylistCommand('highlightInvalid');
                valid = false;
            }

            return valid;
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylistCommand');

            switch (_plugin.settings.type) {
                case 'string':
                    _plugin.htmlElements.input.val("");
                    break;
                case 'dropdown':
                    _plugin.data.element.children().removeAttr("selected");
                    _plugin.data.element.children().eq(0).attr("selected", "selected");
                    break;
            }
            // clear current value
            _plugin.settings.value = [];
            $this.find(".selected").children().remove();
            return $this;

        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylistCommand');
            
            if (_plugin.settings.value !== options.value && options.value.length > 0) {
                _plugin.settings.value = options.value;
                switch (_plugin.data.currentView) {
                    case 'view':
                        $this.insmInputPlayerPlaylistCommand('view');
                        break;
                    case 'edit':
                        $this.insmInputPlayerPlaylistCommand('edit');
                        break;
                    default:
                        break;
                }

                if (_plugin.settings.value !== '') {
                    if (_plugin.data.type) {
                        switch (_plugin.data.currentView) {
                            case 'view':
                                $this.parent().insmHighlight();
                                break;
                            case 'edit':
                                _plugin.htmlElements.input.insmHighlight();
                                break;
                        }
                    }
                }
            }

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputPlayerPlaylistCommand', null).empty();

            return $this;
        }
    };

    $.fn.insmInputPlayerPlaylistCommand = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputPlayerPlaylistCommand');
        }
    };
})(jQuery);