/*
 * INSM Asset
 * This file contain the INSM Input Boolean function.
 *
 * This file may only be used by Instoremedia AB or its customers and partners.
 *
 * Called by $('identifier').insmInputDate(settings);
 *
 * File dependencies:
 * jQuery 1.6.1
 * insmNotification
 *
 * Authors:
 * Tobias Rahm - Instoremedia AB
 * Sebastian Ekström - Creuna AB
 * Koji Wakayama - Creuna AB
 */

;
(function ($) {
    var DISPLAY_DATE_FORMAT = 'yy-mm-dd';
    var SERVER_DATE_FORMAT_SUFFIX = "T00:00:00";
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDate');

            _plugin = {
                settings: $.extend({
                    type: "Date",
                    required: true,
                    onUpdate: function (newValue) { },
                    currentValue: $.datepicker.formatDate(DISPLAY_DATE_FORMAT, new Date())
                }, options),
                data: {
                    element: null
                }
            };
            $this.data('insmInputDate', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            $this.empty();
            var _plugin = $this.data('insmInputDate');

            $this.append(
                _plugin.settings.currentValue
            );
            return $this;

        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDate');

            var $date = $("<input/>", {
                type: "text"
            });

            _plugin.data.element = $date;

            $date.on("change", function () {
                var selectedDate = $(this).datepicker("getDate");
                var formattedDate = $.datepicker.formatDate('yy-mm-dd', selectedDate);
                _plugin.settings.currentValue = formattedDate;
                _plugin.settings.onUpdate($this.insmInputDate('getValue'));
            });

            $this.html($date);

            //Init datepicker with values
            $date.datepicker({ dateFormat: DISPLAY_DATE_FORMAT });
            if (_plugin.settings.currentValue) {
                $date.datepicker("setDate", _plugin.settings.currentValue);
            }
            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDate');
            return _plugin.settings.currentValue;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDate');

            if (_plugin.settings.required && _plugin.settings.currentValue.length === 0) {
                _plugin.data.element.css({
                    border: '1px solid #e67'
                });
                return false;
            } else {
                _plugin.data.element.css({
                    border: '1px solid #000'
                });
                return true;
            };
        },
        destroy: function () {

        }
    };

    $.fn.insmInputDate = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputDate');
        }
    };
})(jQuery);