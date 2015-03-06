/*
* INSM File Properties
* This file contain the INSM Input File Properties function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputFileProperties(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
*
* Authors:
* Tobias Rahm - Instoremedia AB
*/

; (function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputFileProperties');
            if (!_plugin) {
                _plugin = {
                    settings: $.extend(true, {
                        type: 'fileproperties',
                        defaultValue: false,
                        multiValue: false,
                        disabled: false,
                        value: {
                            name: '',
                            state: 'Available',
                            startDate: '',
                            endDate: ''
                        }
                    }, options),
                    data: {
                        type: null,
                        currentView: null
                    },
                    htmlElements: {
                        input: {
                            container: $('<div />'),
                            name: $('<div />'),
                            state: $('<div />'),
                            expiredState: $('<div />'),
                            startDate: $('<div />'),
                            endDate: $('<div />')
                        }
                    }
                };
                $this.data('insmInputFileProperties', _plugin);
            }
           
            if (!_plugin.settings.value.startDate) {
                _plugin.settings.value.startDate = '';
            }
            if (!_plugin.settings.value.endDate) {
                _plugin.settings.value.endDate = '';
            }
            
            _plugin.htmlElements.input.name.insmInput({
                type: 'string',
                value: _plugin.settings.value.name,
                required: true,
                maxChars: 20,
                validateFunction: function (value) {
                    var regex = /^[a-zA-Z0-9]+$/;
                    var val = value;
                    if (regex.test(val)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            });

            _plugin.htmlElements.input.state.insmInput({
                type: 'string',
                required: true,
                value: _plugin.settings.value.state,
                availableValues: ['Available', 'Unavailable']
            });

            _plugin.htmlElements.input.expiredState.insmInput({
                type: 'string',
                value: 'Expired',
                disabled: true,
                availableValues: ['Expired']
            });
            _plugin.htmlElements.input.expiredState.hide();

            _plugin.htmlElements.input.startDate.insmInput({
                type: 'date',
                value: _plugin.settings.value.startDate,
                onChange: function (value) {
                    var endDateValue = _plugin.htmlElements.input.endDate.insmInput('getValue');
                    _plugin.htmlElements.input.endDate.insmInput('destroy').insmInput({
                        type: 'date',
                        value: endDateValue,
                        onChange: function (value) {
                            var today = parseInt($.datepicker.formatDate('yymmdd', new Date()));
                            var chosen = parseInt($.datepicker.formatDate('yymmdd', new Date(value)));

                            // Do comparison
                            if (value !== "" && chosen < today) {
                                _plugin.htmlElements.input.state.hide();
                                _plugin.htmlElements.input.expiredState.show();
                            }
                            else {
                                _plugin.htmlElements.input.state.show();
                                _plugin.htmlElements.input.expiredState.hide();
                            }
                        }
                    }).insmInput('edit');
                }
            });

            _plugin.htmlElements.input.endDate.insmInput({
                type: 'date',
                value: _plugin.settings.value.endDate,
                onChange: function (value) {
                    var today = parseInt($.datepicker.formatDate('yymmdd', new Date()));
                    var chosen = parseInt($.datepicker.formatDate('yymmdd', new Date(value)));
                    
                    // Do comparison
                    if (value !== "" && chosen < today) {
                        _plugin.htmlElements.input.state.hide();
                        _plugin.htmlElements.input.expiredState.show();
                    }
                    else {
                        _plugin.htmlElements.input.state.show();
                        _plugin.htmlElements.input.expiredState.hide();
                    }
                }
            });

            $this.html(
                _plugin.htmlElements.input.container.append(
                    $('<table />').addClass('inputTable').append(
                        $('<tr />').append(
                            $('<th />').text('Name'),
                            $('<td />').append(_plugin.htmlElements.input.name)
                        ),
                        $('<tr />').append(
                            $('<th />').text('State'),
                            $('<td />').append(_plugin.htmlElements.input.state, _plugin.htmlElements.input.expiredState)
                        ),
                        $('<tr />').append(
                            $('<th />').text('Start Date'),
                            $('<td />').append(_plugin.htmlElements.input.startDate)
                        ),
                        $('<tr />').append(
                            $('<th />').text('End Date'),
                            $('<td />').append(_plugin.htmlElements.input.endDate)
                        )
                    ).addClass('vertical')
                )
            );

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFileProperties');
            
            _plugin.htmlElements.input.name.insmInput('view');
            _plugin.htmlElements.input.state.insmInput('view');
            _plugin.htmlElements.input.expiredState.insmInput('view');
            _plugin.htmlElements.input.startDate.insmInput('view');
            _plugin.htmlElements.input.endDate.insmInput('view');
            
            var today = $.datepicker.formatDate('yymmdd', new Date());
            var chosen = $.datepicker.formatDate('yymmdd', new Date(_plugin.settings.value.endDate));
            
            // Do comparison
            if (_plugin.settings.value.endDate !== "" && chosen < today) {
                _plugin.htmlElements.input.state.hide();
                _plugin.htmlElements.input.expiredState.show();
            }
            else {
                _plugin.htmlElements.input.state.show();
                _plugin.htmlElements.input.expiredState.hide();
            }

            _plugin.data.currentView = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFileProperties');

            _plugin.htmlElements.input.name.insmInput('edit');
            _plugin.htmlElements.input.state.insmInput('edit');
            _plugin.htmlElements.input.expiredState.insmInput('edit');
            _plugin.htmlElements.input.startDate.insmInput('edit');
            _plugin.htmlElements.input.endDate.insmInput('edit');

            var today = $.datepicker.formatDate('yymmdd', new Date());
            var chosen = $.datepicker.formatDate('yymmdd', new Date(_plugin.settings.value.endDate));

            // Do comparison
            if (_plugin.settings.value.endDate !== "" && chosen < today) {
                _plugin.htmlElements.input.state.hide();
                _plugin.htmlElements.input.expiredState.show();
            }
            else {
                _plugin.htmlElements.input.state.show();
                _plugin.htmlElements.input.expiredState.hide();
            }

            _plugin.data.currentView = 'edit';

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFileProperties');

            var fileProperties = {};

            fileProperties.name = _plugin.htmlElements.input.name.insmInput('getValue');
            fileProperties.state = _plugin.htmlElements.input.state.insmInput('getValue');
            fileProperties.startDate = _plugin.htmlElements.input.startDate.insmInput('getValue');
            fileProperties.endDate = _plugin.htmlElements.input.endDate.insmInput('getValue');

            return fileProperties;
        },
        setValue: function (value) {
            var $this = $(this);
            var _plugin = $this.data('insmInputFileProperties');
        },
        reset: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFileProperties');
            _plugin.htmlElements.input.name.insmInput('reset', _plugin.settings.value.name);
            _plugin.htmlElements.input.state.insmInput('reset', _plugin.settings.value.state);
            _plugin.htmlElements.input.startDate.insmInput('reset', _plugin.settings.value.startDate);
            _plugin.htmlElements.input.endDate.insmInput('reset', _plugin.settings.value.endDate);
            return $this;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFileProperties');

            var valid_name = _plugin.htmlElements.input.name.insmInput('validate');
            var valid_state = _plugin.htmlElements.input.state.insmInput('validate');
            var valid_startDate = _plugin.htmlElements.input.startDate.insmInput('validate');
            var valid_endDate = _plugin.htmlElements.input.endDate.insmInput('validate');

            if (valid_name && valid_state && valid_startDate && valid_endDate) {
                var startDate = _plugin.htmlElements.input.startDate.insmInput('getValue');
                var endDate = _plugin.htmlElements.input.endDate.insmInput('getValue');
                if (startDate <= endDate) {
                    return true;
                }
                // TODO: Also send explanation why they are invalid
                _plugin.htmlElements.input.startDate.insmInput('highlightInvalid');
                _plugin.htmlElements.input.endDate.insmInput('highlightInvalid');
                return false;
            }
            else {
                return false;
            }
        },
        empty: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputFileProperties');

            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputFileProperties');
            
            _plugin.settings.value = options.value;

            _plugin.htmlElements.input.name.insmInput('update', {
                value: options.value.name
            });

            _plugin.htmlElements.input.state.insmInput('update', {
                value: options.value.state
            });

            _plugin.htmlElements.input.startDate.insmInput('update', {
                value: options.value.startDate
            });

            _plugin.htmlElements.input.endDate.insmInput('update', {
                value: options.value.endDate
            });

            switch (_plugin.data.currentView) {
                case 'view':
                    $this.insmInputFileProperties('view');
                    break;
                case 'edit':
                    $this.insmInputFileProperties('edit');
                    break;
            }

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            $this.data('insmInputFileProperties', null);

            return $this;
        }
    };

    $.fn.convertDate = function (date) {
        return (
            date.constructor === Date ? date :
            date.constructor === Array ? new Date(date[0], date[1], date[2]) :
            date.constructor === Number ? new Date(date) :
            date.constructor === String ? new Date(date) :
            typeof date === "object" ? new Date(date.year, date.month, date.date) : NaN
        );
    };

    $.fn.compareDates = function (startDate, endDate) {
        /*
         * Comparing dates and will return:
         *
         * -1    : startDate < endDate
         *  0    : startDate = endDate
         *  1    : startDate > endDate
         *
         */
        return (
            isFinite(stateDate = $().convertDate(startDate).valueOf()) &&
            isFinite(endDate = $().convertDate(endDate).valueOf()) ? (startDate > endDate) - (startDate < endDate) : NaN
        );
    };

    $.fn.insmInputFileProperties = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputFileProperties');
        }
    };
})(jQuery);