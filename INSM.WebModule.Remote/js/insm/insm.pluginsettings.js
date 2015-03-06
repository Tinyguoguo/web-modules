/*
* INSM Asset
* This file contain the INSM Input Boolean function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmPluginSettings(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
*
* Authors:
* Tobias Rahm - Instoremedia AB
* Koji Wakayama - Creuna AB
*/

; (function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPluginSettings');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        settingsRegionId: 0,
                        pluginRegionId: 1,
                        pluginContentDirectoryName: 'Plugins',
                        applicationName: 'Plugin Settings',
                        ssl: false,
                        ams: '',
                        version: manifest.version,
                        onUpdate: function(currentValue) {},
                        onSave: function() {},
                        onCancel: function() {}
                    }, options),
                    htmlElements: {
                        controls: $('<div />').addClass('pluginControls'),
                        input: $('<div />').addClass('pluginInput'),
                        container: $('<div />')
                    },
                    data: {
                        plugins: [],
                        previousData: {},
                        pluginNames: {}
                    }
                };

                $this.data('insmPluginSettings', _plugin);
            }


            $this.empty().append(_plugin.htmlElements.container.insmLoader());
            
            if (!$.insmFramework('isInitialized')) {
                $.insmFramework({
                    ams: _plugin.settings.ams,
                    app: _plugin.settings.applicationName,
                    version: _plugin.settings.version,
                    protocol: (_plugin.settings.ssl ? 'https' : 'http'),
                    session: (urlDecode($(document).getUrlParam('session')) || '')
                });
            }

            $.when($.insmFramework('initialized')).done(function () {

                $this.insmPluginSettings('downloadPlugins', {
                    success: function (plugins) {
                        var deferredList = [];
                        $.each(plugins, function (index, plugin) {
                            // Get plugin data
                            var deferred = new $.Deferred;
                            deferredList.push(deferred);
                            $.insmFramework('getPluginData', {
                                id: plugin.id,
                                success: function (dataset) {
                                    var defaultName = dataset.Manifest.Items.PluginName.Value;
                                    _plugin.data.pluginNames[plugin.id] = defaultName;
                                    deferred.resolve();
                                },
                                error: function (message) {
                                    deferred.resolve();
                                },
                                denied: function (data) {
                                    
                                }
                            });
                        });
                        
                        $.when.apply($, deferredList).done(function () {
                            setTimeout(function () {
                                _plugin.htmlElements.container.insmLoader('destroy');
                                _plugin.htmlElements.container.append(
                                    _plugin.htmlElements.controls,
                                    _plugin.htmlElements.input
                                );
                                _plugin.data.plugins = plugins;

                                $this.insmPluginSettings('displayPluginControls');
                                $this.insmPluginSettings('displayPluginInput');
                            }, 500);
                        });
                    },
                    error: function (message) {
                        $.insmNotification({
                            type: 'error',
                            text: message
                        });
                    },
                    denied: function (data) {
                        $.insmFramework('login', {
                            success: function () {
                                $this.insmPluginSettings(options);
                            }
                        });
                    }
                });
            });

            return $this;
        },
        downloadPlugins: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPluginSettings');


            return $.insmFramework('getLocalFiles', {
                regionId: _plugin.settings.pluginRegionId,
                directoryName: _plugin.settings.pluginContentDirectoryName,
                success: function (files) {
                    var plugins = [];
                    $.each(files, function (index, file) {
                        if (file.mimeType == 'application/zip') {
                            plugins.push(file);
                        }
                    });
                    options.success(plugins);
                },
                error: function (message) {
                    options.error(message);
                },
                denied: function (data) {
                    options.denied(data);
                }
            });
        },
        displayPluginInput: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPluginSettings');

            $.insmFramework('getRegion', {
                regionId: _plugin.settings.settingsRegionId,
                success: function (data) {
                    var regionData;
                    if (data.Settings && data.Settings.Plugin) {
                        regionData = data.Settings.Plugin;
                    }
                    displayTable(regionData);
                },
                error: function (message) {
                    $.insmNotification({
                        type: 'error',
                        text: message
                    });
                },
                denied: function (data) {
                    $.insmFramework('login', {
                        success: function () {
                            $this.insmPluginSettings('displayPluginInput', options);
                        }
                    });
                }
            });

            function displayTable(regionData) {

                var currentValue = [];
                $.each(regionData, function (key, object) {
                    currentValue.push({
                        Name: key,
                        Enabled: object.Enabled,
                        File: { fileId: object.File, data: object }
                    });
                });

                var table = $('<div/>');
                var dataInfo = _plugin.data.plugins;
                var dropDownValues = {};
                var wrapper = $('<div/>');
                var pluginData = {};
                $.each(dataInfo, function (key, file) {
                    dropDownValues[file.id] = file.name;
                });
                
                _plugin.htmlElements.pluginInputData = $('<div />').insmInput({
                    type: 'Table',
                    multiSelect: true,
                    required: false,
                    initObject: {
                        Name: {
                            type: 'string',
                            disabled: true,
                            required: false,
                            currentValue: ''
                        },
                        Enabled: {
                            type: "Boolean",
                            currentValue: true
                        },
                        File: {
                            type: 'Plugin',
                            values: dropDownValues,
                            required: true
                        }
                    },
                    currentValue: currentValue
                }).insmInput('edit');


                //_plugin.data.previousData = _plugin.htmlElements.pluginInputData.insmInput('getValue');
                _plugin.data.previousData = regionData;
                _plugin.htmlElements.input.empty();
                _plugin.htmlElements.pluginInputData.appendTo(_plugin.htmlElements.input);
            }

            return $this;
        },
        displayPluginControls: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPluginSettings');

            _plugin.htmlElements.controls.empty();

            _plugin.htmlElements.controls.append($('<button />', {
                text: 'Save'
            }).click(function() {
                if (!_plugin.htmlElements.pluginInputData.insmInput('validate')) {
                    return false;
                }
                var data = _plugin.htmlElements.pluginInputData.insmInput('getValue');

                outData = {};

                $.each(_plugin.data.previousData, function (key, object) {
                    outData[key] = {};
                });
                
                $.each(data, function (index, object) {
                    var name = _plugin.data.pluginNames[object.File.fileId];
                    outData[name] = {
                        Enabled: object.Enabled,
                        File: object.File.fileId,
                        Name: name
                    }
                    if (object.File.data) {
                        $.each(object.File.data, function(key, value) {
                            outData[name][key] = value;
                        });
                    }
                });

                $.insmFramework('setRegion', {
                    regionId: _plugin.settings.settingsRegionId,
                    pluginSettings: JSON.stringify(outData),
                    success: function (data) {
                        _plugin.settings.onSave();
                    },
                    error: function (message) {
                        $.insmNotification({
                            type: 'error',
                            text: message
                        });
                    },
                    denied: function (data) {
                        $.insmFramework('login', {
                            success: function () {
                                $this.insmPluginSettings(options);
                            }
                        });
                    }
                });
            }));

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmPluginSettings', null);
            $this.empty();

            return $this;
        }
    };

    $.fn.insmPluginSettings = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPluginSettings');
        }
    };
})(jQuery);