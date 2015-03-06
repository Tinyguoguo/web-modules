/*
* INSM Hash Change
* This file contain the INSM Hash Change plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmHashChange(settings);
*
* File dependencies:
* jQuery 1.6.1
* Fancybox 1.3.4
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmHashChange');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    callbacks: {},
                    applicationName: options.applicationName
                };
                $this.data('insmHashChange', _plugin);

                if (_plugin.applicationName === '' || typeof _plugin.applicationName !== 'string' ) {
                    throw new Error('Application name not provided.');
                }

                window.onhashchange = function () {
                    $.each(_plugin.callbacks, function (application, callback) {
                        _plugin.callbacks[application](($.insmHashChange('get')));
                    });
                };
            }            

            return $this;
        },
        unregister: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmHashChange');

            delete _plugin.callbacks[options.applicationName];

            return $this;
        },
        register: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmHashChange');

            _plugin.callbacks[options.applicationName] = options.callback;
            options.callback($.insmHashChange('get'));

            return $this;
        },
        updateHash: function(newHash) {
            if (typeof newHash === 'object') {
                var hashString = '#';
                var modules = [];

                $.each(newHash, function (moduleName, moduleParams) {
                    modules.push({
                        name: moduleName,
                        params: moduleParams
                    });
                });

                modules.sort(function (a, b) {
                   return parseInt(parseInt(a.params.index) - parseInt(b.params.index));
                });

                $.each(modules, function (index, module) {
                    delete module.params.index;

                    if (hashString !== '#') {
                        hashString += '&';
                    }
                    hashString += module.name;
                    if (module.params) {
                        hashString += '=';
                        $.each(module.params, function (name, value) {
                            hashString += name + ':' + value + ';';
                        });
                        hashString.substring(0, hashString.length - 1);
                    }
                });

                window.location.hash = hashString;
            }
            else if (typeof newHash === 'string') {
                window.location.hash = newHash;
            }
            else {
                throw new Error('Invalid hash type');
            }
        },
        get: function () {
            var result = {};
            var hash = urlDecode(window.location.hash.substring(1));

            if (hash.length > 0) {

                var modules = hash.split('&');

                var i = 0;
                $.each(modules, function (index, module) {
                    module = module.split('=');
                    result[module[0]] = {};

                    if (typeof module[1] !== 'undefined') {
                        $.each(module[1].split(';'), function (index, param) {
                            if (param.length > 0) {
                                param = param.split(':');
                                result[module[0]][param[0]] = param[1];
                            }
                        });
                    }
                    result[module[0]].index = i++;
                });
            }

            return result;
        }
    };

    $.insmHashChange = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmHashChange');
        }
    };
})(jQuery);
