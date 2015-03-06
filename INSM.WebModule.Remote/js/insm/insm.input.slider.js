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

            _plugin = {
                settings: $.extend({
                    type: "Slider",
                    currentValue: 0,
                    required: true,
                    relative: false,
                    relativeValue: '',
                    range: { min: 0, max: 100 },
                    onUpdate: function (newValue) { }
                }, options),
                data: {
                    state: '',
                    relativeValueContainer: $('<span />'),
                    relativeSlider: null,
                    weightSlider: null,
                    relativeSlider: $('<div />')
                }
            };
            
            if (typeof _plugin.settings.currentValue !== 'number') {
                _plugin.settings.currentValue = parseInt(_plugin.settings.currentValue);
            }
            
            _plugin.data.weightSlider = $("<div/>").slider({
                disabled: true,
                range: 'min',
                min: _plugin.settings.range.min,
                max: _plugin.settings.range.max,
                value: _plugin.settings.currentValue,
                slide: function (event, ui) {
                    _plugin.settings.currentValue = ui.value;
                    _plugin.settings.onUpdate($this.insmInputSlider('getValue'));
                }
            }).css({
                width: '200px',
                marginBottom: '14px'
            });

            _plugin.data.relativeSlider = $("<div/>").slider({
                disabled: true,
                range: 'min',
                min: _plugin.settings.range.min,
                max: _plugin.settings.range.max,
                value: _plugin.settings.relativeValue
            }).css({
                width: '200px'
            });
            _plugin.data.relativeValueContainer.html(_plugin.settings.relativeValue);

            _plugin.data.element = _plugin.data.valueContainer;

            _plugin.data.previousValue = _plugin.settings.currentValue;

            $this.data('insmInputSlider', _plugin);

            _plugin.settings.onUpdate($this.insmInputSlider('getValue'));

            return $this;
        },
        updateRelativeValue: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputSlider');

            if (!options || !options.value) {
                throw new Error('Missing parameter "value"');
            }

            _plugin.settings.relativeValue = options.value;
            _plugin.data.relativeSlider.slider('value', _plugin.settings.relativeValue);
            _plugin.data.relativeValueContainer.html(_plugin.settings.relativeValue);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputSlider');
            _plugin.data.relativeValueContainer.detach();
            _plugin.data.relativeSlider.detach();
            _plugin.data.weightSlider.detach();
            $this.empty();

            if (typeof _plugin.settings.currentValue === 'number') {
                if (_plugin.settings.currentValue < _plugin.settings.range.min ||
                    _plugin.settings.currentValue > _plugin.settings.range.max) {

                    _plugin.settings.currentValue = _plugin.settings.range.min;
                }
            }
            else {
                _plugin.settings.currentValue = _plugin.settings.range.min;
            }
            _plugin.data.weightSlider.slider('value', _plugin.settings.currentValue);
            _plugin.data.relativeSlider.slider('value', _plugin.settings.relativeValue);
            
            $this.append(
                $('<div class="float_right" />').text('High'),
                $('<div class="float_left" />').text('Low'),
                $('<div class="clear" />'),
                _plugin.data.weightSlider,
                $('<div />').css({ 'padding-top': '10px', 'border-top': '1px solid #ddd' }).text('Approximate playout: ').append(_plugin.data.relativeValueContainer.html(_plugin.settings.relativeValue)).append(' %'),
                _plugin.data.relativeSlider
            );

            $this.css({ 'width': '200px' });

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputSlider');
            _plugin.data.relativeValueContainer.detach();
            _plugin.data.relativeSlider.detach();
            _plugin.data.weightSlider.detach();

            $this.empty();

            // Visualize the values            
            _plugin.data.weightSlider.slider({
                value: _plugin.settings.currentValue,
                disabled: false
            });
            _plugin.data.relativeSlider.slider('value', _plugin.settings.relativeValue);

            $this.append(
                $('<div class="float_right" />').text('High'),
                $('<div class="float_left" />').text('Low'),
                $('<div class="clear" />'),
                _plugin.data.weightSlider,
                $('<div />').css({ 'padding-top': '10px', 'border-top': '1px solid #ddd' }).text('Approximate playout: ').append(_plugin.data.relativeValueContainer.html(_plugin.settings.relativeValue)).append(' %'),
                _plugin.data.relativeSlider
            );

            $this.css({ 'width': '200px' });

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputSlider');

            return parseInt(_plugin.settings.currentValue);
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputSlider');

            return true;
        },
        reset: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputSlider');

            _plugin.settings.currentValue = _plugin.data.previousValue;
            _plugin.settings.onUpdate($this.insmInputSlider('getValue'));

            return $this;
        },
        destroy: function () {

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