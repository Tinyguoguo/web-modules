/*
 * INSM Asset
 * This file contain the INSM Input Boolean function.
 *
 * This file may only be used by Instoremedia AB or its customers and partners.
 *
 * Called by $('identifier').insmInputTimeInterval(settings);
 *
 * File dependencies:
 * jQuery 1.6.1
 * insmNotification
 *
 * Authors:
 * Tobias Rahm - Instoremedia AB
 */

;
(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTimeInterval');

            _plugin = {
                settings: $.extend({
                    type: "timeinterval",
                    currentValue: [],
                    required: true,
                    onUpdate: function(newValue) { }
                }, options),
                data: {
                    start: null,
                    end: null
                }
                
            };

            $this.data('insmInputTimeInterval', _plugin);

            if ($.isArray(_plugin.settings.currentValue)) {
                _plugin.settings.currentValue = {
                    start: '00:00',
                    end: '24:00'
                }
            }
            _plugin.settings.onUpdate($this.insmInputTimeInterval('getValue'));
            return $this;
        },
        view: function () {
            var $this = $(this);
            $this.empty();
            var _plugin = $this.data('insmInputTimeInterval');

            $this.append(_plugin.settings.currentValue.start + " - " + _plugin.settings.currentValue.end);

            return $this;
        },
        edit: function () {
            var $this = $(this);
            $this.empty();
            var _plugin = $this.data('insmInputTimeInterval');

            var $startTime = $('<span />').insmInput({
                type: "time",
                currentValue: _plugin.settings.currentValue.start,
                onUpdate: function (newValue) {
                    _plugin.settings.currentValue.start = newValue;
                    _plugin.settings.onUpdate($this.insmInputTimeInterval('getValue'))
                }
            }).insmInput('edit');
            _plugin.data.start = $startTime;

            var $endTime = $('<span />').insmInput({
                type: "time",
                currentValue: _plugin.settings.currentValue.end,
                onUpdate: function (newValue) {
                    _plugin.settings.currentValue.end = newValue;
                    _plugin.settings.onUpdate($this.insmInputTimeInterval('getValue'))
                }
            }).insmInput('edit');
            _plugin.data.end = $endTime;

            $startTime.on("change", function(){
                _plugin.settings.currentValue.start = $(this).val();
                _plugin.settings.onUpdate($this.insmInputTimeInterval('getValue'));
                $startTime.insmInput('validate');
            });

            $endTime.on("change", function(){
                _plugin.settings.currentValue.end = $(this).val();
                _plugin.settings.onUpdate($this.insmInputTimeInterval('getValue'));
                $endTime.insmInput('validate');
            });

            $this.append($startTime, $endTime);

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTimeInterval');

            return _plugin.settings.currentValue;
        },
        validate: function () {
            //Todo
            var $this = $(this);
            var _plugin = $this.data('insmInputTimeInterval');
            if (_plugin.data.end.insmInput('validate') && _plugin.data.start.insmInput('validate') && _plugin.settings.currentValue.end > _plugin.settings.currentValue.start) {
                $this.css({
                    border: '0px'
                });
                return true;
            } else {
                $this.css({
                    border: '1px solid #e67'
                });
                return false
            };
        },
        destroy: function () {

        }
    };

    function timeInput(event, inputField) {
        var input = inputField;
        var chars = input.val();
        var currentCharacters = input.val();
        // Allow only backspace, delete and tab
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9) {
            return true;
        }

        if (!((event.keyCode > 47 && event.keyCode < 58) || (event.keyCode > 95 && event.keyCode < 105))) {
            return false;
        }

        if(currentCharacters.length == 2) {
            input.val(currentCharacters +  ":"); 

        }
        return true;
    }

    $.fn.insmInputTimeInterval = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputTimeInterval');
        }
    };
})(jQuery);