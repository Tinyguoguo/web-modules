/*
* INSM Input Tags
* This file contain the INSM Input Tags function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputTags(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
*
* Authors:
* Tobias Rahm - Instoremedia AB
*/

; (function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTags');
            _plugin = {
                settings: $.extend({
                    type: 'tags',
                    defaultValue: '',
                    required: false,
                    multiValue: false,
                    disabled: false,
                    value: '',
                    availableValues: null,
                    availableValuesRemaining: null,
                    defaultValue: '',
                    maxChars: null,
                    onChange: function() {

                    },
                    validateFunction: function (value) {
                        if (value.length == 0)
                            return false;
                        else
                            return true;
                    }
                }, options),
                data: {
                    type: null,
                    previousValue: null
                },
                htmlElements: {
                    input: null,
                    dropdown: null
                }
            };


            if (!$.isArray(_plugin.settings.value)) {
                _plugin.settings.value = [];
            }

            $this.data('insmInputTags', _plugin);

            $this.addClass('insm-input-tags');

            _plugin.settings.availableValuesRemaining = _plugin.settings.availableValues;

            return $this;
        },
        view: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTags');
            
            _plugin.data.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTags');

            $this.empty();
            
            $.each(_plugin.settings.value, function (index, tag) {
                var element = {
                    container: $('<div />'),
                    input: $('<div />').insmInput({
                        type: 'string',
                        value: tag,
                        availableValues: _plugin.settings.availableValuesRemaining,
                        onChange: function (value, oldValue) {
                            if (oldValue && oldValue != 'Select') {
                                _plugin.settings.availableValuesRemaining.push(oldValue);
                            }
                            _plugin.settings.availableValuesRemaining = $.grep(_plugin.settings.availableValuesRemaining, function (n, i) {
                                if (value == n) {
                                    return false;
                                }
                                return true;
                            });
                            $this.insmInputTags('updateRemainingValues');
                        }
                    }).insmInput('edit'),
                    removeButton: $('<a />').text('x').click(function () {
                        var value = element.input.insmInput('getValue');
                        if (value && value != 'Select') {
                            _plugin.settings.availableValuesRemaining.push(value);
                        }
                        element.container.remove();
                        $this.insmInputTags('updateRemainingValues');
                    })
                };

                $this.append(
                    element.container.append(
                        element.input,
                        element.removeButton
                    )
                );

                _plugin.settings.availableValuesRemaining = $.grep(_plugin.settings.availableValuesRemaining, function (n, i) {
                    if (tag == n) {
                        return false;
                    }
                    return true;
                });
            });

            $this.append(
                $('<a />').text('+').click(function () {
                    var element = {
                        container: $('<div />'),
                        input: $('<div />'),
                        removeButton: $('<a />').text('x').click(function() {
                            var value = element.input.insmInput('getValue');
                            if (value && value != 'Select') {
                                _plugin.settings.availableValuesRemaining.push(value);
                            }
                            element.container.remove();
                            $this.insmInputTags('updateRemainingValues');
                        })
                    };
                    element.container.append(element.input, element.removeButton);
                    
                    element.input.insmInput({
                        type: 'string',
                        value: '',
                        availableValues: _plugin.settings.availableValuesRemaining,
                        onChange: function (value, oldValue) {
                            if (oldValue && oldValue != 'Select') {
                                _plugin.settings.availableValuesRemaining.push(oldValue);
                            }
                            _plugin.settings.availableValuesRemaining = $.grep(_plugin.settings.availableValuesRemaining, function (n, i) {
                                if (value == n) {
                                    return false;
                                }
                                return true;
                            });
                            $this.insmInputTags('updateRemainingValues');
                        }
                    }).insmInput('edit');
                    $(this).before(
                        element.container
                    );
                })
            );

            _plugin.data.currentView = 'edit';

            return $this;
        },
        updateRemainingValues: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTags');

            var length = $this.children().length;

            $.each($this.children(), function (index, child) {
                if (index < length - 1) {
                    $(child).children(":first").insmInput('update', {
                        availableValues: _plugin.settings.availableValuesRemaining
                    });
                }
            });

            return $this;
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTags');
            if (typeof value !== 'undefined') {
                if (_plugin.settings.availableValues === null) {
                    _plugin.settings.value = value;
                    switch (_plugin.data.currentView) {
                        case 'view':
                            $this.insmInputTags('view');
                            break;
                        case 'edit':
                            $this.insmInputTags('edit');
                            break;
                        default:
                            break;
                    }
                }
                else {
                    if (_plugin.htmlElements.input) {
                        _plugin.htmlElements.input.children().map(function () {
                            if (this.value.toLowerCase() == value.toLowerCase()) {
                                _plugin.settings.value = this.value;
                            }
                        });
                    }
                }
            }

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTags');
            
            if (!_plugin) {
                return null;
            }

            var value = [];
            var length = $this.children().length;
            $.each($this.children(), function (index, child) {
                if (index < length-1) {
                    value.push($(child).children(":first").insmInput('getValue'));
                }
            });
            
            return value;
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTags');

            _plugin.htmlElements.input.insmHighlight({
                type: 'error'
            });

            return $this;
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTags');
            _plugin.settings.value = value;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTags');

            if (_plugin.settings.multiValue) {
                // TODO: Implement multi-value validation

                /*
                if (typeof _plugin.settings.validateFunction === 'function') {
                    return _plugin.settings.validateFunction($this.insmInputTags("getValue"));
                }
                else {
                    if (_plugin.settings.required === true && $this.insmInputTags("getValue").length === 0) {
                        _plugin.htmlElements.input.insmHighlight({
                            type: 'error'
                        });
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                */
            }
            else {
                if (typeof _plugin.settings.validateFunction === 'function' && _plugin.settings.required === true) {
                    if (_plugin.settings.availableValues !== null) {
                        // If dropdown
                        if ($.isArray(_plugin.settings.availableValues)) {
                            if ($.inArray($this.insmInputTags("getValue"), _plugin.settings.availableValues) >= 0) {
                                return true;
                            }
                        }
                        else {
                            var validValue = false;
                            $.each(_plugin.settings.availableValues, function (value, displayName) {
                                if ($this.insmInputTags("getValue") == value) {
                                    validValue = true;
                                }
                            });
                            if (validValue) {
                                return true;
                            }
                        }
                        _plugin.htmlElements.input.insmHighlight({
                            type: 'error'
                        });
                        return false;
                    }
                    else {
                        // If text input
                        if (_plugin.settings.validateFunction($this.insmInputTags("getValue"))) {
                            return true;
                        }
                        else {
                            _plugin.htmlElements.input.insmHighlight({
                                type: 'error'
                            });
                            return false;
                        }
                    }
                }
                return true;
            }
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTags');

            switch (_plugin.settings.type) {
                case 'string':
                    _plugin.htmlElements.input.val("");
                    break;
                case 'dropdown':
                    _plugin.data.element.children().removeAttr("selected");
                    _plugin.data.element.children().eq(0).attr("selected", "selected");
                    break;
            }
            // clear current value
            _plugin.settings.value = [];
            $this.find(".selected").children().remove();
            return $this;

        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTags');
            
            if (_plugin.settings.value !== options.value && options.value.length > 0) {
                _plugin.settings.value = options.value;
                switch (_plugin.data.currentView) {
                    case 'view':
                        $this.insmInputTags('view');
                        break;
                    case 'edit':
                        $this.insmInputTags('edit');
                        break;
                    default:
                        break;
                }

                if (_plugin.settings.value !== '') {
                    if (_plugin.data.type) {
                        switch (_plugin.data.currentView) {
                            case 'view':
                                $this.parent().insmHighlight();
                                break;
                            case 'edit':
                                _plugin.htmlElements.input.insmHighlight();
                                break;
                        }
                    }
                }
            }

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputTags', null).empty();

            return $this;
        }
    };

    $.fn.insmInputTags = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputTags');
        }
    };
})(jQuery);