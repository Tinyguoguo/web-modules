/*
* INSM Asset
* This file contain the INSM Input String function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputString(settings);
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
            var _plugin = $this.data('insmInputString');
            _plugin = {
                settings: $.extend({
                    placeholder:'Empty',
                    type: 'string',
                    defaultValue: '',
                    autoFocus: false,
                    required: false,
                    multiValue: false,
                    disabled: false,
                    value: '',
                    availableValues: null,
                    defaultValue: '',
                    maxChars: null,
                    onChange: function() {

                    },
                    onBlur: function () {

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

            if (typeof _plugin.settings.value === "number") {
                _plugin.settings.value = _plugin.settings.value.toString();
            }

            $this.data('insmInputString', _plugin);

            return $this;
        },
        view: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');

            if ($.isArray(_plugin.settings.value)) {
                $this.text(_plugin.settings.value.join(", "));
            }
            else {
                if (!_plugin.settings.value) {
                    $this.text(_plugin.settings.placeholder).addClass('is-italic');
                } else {
                    $this.text(_plugin.settings.value).removeClass('is-italic');
                }
            }

            _plugin.data.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');

            $this.empty();

            if (_plugin.settings.availableValues === null) {
                // Text field
                _plugin.htmlElements.input = $("<input/>", {
                    type: "text",
                    disabled: _plugin.settings.disabled,
                    maxlength: _plugin.settings.maxChars ? _plugin.settings.maxChars : null
                }).blur(function () {
                    _plugin.settings.onBlur();
                }).keypress(function (e) {                    
                    if (e.which == 13) {
                        _plugin.htmlElements.input.blur();
                    }
                });

                _plugin.data.type = 'string';
              

                if (_plugin.settings.multiValue === false) {
                    // Single value
                    _plugin.htmlElements.input.val(_plugin.settings.value);
                    $this.append(_plugin.htmlElements.input);
                    if (_plugin.settings.autoFocus) {
                        _plugin.htmlElements.input.focus();
                    }
                    _plugin.htmlElements.input.change(function (event) {
                        _plugin.settings.value = $(event.target).val();
                    });
                }
                else {
                    // Multiple values
                }
            }
            else {
                // Dropdown
                var dropdown = $("<select/>", {
                    disabled: _plugin.settings.disabled
                });

                _plugin.htmlElements.input = dropdown;

                _plugin.htmlElements.input.change(function () {
                    var selectedValue = _plugin.htmlElements.input.val();
                    _plugin.settings.onChange(selectedValue, _plugin.settings.value);
                });

                _plugin.data.type = 'dropdown';

                // First option if no state is default
                if (!_plugin.settings.disabled) {
                    dropdown.append($('<option selected="selected" value="">Select</select>'));
                }

                if ($.isArray(_plugin.settings.availableValues)) {
                    for (var i = 0, len = _plugin.settings.availableValues.length; i < len; i++) {
                        dropdown.append($("<option/>", {
                            value: _plugin.settings.availableValues[i],
                            text: _plugin.settings.availableValues[i]
                        }));
                    }
                }
                else if ($.isPlainObject(_plugin.settings.availableValues)) {
                    $.each(_plugin.settings.availableValues, function (value, displayName) {
                        dropdown.append($("<option/>", {
                            value: value,
                            text: displayName
                        }));
                    });
                }
                else {
                    throw new Error
                }

                // Set default from model
                if (_plugin.settings.value) {
                    dropdown.val(_plugin.settings.value);
                }
                dropdown.change(function () {
                    _plugin.settings.value = $(this).val();
                });

                $this.append(dropdown);
            }

            _plugin.data.currentView = 'edit';

            return $this;
        },
        
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');
            if (typeof value !== 'undefined') {
                if (_plugin.settings.availableValues === null) {
                    _plugin.settings.value = value;
                    switch (_plugin.data.currentView) {
                        case 'view':
                            $this.insmInputString('view');
                            break;
                        case 'edit':
                            $this.insmInputString('edit');
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
            var _plugin = $this.data('insmInputString');
            return _plugin.settings.value;
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');

            _plugin.htmlElements.input.insmHighlight({
                type: 'error'
            });

            return $this;
        },
        setValue: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');
            _plugin.settings.value = options.value;
            _plugin.htmlElements.input.val(options.value);
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');

            if (_plugin.settings.multiValue) {
                // TODO: Implement multi-value validation

                /*
                if (typeof _plugin.settings.validateFunction === 'function') {
                    return _plugin.settings.validateFunction($this.insmInputString("getValue"));
                }
                else {
                    if (_plugin.settings.required === true && $this.insmInputString("getValue").length === 0) {
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
                            if ($.inArray($this.insmInputString("getValue"), _plugin.settings.availableValues) >= 0) {
                                return true;
                            }
                        }
                        else {
                            var validValue = false;
                            $.each(_plugin.settings.availableValues, function (value, displayName) {
                                if ($this.insmInputString("getValue") == value) {
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
                        if (_plugin.settings.validateFunction($this.insmInputString("getValue"))) {
              
                            return true;
                        }
                        else {
        
                            if (_plugin.data.currentView == 'edit') {
                                _plugin.htmlElements.input.insmHighlight({
                                    type: 'error'
                                });
                            } else if (_plugin.data.currentView == 'view') {
                                $this.insmHighlight({
                                    type: 'error'
                                });
                            }
                            return false;
                        }
                    }
                }
                return true;
            }
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputString');

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
            var _plugin = $this.data('insmInputString');
            
            if (_plugin.settings.value !== options.value && options.value.length > 0) {
                _plugin.settings.value = options.value;
                switch (_plugin.data.currentView) {
                    case 'view':
                        $this.insmInputString('view');
                        break;
                    case 'edit':
                        $this.insmInputString('edit');
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
            $this.data('insmInputString', null).empty();

            return $this;
        }
    };

    $.fn.insmInputString = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputString');
        }
    };
})(jQuery);