/*
* INSM Asset
* This file contain the INSM Input Radio function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputRadio(settings);
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
            var _plugin = $this.data('insmInputRadio');
            _plugin = {
                settings: $.extend({
                    type: 'radio',
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
                    type: null,
                    previousValue: null
                },
                htmlElements: {
                    input: null,
                    dropdown: null
                }
            };
            
            $this.addClass('insm-input-radio');

            $this.data('insmInputRadio', _plugin);

            return $this;
        },
        view: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputRadio');
            
            _plugin.data.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputRadio');

            $this.empty();

            $.each(_plugin.settings.availableValues, function(index, value) {
                $this.append(
                    $('<a />').text(value).click(function () {
                        $this.children().removeClass('is-selected');
                        $(this).addClass('is-selected');

                        _plugin.settings.onChange(value);

                    })
                )
            });         

            $this.children(':first').trigger('click');

            _plugin.data.currentView = 'edit';

            return $this;
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputRadio');
            

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputRadio');

            return _plugin.settings.value;
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputRadio');

            _plugin.htmlElements.input.insmHighlight({
                type: 'error'
            });

            return $this;
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputRadio');
            _plugin.settings.value = value;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputRadio');

            if (_plugin.settings.multiValue) {
                // TODO: Implement multi-value validation

                /*
                if (typeof _plugin.settings.validateFunction === 'function') {
                    return _plugin.settings.validateFunction($this.insmInputRadio("getValue"));
                }
                else {
                    if (_plugin.settings.required === true && $this.insmInputRadio("getValue").length === 0) {
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
                            if ($.inArray($this.insmInputRadio("getValue"), _plugin.settings.availableValues) >= 0) {
                                return true;
                            }
                        }
                        else {
                            var validValue = false;
                            $.each(_plugin.settings.availableValues, function (value, displayName) {
                                if ($this.insmInputRadio("getValue") == value) {
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
                        if (_plugin.settings.validateFunction($this.insmInputRadio("getValue"))) {
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
            var _plugin = $this.data('insmInputRadio');

            _plugin.settings.value = '';
            
            return $this;

        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputRadio');
            
            if (_plugin.settings.value !== options.value && options.value.length > 0) {
                _plugin.settings.value = options.value;
                switch (_plugin.data.currentView) {
                    case 'view':
                        $this.insmInputRadio('view');
                        break;
                    case 'edit':
                        $this.insmInputRadio('edit');
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
            $this.data('insmInputRadio', null).empty();

            return $this;
        }
    };

    $.fn.insmInputRadio = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputRadio');
        }
    };
})(jQuery);