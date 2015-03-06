/*
* INSM Service
* This file contain the INSM Service function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmService(settings);
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
            var _plugin = $this.data('insmService');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        apiUrl: '',
                        applicationName: '',
                        version: '',
                        updateInterval: 6000
                    }, options),
                    data: {
                        initialized: new $.Deferred()
                    }
                };
                $this.data('insmService', _plugin);
            }

            // Init sub services
            $.insmServicePlayer({
                updateInterval: _plugin.settings.updateInterval
            });
            
            $.insmServiceAsset({
                updateInterval: _plugin.settings.updateInterval
            });
            $.insmServiceFile({
                updateInterval: _plugin.settings.updateInterval
            });
            $.insmServiceRegionTree({
                updateInterval: _plugin.settings.updateInterval
            });
            $.insmServiceUnconfiguredPlayers({
                updateInterval: _plugin.settings.updateInterval
            });
            $.insmServicePlayoutState({
                updateInterval: _plugin.settings.updateInterval
            });
            if (!$.insmFramework('isInitialized')) {
                $.insmFramework({
                    apiUrl: _plugin.settings.apiUrl,
                    applicationName: _plugin.settings.applicationName,
                    version: _plugin.settings.version,
                    session: (decodeURIComponent($(document).getUrlParam('session')) || '')
                });
            }

            $.when($.insmFramework('initialized')).done(function () {
                _plugin.data.initialized.resolve();
            });

            return $this;
        },
        initialized: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmService');
            if (!_plugin) {
                throw new Error('Instoremedia Service needs to be initialized before calling initialized method.');
            }
            return _plugin.data.initialized;
        },
        isInitialized: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmService');
            if (_plugin) {
                return true;
            }
            return false;
        },
        getService: function (options) {
            switch (options.type.toLowerCase()) {
                case 'player':
                    return $.insmServicePlayer;
                    break;
                case 'playoutstate':
                    return $.insmServicePlayoutState;
                    break;
                case 'asset':
                    return $.insmServiceAsset;
                    break;
                case 'file':
                    return $.insmServiceFile;
                    break;
                case 'regiontree':
                    return $.insmServiceRegionTree;
                    break;
                case 'unconfiguredplayers':
                    return $.insmServiceUnconfiguredPlayers;
                    break;
                default:
                    throw new Error('INSM Service does not support type ' + options.type);
            }
        },
        register: function (options) {
            if (!options.subscriber) {
                throw new Error('Register function needs a subscriber');
            }

            return $.insmService('getService', {
                type: options.type
            })('register', options);
        },
        unregister: function (options) {
            if (!options.subscriber) {
                throw new Error('Unregister function needs a subscriber');
            }

            return $.insmService('getService', {
                type: options.type
            })('unregister', options);
        },
        update: function (options) {
            return $.insmService('getService', {
                type: options.type
            })('update', options);
        },
        destroy: function (options) {
            $.insmServicePlayer('destroy');
            $.insmServicePlayoutState('destroy');
            $.insmServiceAsset('destroy');
            $.insmServiceFile('destroy');
            $.insmServiceRegionTree('destroy');
            $.insmServiceUnconfiguredPlayers('destroy');
            $.insmFramework('destroy');

            var $this = $('html').eq(0);
            $this.data('insmService', null);
        }
    };

    $.insmService = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmService');
        }
        return null;
    };

    $.fn.insmService = function (method) {
        return $.insmService.apply(this, arguments);
    };
})(jQuery);
