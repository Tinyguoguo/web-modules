/*
 * INSM Asset
 * This file contain the INSM Input Integer function.
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
 * Koji Wakayama - Creuna AB
 */

;
(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputInteger');

            _plugin = {
                settings: $.extend({
                    type: "Integer",
                    currentValue: 0,
                    required: true,
                    relative: false,
                    relativeValue: '',
                    range: { min: -100, max: 100 },
                    onUpdate: function (newValue) {}
                }, options),
                data: {
                    element: null,
                    previousValue: null
                }
            };
            
            if (typeof _plugin.settings.currentValue !== 'number') {
                _plugin.settings.currentValue = parseInt(_plugin.settings.currentValue);
            }

            _plugin.data.previousValue = _plugin.settings.currentValue;

            $this.data('insmInputInteger', _plugin);

            return $this;
        },
        updateRelativeValue: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputInteger');

            _plugin.settings.relativeValue = options.value;

            return $this;
        },
        view: function () {
            var $this = $(this);
            $this.empty();

            var _plugin = $this.data('insmInputInteger');


            var $sliderContainer = $("<div/>", {
                class: "slider"
            });
            
            if (_plugin.settings.relative) {
                $this.append(_plugin.settings.relativeValue);
            }
            else {
                $this.append(_plugin.settings.currentValue);
            }

            $this.append($sliderContainer);

            $sliderContainer.slider({
                range: "min",
                disabled: true,
                min: _plugin.settings.range.min,
                max: _plugin.settings.range.max,
            });

            if (!isNaN(_plugin.settings.currentValue)) {
                $sliderContainer.slider("value", _plugin.settings.currentValue);
                _plugin.settings.currentValue = _plugin.settings.currentValue;
                _plugin.settings.onUpdate($this.insmInputInteger('getValue'));
            }

            return $this;
        },
        edit: function () {
            var $this = $(this);
            $this.empty();

            var _plugin = $this.data('insmInputInteger');

            var sliderContainer = $("<div/>", {
                class: "slider"
            });
            var valueContainer = $("<input/>", {
                class: "integerValue",
                value: _plugin.settings.currentValue,
                type: "text"
            });

            var relativeValueContainer = $("<div/>", {
                text: _plugin.settings.relativeValue
            });


            _plugin.data.element = valueContainer;

            if (_plugin.settings.relative) {
                $this.append(relativeValueContainer);
            }
            else {
                $this.append(valueContainer);
            }
            $this.append(sliderContainer);

            sliderContainer.slider({
                range: "min",
                min: _plugin.settings.range.min,
                max: _plugin.settings.range.max,
                slide: function (event, ui) {
                    valueContainer.val(ui.value);
                    _plugin.settings.currentValue = ui.value;
                    _plugin.settings.onUpdate($this.insmInputInteger('getValue'));
                }
            });

            valueContainer.on("change", function () {
                var fieldValue = $(this).val();
                if (!isNaN(fieldValue)) {
                    sliderContainer.slider("value", fieldValue);
                    _plugin.settings.currentValue = fieldValue;
                    _plugin.settings.onUpdate($this.insmInputInteger('getValue'));

                }
            });

            //Sync slider with integer text field
            valueContainer.trigger("change");

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputInteger');

            return parseInt(_plugin.settings.currentValue);
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputInteger');

            if (_plugin.settings.required === true && (isNaN($this.insmInputInteger("getValue")) || $this.insmInputInteger("getValue") > _plugin.settings.range.max || $this.insmInputInteger("getValue") < _plugin.settings.range.min)) {
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
        },
        reset: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputInteger');

            _plugin.settings.currentValue = _plugin.data.previousValue;
            _plugin.settings.onUpdate($this.insmInputInteger('getValue'));

            return $this;
        },
        destroy: function () {

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