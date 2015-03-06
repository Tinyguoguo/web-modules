/*
* INSM Service
* This file contain the INSM Service function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmServicePlayoutState(settings);
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
            var _plugin = $this.data('insmServicePlayoutState');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        updateInterval: 60000
                    }, options),
                    objects: {
                        player: {},
                    },
                    subscribers: {
                        playoutState: {}
                    },
                    timeout: {
                        update: null,
                        registration: null
                    }
                };
                $this.data('insmServicePlayoutState', _plugin);
            }
            return $this;
        },
        register: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServicePlayoutState');
            if (options.upid) {
                if (!_plugin.subscribers.playoutState[options.upid]) {
                    _plugin.subscribers.playoutState[options.upid] = {};
                }

                // Register to a certain player
                if (!_plugin.subscribers.playoutState[options.upid][options.subscriber]) {
                    _plugin.subscribers.playoutState[options.upid][options.subscriber] = {
                        update: options.update
                    }

                    // Send the player to the new subscriber
                    if (_plugin.objects.player[options.upid]) {
                        options.reset();
                        options.update(_plugin.objects.player[options.upid]);
                    }
                }
                else {
                    //throw new Error('Subscriber "' + options.subscriber + '" already registered to player with upid "' + options.upid + '"');
                }
            }   
            // Run with a delay if multiple registrations are made at the same time.
            clearTimeout(_plugin.timeout.registration);
            _plugin.timeout.registration = setTimeout(function () {
                $this.insmServicePlayoutState('update', {
                    subscriber: options.subscriber,
                    upid: options.upid           
                });
            }, 100);

            return $this;
        },
        unregister: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServicePlayoutState');
            
            if (options.upid) {
                if (_plugin.subscribers.playoutState[options.upid]) {
                    // Unregister to a certain player
                    if (_plugin.subscribers.playoutState[options.upid][options.subscriber]) {
                        delete _plugin.subscribers.playoutState[options.upid][options.subscriber];

                        if ($.isEmptyObject(_plugin.subscribers.playoutState[options.upid])) {
                            delete _plugin.subscribers.playoutState[options.upid];
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
            
            return $this;
        },
        save: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServicePlayoutState');

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
            var _plugin = $this.data('insmServicePlayoutState');

            var deferredList = new $.Deferred();
            // Check if we have any subscribers. If we have we can start polling. If not we shouldn't. 
            // Make sure that you can subscribe, unsubscribe and then subscribe again without any trouble.
            if (!$.isEmptyObject(_plugin.subscribers.playoutState)) {
                // If subscribers for players exist we should use getPlayer(upid) (find in insm.player.js)               
                _plugin.subscribers.playoutState[options.upid][options.subscriber].update();                                        
                deferredList.resolve();                         
            }

            $.when(deferredList).done(function () {
                // Need to clear the timeout, otherwise this will be fired twice (not sure why)
                clearTimeout(_plugin.timeout.update);
                _plugin.timeout.update = setTimeout(function () {
                    if (!$.isEmptyObject(_plugin.subscribers.playoutState)) {
                 
                        $this.insmServicePlayoutState('update', {
                            subscriber: options.subscriber,
                            upid: options.upid
                        });
                    }
                }, _plugin.settings.updateInterval);
            });
            return $this;
        },
        hasUpdate: function(options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServicePlayoutState');
            var hasUpdate = false;
            if (typeof _plugin.objects.player[options.upid] === 'undefined') {
                hasUpdate = true;
            }
            else {
                $.each(options.player, function (parameter, value) {
                    if (typeof _plugin.objects.player[options.upid][parameter] === 'undefined') {
                        hasUpdate = true;
                    }
                    if (!_.isEqual(_plugin.objects.player[options.upid][parameter], value)) {
                        hasUpdate = true;
                    }
                });
            }
            return hasUpdate;
        },
        destroy: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServicePlayoutState');

            if (_plugin) {
                $this.data('insmServicePlayoutState', null);
            }
            return $this;
        }
    };

    $.insmServicePlayoutState = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmServicePlayoutState');
        }
        return null;
    };

    $.fn.insmServicePlayoutState = function (method) {
        return $.insmServicePlayoutState.apply(this, arguments);
    };
})(jQuery);

