/*
* INSM Input Tag
* This file contain the INSM Input Tag function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputTag(settings);
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
            var _plugin = $this.data('insmInputTag');
            _plugin = {
                settings: $.extend({
                    type: 'tag',
                    defaultValue: '',
                    required: false,
                    multiValue: false,
                    disabled: false,
                    value: '',
                    availableValues: null,
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
                    editing: false
                },
                htmlElements: {
                    input: null,
                    dropdown: null
                }
            };


            if (typeof _plugin.settings.value !== 'string') {
                _plugin.settings.value = '';
            }

            $this.data('insmInputTag', _plugin);

            return $this;
        },
        view: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTag');
            
            _plugin.data.currentView = 'view';

            return $this;
        },
        click: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTag');

            $this.trigger('click');

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTag');

            _plugin.data.editing = false;
            $this.unbind('click');
            $this.text(_plugin.settings.value).click(function () {
                if (!_plugin.data.editing) {
                    _plugin.data.editing = true;
                    var input = $('<div contenteditable="true" />').text(_plugin.settings.value).blur(function () {
                        _plugin.settings.value = $(this).text();

                        if (_plugin.settings.value == '') {
                            $this.insmInputTag('destroy');
                        }
                        else {
                            $this.insmInputTag('edit');
                        }
                    });
                    $(this).empty().append(
                        input
                    );
                    input.focus();
                }
            });

            _plugin.data.currentView = 'edit';

            return $this;
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTag');
            if (typeof value !== 'undefined') {
                if (_plugin.settings.availableValues === null) {
                    _plugin.settings.value = value;
                    switch (_plugin.data.currentView) {
                        case 'view':
                            $this.insmInputTag('view');
                            break;
                        case 'edit':
                            $this.insmInputTag('edit');
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
            var _plugin = $this.data('insmInputTag');
            if (!_plugin) {
                return null;
            }
            return _plugin.settings.value;
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTag');

            _plugin.htmlElements.input.insmHighlight({
                type: 'error'
            });

            return $this;
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTag');
            _plugin.settings.value = value;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTag');

            if (_plugin.settings.multiValue) {
                // TODO: Implement multi-value validation

                /*
                if (typeof _plugin.settings.validateFunction === 'function') {
                    return _plugin.settings.validateFunction($this.insmInputTag("getValue"));
                }
                else {
                    if (_plugin.settings.required === true && $this.insmInputTag("getValue").length === 0) {
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
                            if ($.inArray($this.insmInputTag("getValue"), _plugin.settings.availableValues) >= 0) {
                                return true;
                            }
                        }
                        else {
                            var validValue = false;
                            $.each(_plugin.settings.availableValues, function (value, displayName) {
                                if ($this.insmInputTag("getValue") == value) {
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
                        if (_plugin.settings.validateFunction($this.insmInputTag("getValue"))) {
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
            var _plugin = $this.data('insmInputTag');

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
            var _plugin = $this.data('insmInputTag');
            
            if (_plugin.settings.value !== options.value && options.value.length > 0) {
                _plugin.settings.value = options.value;
                switch (_plugin.data.currentView) {
                    case 'view':
                        $this.insmInputTag('view');
                        break;
                    case 'edit':
                        $this.insmInputTag('edit');
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
            $this.data('insmInputTag', null).empty();
            $this.remove();

            return $this;
        }
    };

    $.fn.insmInputTag = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputTag');
        }
    };
})(jQuery);