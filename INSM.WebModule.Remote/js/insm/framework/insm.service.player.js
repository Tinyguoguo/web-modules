/*
* INSM Service
* This file contain the INSM Service function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmServicePlayer(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var _guid = 0;
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServicePlayer');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        updateInterval: 60000
                    }, options),
                    objects: {
                        singlePlayers: {},
                        allPlayers: {}
                    },
                    subscribers: {
                        playerList: {},
                        players: {}
                    },
                    timeout: {
                        update: null,
                        registration: null
                    }
                };
                $this.data('insmServicePlayer', _plugin);
            }

            return $this;
        },
        register: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServicePlayer');
            if (options.upid) {
                if (!_plugin.subscribers.players[options.upid]) {
                    _plugin.subscribers.players[options.upid] = {};
                }

                // Register to a certain player
                if (!_plugin.subscribers.players[options.upid][options.subscriber]) {
                    _plugin.subscribers.players[options.upid][options.subscriber] = {
                        update: options.update
                    }

                    // Send the player to the new subscriber
                    if (_plugin.objects.singlePlayers[options.upid]) {
                        options.reset();
                        options.update(_plugin.objects.singlePlayers[options.upid]);
                    }
                }
                else {
                    throw new Error('Subscriber "' + options.subscriber + '" already registered to player with upid "' + options.upid + '"');
                }
            }   
            else {
                // Register to the player list
                if (!_plugin.subscribers.playerList[options.subscriber]) {
                    _plugin.subscribers.playerList[options.subscriber] = {
                        update: options.update
                    }

                    // Send what we got so far
                    options.reset();
                    if (!$.isEmptyObject(_plugin.objects.allPlayers)) {
                        options.update($.extend(true, {}, _plugin.objects.allPlayers));
                    }
                }
                else {
                    throw new Error('Subscriber "' + options.subscriber + '" already registered to player list');
                }
            }

            // Run with a delay if multiple registrations are made at the same time.
            clearTimeout(_plugin.timeout.registration);
            _plugin.timeout.registration = setTimeout(function () {
                $this.insmServicePlayer('update');
            }, 100);

            return $this;
        },
        unregister: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServicePlayer');
            
            if (options.upid) {
                if (_plugin.subscribers.players[options.upid]) {
                    // Unregister to a certain player
                    if (_plugin.subscribers.players[options.upid][options.subscriber]) {
                        delete _plugin.subscribers.players[options.upid][options.subscriber];

                        if ($.isEmptyObject(_plugin.subscribers.players[options.upid])) {
                            delete _plugin.subscribers.players[options.upid];
                        }
                    }
                    else {
                        // The subscriber isn't registered. Should we throw error or let it be?
                        //throw new Error('Subscriber "' + options.subscriber + '" is not registered to player with upid "' + options.upid + '"');
                    }
                }
                else {
                    //throw new Error('There are no subscribers registered to player with upid "' + options.upid + '"');
                }
            }
            else {
                // Unregister to the player list
                if (_plugin.subscribers.playerList[options.subscriber]) {
                    delete _plugin.subscribers.playerList[options.subscriber];
                }
                else {
                    // The subscriber isn't registered. Should we throw error or let it be?
                    //throw new Error('Subscriber "' + options.subscriber + '" is not registered to player list');
                }
            }

            return $this;
        },
        save: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServicePlayer');

            if (typeof options.player.upid === 'undefined') {
                throw new Error('UPid missing on save');
            }

            var player = $.extend({}, options.player);

            $.insmFramework('savePlayer', {
                player: player,
                success: function () {
                    options.success();
                },
                invalid: options.invalid
            });

            return $this;
        },
        update: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServicePlayer');

            var deferredList = [];

            // Check if we have any subscribers. If we have we can start polling. If not we shouldn't. 
            // Make sure that you can subscribe, unsubscribe and then subscribe again without any trouble.

            if (!$.isEmptyObject(_plugin.subscribers.playerList)) {
                // If subscribers for player list exist we should use getPlayers (find below)
                deferredList.push($.insmFramework('getPlayers', {
                    success: function (players) {
                        // Each method which is registered to players should get an update of each players one by one.
                        // Compare with what we got in _plugin.models.players and update that list as well.

                        var playersToBeUpdated = [];
                        var playersToBeRemoved = [];

                        $.each(_plugin.objects.allPlayers, function (upid, player) {
                            playersToBeRemoved.push(player);
                        });

                        $.each(players, function (upid, player) {
                            if (playersToBeRemoved.indexOf(player) >= 0) {
                                // Do not delete this player
                                playersToBeRemoved.splice(playersToBeRemoved.indexOf(player), 1);
                            }
                            // Check if it should be updated
                            var hasUpdate = false;

                            if (typeof _plugin.objects.allPlayers[player.upid] === 'undefined') {
                                hasUpdate = true;
                            }
                            else {
                                $.each(player, function (parameter, value) {
                                    if (typeof _plugin.objects.allPlayers[player.upid][parameter] === 'undefined') {
                                        hasUpdate = true;
                                    }
                                    if (!_.isEqual(_plugin.objects.allPlayers[player.upid][parameter], value)) {
                                        hasUpdate = true;
                                    }
                                });
                            }
                            if (hasUpdate) {
                                _plugin.objects.allPlayers[player.upid] = player;
                                playersToBeUpdated.push(player);
                            }
                        });

                        // Send updated players to subscribers
                        $.each(_plugin.subscribers.playerList, function (subscriberKey, subscriber) {
                            var copy = [];
                            $.each(playersToBeUpdated, function (index, player) {
                                copy.push($.extend(true, {}, player));
                            });
                            subscriber.update(copy);

                            
                        });                        
                    }
                }));
            }

            if (!$.isEmptyObject(_plugin.subscribers.players)) {
                // If subscribers for players exist we should use getPlayer(upid) (find in insm.player.js)
                var playerUpids = [];
                $.each(_plugin.subscribers.players, function (upid, subscribers) {
                    playerUpids.push(upid);
                });                

                var index = 0;
                
                function fetchPlayer() {
                    if (playerUpids[index]) {
                        deferredList.push($.insmFramework('getPlayer', {
                            upid: playerUpids[index],
                            success: function (player) {
                                // Check if it should be updated
                                var hasUpdate = false;

                                if (typeof _plugin.objects.singlePlayers[player.upid] === 'undefined') {
                                    hasUpdate = true;
                                }
                                else {
                                    $.each(player, function (parameter, value) {
                                        if (typeof _plugin.objects.singlePlayers[player.upid][parameter] === 'undefined') {
                                            hasUpdate = true;
                                        }
                                        if (!_.isEqual(_plugin.objects.singlePlayers[player.upid][parameter], value)) {
                                            hasUpdate = true;
                                        }
                                    });
                                }
                                if (hasUpdate) {
                                    if (!_plugin.objects.singlePlayers[player.upid]) {
                                        _plugin.objects.singlePlayers[player.upid] = player;
                                    }
                                    else {
                                        $.extend(true, _plugin.objects.singlePlayers[player.upid], player);
                                    }

                                    if (player) {
                                        if (_plugin.subscribers.players[player.id]) {
                                            $.each(_plugin.subscribers.players[player.id], function (subscriberKey, subscriber) {
                                                subscriber.update(_plugin.objects.singlePlayers[player.id]);
                                            });
                                        }
                                    }
                                }
                                index++;
                                fetchPlayer();
                            }
                        }));
                    }
                    else {

                    }
                }

                fetchPlayer();
            }

            $.when.apply(null, deferredList).done(function () {
                // Need to clear the timeout, otherwise this will be fired twice (not sure why)
                clearTimeout(_plugin.timeout.update);
                _plugin.timeout.update = setTimeout(function () {
                    if (!$.isEmptyObject(_plugin.subscribers.playerList) || !$.isEmptyObject(_plugin.subscribers.players)) {
                        $this.insmServicePlayer('update');
                    }
                }, _plugin.settings.updateInterval);
            });
            

            return $this;
        },
        hasUpdate: function(options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServicePlayer');

            var hasUpdate = false;

            if (typeof _plugin.objects[options.player.upid] === 'undefined') {
                hasUpdate = true;
            }
            else {
                $.each(options.player, function (parameter, value) {
                    if (typeof _plugin.objects[options.player.upid][parameter] === 'undefined') {
                        hasUpdate = true;
                    }
                    if (!_.isEqual(_plugin.objects[options.player.upid][parameter], value)) {
                        hasUpdate = true;
                    }
                });
            }

            return hasUpdate;
        },
        destroy: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServicePlayer');

            if (_plugin) {
                $this.data('insmServicePlayer', null);
            }

            return $this;
        }
    };

    $.insmServicePlayer = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmServicePlayer');
        }
        return null;
    };

    $.fn.insmServicePlayer = function (method) {
        return $.insmServicePlayer.apply(this, arguments);
    };
})(jQuery);

