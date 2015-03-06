/*
* INSM Input Date Interval
* This file contain the INSM Input Date Interval function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputDateIntervalYear(settings);
*
* File dependencies:
* jQuery 1.6.1
* jQuery UI 1.10.3
* insmNotification
*
* Authors:
* Markus Bergh - Creuna AB
*/
; (function ($) {
    var DATE_FORMAT = 'yy-mm-dd';
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalYear');

            _plugin = {
                settings: $.extend({
                    type: 'Date',
                    required: true,
                    value: '',
                    onChange: function () { },
                    maxDate: null
                }, options),
                data: {
                    currentValue: null,
                    currentView: null,
                    type: null
                },
                htmlElements: {
                    input: {
                        start: $('<div />'),
                        end: $('<div />')
                    },
                    clear: $('<a class="clear" />')
                }
            }

            if (typeof _plugin.settings.value !== 'object') {
                _plugin.settings.value = {
                    start: '',
                    end: ''
                };
            }
            else {
                if (typeof _plugin.settings.value.start !== 'string') {
                    _plugin.settings.value.start = '';
                }
                if (typeof _plugin.settings.value.end !== 'string') {
                    _plugin.settings.value.end = '';
                }
            }

            var availableYears = [];

            var currentYear = $.datepicker.formatDate('yy', new Date());

            for (var i = 0; i < 10; i++) {
                availableYears.push(parseInt(currentYear - i).toString());
            }

            _plugin.htmlElements.input.start.insmInput({
                type: 'string',
                availableValues: availableYears,
                value: currentYear,
                required: _plugin.settings.required
            });

            _plugin.htmlElements.input.end.insmInput({
                type: 'string',
                availableValues: availableYears,
                value: currentYear,
                required: _plugin.settings.required
            });

            $this.empty().addClass('inputDateInterval').append(
                _plugin.htmlElements.input.start,
                $('<span />').text(' - '),
                _plugin.htmlElements.input.end
            );;

            $this.data('insmInputDateIntervalYear', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalYear');

            _plugin.htmlElements.input.start.insmInput('view');
            _plugin.htmlElements.input.end.insmInput('view');

            _plugin.data.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalYear');

            _plugin.htmlElements.input.start.insmInput('edit');
            _plugin.htmlElements.input.end.insmInput('edit');

            _plugin.data.currentView = 'edit';

            return $this;
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalYear');

            _plugin.htmlElements.input.start.insmInput('highlightInvalid');
            _plugin.htmlElements.input.end.insmInput('highlightInvalid');

            return $this;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalYear');

            var validateStart = _plugin.htmlElements.input.start.insmInput('validate');
            var validateEnd = _plugin.htmlElements.input.end.insmInput('validate');

            if (validateStart && validateEnd) {
                var value = $this.insmInputDateIntervalYear('getValue');
                if (value.start > value.end) {
                    $this.insmInputDateIntervalYear('highlightInvalid');
                    return false;
                }
                return true;
            }

            return false;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalYear');

            return {
                start: _plugin.htmlElements.input.start.insmInput('getValue'),
                end: _plugin.htmlElements.input.end.insmInput('getValue'),
            };
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalYear');

            throw new Error('Update not implemented');

            return $this;
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalYear');

            if (typeof value !== 'undefined') {
                $this.empty();
                $this.html(
                    value
                );
                _plugin.settings.value = value;
            }
            return $this;
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalYear');
            _plugin.htmlElements.startInput.val('');
            _plugin.htmlElements.endInput.val('');
            _plugin.settings.value = {
                start: '',
                end: ''
            };
            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputDateIntervalYear', null);
            return $this;
        }
    }

    $.fn.insmInputDateIntervalYear = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputDateIntervalYear');
        }
    };
})(jQuery);