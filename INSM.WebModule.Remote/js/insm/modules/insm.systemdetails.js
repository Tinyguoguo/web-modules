/*
* INSM System Details
* This file contain the INSM System Details function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmSystemDetails(settings);
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
            var _plugin = $this.data('insmSystemDetails');
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        header: $('<div />'),
                        fullscreen: {
                            table: $('<div />'),
                            player: {
                                view: $('<div />')
                            },
                            controls: {
                                container: $('<div />'),
                                back: $('<button />'),
                                edit: $('<button />'),
                                save: $('<button />'),
                                cancel: $('<button />')
                            }
                        }
                    },
                    data: {
                        fullscreenInitialized: false,
                        players: {},
                        playerUpdateListeners: [],
                        selectedPlayer: {
                            upid: null
                        },
                        tableSearchIndex: function (player) {
                            var searchArray = [];
                            if (player.state && player.name && player.version) {
                                $.merge(searchArray, player.state.split(' '));
                                $.merge(searchArray, player.name.split(' '));
                                $.merge(searchArray, player.version.split(' '));
                            }
                            return searchArray;
                        },
                        tableHeaders: {
                            themeDefault: {
                                State: {
                                    key: 'state',
                                    output: function (player) {
                                        var stateRow = $('<div />').addClass('state ' + player.state.toLowerCase()).text(player.state);

                                        stateRow.insmTooltip({
                                            width: 150,
                                            textAlign: 'center',
                                            text: player.message
                                        });

                                        return stateRow;
                                    },
                                    sort: function (a, b) {
                                        var orderLookup = {
                                            ok: 4,
                                            transferring: 3,
                                            warning: 2,
                                            error: 1,
                                            offline: 0
                                        };
                                        if (orderLookup[a.state.toLowerCase()] < orderLookup[b.state.toLowerCase()]) {
                                            return -1;
                                        }
                                        if (orderLookup[a.state.toLowerCase()] > orderLookup[b.state.toLowerCase()]) {
                                            return 1;
                                        }
                                        return 0;
                                    }
                                },
                                Preview: {
                                    key: 'preview',
                                    output: function (player) {
                                        return $.insmPlayerPreview({
                                            upid: player.upid
                                        });
                                    },
                                    sortable: false,
                                    searchable: false
                                },
                                Name: {
                                    output: function (player) {
                                        return player.name;
                                    },
                                    sort: function (a, b) {
                                        if (a.name.toLowerCase() < b.name.toLowerCase()) {
                                            return -1;
                                        }
                                        else if (a.name.toLowerCase() > b.name.toLowerCase()) {
                                            return 1;
                                        }
                                        return 0;
                                    }
                                },
                                Version: {
                                    key: 'version',
                                    sort: function (a, b) {
                                        if (a.version == 'Unknown') {
                                            return -1;
                                        }
                                        else if (b.version == 'Unknown') {
                                            return 1;
                                        }
                                        if (a.version < b.version) {
                                            return -1;
                                        }
                                        else if (a.version > b.version) {
                                            return 1;
                                        }
                                        return 0;
                                    }
                                }
                            }
                        }
                    },
                    subscriptions: {
                        start: function() {},
                        stop: function() {}
                    },
                    settings: $.extend({
                        apiUrl: '',
                        applicationName: 'System Details',
                        version: manifest.version,
                        containerCallback: function (module) {

                        },
                        show: function () { },
                        target: null,
                        previewTarget: null,
                        thumbnailTarget: null
                    }, options)
                };
                $this.data('insmSystemDetails', _plugin);
            }

            return $this;
        },
        isInitialized: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            if (_plugin) {
                return true;
            }
            else {
                return false;
            }
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            }
            else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview systemDetails');

            var previewStatusDigits = {
                unknown: $('<span />'),
                offline: $('<span />'),
                error: $('<span />'),
                warning: $('<span />')
            };

            var previewContainer = $('<div />').append(
                $('<h2 />').text('System Details'),
                $('<div />').append(previewStatusDigits.unknown),
                $('<div />').append(previewStatusDigits.offline),
                $('<div />').append(previewStatusDigits.error),
                $('<div />').append(previewStatusDigits.warning)
            ).click(function (e) {
                e.stopPropagation();
                _plugin.settings.show();
            });

            _plugin.settings.previewTarget.html(previewContainer);

            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            return _plugin.settings.previewTarget;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            if (_plugin.settings.target) {
                return _plugin.settings.target;
            }
            else {
                _plugin.settings.target = $('<div />');
                //$this.insmSystemDetails('fullscreen');
            }

            return _plugin.settings.target;
        },
        fullscreen: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function () {
                    $this.insmSystemDetails('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;
            
            // Init html
            _plugin.settings.target.addClass('systemDetails systemDetails-container').empty().append(
                _plugin.htmlElements.header.addClass('header').append(
                        $('<div />').addClass('company-logo'),
                        $('<div />').addClass('module-logo')
                    ),
                _plugin.htmlElements.fullscreen.table.addClass('content'),
                _plugin.htmlElements.fullscreen.controls.container.append(
                    _plugin.htmlElements.fullscreen.controls.back,
                    _plugin.htmlElements.fullscreen.controls.edit,
                    _plugin.htmlElements.fullscreen.controls.cancel.hide(),
                    _plugin.htmlElements.fullscreen.controls.save.hide()
                ).addClass('controlsContainer').hide()
            );
            _plugin.settings.target.append(
                _plugin.htmlElements.fullscreen.player.view.addClass('playerDetails').hide()
            );

            // Create table
            _plugin.htmlElements.fullscreen.table.insmTable({
                headers: _plugin.data.tableHeaders.themeDefault,
                items: _plugin.data.players,
                searchIndex: _plugin.data.tableSearchIndex,
                selectable: false,
                placeholderText: 'Search players...',
                onSelect: function (player) {
                    // Show player #System Details=upid:#;
                    var hash = $.insmHashChange('get');
                    hash[_plugin.settings.applicationName] = {
                        upid: player.upid
                    }
                    $.insmHashChange('updateHash', hash);
                }
            });

            // Create back button
            _plugin.htmlElements.fullscreen.controls.back.addClass('button').text('Back').click(function () {
                _plugin.htmlElements.fullscreen.player.view.insmPlayer('destroy');
                $.insmHashChange('updateHash', _plugin.settings.applicationName);
            });

            // Create edit button (for name at beginning)
            _plugin.htmlElements.fullscreen.controls.edit.addClass('button').text('Edit').click(function () {
                _plugin.htmlElements.fullscreen.controls.back.hide();
                _plugin.htmlElements.fullscreen.controls.edit.hide();

                _plugin.htmlElements.fullscreen.controls.cancel.fadeIn();
                _plugin.htmlElements.fullscreen.controls.save.fadeIn();

                _plugin.htmlElements.fullscreen.player.view.insmPlayer('edit');
            });

            // Create save button (for name at beginning)
            _plugin.htmlElements.fullscreen.controls.save.addClass('button').text('Save').click(function () {
                $this.insmSystemDetails('save', {
                    success: function () {
                        $this.insmSystemDetails('enableControls');
                        
                        _plugin.htmlElements.fullscreen.controls.save.hide().text('Save');
                        _plugin.htmlElements.fullscreen.controls.cancel.hide();

                        _plugin.htmlElements.fullscreen.controls.back.fadeIn();
                        _plugin.htmlElements.fullscreen.controls.edit.fadeIn();

                        _plugin.htmlElements.fullscreen.player.view.insmPlayer('view');
                        
                    },
                    fail: function () {
                        $this.insmSystemDetails('enableControls');
                        _plugin.htmlElements.fullscreen.controls.save.hide().text('Save');
                        _plugin.htmlElements.fullscreen.controls.cancel.hide();

                        _plugin.htmlElements.fullscreen.controls.back.fadeIn();
                        _plugin.htmlElements.fullscreen.controls.edit.fadeIn();
                    }
                });
            });

            // Create cancel button
            _plugin.htmlElements.fullscreen.controls.cancel.addClass('button').text('Cancel').click(function () {
                _plugin.htmlElements.fullscreen.controls.back.fadeIn();
                _plugin.htmlElements.fullscreen.controls.edit.fadeIn();

                _plugin.htmlElements.fullscreen.controls.cancel.hide();
                _plugin.htmlElements.fullscreen.controls.save.hide();

                _plugin.htmlElements.fullscreen.player.view.insmPlayer('reset').insmPlayer('view');
            });

            // Hash listener
            $.insmHashChange('register', {
                applicationName: _plugin.settings.applicationName,
                callback: function (hash) {
                    var systemDetails = hash[_plugin.settings.applicationName];
                    if (systemDetails) {
                        if (systemDetails.upid) {
                            $this.insmSystemDetails('showPlayer', {
                                upid: systemDetails.upid
                            });
                        }
                        else {
                            $this.insmSystemDetails('showTable');
                        }
                    }
                }
            });

            setTimeout(function () {
                $this.insmSystemDetails('resize');
            }, 1);

            return _plugin.settings.target;
        },
        disableControls: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            _plugin.htmlElements.fullscreen.controls.container.children().attr('disabled', 'disabled');

            return $this;
        },
        enableControls: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            _plugin.htmlElements.fullscreen.controls.container.children().removeAttr('disabled');

            return $this;
        },
        save: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            // Validate name of player
            var playerToSave = _plugin.htmlElements.fullscreen.player.view.insmPlayer('getValue');
            var playerValidate = _plugin.htmlElements.fullscreen.player.view.insmPlayer('validate');

            if (playerValidate && playerToSave) {
                $this.insmSystemDetails('disableControls');
                _plugin.htmlElements.fullscreen.controls.save.text('Saving...');

                var player = $.extend(_plugin.data.players[_plugin.data.selectedPlayer.upid], playerToSave);

                $.insmServicePlayer('save', {
                    player: player,
                    success: options.success,
                    invalid: function (message) {
                        // TODO: Platform should specify which parameters are wrong and why
                        $.insmNotification({
                            message: message,
                            type: 'warning'
                        });
                        options.fail();
                    }
                });
            }

            return $this;
        },
        resize: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            if (_plugin) {
                var target = _plugin.settings.target.insmUtilities('size');
                var header = _plugin.htmlElements.header.insmUtilities('size', { actualSize: true });
                
                var tableMargin = parseInt(_plugin.htmlElements.fullscreen.table.insmUtilities('size', { actualSize: true }).height - _plugin.htmlElements.fullscreen.table.insmUtilities('size').height);
                _plugin.htmlElements.fullscreen.table.css({
                    height: parseInt(target.height - header.height - tableMargin) + 'px'
                });

            }

            return $this;
        },
        showTable: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            _plugin.htmlElements.fullscreen.player.view.hide();
            _plugin.htmlElements.fullscreen.controls.container.hide();

            _plugin.htmlElements.fullscreen.table.fadeIn();

            $this.insmSystemDetails('setSubscriptions', {
                view: 'table'
            });

            return $this;
        },
        showPlayer: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            _plugin.htmlElements.fullscreen.table.hide();

            _plugin.htmlElements.fullscreen.controls.back.show();
            _plugin.htmlElements.fullscreen.controls.edit.show();
            _plugin.htmlElements.fullscreen.controls.cancel.hide();
            _plugin.htmlElements.fullscreen.controls.save.hide();

            _plugin.htmlElements.fullscreen.controls.container.fadeIn();

            _plugin.data.selectedPlayer = {
                upid: options.upid
            };

            _plugin.htmlElements.fullscreen.player.view.insmPlayer('destroy').insmPlayer({
                player: _plugin.data.players[_plugin.data.selectedPlayer.upid]
            }).insmPlayer('view').fadeIn();

            $this.insmSystemDetails('setSubscriptions', {
                view: 'player'
            });
                   
            return $this;
        },
        setSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            switch (options.view.toLowerCase()) {
                case 'table':
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
                                        updatedPlayers[player.id] = player;
                                    }
                                    else {
                                        $.each(player, function (property, value) {
                                            if (!_.isEqual(_plugin.data.players[player.id][property], player[property])) {
                                                _plugin.data.players[player.id] = player;
                                                updatedPlayers[player.id] = player;
                                                return false;
                                            }
                                        });
                                    }
                                });

                                _plugin.htmlElements.fullscreen.table.insmTable('update', {
                                    items: updatedPlayers
                                });
                            },
                            reset: function () {
                                _plugin.data.players = {};
                            },
                            remove: function () {
                                
                            }
                        });
                    };

                    $this.insmSystemDetails('stopSubscriptions');
                    $this.insmSystemDetails('startSubscriptions');

                    _plugin.subscriptions.stop = function () {
                        $.insmService('unregister', {
                            subscriber: _plugin.settings.applicationName,
                            type: 'player'
                        });
                    };

                    break;
                case 'player':
                    _plugin.subscriptions.start = function () {
                        $.insmService('register', {
                            subscriber: _plugin.settings.applicationName,
                            type: 'player',
                            upid: _plugin.data.selectedPlayer.upid,
                            update: function (player) {
                                if ($.isEmptyObject(_plugin.data.players)) {
                                    _plugin.data.players = {};
                                    _plugin.data.players[player.id] = player;
                                }
                                else {
                                    $.extend(_plugin.data.players[player.id], player);
                                }

                                _plugin.htmlElements.fullscreen.player.view.insmPlayer('update', {
                                    player: _plugin.data.players[_plugin.data.selectedPlayer.upid]
                                });
                                var items = {};
                                items[_plugin.data.selectedPlayer.upid] = _plugin.data.players[_plugin.data.selectedPlayer.upid];
                                _plugin.htmlElements.fullscreen.table.insmTable('update', {
                                    items: items
                                });
                            }
                        });
                    };

                    $this.insmSystemDetails('stopSubscriptions');
                    $this.insmSystemDetails('startSubscriptions');

                    _plugin.subscriptions.stop = function () {
                        $.insmService('unregister', {
                            subscriber: _plugin.settings.applicationName,
                            type: 'player',
                            upid: _plugin.data.selectedPlayer.upid
                        });
                    };

                    break;
                default:
                    break;
            }

            return $this;
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            _plugin.subscriptions.stop();

            return $this;
        },
        hasSettings: function () {
            return false;
        },
        onClose: function (options) {
            options.success();
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSystemDetails');

            $this.insmSystemDetails('stopSubscriptions');
            $this.data('insmSystemDetails', null).empty();

            return $this;
        }
    };

    $.fn.insmSystemDetails = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmSystemDetails');
        }
    };

    //$.insmSystemDetails = function (method) {
    //    return $('html').insmSystemDetails(arguments);
    //};
})(jQuery);