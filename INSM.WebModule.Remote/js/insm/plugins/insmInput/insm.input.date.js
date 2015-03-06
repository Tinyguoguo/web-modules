/*
* INSM Asset
* This file contain the INSM Input function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputDate(settings);
*
* File dependencies:
* jQuery 1.6.1
* jQuery UI 1.10.3
* insmNotification
*
* Authors:
* Markus Bergh - Creuna AB
*/
; (function($) {
    var DATE_FORMAT = 'yy-mm-dd';
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDate');

            if (!_plugin) {
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
                        input: null,
                        clear: $('<a />').addClass('clearDate')
                    }
                }

                $this.data('insmInputDate', _plugin);
            }
            
            

            return $this.addClass('inputDate');
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDate');

            $this.html(
                _plugin.settings.value
            );

            _plugin.data.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDate');

            _plugin.htmlElements.clear.detach();

            // Instance of datepicker
            var $date = $("<input/>", {
                type: "text",
                readonly: "readonly"
            });
            
            _plugin.data.type = 'date';
            _plugin.htmlElements.input = $date;
            
            $date.datepicker({
                dateFormat: DATE_FORMAT,
                onSelect: function () {
                    var date = this.value;
                    _plugin.settings.onChange(date);

                    // Set date
                    _plugin.settings.value = date;
                },
                maxDate: _plugin.settings.maxDate
            }).change(function() {
                _plugin.settings.value = this.value;
            });

            // Set current value
            if (_plugin.settings.value) {
                $date.datepicker("setDate", _plugin.settings.value);
            }

            $this.empty();
            _plugin.htmlElements.clear = $('<a />').addClass('clearDate').click(function () {
                $this.insmInputDate('empty');
                _plugin.settings.onChange('');
            });
            $this.append(
                $date,
                _plugin.htmlElements.clear
            );

            _plugin.data.currentView = 'edit';
          
            return $this;
        },
        highlightInvalid: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDate');

            _plugin.htmlElements.input.insmHighlight({
                type: 'error'
            });

            return $this;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDate');
            
            if (_plugin.settings.value === "" && !_plugin.settings.required) {
                return true;
            }

            if (!_plugin.settings.value.match(/^\d{4}\-\d{2}\-\d{2}$/)) {
                // TODO: Send explanation why it is invalid
                $this.insmInputDate('highlightInvalid');
                return false;
            }

            return true;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDate');
            return _plugin.settings.value;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDate');
            
            if (_plugin.settings.value !== options.value) {
                _plugin.settings.value = options.value;

                if (!_plugin.settings.value) {
                    _plugin.settings.value = '';
                }

                switch (_plugin.data.currentView) {
                    case 'view':
                        $this.insmInputDate('view');
                        break;
                    case 'edit':
                        $this.insmInputDate('edit');
                        break;
                    default:
                        break;
                }

                if (_plugin.data.type) {
                    switch (_plugin.data.currentView) {
                        case 'view':
                            $this.parent().insmHighlight();
                            break;
                        case 'edit':
                            _plugin.htmlElements.input.insmHighlight();
                            break;
                    }
                }
            }
            
            return $this;
        },
        reset: function(value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDate');

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
            var _plugin = $this.data('insmInputDate');
            _plugin.htmlElements.input.val('');
            _plugin.settings.value = '';
            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputDate', null);
            return $this;
        }
    }

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