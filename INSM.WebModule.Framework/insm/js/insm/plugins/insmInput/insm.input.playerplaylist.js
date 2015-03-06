/*
* INSM Asset
* This file contain the INSM Input Player Playlist function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputPlayerPlaylist(settings);
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
            var _plugin = $this.data('insmInputPlayerPlaylist');
            _plugin = {
                settings: $.extend({
                    type: 'playerPlaylist',
                    required: false,
                    multiSelect: false,
                    disabled: false,
                    value: null
                }, options),
                data: {
                    commands: [],
                    players: []
                },
                htmlElements: {
                    commands: [],
                    addButton: $('<button />').text('Add'),
                    value: $('<div />'),
                    input: $('<div />')
                }
            };
            
            $this.data('insmInputPlayerPlaylist', _plugin).addClass('insm-input-player-playlist');

            return $this;
        },
        view: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylist');

            if ($.isArray(_plugin.settings.value)) {
                $this.text(_plugin.settings.value.join(", "));
            }
            else {
                $this.text(_plugin.settings.value);
            }

            _plugin.data.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylist');

            $this.empty();

            _plugin.htmlElements.input = $('<div />').addClass('insm-combobox-input').hide();

            $this.append(
                _plugin.htmlElements.input
            );

            if (!_plugin.settings.value) {
                $this.insmInputPlayerPlaylist('setValue', {
                    playlist: null
                });
            }

            _plugin.data.currentView = 'edit';

            return $this;
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylist');
            

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylist');

            return _plugin.settings.value;
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylist');

            _plugin.htmlElements.input.insmHighlight({
                type: 'error'
            });

            return $this;
        },
        setValue: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylist');
                        
            if (typeof options.playlist !== 'undefined') {
                _plugin.settings.value = options.playlist;
            }

            if (options.playlist !== null) {
                _plugin.htmlElements.input.fadeIn();
            }


            _plugin.htmlElements.input.empty();

            if (_plugin.settings.value) {
                _plugin.htmlElements.input.text(_plugin.settings.value);
            }
            
            var loadingDiv;
            var cancelRequest = false;

            _plugin.htmlElements.input.unbind('click');
            _plugin.htmlElements.input.click(function () {
                cancelRequest = false;
                loadingDiv = $('<div />').insmLoader({
                    background: '#fff',
                    text: 'Loading playlists...'
                });
                $.insmPopup({
                    content: loadingDiv,
                    onClose: function () {
                        loadingDiv.insmLoader('destroy');
                        cancelRequest = true;
                    }
                });

                $.insmFramework('getPlayers', {
                    success: function (players) {
                        // Get players
                        _plugin.data.players = players;

                        $.each(players, function (index, player) {
                            if (options.playerId == player.id) {
                                $.insmFramework('getAvailablePlaylists', {
                                    playerId: options.playerId,
                                    view: options.viewId,
                                    success: function (playlists) {
                                        // Something wrong with the cancel request...
                                        if (!cancelRequest) {
                                            loadingDiv.insmLoader('destroy');
                                            $.insmPopup('destroy');
                                            $.insmCombobox({
                                                availableValues: playlists,
                                                onSelect: function (playlist) {
                                                    _plugin.htmlElements.input.text(playlist.name);
                                                    _plugin.settings.value = playlist.name;
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });

                //$.insmCombobox({
                //    availableValues: playlists,
                //    onSelect: function (playlist) {
                //        _plugin.htmlElements.input.text(playlist.name);
                //        _plugin.settings.value = playlist.name;
                //    }
                //});
            });

            

            return $this;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylist');


            if (_plugin.settings.required && !_plugin.settings.value) {
                $this.insmInputPlayerPlaylist('highlightInvalid');
                return false;
            }


            return true;
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlayerPlaylist');

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
            var _plugin = $this.data('insmInputPlayerPlaylist');
            
            if (_plugin.settings.value !== options.value && options.value.length > 0) {
                _plugin.settings.value = options.value;
                switch (_plugin.data.currentView) {
                    case 'view':
                        $this.insmInputPlayerPlaylist('view');
                        break;
                    case 'edit':
                        $this.insmInputPlayerPlaylist('edit');
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
            $this.data('insmInputPlayerPlaylist', null).empty();

            return $this;
        }
    };

    $.fn.insmInputPlayerPlaylist = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputPlayerPlaylist');
        }
    };
})(jQuery);