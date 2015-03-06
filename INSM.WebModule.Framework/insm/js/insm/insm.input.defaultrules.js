/*
* INSM Asset
* This file contain the INSM Input Default Rules function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputDefaultRules(settings);
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
            var _plugin = $this.data('insmInputDefaultRules');


            if (options.rightHeader == 'Value') {
                throw new Exception("Right header can't have name 'Value'!");
            }
            _plugin = {
                settings: $.extend({
                    type: "Rules",
                    values: [],
                    currentValue: [],
                    leftHeader: 'Value',
                    rightHeader: 'Value',
                    leftValues: [],
                    leftValueObjects: {},
                    rightValues: null,
                    multiSelect: false,
                    required: true,
                    onUpdate: function (newValue) { }
                }, options),
                htmlElements: {
                    addButton: null,
                    rows: [],
                    data: []
                },
                data: {
                    rows: []
                }
            };

            

            if (!_plugin.settings.rightValues) {
                var tmp = _plugin.settings.leftValues;
                _plugin.settings.leftValues = [];
                $.each(tmp, function (index, value) {
                    _plugin.settings.leftValues.push(value.name);
                    _plugin.settings.leftValueObjects[value.name] = value;
                });
            }

            if (typeof _plugin.settings.currentValue === "string") {
                _plugin.settings.currentValue = [_plugin.settings.currentValue];
            }
            $.each(_plugin.settings.currentValue, function (index, value) {
                var operator = '';
                if (value.indexOf('!=') >= 0) {
                    operator = '!=';
                }
                else if (value.indexOf('=') >= 0) {
                    operator = '=';
                }
                else if (value.indexOf(' in ') >= 0) {
                    operator = ' in ';
                }
                var sides = value.split(operator);
                var left = sides[0].split('.');
                var right = sides[1].split('.');

                if (left.length == 1) {
                    left[1] = left[0];
                    left[0] = 'Value';
                }
                if (right.length == 1) {
                    right[1] = right[0];
                    right[0] = 'Value';
                }

                _plugin.data.rows.push({
                    operator: operator,
                    left: {
                        type: left[0],
                        value: left[1]
                    },
                    right: {
                        type: right[0],
                        value: right[1]
                    }
                });

                _plugin.htmlElements.rows.push(function() {
                    var rowObject;
                    rowObject = {
                        operator: $('<div />').insmInput({
                            type: 'string',
                            availableValues: ['=', '!=', ' in '],
                            value: operator,
                            required: true
                        }).insmInput('edit'),
                        left: {
                            type: $('<div />').insmInput({
                                type: 'string',
                                availableValues: ['Asset', 'Player', 'Value'],
                                value: left[0],
                                onChange: function (value) {
                                    if (value == 'Asset') {
                                        rowObject.left.value.insmInput('destroy').insmInput({
                                            type: 'string',
                                            availableValues: _plugin.settings.assetKeys,
                                            value: null,
                                            required: true
                                        }).insmInput('edit');
                                    }
                                    else if (value == 'Player') {
                                        rowObject.left.value.insmInput('destroy').insmInput({
                                            type: 'string',
                                            availableValues: _plugin.settings.playerKeys,
                                            value: null,
                                            required: true
                                        }).insmInput('edit');
                                    }
                                    else if(value == 'Value') {
                                        rowObject.left.value.insmInput('destroy').insmInput({
                                            type: 'string',
                                            value: null,
                                            required: true
                                        }).insmInput('edit');
                                    }
                                },
                                required: true
                            }).insmInput('edit'),
                            value: function () {
                                if (left[0] == 'Asset') {
                                    return $('<div />').insmInput({
                                        type: 'string',
                                        availableValues: _plugin.settings.assetKeys,
                                        value: left[1],
                                        required: true
                                    }).insmInput('edit');
                                }
                                else if (left[0] == 'Player') {
                                    return $('<div />').insmInput({
                                        type: 'string',
                                        availableValues: _plugin.settings.playerKeys,
                                        value: left[1],
                                        required: true
                                    }).insmInput('edit');
                                }
                                else if (left[0] == 'Value') {
                                    return $('<div />').insmInput({
                                        type: 'string',
                                        value: left[1],
                                        required: true
                                    }).insmInput('edit');
                                }
                            }()
                        },
                        right: {
                            type: $('<div />').insmInput({
                                type: 'string',
                                availableValues: ['Asset', 'Player', 'Value'],
                                value: right[0],
                                onChange: function (value) {
                                    if (value == 'Asset') {
                                        rowObject.right.value.insmInput('destroy').insmInput({
                                            type: 'string',
                                            availableValues: _plugin.settings.assetKeys,
                                            value: null,
                                            required: true
                                        }).insmInput('edit');
                                    }
                                    else if (value == 'Player') {
                                        rowObject.right.value.insmInput('destroy').insmInput({
                                            type: 'string',
                                            availableValues: _plugin.settings.playerKeys,
                                            value: null,
                                            required: true
                                        }).insmInput('edit');
                                    }
                                    else if (value == 'Value') {
                                        rowObject.right.value.insmInput('destroy').insmInput({
                                            type: 'string',
                                            value: null,
                                            required: true
                                        }).insmInput('edit');
                                    }
                                },
                                required: true
                            }).insmInput('edit'),
                            value: function () {
                                if (right[0] == 'Asset') {
                                    return $('<div />').insmInput({
                                        type: 'string',
                                        availableValues: _plugin.settings.assetKeys,
                                        value: right[1],
                                        required: true
                                    }).insmInput('edit');
                                }
                                else if (right[0] == 'Player') {
                                    return $('<div />').insmInput({
                                        type: 'string',
                                        availableValues: _plugin.settings.playerKeys,
                                        value: right[1],
                                        required: true
                                    }).insmInput('edit');
                                }
                                else if (right[0] == 'Value') {
                                    return $('<div />').insmInput({
                                        type: 'string',
                                        value: right[1],
                                        required: true
                                    }).insmInput('edit');
                                }
                            }()
                        }
                    }

                    return rowObject;
                }());
            });

            //var newCurrentValue = [];
            //$.each(_plugin.settings.currentValue, function (key, value) {
            //    // If != exist in string
            //    var comparator;
            //    if (value.indexOf("!=") !== -1) {
            //        comparator = "!=";
            //    } else {
            //        comparator = "=";
            //    }
            //    var rule = value.split(comparator);
            //    if (rule.length === 2) {
            //        var left = rule[0].split(".");
            //        var right = "";
            //        if (_plugin.settings.leftHeader !== 'Value') {
            //            right = rule[1].split(".");
            //        } else {
            //            right = rule[1];
            //        }

            //        if (left.length === 1 && _plugin.settings.leftHeader !== 'Value') {
            //            left.unshift(_plugin.settings.leftHeader);
            //        }
            //        if (right.length === 1) {
            //            right.unshift(_plugin.settings.rightHeader);
            //        }

            //        newCurrentValue.push({
            //            "id": key,
            //            "left": left,
            //            "right": right,
            //            "comparator": comparator
            //        });
            //    }
            //});

            //_plugin.settings.currentValue = newCurrentValue;
            $this.data('insmInputDefaultRules', _plugin);
            //_plugin.settings.onUpdate($this.insmInputDefaultRules("getValue"));

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDefaultRules');

            $this.empty();
            var rulesTable = $('<table/>').addClass('input-table-defaultrules');

            $.each(_plugin.settings.currentValue, function (index, value) {
                var operator = '';
                if (value.indexOf('!=') >= 0) {
                    operator = '!=';
                }
                else if (value.indexOf('=') >= 0) {
                    operator = '=';
                }
                else if (value.indexOf(' in ') >= 0) {
                    operator = ' in ';
                }
                var sides = value.split(operator);
                var left = sides[0].split('.');
                var right = sides[1].split('.');
                if (left.length == 1) {
                    left[1] = left[0];
                    left[0] = 'Value';
                }
                if (right.length == 1) {
                    right[1] = right[0];
                    right[0] = 'Value';
                }

                rulesTable.append(
                    $("<tr/>").append(
                        $("<td/>").text((left[0] == 'Value' ? '' : left[0] + '.') + left[1])
                    ).append(
                        $("<td/>").text(operator)
                    ).append(
                        $("<td/>").text((right[0] == 'Value' ? '' : right[0] + '.') + right[1])
                    )
                );
            });

            $this.append(rulesTable);            

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDefaultRules');
            $this.empty();

            var rulesTable = $('<table/>').addClass('input-table-defaultrules')

            $.each(_plugin.htmlElements.rows, function (index, rowObject) {
                var rowElement = $('<tr />');
                rulesTable.append(
                    rowElement.append(
                        $("<td/>").append(rowObject.left.type)
                    ).append(
                        $("<td/>").append(rowObject.left.value)
                    ).append(
                        $("<td/>").append(rowObject.operator)
                    ).append(
                        $("<td/>").append(rowObject.right.type)
                    ).append(
                        $("<td/>").append(rowObject.right.value)
                    ).append(
                        $("<td/>").append(
                            $('<button />').text('Remove').click(function () {
                                rowElement.remove();
                                $.each(_plugin.htmlElements.rows, function (index, row) {
                                    if (rowObject === row) {
                                        _plugin.htmlElements.rows.splice(index, 1);
                                    }
                                });
                            })
                        )
                    )
                );
            });

            rulesTable.append(
                $('<tr />').append(
                        $("<td/>")
                    ).append(
                        $("<td/>")
                    ).append(
                        $("<td/>")
                    ).append(
                        $("<td/>")
                    ).append(
                        $("<td/>")
                    ).append(
                        $("<td/>").append(
                            $('<button />').text('Add Rule').click(function () {
                                var rowObject;
                                rowObject = {
                                    operator: $('<div />').insmInput({
                                        type: 'string',
                                        availableValues: ['=', '!=', ' in '],
                                        value: null,
                                        required: true
                                    }).insmInput('edit'),
                                    left: {
                                        type: $('<div />').insmInput({
                                            type: 'string',
                                            availableValues: ['Asset', 'Player', 'Value'],
                                            value: null,
                                            onChange: function (value) {
                                                if (value == 'Asset') {
                                                    rowObject.left.value.insmInput('destroy').insmInput({
                                                        type: 'string',
                                                        availableValues: _plugin.settings.assetKeys,
                                                        value: null,
                                                        required: true
                                                    }).insmInput('edit');
                                                }
                                                else if (value == 'Player') {
                                                    rowObject.left.value.insmInput('destroy').insmInput({
                                                        type: 'string',
                                                        availableValues: _plugin.settings.playerKeys,
                                                        value: null,
                                                        required: true
                                                    }).insmInput('edit');
                                                }
                                                else if (value == 'Value') {
                                                    rowObject.left.value.insmInput('destroy').insmInput({
                                                        type: 'string',
                                                        value: null,
                                                        required: true
                                                    }).insmInput('edit');
                                                }
                                            },
                                            required: true
                                        }).insmInput('edit'),
                                        value: $('<div />')
                                    },
                                    right: {
                                        type: $('<div />').insmInput({
                                            type: 'string',
                                            availableValues: ['Asset', 'Player', 'Value'],
                                            value: null,
                                            onChange: function (value) {
                                                if (value == 'Asset') {
                                                    rowObject.right.value.insmInput('destroy').insmInput({
                                                        type: 'string',
                                                        availableValues: _plugin.settings.assetKeys,
                                                        value: null,
                                                        required: true
                                                    }).insmInput('edit');
                                                }
                                                else if (value == 'Player') {
                                                    rowObject.right.value.insmInput('destroy').insmInput({
                                                        type: 'string',
                                                        availableValues: _plugin.settings.playerKeys,
                                                        value: null,
                                                        required: true
                                                    }).insmInput('edit');
                                                }
                                                else if (value == 'Value') {
                                                    rowObject.right.value.insmInput('destroy').insmInput({
                                                        type: 'string',
                                                        value: null,
                                                        required: true
                                                    }).insmInput('edit');
                                                }
                                            },
                                            required: true
                                        }).insmInput('edit'),
                                        value: $('<div />')
                                    }
                                };

                                _plugin.htmlElements.rows.push(rowObject);
                                var index = _plugin.htmlElements.rows.length - 1;

                                var rowElement = $('<tr />');
                                rulesTable.append(
                                    rowElement.append(
                                        $("<td/>").append(rowObject.left.type)
                                    ).append(
                                        $("<td/>").append(rowObject.left.value)
                                    ).append(
                                        $("<td/>").append(rowObject.operator)
                                    ).append(
                                        $("<td/>").append(rowObject.right.type)
                                    ).append(
                                        $("<td/>").append(rowObject.right.value)
                                    ).append(
                                        $("<td/>").append(
                                            $('<button />').text('Remove').click(function () {
                                                rowElement.remove();
                                                $.each(_plugin.htmlElements.rows, function (index, row) {
                                                    if (rowObject === row) {
                                                        _plugin.htmlElements.rows.splice(index, 1);
                                                    }
                                                });
                                            })
                                        )
                                    )
                                );

                                
                                $(this).parent().parent().before(rowElement);
                            })
                        )
                    )
            );

            $this.append(rulesTable);

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDefaultRules');
            
            var returnValue = [];
            $.each(_plugin.htmlElements.rows, function (index, row) {
                var ruleString = '';

                var leftType = row.left.type.insmInput('getValue');
                if (leftType !== 'Value') {
                    ruleString += row.left.type.insmInput('getValue') + '.';
                    ruleString += row.left.value.insmInput('getValue');
                }
                else {
                    ruleString += row.left.value.insmInput('getValue');
                }
                ruleString += row.operator.insmInput('getValue');

                var rightType = row.right.type.insmInput('getValue');
                if (rightType !== 'Value') {
                    ruleString += row.right.type.insmInput('getValue') + '.';
                    ruleString += row.right.value.insmInput('getValue');
                }
                else {
                    ruleString += row.right.value.insmInput('getValue');
                }

                returnValue.push(ruleString);
            });

            return returnValue;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDefaultRules');

            var valid = true;
            $.each(_plugin.htmlElements.rows, function (index, row) {
                if (!row.left.type.insmInput('validate')) {
                    valid = false;
                }
                if (!row.left.value.insmInput('validate')) {
                    valid = false;
                }
                if (!row.operator.insmInput('validate')) {
                    valid = false;
                }
                if (!row.right.type.insmInput('validate')) {
                    valid = false;
                }
                if (!row.right.value.insmInput('validate')) {
                    valid = false;
                }
            });

            return valid;
        },
        destroy: function () {

        }
    };

    $.fn.insmInputDefaultRules = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputDefaultRules');
        }
    };
})(jQuery);