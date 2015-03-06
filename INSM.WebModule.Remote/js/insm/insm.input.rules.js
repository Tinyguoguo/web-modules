/*
* INSM Asset
* This file contain the INSM Input Rules function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputRules(settings);
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
            var _plugin = $this.data('insmInputRules');


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
                    addButton: null
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
            var newCurrentValue = [];
            $.each(_plugin.settings.currentValue, function (key, value) {
                // If != exist in string
                var comparator;
                if (value.indexOf("!=") !== -1) {
                    comparator = "!=";
                }
                else {
                    comparator = "=";
                }
                var rule = value.split(comparator);
                if (rule.length === 2) {
                    var left = rule[0].split(".");
                    var right = "";
                    if (_plugin.settings.leftHeader !== 'Value') {
                        right = rule[1].split(".");
                    } else {
                        right = rule[1];
                    }

                    if (left.length === 1 && _plugin.settings.leftHeader !== 'Value') {
                        left.unshift(_plugin.settings.leftHeader);
                    }
                    if (right.length === 1) {
                        right.unshift(_plugin.settings.rightHeader);
                    }

                    newCurrentValue.push({
                        "id": key,
                        "left": left,
                        "right": right,
                        "comparator": comparator
                    });
                }
            });

            _plugin.settings.currentValue = newCurrentValue;
            $this.data('insmInputRules', _plugin);
            //_plugin.settings.onUpdate($this.insmInputRules("getValue"));

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputRules');
            $this.empty();

            var myTable = $('<table/>').addClass('input-table-rules').appendTo($this);

            // Build Header
            myTable.append(
                $("<tr/>").append(
                    $("<th/>").text(_plugin.settings.leftHeader)
                ).append(
                    $("<th/>")
                ).append(
                    $("<th/>").text(_plugin.settings.rightHeader)
                )
            );

            // Add Rows
            $.each(_plugin.settings.currentValue, function (key, value) {
                var left = value.left;
                var right = value.right;
                var comparator = value.comparator;
                var valueLeft = left[left.length - 1];
                var valueRight = right[right.length - 1];

                myTable.append(
                    $("<tr/>").append(
                        $("<td/>").text(valueLeft)
                    ).append(
                        $("<td/>").text(comparator)
                    ).append(
                        $("<td/>").text(valueRight)
                    )
                );
            });

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputRules');
            $this.empty();
            
            var myTable = $('<table/>').addClass('input-table-rules').appendTo($this);

            // Build Header
            myTable.append(
                $("<tr/>").append(
                    $("<th/>").text(_plugin.settings.leftHeader)
                ).append(
                    $("<th/>")
                ).append(
                    $("<th/>").text(_plugin.settings.rightHeader)
                ).append(
                    $("<th/>")
                )
            );
            // Add Inputfields
            addRow('add', {
                left: [],
                right: [],
                comparator: "="
            });

            // Add Rows
            var lastId;
            $.each(_plugin.settings.currentValue, function (key, value) {
                addRow(key, value);
                lastId = key;
            });

            return $this;

            function addRow(id, value) {
                var left = value.left;
                var right = value.right;
                var comparator = value.comparator;

                var valueLeft = left[left.length - 1];
                var valueRight = right[right.length - 1];

                var myRow = $("<tr/>").data("id", id);

                if (id !== 'add') {
                    // Insert before inputFields
                    var row_count = myTable.find('tr').length;
                    $(myTable.find('tr')[row_count - 2]).after(
                        myRow.append(
                            $("<td/>").append(
                                $("<div/>").insmInput({
                                    type: "string",
                                    values: _plugin.settings.leftValues,
                                    currentValue: valueLeft,
                                    multiSelect: false,
                                    required: true
                                }).insmInput("view")
                            )
                        ).append(
                            $("<td/>").append(
                                $("<div/>").append(comparator)
                            )
                        ).append(
                            $("<td/>").append(
                                function () {
                                    if (_plugin.settings.rightValues) {
                                        return $("<div/>").insmInput({
                                            type: "string",
                                            values: _plugin.settings.rightValues,
                                            currentValue: valueRight,
                                            multiSelect: false,
                                            required: true
                                        }).insmInput("view");
                                    } else {
                                        var leftValueObject = _plugin.settings.leftValueObjects[valueLeft];
                                        if (!leftValueObject) { //change in Marketing Tags.
                                            leftValueObject = {
                                                type: "string",
                                                values: [valueRight],
                                                multiSelect: false,
                                                required: true
                                            }
                                        }
                                        leftValueObject.currentValue = valueRight;
                                        return $("<div/>").insmInput(leftValueObject).insmInput("view");
                                    }
                                }
                            )
                        ).append(
                            $("<td/>").append(
                                $('<a/>', {
                                    'class': "button",
                                    onClick: 'return false',
                                    text: "Delete"
                                }).click(
                                    function () {
                                        // disable all event listeners and remove row
                                        myRow.find("*").off().remove();
                                        // update current value
                                        var i = _plugin.settings.currentValue.length;
                                        while (i--) {
                                            if (_plugin.settings.currentValue[i].id === myRow.data("id")) {
                                                // Remove element
                                                _plugin.settings.currentValue.splice([i], 1);
                                            }
                                        }
                                        _plugin.settings.onUpdate($this.insmInputRules("getValue"));
                                    }
                                )
                            )
                        )
                    );
                } else { // add
                    var inputLeft = $("<div/>").insmInput({
                        type: "string",
                        values: _plugin.settings.leftValues,
                        multiSelect: false,
                        required: true,
                        onUpdate: function (value) {
                            if (!_plugin.settings.rightValues && value) {
                                var r = _plugin.settings.leftValueObjects[value];
                                var input = {
                                    currentValue: [],
                                    multiSelect: r.multiSelect,
                                    name: r.name,
                                    required: true,
                                    type: r.type,
                                    values: r.values
                                }
                                inputRight.insmInput('destroy').insmInput(input).insmInput("edit");
                            }
                            else if(!_plugin.settings.rightValues) {
                                inputRight.insmInput('destroy').empty();
                            }
                        }
                    }).insmInput("edit");

                    var inputRight = $("<div/>");

                    if (!_plugin.settings.rightValues) {
                         inputRight.empty();
                    } else {
                        inputRight.insmInput({
                            type: "string",
                            values: _plugin.settings.rightValues,
                            currentValue: valueRight,
                            multiSelect: false,
                            required: true
                        }).insmInput("edit");
                    }

                    // Add
                    var comparatorButton = $('<a/>', {
                        'class': "button",
                        onClick: 'return false',
                        text: comparator
                    }).click(function (event) {
                        if ($(event.currentTarget).text() !== "!=") {
                            $(this).text("!=");
                        }
                        else {
                            $(this).text("=");
                        }
                    });

                    myTable.append(
                        myRow.append($("<td/>").append(inputLeft)).append($("<td/>").append(comparatorButton)).append($("<td/>").append(inputRight)).append(
                            $("<td/>").append(
                                _plugin.htmlElements.addButton = $('<a/>', {
                                    'class': "button",
                                    onClick: 'return false',
                                    text: "Add"
                                }).click(
                                    function () {
                                        if (!inputLeft.insmInput('validate') || !inputRight.insmInput('validate')) {
                                            return;
                                        }

                                        // add row
                                        addRow(++lastId, {
                                            left: [inputLeft.insmInput('getValue')],
                                            right: [inputRight.insmInput('getValue')],
                                            comparator: comparatorButton.text()
                                        });
                                        // update current value
                                        _plugin.settings.currentValue.push({
                                            id: lastId,
                                            left: [_plugin.settings.leftHeader, inputLeft.insmInput('getValue')],
                                            right: _plugin.settings.rightHeader === 'Value' ? [inputRight.insmInput('getValue')] : [_plugin.settings.rightHeader, inputRight.insmInput('getValue')],
                                            comparator: comparatorButton.text()
                                        });
                                        _plugin.settings.onUpdate($this.insmInputRules("getValue"));

                                        // empty input fields
                                        inputLeft.insmInput('empty');
                                        if (!_plugin.settings.rightValues) {
                                            inputRight.insmInput('destroy').empty();
                                        } else {
                                            inputRight.insmInput('empty');
                                        }

                                        // reset comparator button
                                        comparatorButton.text("=");
                                    }
                                )
                            )
                        )
                    );
                }
            }

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputRules');
            
            var returnValue = [];
            $.each(_plugin.settings.currentValue, function (key, value) {
                var returnString = "";
                if (typeof value.left[0] !== "undefined") {
                    returnString = returnString + value.left[0];
                }
                if (typeof value.left[1] !== "undefined") {
                    returnString = returnString + '.' + value.left[1];
                }
                returnString = returnString + value.comparator;
                if (typeof value.right[0] !== "undefined" && value.right[0] !== 'Value') {
                    returnString = returnString + value.right[0];
                }
                if (typeof value.right[1] !== "undefined") {
                    if (value.right[0] === "" || value.right[0] === "Value") {
                        returnString = returnString + value.right[1];
                    }
                    else {
                        returnString = returnString + '.' + value.right[1];
                    }
                }
                returnValue.push(returnString);
            });
            return returnValue;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputRules');

            if (_plugin.settings.required === true && $this.insmInputRules("getValue").length === 0) {
                _plugin.htmlElements.addButton.css({
                    borderColor: 'red'
                });
                return false;
            } else {
                return true;
            }
        },
        destroy: function () {

        }
    };

    $.fn.insmInputRules = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputRules');
        }
    };
})(jQuery);