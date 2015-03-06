/*
* INSM Input Date Interval
* This file contain the INSM Input Date Interval function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputDateIntervalMonth(settings);
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
            var _plugin = $this.data('insmInputDateIntervalMonth');

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
                        start: {
                            year: $('<div />'),
                            month: $('<div />')
                        },
                        end: {
                            year: $('<div />'),
                            month: $('<div />')
                        }
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

            var currentYear = $.datepicker.formatDate('yy', new Date())
            var currentMonth = $.datepicker.formatDate('mm', new Date())

            for (var i = 0; i < 10; i++) {
                availableYears.push(parseInt(currentYear - i).toString());
            }

            _plugin.htmlElements.input.start.year.insmInput({
                type: 'string',
                availableValues: availableYears,
                value: currentYear,
                required: _plugin.settings.required
            });
            _plugin.htmlElements.input.start.month.insmInput({
                type: 'string',
                availableValues: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
                value: currentMonth,
                required: _plugin.settings.required
            });

            _plugin.htmlElements.input.end.year.insmInput({
                type: 'string',
                availableValues: availableYears,
                value: currentYear,
                required: _plugin.settings.required
            });
            _plugin.htmlElements.input.end.month.insmInput({
                type: 'string',
                availableValues: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
                value: currentMonth,
                required: _plugin.settings.required
            });

            $this.empty().addClass('inputDateInterval').append(
                _plugin.htmlElements.input.start.year,
                _plugin.htmlElements.input.start.month,
                $('<span />').text(' - '),
                _plugin.htmlElements.input.end.year,
                _plugin.htmlElements.input.end.month
            );;

            $this.data('insmInputDateIntervalMonth', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalMonth');

            _plugin.htmlElements.input.start.year.insmInput('view');
            _plugin.htmlElements.input.start.month.insmInput('view');
            _plugin.htmlElements.input.end.year.insmInput('view');
            _plugin.htmlElements.input.end.month.insmInput('view');
            
            _plugin.data.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalMonth');

            _plugin.htmlElements.input.start.year.insmInput('edit');
            _plugin.htmlElements.input.start.month.insmInput('edit');
            _plugin.htmlElements.input.end.year.insmInput('edit');
            _plugin.htmlElements.input.end.month.insmInput('edit');
            
            _plugin.data.currentView = 'edit';

            return $this;
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalMonth');

            _plugin.htmlElements.input.start.year.insmInput('highlightInvalid');
            _plugin.htmlElements.input.start.month.insmInput('highlightInvalid');
            _plugin.htmlElements.input.end.year.insmInput('highlightInvalid');
            _plugin.htmlElements.input.end.month.insmInput('highlightInvalid');

            return $this;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalMonth');
            
            var validateStart = _plugin.htmlElements.input.start.year.insmInput('validate') && _plugin.htmlElements.input.start.month.insmInput('validate');
            var validateEnd = _plugin.htmlElements.input.end.year.insmInput('validate') && _plugin.htmlElements.input.end.month.insmInput('validate');

            if (validateStart && validateEnd) {
                var value = $this.insmInputDateIntervalMonth('getValue');

                if (value.start > value.end) {
                    $this.insmInputDateIntervalMonth('highlightInvalid');
                    return false;
                }
                return true;
            }

            $this.insmInputDateIntervalMonth('highlightInvalid');
            return false;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalMonth');

            return {
                start: _plugin.htmlElements.input.start.year.insmInput('getValue') + '-' + _plugin.htmlElements.input.start.month.insmInput('getValue'),
                end: _plugin.htmlElements.input.end.year.insmInput('getValue') + '-' + _plugin.htmlElements.input.end.month.insmInput('getValue'),
            };
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalMonth');
            
            throw new Error('Update not implemented');

            return $this;
        },
        reset: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateIntervalMonth');

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
            var _plugin = $this.data('insmInputDateIntervalMonth');
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
            $this.data('insmInputDateIntervalMonth', null);
            return $this;
        }
    }

    $.fn.insmInputDateIntervalMonth = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputDateIntervalMonth');
        }
    };
})(jQuery);