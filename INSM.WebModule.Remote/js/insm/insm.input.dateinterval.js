/*
 * INSM Asset
 * This file contain the INSM Input Boolean function.
 *
 * This file may only be used by Instoremedia AB or its customers and partners.
 *
 * Called by $('identifier').insmInputDateInterval(settings);
 *
 * File dependencies:
 * jQuery 1.6.1
 * insmNotification
 *
 * Authors:
 * Tobias Rahm - Instoremedia AB
 * Sebastian Ekström - Creuna AB
 */

;
(function ($) {
    var DISPLAY_DATE_FORMAT = 'yy-mm-dd';
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateInterval');

            _plugin = {
                settings: $.extend({
                    type: "DateInterval",
                    required: true,
                    onUpdate: function (newValue) { },
                    currentValue: {
                        start: $.datepicker.formatDate(DISPLAY_DATE_FORMAT, new Date()),
                        end: $.datepicker.formatDate(DISPLAY_DATE_FORMAT, new Date())
                    }
                }, options)
            };

            $this.data('insmInputDateInterval', _plugin);

            if ($.isArray(_plugin.settings.currentValue)) {
                _plugin.settings.currentValue = {
                    start: $.datepicker.formatDate(DISPLAY_DATE_FORMAT, new Date()),
                    end: $.datepicker.formatDate(DISPLAY_DATE_FORMAT, new Date())
                }
            }

            //check if the current value provided is OK (so that the user only may provide one of them etc.)
            $.each(['end', 'start'], function (i, v) {
                if (!_plugin.settings.currentValue[v]) {
                    _plugin.settings.currentValue[v] = $.datepicker.formatDate(DISPLAY_DATE_FORMAT, new Date());
                } else {
                    try {
                        new Date(_plugin.settings.currentValue[v]);
                    } catch (err) {
                        _plugin.settings.currentValue[v] = $.datepicker.formatDate(DISPLAY_DATE_FORMAT, new Date());
                    }
                }
            });

            _plugin.settings.onUpdate($this.insmInputDateInterval('getValue'));
            return $this;
        },
        view: function () {
            var $this = $(this);
            $this.empty();
            var _plugin = $this.data('insmInputDateInterval');

            $this.append(
                _plugin.settings.currentValue.start
                    + " - " +
                _plugin.settings.currentValue.end
            );


            return $this;

        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateInterval');

            var $startDate = $("<input/>", {
                type: "text"
            });

            var $endDate = $("<input/>", {
                type: "text"
            });

            $startDate.on("change", function () {
                var selectedDate = $(this).datepicker("getDate");
                //server friendly format, not for display so don't use the DISPLAY_DATE_FORMAT constant
                var formattedDate = $.datepicker.formatDate(DISPLAY_DATE_FORMAT, selectedDate);
                _plugin.settings.currentValue.start = formattedDate;
                _plugin.settings.onUpdate($this.insmInputDateInterval('getValue'));
            });

            $endDate.on("change", function () {
                var selectedDate = $(this).datepicker("getDate");
                //server friendly format, not for display so don't use the DISPLAY_DATE_FORMAT constant
                var formattedDate = $.datepicker.formatDate(DISPLAY_DATE_FORMAT, selectedDate);
                _plugin.settings.currentValue.end = formattedDate;
                _plugin.settings.onUpdate($this.insmInputDateInterval('getValue'));
            });

            $this.html([$startDate, $endDate]);

            //Init datepicker with values
            $startDate.datepicker({ dateFormat: DISPLAY_DATE_FORMAT });
            $endDate.datepicker({ dateFormat: DISPLAY_DATE_FORMAT });
            $startDate.datepicker("setDate", _plugin.settings.currentValue.start);
            $endDate.datepicker("setDate", _plugin.settings.currentValue.end);

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateInterval');
            return _plugin.settings.currentValue;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDateInterval');
            if (_plugin.settings.required === true) {
                try {
                    var d1 = new Date(_plugin.settings.currentValue.start);
                    var d2 = new Date(_plugin.settings.currentValue.end);
                    if (d1 > d2) {
                        $this.css({
                            border: '1px solid #e67'
                        });
                        return false;
                    }
                } catch (err) {
                    $this.css({
                        border: '1px solid #e67'
                    });
                    return false;
                }
            }

            if (_plugin.settings.required === true && typeof $this.insmInputDateInterval("getValue") === 'undefined') {
                $this.css({
                    border: '1px solid #e67'
                });
                return false;
            } else {
                $this.css({
                    border: '0px'
                });
                return true;
            }
        },
        destroy: function () {

        }
    };

    $.fn.insmInputDateInterval = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputDateInterval');
        }
    };
})(jQuery);