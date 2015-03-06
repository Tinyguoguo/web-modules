/*
* INSM Service Asset
* This file contain the INSM Service Asset function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmServiceAsset(settings);
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
            var _plugin = $this.data('insmServiceAsset');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        updateInterval: 60000,
                        local: true
                    }, options),
                    objects: {
                        localAssets: {},
                        assets: {}
                    },
                    subscribers: {
                        regionAssets: {},
                        localRegionAssets: {},
                        assets: {}
                    },
                    timeout: {
                        update: null,
                        registration: null
                    }
                };
                $this.data('insmServiceAsset', _plugin);
            }

            return $this;
        },
        register: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceAsset');

            if (options.assetId) {
                if (!_plugin.subscribers.assets[options.assetId]) {
                    _plugin.subscribers.assets[options.assetId] = {};
                }

                // Register to a certain asset
                if (!_plugin.subscribers.assets[options.assetId][options.subscriber]) {
                    _plugin.subscribers.assets[options.assetId][options.subscriber] = {
                        update: options.update,
                        remove: options.remove,
                        invalid: options.invalid
                    }

                    // Send what we got so far
                    if (typeof _plugin.objects.assets[options.assetId] !== 'undefined') {
                        options.update($.extend(true, {}, _plugin.objects.assets[options.assetId]));
                    }
                }
                else {
                    throw new Error('Subscriber "' + options.subscriber + '" already registered to asset with id "' + options.assetId + '"');
                }
            }
            else if (options.regionId) {
                if (!options.local) {
                    if (!_plugin.subscribers.regionAssets[options.regionId]) {
                        _plugin.subscribers.regionAssets[options.regionId] = {};
                    }

                    // Register to the region asset list
                    if (!_plugin.subscribers.regionAssets[options.regionId][options.subscriber]) {
                        _plugin.subscribers.regionAssets[options.regionId][options.subscriber] = {
                            update: options.update,
                            remove: options.remove,
                            invalid: options.invalid
                        }

                        // Send what we got so far
                        if (!$.isEmptyObject(_plugin.objects.assets)) {
                            options.update($.extend(true, {}, _plugin.objects.assets));
                        }
                    }
                    else {
                        throw new Error('Subscriber "' + options.subscriber + '" already registered to asset list on region "' + options.regionId + '"');
                    }
                }
                else {
                    if (!_plugin.subscribers.localRegionAssets[options.regionId]) {
                        _plugin.subscribers.localRegionAssets[options.regionId] = {};
                    }

                    // Register to the region asset list
                    if (!_plugin.subscribers.localRegionAssets[options.regionId][options.subscriber]) {
                        _plugin.subscribers.localRegionAssets[options.regionId][options.subscriber] = {
                            update: options.update,
                            remove: options.remove,
                            invalid: options.invalid
                        }

                        // Send what we got so far
                        if (!$.isEmptyObject(_plugin.objects.localAssets)) {
                            options.update($.extend(true, {}, _plugin.objects.localAssets));
                        }
                    }
                    else {
                        throw new Error('Subscriber "' + options.subscriber + '" already registered to asset list on region "' + options.regionId + '"');
                    }
                }
            }
            else {
                // Should use the root region id or throw error? Throw for now
                throw new Error('Asset or region ID has to be provided');
            }

            // Run with a delay if multiple registrations are made at the same time.
            clearTimeout(_plugin.timeout.registration);
            _plugin.timeout.registration = setTimeout(function () {
                $this.insmServiceAsset('update');
            }, 100);

            return $this;
        },
        unregister: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceAsset');

            if (options.assetId) {
                if (_plugin.subscribers.assets[options.assetId]) {
                    // Unregister to a certain asset
                    if (_plugin.subscribers.assets[options.assetId][options.subscriber]) {

                        delete _plugin.subscribers.assets[options.assetId][options.subscriber];

                        if ($.isEmptyObject(_plugin.subscribers.assets[options.assetId])) {
                            delete _plugin.subscribers.assets[options.assetId];
                        }
                    }
                    else {
                        // The subscriber isn't registered. Should we throw error or let it be?
                        //throw new Error('Subscriber "' + options.subscriber + '" is not registered to asset with upid "' + options.assetId + '"');
                    }
                }
                else {

                    //throw new Error('There are no subscribers registered to asset with upid "' + options.assetId + '"');
                }
            }
            else if (options.regionId) {
                if (!options.local) {
                    // Unregister to the region asset list
                    if (_plugin.subscribers.regionAssets[options.regionId]) {
                        if (_plugin.subscribers.regionAssets[options.regionId][options.subscriber]) {
                            delete _plugin.subscribers.regionAssets[options.regionId][options.subscriber];

                            if ($.isEmptyObject(_plugin.subscribers.regionAssets[options.regionId])) {
                                delete _plugin.subscribers.regionAssets[options.regionId];
                            }
                        }
                        else {
                            // The subscriber isn't registered. Should we throw error or let it be?
                            //throw new Error('Subscriber "' + options.subscriber + '" is not registered to asset list');
                        }
                    }
                    else {
                        // The subscriber isn't registered. Should we throw error or let it be?
                        //throw new Error('Subscriber "' + options.subscriber + '" is not registered to asset list');
                    }
                }
                else {
                    // Unregister to the region asset list
                    if (_plugin.subscribers.localRegionAssets[options.regionId]) {
                        if (_plugin.subscribers.localRegionAssets[options.regionId][options.subscriber]) {
                            delete _plugin.subscribers.localRegionAssets[options.regionId][options.subscriber];

                            if ($.isEmptyObject(_plugin.subscribers.localRegionAssets[options.regionId])) {
                                delete _plugin.subscribers.localRegionAssets[options.regionId];
                            }
                        }
                        else {
                            // The subscriber isn't registered. Should we throw error or let it be?
                            //throw new Error('Subscriber "' + options.subscriber + '" is not registered to asset list');
                        }
                    }
                    else {
                        // The subscriber isn't registered. Should we throw error or let it be?
                        //throw new Error('Subscriber "' + options.subscriber + '" is not registered to asset list');
                    }
                }
            }
            else {
                // Should use the root region id or throw error? Throw for now
                throw new Error('Asset or region ID has to be provided');
            }

            return $this;
        },
        update: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceAsset');

            var deferredList = [];

            // Asset subscribers
            $.each(_plugin.subscribers.assets, function (assetId, subscribers) {
                deferredList.push($.insmFramework('getAsset', {
                    assetId: assetId,
                    invalid: function() {
                        $.each(subscribers, function (index, subscriber) {
                            if (typeof subscriber.invalid === 'function') {
                                subscriber.invalid();
                            }
                        });
                    },
                    success: function (asset) {
                        if (_plugin.objects.assets[asset.id]) {
                            // It has been updated so we need to push the info to the subscribers
                            if (!_.isEqual(_plugin.objects.assets[asset.id], asset)) {
                                _plugin.objects.assets[asset.id] = asset;
                                $.each(subscribers, function (index, subscriber) {
                                    subscriber.update($.extend(true, {}, asset));
                                });
                            }
                        }
                            // New asset
                        else {
                            _plugin.objects.assets[asset.id] = asset;
                            $.each(subscribers, function (index, subscriber) {
                                subscriber.update($.extend(true, {}, asset));
                            });
                        }
                    }
                }));
            });

            // Region subscribers
            $.each(_plugin.subscribers.regionAssets, function (regionId, subscribers) {
                deferredList.push($.insmFramework('getAssets', {
                    regionId: regionId,
                    local: false,
                    success: function (assets) {
                        var assetsToBeUpdated = [];
                        var deletedAssets = [];
                        $.each(_plugin.objects.assets, function (assetId, asset) {
                            deletedAssets.push(assetId);
                        });

                        $.each(assets, function (index, asset) {
                            // Already exists
                            if (_plugin.objects.assets[asset.id]) {
                                // It has been updated so we need to push the info to the subscribers
                                if (!_.isEqual(_plugin.objects.assets[asset.id], asset)) {
                                    _plugin.objects.assets[asset.id] = $.extend(true, {}, asset);
                                    assetsToBeUpdated.push(asset);
                                }

                                deletedAssets = $.grep(deletedAssets, function (value) {
                                    return value != asset.id;
                                });
                            }
                                // New asset
                            else {
                                _plugin.objects.assets[asset.id] = $.extend(true, {}, asset);
                                assetsToBeUpdated.push(asset);
                            }
                        });

                        if(deletedAssets.length > 0) {
                            for (var i = 0; i < deletedAssets.length; i++) {
                                delete _plugin.objects.assets[deletedAssets[i]];
                                $.each(subscribers, function (index, subscriber) {
                                    subscriber.remove(deletedAssets[i]);
                                });
                            }
                        }

                        $.each(subscribers, function (index, subscriber) {
                            var newList = [];
                            $.each(assetsToBeUpdated, function (index, newAsset) {
                                newList.push($.extend(true, {}, newAsset));
                            });
                            subscriber.update(newList);
                        });
                    }
                }));
            });

            // Local region subscribers
            $.each(_plugin.subscribers.localRegionAssets, function (regionId, subscribers) {
                deferredList.push($.insmFramework('getAssets', {
                    regionId: regionId,
                    local: true,
                    success: function (assets) {
                        var assetsToBeUpdated = [];
                        var deletedAssets = [];
                        $.each(_plugin.objects.localAssets, function (assetId, asset) {
                            deletedAssets.push(assetId);
                        });

                        $.each(assets, function (index, asset) {
                            // Already exists
                            if (_plugin.objects.localAssets[asset.id]) {
                                // It has been updated so we need to push the info to the subscribers
                                if (!_.isEqual(_plugin.objects.localAssets[asset.id], asset)) {
                                    _plugin.objects.localAssets[asset.id] = $.extend(true, {}, asset);
                                    assetsToBeUpdated.push(asset);
                                }

                                deletedAssets = $.grep(deletedAssets, function (value) {
                                    return value != asset.id;
                                });
                            }
                                // New asset
                            else {
                                _plugin.objects.localAssets[asset.id] = $.extend(true, {}, asset);
                                assetsToBeUpdated.push(asset);
                            }
                        });

                        if (deletedAssets.length > 0) {
                            for (var i = 0; i < deletedAssets.length; i++) {
                                delete _plugin.objects.localAssets[deletedAssets[i]];
                                $.each(subscribers, function (index, subscriber) {
                                    subscriber.remove(deletedAssets[i]);
                                });
                            }
                        }

                        $.each(subscribers, function (index, subscriber) {
                            var newList = [];
                            $.each(assetsToBeUpdated, function (index, newAsset) {
                                newList.push($.extend(true, {}, newAsset));
                            });
                            subscriber.update(newList);
                        });
                    }
                }));
            });


            $.when.apply(null, deferredList).done(function () {
                // Need to clear the timeout, otherwise this will be fired twice (not sure why)
                clearTimeout(_plugin.timeout.update);
                _plugin.timeout.update = setTimeout(function () {
                    if (!$.isEmptyObject(_plugin.subscribers.regionAssets) || !$.isEmptyObject(_plugin.subscribers.localRegionAssets)  || !$.isEmptyObject(_plugin.subscribers.assets)) {
                        $this.insmServiceAsset('update');
                    }
                }, _plugin.settings.updateInterval);
            });

            return $this;
        },
        save: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceAsset');

            var asset = $.extend(true, {}, options.asset);

            $.insmFramework('saveAsset', {
                asset: asset,
                regionId: options.regionId,
                success: function () {
                    options.success();
                    clearTimeout(_plugin.timeout.update);
                    $this.insmServiceAsset('update');
                }
            });

            return $this;
        },
        'delete': function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceAsset');

            $.insmFramework('deleteDataset', {
                id: options.asset.id,
                success: function () {
                    options.success();

                    clearTimeout(_plugin.timeout.update);
                    $this.insmServiceAsset('update');
                }
            });

            return $this;
        },
        destroy: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmServiceAsset');

            if (_plugin) {
                $this.data('insmServiceAsset', null);
            }

            return $this;
        }
    };

    $.insmServiceAsset = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmServiceAsset');
        }
        return null;
    };

    $.fn.insmServiceAsset = function (method) {
        return $.insmServiceAsset.apply(this, arguments);
    };
})(jQuery);

