/*
* INSM Asset
* This file contain the INSM Input Dataset function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputDataset(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
*
* Authors:
* Tobias Rahm - Instoremedia AB
* Koji Wakayama - Creuna AB
*/

;(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputDataset');

            _plugin = {
                settings: $.extend({
                    type: "Dataset",
                    values: [],
                    currentValue: {},
                    header1: "Name",
                    header2: "Type",
                    header3: "Value",
                    header4: "",
                    multiSelect: false,
                    required: true,
                    onUpdate: function(currentValue){}
                }, options)
            };

            if(typeof _plugin.settings.currentValue !== "object"){
                throw "Type Error";
            }

            $this.data('insmInputDataset', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDataset');
            $this.empty();

            var myTable = $('<table/>').appendTo($this);

            // Build Header
            myTable.append(
                $("<tr/>").append(
                    $("<th/>").text(_plugin.settings.header1)
                ).append(
                    $("<th/>").text(_plugin.settings.header2)
                ).append(
                    $("<th/>").text(_plugin.settings.header3)
                )
            );

            // Add Rows
            $.each(_plugin.settings.currentValue, function(key, value){

                myTable.append(
                    $("<tr/>").append(
                        $("<td/>").append(
                            $('<a/>',{
                                text:key
                            }).click(function(event){
                                _plugin.settings.onItemClick(value);
                            })
                        )
                    ).append(
                        $("<td/>").text(value.Type)
                    ).append(
                        $("<td/>").text(value.Value)
                    )
                );
            });

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDataset');
            $this.empty();

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

            // Add Inputfields
            addRow('add', '', {}, myTable);

            // Add Rows
            var nextId = 0;
            $.each(_plugin.settings.currentValue, function(key, value){
                this.id = nextId;
                addRow(nextId, key, value, myTable);
                nextId++;
            });
            _plugin.settings.onUpdate($this.insmInputDataset("getValue"));

            return $this;

            function addRow(id, key, value, table){
                // Create row
                var myRow = $("<tr/>").data("id", id);

                if(id !== 'add'){
                    myRow.append(
                        $("<td/>").text(key) //Name
                    ).append(
                        $("<td/>").text(value.Type)
                    ).append(
                        $("<td/>").append(function () {
                            switch (value.Type) {
                                case "Text":
                                    return $("<div/>").insmInput({
                                        type: "String",
                                        currentValue: value.Value,
                                        onUpdate: function (newValue) {
                                            _plugin.settings.currentValue[key].Value = newValue;
                                            _plugin.settings.onUpdate($this.insmInput('getValue'));
                                        }
                                    }).insmInput('edit');
                                case "Boolean":
                                    return $("<div/>").insmInput({
                                        type: "Boolean",
                                        currentValue: value.Value,
                                        onUpdate: function (newValue) {
                                            _plugin.settings.currentValue[key].Value = newValue;
                                            _plugin.settings.onUpdate($this.insmInput('getValue'));
                                        }
                                    }).insmInput('edit');
                                default:
                                    return value.Value.toString();
                            }
                        })
                    ).append(
                        $("<td/>").append(
                            $('<a/>', {
                                class: "button",
                                href: "#",
                                text: "Delete"
                            }).click(
                                function(){
                                    //disable all event listeners and remove row
                                    myRow.find("*").off().remove();
                                    // update current value
                                    for (var key in _plugin.settings.currentValue) {
                                        if(_plugin.settings.currentValue[key].id === myRow.data("id")){
                                            delete _plugin.settings.currentValue[key];
                                        }
                                    }
                                    _plugin.settings.onUpdate($this.insmInputDataset("getValue"));
                                }
                            )
                        )
                    );

                    // Insert before inputFields
                    var row_count = table.find('tr').length;
                    $(table.find('tr')[row_count-2]).after(myRow);

                }else{
                   // Inputrow
                   var inputColumn1 = $("<div/>").insmInput({
                            type: "string"
                        }).insmInput("edit");

                   var inputColumn3 = $("<div/>").insmInput({
                       type: "string",
                       disabled: true
                   }).insmInput("edit");

                   var inputColumn2 = $("<div/>").insmInput({
                       type: "string",
                       values: ['Text', 'Boolean'],
                       onUpdate: function (newValue) {
                           var inputDisabled = false;

                           if (newValue === 'Bool') {
                               newValue = 'Boolean'
                           }

                           var inputDisabled = false;
                           if (newValue === "") {
                               newValue = "String";
                               inputDisabled = true;
                           }

                           inputColumn3.insmInput({
                               type: newValue,
                               disabled: inputDisabled
                           }).insmInput("edit");
                       }
                    }).insmInput("edit");


                   var addButton = $('<a/>', {
                        class: "button",
                        href: "#",
                        text: "Add"
                    }).click(
                        function () {
                            // add row
                            var valid = inputColumn1.insmInput("validate") && inputColumn2.insmInput("validate") && inputColumn3.insmInput("validate");
                            if (valid) {
                                addRow(nextId, inputColumn1.insmInput('getValue'), {
                                    Type: inputColumn2.insmInput('getValue'),
                                    Value: inputColumn3.insmInput('getValue')
                                }, myTable);

                                // update current value
                                _plugin.settings.currentValue[inputColumn1.insmInput('getValue')] = {
                                    Type: inputColumn2.insmInput('getValue'),
                                    Value: inputColumn3.insmInput('getValue'),
                                    id: nextId
                                };

                                nextId++;

                                _plugin.settings.onUpdate($this.insmInputDataset("getValue"));

                                // empty input fields
                                inputColumn1.insmInput('empty');
                                inputColumn2.insmInput('empty');
                                inputColumn3.insmInput({
                                    type: "string",
                                    disabled: true
                                }).insmInput("edit");
                            }
                            return false;
                        }
                    );

                    myRow.append(
                        $("<td/>").append(inputColumn1)
                    ).append(
                        $("<td/>").append(inputColumn2)
                    ).append(
                        $("<td/>").append(inputColumn3)
                    ).append(
                        $("<td/>").append(addButton)
                    );

                   table.append(myRow);
                }
            }
        },
        getValue: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInputDataset');

            var result = {};

            // update current value
            for (var key in _plugin.settings.currentValue) {
                result[key] = $.extend({}, _plugin.settings.currentValue[key]);
                delete result[key]['id'];
            }
            return result;
        },
        validate: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInputDataset');
            var valid = true;
            $.each(_plugin.settings.currentValue, function(key, value){
                switch (value.Type) {
                    case "Text":
                    case "String":
                        if(!$("<div/>").insmInput({
                            type: "String",
                            currentValue: value.Value
                        }).insmInput('edit').insmInput('validate')) {
                            valid = false;
                        }
                        break;
                    case "Boolean":
                        if(!$("<div/>").insmInput({
                            type: "Boolean",
                            currentValue: value.Value
                        }).insmInput('edit').insmInput('validate')) {
                            valid = false;
                        }
                        break;
                    default:
                        return value.Value.toString();
                }
            });
            return valid;
        },
        destroy: function () {
            var $this = $(this);
            $this.empty().data('insmInputDataset', null);
            
            return $this;
        }
    };

    $.fn.insmInputDataset = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputDataset');
        }
    };
})(jQuery);