/*
* INSM Input Resolution
* This file contain the INSM Input Resolution function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputResolution(settings);
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
            var _plugin = $this.data('insmInputResolution');
            _plugin = {
                settings: $.extend({
                    type: 'string',
                    defaultValue: 0,
                    required: false,
                    multiValue: false,
                    disabled: false,
                    value: null
                }, options),
                data: {
                    type: null,
                    element: null,
                    previousValue: null,
                    currentView: ''
                }
            };

            if (typeof _plugin.settings.value !== 'object') {
                _plugin.settings.value = {};
            }
            else {
                if (typeof _plugin.settings.value.width === 'undefined') {
                    _plugin.settings.value = {};
                }
                else if (typeof _plugin.settings.value.height === 'undefined') {
                    _plugin.settings.value = {};
                }
            }

            $this.data('insmInputResolution', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputResolution');
            $this.empty();

            if (typeof _plugin.settings.value.width !== 'undefined' && typeof _plugin.settings.value.height !== 'undefined') {
                $this.append(_plugin.settings.value.width + 'x' + _plugin.settings.value.height);
            }
            else {
                $this.empty();
            }

            _plugin.data.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputResolution');
            
            $this.empty();

            var textInput = $("<input/>", {
                type: "text",
                disabled: _plugin.settings.disabled
            });

            // Single value
            textInput.val(_plugin.settings.value);
            $this.append(textInput);

            textInput.change(function (event) {
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
                textInput.insmHighlight();
            }
            else {
                _plugin.data.currentView = 'edit';
            }

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputResolution');

            return _plugin.settings.value;
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputResolution');
            if (_plugin.data.type == "input") {
                _plugin.settings.value = value;
                _plugin.data.element.val(_plugin.settings.value[0])
                _plugin.settings.onUpdate($this.insmInputResolution('getValue'));
            } else {
                throw new Exception("setValue missing implementation!");
            }
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputResolution');

            if (_plugin.settings.multiSelect) {
                if (_plugin.settings.required === true && $this.insmInputResolution("getValue").length === 0) {
                    _plugin.data.element.css({
                        border: '1px solid #e67'
                    });
                    return false;
                } else {
                    _plugin.data.element.css({
                        border: '1px solid #000'
                    });
                    return true;
                }
            }
            else {
                if (_plugin.settings.required === true && !$this.insmInputResolution("getValue")) {
                    _plugin.data.element.css({
                        border: '1px solid #e67'
                    });
                    return false;
                } else {
                    var foundNotAllowed = false;
                    $.each(_plugin.settings.doNotAllow, function (index, value) {
                        if ($this.insmInputResolution("getValue").indexOf(value) != -1) {
                            foundNotAllowed = value;
                        }
                    });
                    if (foundNotAllowed) {
                        _plugin.data.element.css({
                            border: '1px solid #e67'
                        });
                        return false;
                    } else {
                        _plugin.data.element.css({
                            border: '1px solid #000'
                        });
                        return true;
                    }
                }
            }
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputResolution');

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
        reset: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputResolution');

            _plugin.settings.value = _plugin.data.previousValue;
            _plugin.settings.onUpdate($this.insmInputResolution('getValue'));

            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputResolution');

            if (typeof options.value !== 'object') {
                return $this;
            }
            else {
                if (!options.value.width) {
                    return $this;
                }
                if (!options.value.height) {
                    return $this;
                }
            }

            if (_plugin.settings.value != options.value) {
                if ($.isEmptyObject(_plugin.settings.value)) {
                    $this.insmHighlight();
                }
                _plugin.settings.value = options.value;
                switch (_plugin.data.currentView) {
                    case 'view':
                        $this.insmInputResolution('view');
                        break;
                    case 'edit':
                        $this.insmInputResolution('edit');
                        break;
                    default:
                        break;
                }
            }

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputResolution', null);

            return $this;
        }
    };

    $.fn.insmInputResolution = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputResolution');
        }
    };
})(jQuery);