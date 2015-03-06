/*
* INSM Asset
* This file contain the INSM Input Boolean function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputPlugin(settings);
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
            var _plugin = $this.data('insmInputPlugin');
            
            _plugin = {
                settings: $.extend({
                    type: "Plugin",
                    currentValue: {
                        fileId: 0,
                        data: null
                    },
                    required: true,
                    values: [],
                    onUpdate: function (currentValue) { },
                    pluginDefaultNameCallback: function (defaultName) { }
                }, options),
                htmlElements: {
                    dropdown: $('<div />')
                }
            };

            if (_plugin.settings.currentValue.data && _plugin.settings.currentValue.data.File) {
                delete _plugin.settings.currentValue.data.File;
            }

            if (_plugin.settings.currentValue.data && _plugin.settings.currentValue.data.Enabled) {
                delete _plugin.settings.currentValue.data.Enabled;
            }
            $this.data('insmInputPlugin', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlugin');

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlugin');
            
            if (typeof _plugin.settings.currentValue.data !== 'undefined' && _plugin.settings.currentValue.data !== null && typeof _plugin.settings.currentValue.data.Name !== 'undefined') {
                delete _plugin.settings.currentValue.data.Name;
            }

            var pluginData = $('<div/>');
            if (_plugin.settings.currentValue.fileId !== 0) {
                pluginData.insmInput('destroy').insmInput({
                    type: "Table",
                    initObject: _plugin.settings.currentValue.data,
                    currentValue: _plugin.settings.currentValue.data,
                    onUpdate: function (newValue) {
                        _plugin.settings.currentValue.data = newValue;
                        _plugin.settings.onUpdate($this.insmInputPlugin('getValue'));
                    }
                }).insmInput('edit');
            }

            _plugin.htmlElements.dropdown.insmInput({
                type: 'Dropdown',
                values: _plugin.settings.values,
                currentValue: _plugin.settings.currentValue.fileId,
                onUpdate: function (fileId) {
                    if (!fileId) {
                        _plugin.settings.currentValue = {
                            fileId: 0,
                            data: null
                        };
                        _plugin.settings.onUpdate($this.insmInputPlugin('getValue'));
                        _plugin.settings.pluginDefaultNameCallback(_plugin.settings.currentValue, '');
                        pluginData.hide();
                        return false;
                    }

                    $.insmFramework('getPluginData', {
                        id: fileId,
                        success: function (dataset) {
                            var initObject = {};
                            var defaultValue = {};
                            
                            var defaultName = dataset.Manifest.Items.DisplayName.Value;

                            // Fix for change in platform API
                            if (dataset.Content) {
                                dataset = dataset.Content;
                            }

                            $.each(dataset.Items, function (key, item) {
                                initObject[key] = {
                                    type: item.Type
                                };

                                defaultValue[key] = item.Value;
                            });

                            _plugin.settings.currentValue.fileId = fileId;
                            _plugin.settings.currentValue.data = defaultValue;
                            _plugin.settings.onUpdate($this.insmInputPlugin('getValue'));
                            
                            pluginData.insmInput('destroy').insmInput({
                                type: "Table",
                                initObject: initObject,
                                currentValue: [defaultValue],
                                onUpdate: function (newValue) {
                                    _plugin.settings.currentValue.data = newValue;
                                    _plugin.settings.onUpdate($this.insmInputPlugin('getValue'));
                                }
                            }).insmInput('edit');
                            pluginData.show();

                            _plugin.settings.onUpdate(_plugin.settings.currentValue);
                            _plugin.settings.pluginDefaultNameCallback(_plugin.settings.currentValue, defaultName);
                        },
                        error: function (message) {
                            $.insmNotification({
                                type: 'error',
                                text: 'Plugin is invalid. Please try with a different plugin.'
                            });
                            _plugin.settings.currentValue = {
                                fileId: 0,
                                data: null
                            };
                            _plugin.settings.onUpdate($this.insmInputPlugin('getValue'));
                            _plugin.settings.pluginDefaultNameCallback(_plugin.settings.currentValue, '');
                            pluginData.hide();
                        },
                        denied: function (data) {
                            $.insmFramework('login', {
                                success: function () {
                                    
                                }
                            });
                        }
                    });
                }
            }).insmInput('edit');

            $this.append(_plugin.htmlElements.dropdown).append(pluginData);

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlugin');
            return _plugin.settings.currentValue;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputPlugin');

            if (_plugin.settings.required === true && $this.insmInputPlugin("getValue").fileId == 0) {
                $this.css({
                    border: '1px solid red'
                });
                return false;
            } else {
                return true;
            }
        },
        destroy: function () {

        }
    };

    $.fn.insmInputPlugin = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputPlugin');
        }
    };
})(jQuery);