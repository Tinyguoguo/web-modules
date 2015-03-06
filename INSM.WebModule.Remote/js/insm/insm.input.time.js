/*
 * INSM Asset
 * This file contain the INSM Input Boolean function.
 *
 * This file may only be used by Instoremedia AB or its customers and partners.
 *
 * Called by $('identifier').insmInputTime(settings);
 *
 * File dependencies:
 * jQuery 1.6.1
 * insmNotification
 *
 * Authors:
 * Tobias Rahm - Instoremedia AB
 * Koji Wakayama - Creuna AB
 */

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTime');

            _plugin = {
                settings: $.extend({
                    type: "time",
                    currentValue: [],
                    required: true,
                    onUpdate: function(newValue) { }
                }, options),
                data: {
                    element: null
                }
            };

            $this.data('insmInputTime', _plugin);

            if (typeof _plugin.settings.currentValue !== 'string') {
                _plugin.settings.currentValue = '00:00';
                _plugin.settings.onUpdate($this.insmInputTime('getValue'));

            }

            return $this;
        },
        view: function () {
            var $this = $(this);
            $this.empty();
            var _plugin = $this.data('insmInputTime');

            $this.append(_plugin.settings.currentValue);

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTime');

            $this.empty();

            var timeInput = $("<input/>", {
                type: "text",
                class: "timeInput",
                value: _plugin.settings.currentValue
            }).keyup(function (event) {

                // Format Data
                var input = $(event.currentTarget);
                var currentCharacters = input.val();

                // Update Current Value
                _plugin.settings.currentValue = currentCharacters;
                _plugin.settings.onUpdate($this.insmInputTime('getValue'));

            });
            
            $this.append(timeInput);

            _plugin.data.element = timeInput;

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTime');

            return _plugin.settings.currentValue;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTime');

            if (_plugin.settings.required && _plugin.settings.currentValue.length === 0) {
                _plugin.data.element.css({
                    border: '1px solid #e67'
                });
                return false;
            } else {
                if (_plugin.settings.currentValue.length > 5) {
                    _plugin.data.element.css({
                        border: '1px solid #e67'
                    });
                    return false;
                } else if (_plugin.settings.currentValue.length === 5) {
                    var firstTwoChars = parseInt(_plugin.settings.currentValue.substr(0, 1))*10 + parseInt(_plugin.settings.currentValue.substr(1, 1));
                    var dividerChar = _plugin.settings.currentValue.substr(2, 1);
                    var lastTwoChars = parseInt(_plugin.settings.currentValue.substr(3, 1)) * 10 + parseInt(_plugin.settings.currentValue.substr(4, 1));
                    
                    // 24:00 is fine but not 24:17
                    if (typeof firstTwoChars === 'number' && firstTwoChars == 24 && lastTwoChars !== 0) {
                        _plugin.data.element.css({
                            border: '1px solid #e67'
                        });
                        return false;
                    }

                    if (typeof firstTwoChars === 'number' && firstTwoChars >= 0 && firstTwoChars <= 24 && dividerChar === ':' && typeof lastTwoChars === 'number' && lastTwoChars >= 0 && lastTwoChars <= 59) {
                        _plugin.data.element.css({
                            border: '1px solid #000'
                        });

                        if (firstTwoChars < 10) {
                            firstTwoChars = '0' + firstTwoChars.toString();
                        }
                        if (lastTwoChars < 10) {
                            lastTwoChars = '0' + lastTwoChars.toString();
                        }

                        _plugin.data.element.val(firstTwoChars + dividerChar + lastTwoChars);
                        _plugin.settings.currentValue = firstTwoChars + dividerChar + lastTwoChars;
                        _plugin.settings.onUpdate($this.insmInputTime('getValue'));

                        return true;
                    } else {
                        _plugin.data.element.css({
                            border: '1px solid #e67'
                        });
                        return false;
                    }
                } else if (_plugin.settings.currentValue.length === 4) {
                    var firstTwoChars = parseInt(_plugin.settings.currentValue.substr(0, 1)) * 10 + parseInt(_plugin.settings.currentValue.substr(1, 1));
                    var dividerChar = ':';
                    var lastTwoChars = parseInt(_plugin.settings.currentValue.substr(2, 1)) * 10 + parseInt(_plugin.settings.currentValue.substr(3, 1));

                    // 24:00 is fine but not 24:17
                    if (typeof firstTwoChars === 'number' && firstTwoChars == 24 && lastTwoChars !== 0) {
                        _plugin.data.element.css({
                            border: '1px solid #e67'
                        });
                        return false;
                    }
                    if (typeof firstTwoChars === 'number' && firstTwoChars >= 0 && firstTwoChars <= 24 && dividerChar === ':' && typeof lastTwoChars === 'number' && lastTwoChars >= 0 && lastTwoChars <= 59) {
                        _plugin.data.element.css({
                            border: '1px solid #000'
                        });

                        if (firstTwoChars < 10) {
                            firstTwoChars = '0' + firstTwoChars.toString();
                        }
                        if (lastTwoChars < 10) {
                            lastTwoChars = '0' + lastTwoChars.toString();
                        }

                        _plugin.data.element.val(firstTwoChars + dividerChar + lastTwoChars);
                        _plugin.settings.currentValue = firstTwoChars + dividerChar + lastTwoChars;
                        _plugin.settings.onUpdate($this.insmInputTime('getValue'));
                        return true;
                    } else {
                        _plugin.data.element.css({
                            border: '1px solid #e67'
                        });
                        return false;
                    }
                } else if (_plugin.settings.currentValue.length === 2) {
                    var firstTwoChars = parseInt(_plugin.settings.currentValue.substr(0, 1)) * 10 + parseInt(_plugin.settings.currentValue.substr(1, 1));
                    var dividerChar = ':';
                    var lastTwoChars = 00;

                    if (typeof firstTwoChars === 'number' && firstTwoChars >= 0 && firstTwoChars <= 24 && dividerChar === ':' && typeof lastTwoChars === 'number' && lastTwoChars >= 0 && lastTwoChars <= 59) {
                        _plugin.data.element.css({
                            border: '1px solid #000'
                        });

                        if (firstTwoChars < 10) {
                            firstTwoChars = '0' + firstTwoChars.toString();
                        }
                        if (lastTwoChars < 10) {
                            lastTwoChars = '0' + lastTwoChars.toString();
                        }

                        _plugin.data.element.val(firstTwoChars + dividerChar + lastTwoChars);
                        _plugin.settings.currentValue = firstTwoChars + dividerChar + lastTwoChars;
                        _plugin.settings.onUpdate($this.insmInputTime('getValue'));
                        return true;
                    } else {
                        _plugin.data.element.css({
                            border: '1px solid #e67'
                        });
                        return false;
                    }
                }
            }
            _plugin.data.element.css({
                border: '1px solid #e67'
            });
            return false;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputTime', null);

            return $this;
        }
    };

    $.fn.insmInputTime = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputTime');
        }
    };
})(jQuery);