/*
* INSM Service
* This file contain the INSM Unconfigured Players function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmServiceUnconfiguredPlayers(settings);
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
            var _plugin = $this.data('insmServiceUnconfiguredPlayers');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        updateInterval: 60000
                    }, options),
                    objects: {
                        allPlayers: {}
                    },
                    subscribers: {
                        unconfiguredPlayers: {}
                    },
                    timeout: {
                        update: null,
                        registration: null
                    }
                };
                $this.data('insmServiceUnconfiguredPlayers', _plugin);
            }

            return $this;
        },
        register: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceUnconfiguredPlayers');
            
            
                // Register to the player list
            if (!_plugin.subscribers.unconfiguredPlayers[options.subscriber]) {
                _plugin.subscribers.unconfiguredPlayers[options.subscriber] = {
                    update: options.update
                }

                // Send what we got so far
                options.reset();
                if (!$.isEmptyObject(_plugin.objects.allPlayers)) {
                    options.update($.extend(true, {}, _plugin.objects.allPlayers));
                }
            }
            else {
                throw new Error('Subscriber "' + options.subscriber + '" already registered to unconfigured players');
            }

            // Run with a delay if multiple registrations are made at the same time.
            clearTimeout(_plugin.timeout.registration);
            _plugin.timeout.registration = setTimeout(function () {
                $this.insmServiceUnconfiguredPlayers('update');
            }, 100);

            return $this;
        },
        unregister: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceUnconfiguredPlayers');
            
            // Unregister to the unconfigured players list
            if (_plugin.subscribers.unconfiguredPlayers[options.subscriber]) {
                delete _plugin.subscribers.unconfiguredPlayers[options.subscriber];
            }

            return $this;
        },
        save: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceUnconfiguredPlayers');

            throw new Error('Not implemented');

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
            var _plugin = $this.data('insmServiceUnconfiguredPlayers');

            var deferred;

            // Check if we have any subscribers. If we have we can start polling. If not we shouldn't. 
            // Make sure that you can subscribe, unsubscribe and then subscribe again without any trouble.

            if (!$.isEmptyObject(_plugin.subscribers.unconfiguredPlayers)) {
                // If subscribers for player list exist we should use getPlayers (find below)
                deferred = $.insmFramework('getUnconfiguredPlayers', {
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
                        $.each(_plugin.subscribers.unconfiguredPlayers, function (subscriberKey, subscriber) {
                            var copy = [];
                            $.each(playersToBeUpdated, function (index, player) {
                                copy.push($.extend(true, {}, player));
                            });
                            subscriber.update(copy);
                        });                        
                    }
                });
            }

            
            deferred.done(function () {
                // Need to clear the timeout, otherwise this will be fired twice (not sure why)
                clearTimeout(_plugin.timeout.update);
                _plugin.timeout.update = setTimeout(function () {
                    if (!$.isEmptyObject(_plugin.subscribers.unconfiguredPlayers)) {
                        $this.insmServiceUnconfiguredPlayers('update');
                    }
                }, _plugin.settings.updateInterval);
            });
            

            return $this;
        },
        hasUpdate: function(options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceUnconfiguredPlayers');

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
            var _plugin = $this.data('insmServiceUnconfiguredPlayers');

            if (_plugin) {
                $this.data('insmServiceUnconfiguredPlayers', null);
            }

            return $this;
        }
    };

    $.insmServiceUnconfiguredPlayers = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmServiceUnconfiguredPlayers');
        }
        return null;
    };

    $.fn.insmServiceUnconfiguredPlayers = function (method) {
        return $.insmServiceUnconfiguredPlayers.apply(this, arguments);
    };
})(jQuery);

