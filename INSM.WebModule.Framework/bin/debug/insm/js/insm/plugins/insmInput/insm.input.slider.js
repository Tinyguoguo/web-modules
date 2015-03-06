/*
 * INSM Asset
 * This file contain the INSM Input Slider function.
 *
 * This file may only be used by Instoremedia AB or its customers and partners.
 *
 * Called by $('identifier').insmInputSlider(settings);
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
            var _plugin = $this.data('insmInputSlider');
            
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        type: "Slider",
                        value: 0,
                        required: true,
                        relative: false,
                        rangeSliderLabel: null,
                        range: { min: 0, max: 100 },
                        unitLabel: null,
                        onUpdate: function (newValue) { },
                        sliderWidth: null
                    }, options),
                    data: {
                        state: '',
                        currentView: ''
                    },
                    htmlElements: {
                        slider: null,
                        value: $('<span />'),
                        rangeValueLabel: $('<span />')
                    }
                };

                if (typeof _plugin.settings.value !== 'number') {
                    _plugin.settings.value = parseInt(_plugin.settings.value);
                }

                if (typeof _plugin.settings.sliderWidth !== 'number') {
                    _plugin.settings.sliderWidth = parseInt(_plugin.settings.sliderWidth);
                }

                if (!_plugin.settings.unitLabel) {
                    throw new Error('Unit label not set on $.insmInputSlider');
                }

                _plugin.htmlElements.slider = $("<div/>").slider({
                    disabled: true,
                    range: 'min',
                    min: _plugin.settings.range.min,
                    max: _plugin.settings.range.max,
                    value: _plugin.settings.value
                });

                $this.data('insmInputSlider', _plugin);

                _plugin.settings.onUpdate($this.insmInputSlider('getValue'));

            }

            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputSlider');

            if (!options || !options.value) {
                throw new Error('Missing parameter "value"');
            }
            
            $.extend(_plugin.settings, options);

            _plugin.htmlElements.slider = $("<div/>").slider({
                disabled: true,
                range: 'min',
                min: _plugin.settings.range.min,
                max: _plugin.settings.range.max,
                value: _plugin.settings.value
            });

            if (_plugin.data.currentView == 'view') {
                $this.insmInputSlider('view');
            }
            else if (_plugin.data.currentView == 'edit') {
                $this.insmInputSlider('edit');
            }

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputSlider');

            _plugin.htmlElements.value.detach();
            _plugin.htmlElements.slider.detach();
            $this.empty();

            if (typeof _plugin.settings.value === 'number') {
                if (_plugin.settings.value < _plugin.settings.range.min ||
                    _plugin.settings.value > _plugin.settings.range.max) {

                    _plugin.settings.value = _plugin.settings.range.min;
                }
            }
            else {
                _plugin.settings.value = _plugin.settings.range.min;
            }

            _plugin.htmlElements.slider.slider({
                value: _plugin.settings.value,
                disabled: true
            });
            
            $this.append(
                _plugin.htmlElements.slider,
                _plugin.htmlElements.rangeValueLabel.text(_plugin.htmlElements.slider.slider('value') + ' ' + _plugin.settings.unitLabel)
            );

            _plugin.data.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputSlider');
            _plugin.htmlElements.value.detach();
            _plugin.htmlElements.slider.detach();

            $this.empty();

            _plugin.htmlElements.slider.slider({
                value: _plugin.settings.value,
                disabled: false,
                slide: function (event, ui) {
                    _plugin.htmlElements.rangeValueLabel.text(ui.value + ' ' + _plugin.settings.unitLabel);
                    _plugin.settings.value = ui.value;
                },
                change: function (event, ui) {
                    _plugin.htmlElements.rangeValueLabel.text(ui.value + ' ' + _plugin.settings.unitLabel);
                    _plugin.settings.value = ui.value;
                }
            });

            $this.append(
                _plugin.htmlElements.slider,
                _plugin.htmlElements.rangeValueLabel.text(_plugin.htmlElements.slider.slider('value') + ' ' + _plugin.settings.unitLabel)
            );

            _plugin.data.currentView = 'edit';

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputSlider');

            return parseInt(_plugin.settings.value);
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputSlider');

            return true;
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputSlider');


            _plugin.settings.value = parseInt(value);
            _plugin.htmlElements.slider.slider('value', value);

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputSlider', null).empty();

            return $this;
        }
    };

    $.fn.insmInputSlider = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputSlider');
        }
    };
})(jQuery);