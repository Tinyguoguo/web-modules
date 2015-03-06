/*
 * INSM Asset
 * This file contain the INSM Input Boolean function.
 *
 * This file may only be used by Instoremedia AB or its customers and partners.
 *
 * Called by $('identifier').insmInputWeekdays(settings);
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
            var _plugin = $this.data('insmInputWeekdays');
            _plugin = {
                settings: $.extend({
                    type: "Weekdays",
                    currentValue: [0, 1, 2, 3, 4, 5, 6],
                    required: true,
                    onUpdate: function (newValue) { }
                }, options)
            };

            _plugin["data"] = {
                weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            }

            _plugin["data"]["convertedCurrentValue"] = convertCurrentValueToBooleanArray(_plugin.settings.currentValue, _plugin.data.weekdays);
            $this.data('insmInputWeekdays', _plugin);
            _plugin.settings.onUpdate($this.insmInputWeekdays('getValue'));
            return $this;
        },
        view: function () {
            var $this = $(this);
            $this.empty();
            var _plugin = $this.data('insmInputWeekdays');
            var convertedCurrentValues = _plugin.data.convertedCurrentValue;


            for (var i = 0; i < convertedCurrentValues.length; i++) {

                var $weekDay = $("<div/>", {class: "weekDay"}).insmInput({
                    type: "boolean",
                    currentValue: convertedCurrentValues[i]
                }).insmInput('view');

                var label = $("<label/>", {
                    text: _plugin.data.weekdays[i]
                });

                $weekDay.append(label);
                $this.append($weekDay);
            }

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputWeekdays');
            var convertedCurrentValues = _plugin.data.convertedCurrentValue;
            $this.empty();
            for (var i = 0; i < convertedCurrentValues.length; i++) {

                var $weekDay = $("<div/>", {class: "weekDay"}).insmInput({
                    type: "boolean",
                    currentValue: convertedCurrentValues[i]
                }).insmInput('edit');

                var $checkbox = $weekDay.find("input[type='checkbox']");

                $checkbox.data("weekDayIndex", i);

                var label = $("<label/>", {
                    text: _plugin.data.weekdays[i]
                });

                $checkbox.on("change", function () {
                    var currentValue = _plugin.settings.currentValue;
                    if ($(this).is(":checked")) {
                        currentValue.push($(this).data("weekDayIndex"));
                    } else {
                        currentValue.splice(currentValue.indexOf($(this).data("weekDayIndex")), 1);
                    }
                    _plugin.settings.onUpdate($this.insmInputWeekdays('getValue'));
                });

                $weekDay.append(label);
                $this.append($weekDay);
            }

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputWeekdays');
            return _plugin.settings.currentValue;
        },
        validate: function () {
            //Todo
            var $this = $(this);
            var _plugin = $this.data('insmInputWeekdays');

            return true;

        },
        destroy: function () {

        }
    };

    function convertCurrentValueToBooleanArray(array, weekdays) {
        var converted = [];
        for (var i = 0; i < weekdays.length; i++) {
            if ($.inArray(i, array) !== -1) {
                converted[i] = true;
            } else {
                converted[i] = false;
            }
        }
        return converted;
    }

    $.fn.insmInputWeekdays = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputWeekdays');
        }
    };
})(jQuery);