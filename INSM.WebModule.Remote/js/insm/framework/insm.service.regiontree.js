/*
* INSM Service Regiontree
* This file contain the INSM Service Regiontree function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmServiceRegionTree(settings);
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
            var _plugin = $this.data('insmServiceRegionTree');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        updateInterval: 60000,
                        includePlayers: false
                    }, options),
                    objects: {

                    },
                    subscribers: {
                        regionTree: {},
                        regions: {}
                    },
                    timeout: {
                        update: null,
                        registration: null
                    }
                };
                $this.data('insmServiceRegionTree', _plugin);
            }

            return $this;
        },
        register: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceRegionTree');

            if (options.id) {
                // TODO
                // Register on a single region
            }   
            else {
                // Register to the region tree
                if (!_plugin.subscribers.regionTree[options.regionId]) {
                    _plugin.subscribers.regionTree[options.regionId] = {};
                }
                if (!_plugin.subscribers.regionTree[options.regionId][options.subscriber]) {
                    _plugin.subscribers.regionTree[options.regionId][options.subscriber] = {
                        update: options.update,
                        remove: options.remove,
                        settings: {
                            includePlayers: options.includePlayers
                        }
                    }
                    if (options.includePlayers) {
                        _plugin.subscribers.regionTree[options.regionId][options.subscriber].settings.includePlayers = true;
                    }
                }
                else {
                    throw new Error('Subscriber "' + options.subscriber + '" already registered to region tree');
                }
            }

            // Run with a delay if multiple registrations are made at the same time.
            clearTimeout(_plugin.timeout.registration);
            _plugin.timeout.registration = setTimeout(function () {
                $this.insmServiceRegionTree('update');
            }, 100);

            return $this;
        },
        unregister: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceRegionTree');
            
            if (options.id) {
                // TODO
                // Unregister from single region
            }
            else {
                // Unregister to the region tree
                if (_plugin.subscribers.regionTree[options.regionId]) {
                    if (_plugin.subscribers.regionTree[options.regionId][options.subscriber]) {
                        delete _plugin.subscribers.regionTree[options.regionId][options.subscriber];

                        if ($.isEmptyObject(_plugin.subscribers.regionTree[options.regionId])) {
                            delete _plugin.subscribers.regionTree[options.regionId];
                        }
                    }
                }
            }

            return $this;
        },
        update: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceRegionTree');

            var successDeferred = new $.Deferred();
            var deferredList = [successDeferred];

            // Check if we have any subscribers. If we have we can start polling. If not we shouldn't. 
            // Make sure that you can subscribe, unsubscribe and then subscribe again without any trouble.

            if (!$.isEmptyObject(_plugin.subscribers.regionTree)) {
                var regionsToDownload = [];
                $.each(_plugin.subscribers.regionTree, function (regionId, subscribers) {
                    $.each(subscribers, function (index, subscriber) {
                        if (subscriber.settings.includePlayers) {
                            regionsToDownload.push({
                                subscriber: subscriber,
                                includePlayers: true
                            });
                        }
                        else {
                            regionsToDownload.push({
                                subscriber: subscriber,
                                includePlayers: false
                            });
                        }
                    });
                });
                // If subscribers for player list exist we should use getPlayers (find below)
                $.each(regionsToDownload, function(index, settings) {
                    deferredList.push($.insmFramework('regionTree', {
                        includePlayers: settings.includePlayers,
                        success: function (regionTree) {
                            settings.subscriber.update(regionTree);
                            successDeferred.resolve();
                            return;
                        }
                    }));
                });
            }


            if (!$.isEmptyObject(_plugin.subscribers.regions)) {
                // TODO: Fetch a single region
            }


            $.when.apply(null, deferredList).done(function () {
                // Need to clear the timeout, otherwise this will be fired twice (not sure why)
                clearTimeout(_plugin.timeout.update);
                _plugin.timeout.update = setTimeout(function () {
                    if (!$.isEmptyObject(_plugin.subscribers.regionTree) || !$.isEmptyObject(_plugin.subscribers.regions)) {
                        $this.insmServiceRegionTree('update');
                    }
                }, _plugin.settings.updateInterval);
            });
            

            return $this;
        },
        hasUpdate: function(options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceRegionTree');

            var hasUpdate = false;

            $.each(options.player, function (parameter, value) {
                if (typeof _plugin.objects[options.player.upid][parameter] === 'undefined') {
                    _plugin.objects[options.player.upid][parameter] = value;
                    hasUpdate = true;
                }
                if (!_.isEqual(_plugin.objects[options.player.upid][parameter], value)) {
                    hasUpdate = true;
                }
            });

            return hasUpdate;
        },
        destroy: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceRegionTree');

            if (_plugin) {
                $this.data('insmServiceRegionTree', null);
            }

            return $this;
        }
    };

    $.insmServiceRegionTree = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmServiceRegionTree');
        }
        return null;
    };

    $.fn.insmServiceRegionTree = function (method) {
        return $.insmServiceRegionTree.apply(this, arguments);
    };
})(jQuery);

