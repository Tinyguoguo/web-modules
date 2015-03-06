/*
* INSM Asset
* This file contain the INSM Input String function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputInteger(settings);
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
            var _plugin = $this.data('insmInputInteger');

            _plugin = {
                settings: $.extend({
                    type: 'string',
                    defaultValue: 0,
                    required: false,
                    multiValue: false,
                    disabled: false,
                    doNotAllow: [],
                    value: null,
                    validateFunction: function (value) {
                        if (value.length == 0)
                            return false;
                        else
                            return true;
                    }
                }, options),
                data: {
                    type: null,
                    element: null,
                    previousValue: null,
                    currentView: ''
                },
                htmlElements: {
                    input: null
                }
            };

            if (_plugin.settings.value === null) {
                _plugin.settings.value = _plugin.settings.defaultValue
            }

            if (typeof _plugin.settings.value !== 'number') {
                _plugin.settings.value = parseInt(_plugin.settings.value);
            }

            $this.data('insmInputInteger', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputInteger');

            $this.empty();
            $this.append(_plugin.settings.value);

            _plugin.data.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputInteger');
            
            $this.empty();

            _plugin.htmlElements.input = $("<input/>", {
                type: "text",
                disabled: _plugin.settings.disabled
            });

            // Single value
            $this.append(
                _plugin.htmlElements.input.val(_plugin.settings.value)
            );

            _plugin.htmlElements.input.change(function (event) {
                if (!isNaN(parseInt($(event.target).val()))) {
                    _plugin.settings.value = parseInt($(event.target).val());
                    $(event.target).val(_plugin.settings.value);
                }
                else {
                    // Maybe highlight and notify what was wrong?
                    $(event.target).val(_plugin.settings.value);
                }
            });

            if (_plugin.data.currentView == 'edit') {
                _plugin.htmlElements.input.insmHighlight();
            }
            else {
                _plugin.data.currentView = 'edit';
            }

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputInteger');
            return _plugin.settings.value;
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputInteger');

            if (_plugin.data.type == "input") {
                _plugin.settings.value = value;
                _plugin.htmlElements.input.val(_plugin.settings.value[0])
            } else {
                throw new Exception("setValue missing implementation!");
            }
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputInteger');

            if (_plugin.settings.multiSelect) {
                if (_plugin.settings.required === true && $this.insmInputInteger("getValue").length === 0) {
                    _plugin.htmlElements.input.insmHighlight({
                        type: 'error'
                    });
                    return false;
                } else {
                    return true;
                }
            }
            else {
                if (_plugin.settings.required === true && !$this.insmInputInteger("getValue")) {
                    _plugin.htmlElements.input.insmHighlight({
                        type: 'error'
                    });
                    return false;
                } else {
                    var foundNotAllowed = false;
                    $.each(_plugin.settings.doNotAllow, function (index, value) {
                        if ($this.insmInputInteger("getValue").indexOf(value) != -1) {
                            foundNotAllowed = value;
                        }
                    });
                    if (foundNotAllowed) {
                        _plugin.htmlElements.input.insmHighlight({
                            type: 'error'
                        });
                        return false;
                    }
                    return true;
                }
            }
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputInteger');

            switch(_plugin.data.type){
                case 'input':
                    _plugin.data.element.val("");
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
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputInteger');

            _plugin.settings.value = value;

            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputInteger');

            if (parseInt(_plugin.settings.value) != parseInt(options.value)) {
                _plugin.settings.value = options.value;
                switch (_plugin.data.currentView) {
                    case 'view':
                        $this.insmInputInteger('view');
                        break;
                    case 'edit':
                        $this.insmInputInteger('edit');
                        break;
                    default:
                        break;
                }
            }

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputInteger', null);

            return $this;
        }
    };

    $.fn.insmInputInteger = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputInteger');
        }
    };
})(jQuery);