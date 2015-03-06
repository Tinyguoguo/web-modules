/*
* INSM Asset
* This file contain the INSM Input Rule Set function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputRuleset(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
*
* Authors:
* Tobias Rahm - Instoremedia AB
* Koji Wakayama - Creuna AB
*/

; (function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputRuleset');
            if (options.rightHeader == 'Value') {
                throw new Exception("Right header can't have name 'Value'!");
            }
            _plugin = {
                settings: $.extend({
                    type: "Rules",
                    values: [],
                    currentValue: [],
                    ruleHeader: null,
                    ruleKeys: [],
                    multiSelect: false,
                    required: true,
                    onUpdate: function (newValue) { }
                }, options),
                htmlElements: {
                    addButton: null
                }
            };

            if (!_plugin.settings.ruleHeader) {
                throw new Error('No rule header');
            }
            if (!_plugin.settings.ruleKeys || _plugin.settings.ruleKeys.length == 0) {
                throw new Error('No rule keys');
            }

            if (typeof _plugin.settings.currentValue === "string") {
                _plugin.settings.currentValue = [_plugin.settings.currentValue];
            }

            $this.data('insmInputRuleset', _plugin);
            
            var rawValues = $.extend({}, _plugin.settings.currentValue);
            _plugin.settings.currentValue = [];
            $.each(rawValues, function (index, value) {
                $this.insmInputRuleset('addValue', {
                    value: value
                });
            });

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputRuleset');
            var tables = [];
            $.each(_plugin.settings.currentValue, function (index, value) {
                var table = $('<table />').append(
                    $('<tr />').append(
                        $('<th />').text('Name'),
                        $('<td />').html(value.name.insmInput('view'))
                    ),
                    $('<tr />').append(
                        $('<th />').text('Weight'),
                        $('<td />').html(value.weight.insmInput('view'))
                    ),
                    $('<tr />').append(
                        $('<th />').text('Rules'),
                        $('<td />').html(value.rules.insmInput('view'))
                    )
                );

                tables.push(table);
            });

            $this.empty();
            $.each(tables, function (index, table) {
                $this.append(table);
            });
            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputRuleset');
            var tables = [];

            $.each(_plugin.settings.currentValue, function (index, value) {
                var valueContainer = $('<div />');
                var table = $('<table />').append(
                    $('<tr />').append(
                        $('<th />').text('Name'),
                        $('<td />').html(value.name.insmInput('edit'))
                    ),
                    $('<tr />').append(
                        $('<th />').text('Weight'),
                        $('<td />').html(value.weight.insmInput('edit'))
                    ),
                    $('<tr />').append(
                        $('<th />').text('Rules'),
                        $('<td />').html(value.rules.insmInput('edit'))
                    )
                );

                valueContainer.append(table);

                if (_plugin.settings.multiSelect) {
                    var removeButton = $('<a />', {
                        text: 'Remove',
                        'class': 'button remove-ruleset'
                    }).click(function () {
                        _plugin.settings.currentValue.splice(index, 1);
                        $this.insmInputRuleset('edit');
                        $this.insmInputRuleset('updateRelativeValue');
                        _plugin.settings.onUpdate($this.insmInputRuleset('getValue'));
                    });

                    valueContainer.append(removeButton);
                }

                tables.push(valueContainer);
            });

            $this.empty();
            $.each(tables, function (index, table) {
                $this.append(table);
            });

            
            if (_plugin.settings.multiSelect) {
                _plugin.htmlElements.addButton = $('<a />', {
                    text: 'Add',
                    'class': 'button add-ruleset'
                }).click(function () {
                    $this.insmInputRuleset('addValue');
                    $this.insmInputRuleset('edit');
                });

                $this.append(_plugin.htmlElements.addButton);
            }

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputRuleset');

            var tables = [];
            $.each(_plugin.settings.currentValue, function (index, value) {
                if (value !== null) {
                    var table = {
                        name: value.name.insmInput('getValue'),
                        weight: value.weight.insmInput('getValue'),
                        rules: value.rules.insmInput('getValue')
                    };

                    tables.push(table);
                }
            });
            return tables;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputRuleset');

            if (_plugin.settings.required === true && $this.insmInputRuleset("getValue").length === 0) {
                _plugin.htmlElements.addButton.css({
                    borderColor: 'red'
                });
                return false;
            } else {
                var validateResult = true;
                $.each(_plugin.settings.currentValue, function (index, value) {
                    if (value !== null) {
                        if (!value.name.insmInput('validate')) {
                            validateResult = false;
                        }
                        if (!value.weight.insmInput('validate')) {
                            validateResult = false;
                        }
                        if (!value.rules.insmInput('validate')) {
                            validateResult = false;
                        }
                    }
                });
                return validateResult;
            }
        },
        updateRelativeValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputRuleset');

            var totalValue = 0;
            var totalItems = 0;
            $.each(_plugin.settings.currentValue, function (index, value) {
                totalValue += value.weight.insmInput('getValue');
                totalItems++;
            });

            $.each(_plugin.settings.currentValue, function (index, value) {
                var percentage = 0;
                if (totalValue > 0) {
                    percentage = Math.round(value.weight.insmInputSlider('getValue') / totalValue * 10000)/100;
                }

                value.weight.insmInputSlider('updateRelativeValue', {
                    value: percentage
                });
            });

            return $this;
        },
        addValue: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputRuleset');

            if (!options || !options.value) {
                options = {
                    value: null
                };
            }

            var value = $.extend({
                name: '',
                weight: 1,
                rules: []
            }, options.value);

            value.name = $('<div />').insmInput({
                type: "string",
                currentValue: value.name,
                onUpdate: function (newValue) {
                    _plugin.settings.onUpdate($this.insmInputRuleset('getValue'));
                }
            });
            value.weight = $('<div />').insmInput({
                type: "slider",
                relative: true,
                currentValue: value.weight,
                onUpdate: function (newValue) {
                    _plugin.settings.onUpdate($this.insmInputRuleset('getValue'));
                    $this.insmInputRuleset('updateRelativeValue');
                },
                range: {
                    min: 1,
                    max: 100
                }
            });
            value.rules = $('<div />').insmInput({
                type: "Rules",
                leftHeader: 'Asset',
                leftValues: _plugin.settings.ruleKeys,
                currentValue: value.rules,
                multiSelect: true,
                required: true,
                onUpdate: function (newValue) {
                    _plugin.settings.onUpdate($this.insmInputRuleset('getValue'));
                }
            });


            _plugin.settings.currentValue.push(value);
            _plugin.settings.onUpdate($this.insmInputRuleset('getValue'));
            $this.insmInputRuleset('updateRelativeValue');

            return $this;
        },
        destroy: function () {

        }
    };

    $.fn.insmInputRuleset = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputRuleset');
        }
    };
})(jQuery);