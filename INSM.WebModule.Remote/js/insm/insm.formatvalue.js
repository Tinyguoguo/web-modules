/*
* INSM Asset
* This file contain the INSM Format Value function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmFormatValue(settings);
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
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFormatValue');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        Type: '',
                        Multi: false,
                        DefaultValue: '',
                        Values: [],
                        Value: null,
                        tag: ''
                    }, options)
                };
                $this.data('insmFormatValue', _plugin);
            }
            
            switch (_plugin.settings.Type.toLowerCase()) {
                case 'text':
                case 'string':
                case 'float':
                case 'select':
                case 'numeric':
                    $this.insmInputString(options);
                    break;
                case 'bool':
                case 'boolean':
                    $this.insmInputBoolean(options);
                    break;
            }

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFormatValue');

            switch (_plugin.settings.Type.toLowerCase()) {
                case 'text':
                case 'string':
                case 'float':
                case 'select':
                case 'numeric':
                    $this.insmInputString('view');
                    if (_plugin.settings.Value) {
                        $this.html(_plugin.settings.Value);
                    }
                    else if (_plugin.settings.DefaultValue) {
                        $this.html(_plugin.settings.DefaultValue);
                    }
                    break;
                case 'bool':
                case 'boolean':
                    $this.insmInputBoolean('view');
                    if (_plugin.settings.Value !== null) {
                        if (_plugin.settings.Value) {
                            $this.html(
                                $('<input tag="' + _plugin.settings.tag + '" type="checkbox" checked disabled/>')
                            );
                        }
                        else {
                            $this.html(
                                $('<input tag="' + _plugin.settings.tag + '" type="checkbox" disabled/>')
                            );
                        }
                    }
                    else {
                        if (_plugin.settings.DefaultValue) {
                            $this.html(
                                $('<input tag="' + _plugin.settings.tag + '" type="checkbox" checked disabled/>')
                            );
                        }
                        else {
                            $this.html(
                                $('<input tag="' + _plugin.settings.tag + '" type="checkbox" disabled/>')
                            );
                        }
                    }
                    break;
                default:
                    $.insmNotification({
                        type: 'error',
                        text: 'Type "' + _plugin.settings.Type + '" not implemented for get in INSM Format Value'
                    });
                    break;
            }
            return $this;
        },
        edit: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFormatValue');
            switch (_plugin.settings.Type.toLowerCase()) {
                case 'text':
                case 'float':
                case 'numeric':
                    if (_plugin.settings.Value) {
                        $this.html(
                            $('<input tag="' + _plugin.settings.tag + '" type="text" />').val(_plugin.settings.Value)
                        );
                    }
                    else if (_plugin.settings.DefaultValue) {
                        $this.html(
                            $('<input tag="' + _plugin.settings.tag + '" type="text" />').val(_plugin.settings.DefaultValuevalue)
                        );
                    }
                    else {
                        $this.html(
                            $('<input tag="' + _plugin.settings.tag + '" type="text" />')
                        );
                    }
                    break;
                case 'select':
                    var dropdown = $('<select tag="' + _plugin.settings.tag + '" />');
                    $.each(_plugin.settings.Values, function (index, value) {
                        dropdown.append(
                            $('<option />').text(value)
                        );
                    });
                    if (_plugin.settings.Value) {
                        dropdown.val(_plugin.settings.Value);
                    }
                    else if (_plugin.settings.DefaultValue) {
                        dropdown.val(_plugin.settings.DefaultValue);
                    }
                    $this.html(dropdown);
                    break;
                case 'bool':
                case 'boolean':
                    if (_plugin.settings.Value !== null && _plugin.settings.Value) {
                        $this.html(
                            $('<input tag="' + _plugin.settings.tag + '" type="checkbox" checked />')
                        );
                    } else if (_plugin.settings.Value !== null && _plugin.settings.DefaultValue) {
                        $this.html(
                            $('<input tag="' + _plugin.settings.tag + '" type="checkbox" checked />')
                        );
                    }
                    else {
                        $this.html(
                            $('<input tag="' + _plugin.settings.tag + '" type="checkbox" />')
                        );
                    }
                    break;
                default:
                    $.insmNotification({
                        type: 'error',
                        text: 'Type "' + _plugin.settings.Type + '" not implemented for edit in INSM Format Value'
                    });
                    break;
            }
            return $this;
        },
        disable: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFormatValue');

            switch (_plugin.settings.Type.toLowerCase()) {
                case 'text':
                case 'float':
                case 'numeric':
                    if (_plugin.settings.Value) {
                        $this.html(
                            $('<input disabled="disabled" tag="' + _plugin.settings.tag + '" type="text" />').val(_plugin.settings.Value)
                        );
                    }
                    else if (_plugin.settings.DefaultValue) {
                        $this.html(
                            $('<input disabled="disabled" tag="' + _plugin.settings.tag + '" type="text" />').val(_plugin.settings.DefaultValuevalue)
                        );
                    }
                    else {
                        $this.html(
                            $('<input disabled="disabled" tag="' + _plugin.settings.tag + '" type="text" />')
                        );
                    }
                    break;
                case 'select':
                    var dropdown = $('<select disabled="disabled" tag="' + _plugin.settings.tag + '" />');
                    $.each(_plugin.settings.Values, function (index, value) {
                        dropdown.append(
                            $('<option />').text(value)
                        );
                    });
                    if (_plugin.settings.Value) {
                        dropdown.val(_plugin.settings.Value);
                    }
                    else if (_plugin.settings.DefaultValue) {
                        dropdown.val(_plugin.settings.DefaultValue);
                    }
                    $this.html(dropdown);
                    break;
                case 'bool':
                case 'boolean':
                    if (_plugin.settings.Value !== null && _plugin.settings.Value) {
                        $this.html(
                            $('<input disabled="disabled" tag="' + _plugin.settings.tag + '" type="checkbox" checked />')
                        );
                    } else if (_plugin.settings.Value !== null && _plugin.settings.DefaultValue) {
                        $this.html(
                            $('<input disabled="disabled" tag="' + _plugin.settings.tag + '" type="checkbox" checked />')
                        );
                    }
                    else {
                        $this.html(
                            $('<input disabled="disabled" tag="' + _plugin.settings.tag + '" type="checkbox" />')
                        );
                    }
                    break;
                default:
                    $.insmNotification({
                        type: 'error',
                        text: 'Type "' + _plugin.settings.Type + '" not implemented for edit in INSM Format Value'
                    });
                    break;
            }
            return $this;
        }
    };

    $.fn.insmFormatValue = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmFormatValue');
        }
    };
})(jQuery);