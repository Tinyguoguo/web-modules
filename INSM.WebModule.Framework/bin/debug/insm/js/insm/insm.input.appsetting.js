/*
* INSM Input App Setting
* This file contain the INSM Input App Setting function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputAppSetting(settings);
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
            var _plugin = $this.data('insmInputAppSetting');

            _plugin = {
                settings: $.extend({
                    type: "AppSetting",
                    values: [],
                    selectValue: {},
                    currentValue: {},
                    header1: "Key",
                    header2: "Value",
                    header3: "Default",
                    header4: "",
                    header5: "",
                    multiSelect: false,
                    required: true,
                    onUpdate: function (currentValue) { }
                }, options)
            };

            // Parse Values
            // selectValue holds objts with equal values
            // currentValue holds objts with unequal values
            // sort selectValue , alphabetical order
            $.each(_plugin.settings.values, function (index, obj) {
                if (obj.Value !== obj.DefaultValue) {
                    _plugin.settings.currentValue[obj.Key] = obj;
                } else {
                    _plugin.settings.selectValue[obj.Key] = obj;
                }
            });

            if (typeof _plugin.settings.currentValue !== "object") {
                throw "Type Error";
            }

            $this.data('insmInputAppSetting', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputAppSetting');
            $this.empty();

            // Re-Parse Values
            $.each(_plugin.settings.currentValue, function (index, obj) {
                //if (obj.Value !== obj.DefaultValue) {
                    _plugin.settings.currentValue[obj.Key] = obj;
                //} else {
                //    _plugin.settings.selectValue[obj.Key] = obj;
                //    delete _plugin.settings.currentValue[obj.Key];
                //}
            });

            if (Object.keys(_plugin.settings.currentValue).length) {
                var myTable = $('<table/>').appendTo($this);

                // Build Header
                myTable.append(
                    $("<tr/>").append(
                        $("<th/>").text(_plugin.settings.header1)
                    ).append(
                        $("<th/>").text(_plugin.settings.header2)
                    ).append(
                        $("<th/>").text(_plugin.settings.header3)
                    ).append(
                        $("<th/>").text(_plugin.settings.header4)
                    )
                );

                $.each(_plugin.settings.currentValue, function (key, value) {
                    addRow(key, value, myTable);
                });
            }

            return $this;

            function addRow(key, value, table) {
                // Create row
                var myRow = $("<tr/>");

                var myKey = value.Key;
                var myValue = value.Value;
                var myDefaultValue = value.DefaultValue;

                var description = $('<a/>', {
                    'class': "button",
                    href: "#",
                    text: "?"
                });

                description.insmTooltip({
                    width: 400,
                    container: $('html'),
                    text: value.Name + " (" + value.Type + ")" + '<br />' + "Description: " + value.Description + '<br />' + "Section: " + value.Section + '<br />' + "Role: " + value.Role
                });
                

                myRow.append(
                    $("<td/>").text(myKey)
                ).append(
                    $("<td/>").text(myValue)
                ).append(
                    $("<td/>").text(myDefaultValue)
                ).append(
                    $("<td/>").html(description)
                );

                // Insert rows
                table.append(myRow);
            }
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputAppSetting');
            $this.empty();

            // Re-Parse Values
            $.each(_plugin.settings.currentValue, function (index, obj) {
                //if (obj.Value !== obj.DefaultValue) {
                    _plugin.settings.currentValue[obj.Key] = obj;
                //} else {
                //    _plugin.settings.selectValue[obj.Key] = obj;
                //    delete _plugin.settings.currentValue[obj.Key];
                //}
            });

            var myTable = $('<table/>').appendTo($this);

            // Build Header
            myTable.append(
                $("<tr/>").append(
                    $("<th/>").text(_plugin.settings.header1)
                ).append(
                    $("<th/>").text(_plugin.settings.header2)
                ).append(
                    $("<th/>").text(_plugin.settings.header3)
                ).append(
                    $("<th/>").text(_plugin.settings.header4)
                ).append(
                    $("<th/>").text(_plugin.settings.header5)
                )
            );

            // Add Inputfields
            addRow('add', '', {}, myTable);

            // Add Rows
            var nextId = 0;
            $.each(_plugin.settings.currentValue, function (key, value) {
                this.id = nextId;
                addRow(nextId, key, {}, myTable);
                nextId++;
            });
            _plugin.settings.onUpdate($this.insmInputAppSetting("getValue"));

            return $this;


            var inputAdded = false;
            function addRow(id, key, value, table) {
                // Create row
                var myRow = $("<tr/>").data("id", id);

                if (id !== 'add') {

                    var myKey = Object.keys(value).length ? _plugin.settings.selectValue[key].Key : _plugin.settings.currentValue[key].Key;
                    var myValue = null;
                    var myDefaultValue = null;

                    if (value.hasOwnProperty("Value") && value.hasOwnProperty("DefaultValue")) {
                        myValue = value.Value;
                        myDefaultValue = value.DefaultValue;
                    } else {
                        myValue = Object.keys(value).length ? _plugin.settings.selectValue[key].Value : _plugin.settings.currentValue[key].Value;
                        myDefaultValue = Object.keys(value).length ? _plugin.settings.selectValue[key].DefaultValue : _plugin.settings.currentValue[key].DefaultValue;
                    }

                    var description = $('<a/>', {
                        'class': "button",
                        href: "#",
                        text: "?"
                    });

                    description.insmTooltip({
                        width: 400,
                        container: $('html'),
                        text: Object.keys(value).length ? _plugin.settings.selectValue[key].Description : _plugin.settings.currentValue[key].Description
                    });

                    myRow.append(
                        $("<td/>").text(myKey)
                    ).append(
                        $("<td/>").text(myValue)
                    ).append(
                        $("<td/>").text(myDefaultValue)
                    ).append(
                        $("<td/>").append(description)
                    ).append(
                        $("<td/>").append(
                            $('<a/>', {
                                class: "button",
                                href: "#",
                                text: "Delete"
                            }).click(
                                function () {
                                    //disable all event listeners and remove row
                                    myRow.find("*").off().remove();

                                    // add to select value
                                    _plugin.settings.selectValue[key] = _plugin.settings.currentValue[key];

                                    // remove from current value
                                    delete _plugin.settings.currentValue[key];

                                    // add to dropdown (reset inputfields)
                                    addRow('add', '', {}, myTable);

                                    _plugin.settings.onUpdate($this.insmInputAppSetting("getValue"));
                                }
                            )
                        )
                    );

                    // Insert before inputFields
                    var row_count = table.find('tr').length;
                    $(table.find('tr')[row_count - 2]).after(myRow);

                    // add to current value
                    if (Object.keys(value).length) {
                        _plugin.settings.currentValue[key] = _plugin.settings.selectValue[key];

                        // remove from select value
                        delete _plugin.settings.selectValue[key];
                    }

                } else {

                    // Inputrow
                    if (inputAdded === true) {
                        myTable.find('tr:last').remove();
                    } else {
                        inputAdded = true;
                    }

                    var selectValues = [];
                    $.each(_plugin.settings.selectValue, function (key, value) {
                        selectValues.push(key);
                    });

                    var inputColumn4 = $("<div/>");

                    var inputColumn3 = $("<div/>").insmInput({
                        type: "string",
                        disabled: true
                    }).insmInput("edit");

                    var inputColumn2 = $("<div/>").insmInput({
                        type: "string",
                        disabled: true
                    }).insmInput("edit");

                    selectValues.sort(function (a, b) {
                        if (a.toLowerCase() > b.toLowerCase()) return 1;
                        else if (a.toLowerCase() < b.toLowerCase()) return -1;
                        else return 0
                    });

                    var availableValues = [];
                    $.each(selectValues, function (key, value) {
                        availableValues.push({
                            displayName: value
                        });
                    });

                    var inputColumn1 = $('<button />').text('Add key').click(function() {
                        $.insmCombobox({
                            availableValues: availableValues,
                            onSelect: function (setting) {
                                inputColumn1.text(setting.displayName);
                                var key = setting.displayName;

                                if (key !== null) {
                                    inputColumn1.data('key', key);

                                    inputColumn2 = $("<div/>").insmInput({
                                        type: _plugin.settings.selectValue[key].Type.toLowerCase() === "int" ? 'string' : _plugin.settings.selectValue[key].Type,
                                        currentValue: _plugin.settings.selectValue[key].Value !== null ? _plugin.settings.selectValue[key].Value : '',
                                        required: false
                                    }).insmInput("edit");

                                    inputColumn3 = $("<div/>").insmInput({
                                        type: _plugin.settings.selectValue[key].Type.toLowerCase() === "int" ? 'string' : _plugin.settings.selectValue[key].Type,
                                        currentValue: _plugin.settings.selectValue[key].DefaultValue !== null ? _plugin.settings.selectValue[key].DefaultValue : '',
                                        required: false
                                    }).insmInput("view");

                                    table.find('.input2').empty().append(inputColumn2);
                                    table.find('.input3').empty().append(inputColumn3);

                                    var description = $('<a/>', {
                                        'class': "button",
                                        href: "#",
                                        text: "?"
                                    });


                                    description.insmTooltip({
                                        width: 400,
                                        container: $('html'),
                                        text: _plugin.settings.selectValue[key].Description
                                    });

                                    table.find('.input4').empty().append(description);

                                } else {
                                    // Reset Inputfields
                                    addRow('add', '', {}, myTable);
                                }

                            }
                        });
                    });

                    var setButton = $('<a/>', {
                        class: "button",
                        href: "#",
                        text: "Set"
                    }).click(
                        function () {
                            // add row
                            if (typeof $(inputColumn1).data('key') !== 'undefined') {

                                if (inputColumn2.insmInput("getValue") !== inputColumn3.insmInput("getValue")) {
                                    // Update Value
                                    _plugin.settings.selectValue[$(inputColumn1).data('key')].Value = inputColumn2.insmInput("getValue");

                                    addRow(nextId, $(inputColumn1).data('key'), { "Value": inputColumn2.insmInput("getValue"), "DefaultValue": inputColumn3.insmInput("getValue") }, myTable);
                                    nextId++;
                                    _plugin.settings.onUpdate($this.insmInputAppSetting("getValue"));
                                }
                            };

                            // Reset Inputfields
                            addRow('add', '', {}, myTable);
                        }
                    );

                    myRow.append(
                        $("<td/>").append(inputColumn1).addClass("input1")
                    ).append(
                        $("<td/>").append(inputColumn2).addClass("input2")
                    ).append(
                        $("<td/>").append(inputColumn3).addClass("input3")
                    ).append(
                        $("<td/>").append(inputColumn4).addClass("input4")
                    ).append(
                        $("<td/>").append(setButton)
                    );

                    table.append(myRow);
                }
            }
        },
        cancel: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputAppSetting');
            $this.empty();
            // Reset currentValue and selectValue obj
            _plugin.settings.currentValue = {},
            _plugin.settings.selectValue = {},

            // Parse Values
            // selectValue holds objts with equal values
            // currentValue holds objts with unequal values         
            $.each(_plugin.settings.values, function (index, obj) {
                if (obj.Value !== obj.DefaultValue) {
                    _plugin.settings.currentValue[obj.Key] = obj;
                } else {
                    _plugin.settings.selectValue[obj.Key] = obj;
                }
            });

            // call View
            $this.insmInputAppSetting('view');

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputAppSetting');

            var result = _plugin.settings.currentValue;

            return result;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputAppSetting');
            throw new Error("Validation not implemented");
        },
        destroy: function () {

        }
    };

    $.fn.insmInputAppSetting = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputAppSetting');
        }
    };
})(jQuery);