/*
* INSM Asset
* This file contain the INSM Input Boolean function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputDisplay(settings);
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
            var _plugin = $this.data('insmInputDisplay');

            _plugin = {
                settings: $.extend({
                    required: true,
                    currentValue: {
                        Vendor: null,
                        Model: null,
                        Input: null,
                        InputNumber: null
                    },
                    initObject: {},
                    onUpdate: function(newValue){}
                }, options)
            };

            $this.data('insmInputDisplay', _plugin);

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDisplay');
            var table = $('<table/>');

            $.each(_plugin.settings.currentValue, function(key, value) {
                var row =  $('<tr/>').append(
                    $('<th/>', {
                        text: key
                    }),
                    $('<td/>', {
                        text: value
                    })
                );
                row.appendTo(table);
            });
            table.appendTo($this);
            
            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputDisplay');

            var vendorInput = $('<select />').append(
                $('<option />').text('select')
            );

            var modelInput = $('<select />').append(
                $('<option />').text('select')
            ).attr('disabled', 'disabled');

            var inputInput = $('<select />').append(
                $('<option />').text('select')
            ).attr('disabled', 'disabled');

            var inputNumberInput = $('<select />').append(
                $('<option />').text('select')
            ).attr('disabled', 'disabled');

            $.each(_plugin.settings.initObject, function (vendorName, models) {
                vendorInput.append(
                    $('<option />').text(vendorName)
                );
            });

            vendorInput.change(function () {
                modelInput.find('option').remove().end().append(
                    $('<option />').text('select')
                ).attr('disabled', 'disabled');
                inputInput.find('option').remove().end().append(
                    $('<option />').text('select')
                ).attr('disabled', 'disabled');
                inputNumberInput.find('option').remove().end().append(
                    $('<option />').text('select')
                ).attr('disabled', 'disabled');

                if ($(this).val() && $(this).val() !== 'select') {
                    modelInput.removeAttr('disabled');
                    $.each(_plugin.settings.initObject[vendorInput.val()], function (modelName, inputs) {
                        modelInput.append(
                            $('<option />').text(modelName)
                        );
                    });
                }
                _plugin.settings.currentValue.Vendor = null;
                _plugin.settings.currentValue.Model = null;
                _plugin.settings.currentValue.Input = null;
                _plugin.settings.currentValue.InputNumber = null;

                _plugin.settings.onUpdate($this.insmInputDisplay('getValue'));
            });

            modelInput.change(function () {
                inputInput.find('option').remove().end().append(
                    $('<option />').text('select')
                ).attr('disabled', 'disabled');
                inputNumberInput.find('option').remove().end().append(
                    $('<option />').text('select')
                ).attr('disabled', 'disabled');
                if ($(this).val() && $(this).val() !== 'select') {
                    inputInput.removeAttr('disabled');
                    $.each(_plugin.settings.initObject[vendorInput.val()][modelInput.val()], function (inputName, inputNumbers) {
                        inputInput.append(
                            $('<option />').text(inputName)
                        );
                    });
                }
                _plugin.settings.currentValue.Vendor = null;
                _plugin.settings.currentValue.Model = null;
                _plugin.settings.currentValue.Input = null;
                _plugin.settings.currentValue.InputNumber = null;

                _plugin.settings.onUpdate($this.insmInputDisplay('getValue'));
            });

            inputInput.change(function () {
                inputNumberInput.find('option').remove().end().append(
                    $('<option />').text('select')
                ).attr('disabled', 'disabled');
                if ($(this).val() && $(this).val() !== 'select') {
                    inputNumberInput.removeAttr('disabled');
                    $.each(_plugin.settings.initObject[vendorInput.val()][modelInput.val()][inputInput.val()], function (index, inputNumber) {
                        inputNumberInput.append(
                            $('<option />').text(inputNumber)
                        );
                    });

                    _plugin.settings.currentValue.Vendor = null;
                    _plugin.settings.currentValue.Model = null;
                    _plugin.settings.currentValue.Input = null;
                    _plugin.settings.currentValue.InputNumber = null;

                    _plugin.settings.onUpdate($this.insmInputDisplay('getValue'));
                }
            });

            inputNumberInput.change(function () {
                _plugin.settings.currentValue = {
                    Vendor: vendorInput.val(),
                    Model: modelInput.val(),
                    Input: inputInput.val(),
                    InputNumber: inputNumberInput.val()
                };
                _plugin.settings.onUpdate($this.insmInputDisplay('getValue'));
            });

            if (_plugin.settings.currentValue) {
                var display = $.extend({}, _plugin.settings.currentValue);
                vendorInput.val(display.Vendor).trigger('change');
                modelInput.val(display.Model).trigger('change');
                inputInput.val(display.Input).trigger('change');
                inputNumberInput.val(display.InputNumber).trigger('change');
            }

            $this.empty().append(
                $('<table />').addClass('vertical').append(
                    $('<tr />').append(
                        $('<th />').text('Vendor'),
                        $('<th />').text('Model'),
                        $('<th />').text('Input'),
                        $('<th />').text('Input number')
                    ),
                    $('<tr />').append(
                        $('<td />').append(vendorInput),
                        $('<td />').append(modelInput),
                        $('<td />').append(inputInput),
                        $('<td />').append(inputNumberInput)
                    )
                )
            );
            
            return $this;

            var id = Math.floor(Math.random()*999999999);
            while($("#" + id).length > 0) {
                id = Math.floor(Math.random()*999999999);
            }

            var table = $('<table/>', {
                class: "displayTable",
                id: id
            });

            var firstSelect = $('<select/>', {
                class: 'filter_select'
            });

            $.each(_plugin.settings.values, function(keyValue, vendors) {
                var children = _plugin.settings.values[keyValue];
                var options = createOption(keyValue, vendors, children);
                firstSelect.append(options);
            });

            var firstOption = $('<option/>', {
                text: 'select'
            });

            firstSelect.prepend(firstOption);
            table.append(firstSelect);
            table.appendTo($this);
            firstSelect.val('select');

            $(document).on("change", "#" + table.attr("id") + " .filter_select", function(){
                var newSelect = $("<select/>", {
                    class: "filter_select"
                });                
                var selectedOption = $(this).find('option:selected');
                var children = selectedOption.data("children");
                
                var currentSelect = $(this);
                currentSelect.nextAll('.filter_select').remove();

                //The last input should always be a string, therefore
                //its the last, and shouldnt be ran through this.
                if($.type(children) !== 'string') {
                    $.each(children, function(keyValue, vendors){
                        newSelect.append(createOption(keyValue, vendors, children[keyValue]));
                        newSelect.prepend(firstOption);
                        table.append(newSelect);
                    });
                    newSelect.val('select');
                }

                var newValue = {
                    Vendor: null,
                    Model: null,
                    Input: null,
                    InputValue: null
                };
                $.each(table.find('select'), function (index, selectInput) {
                    var selectValue = $(selectInput).val();
                    if (selectValue != 'select') {
                        switch (index) {
                            case 0:
                                newValue.Vendor = selectValue;
                                break;
                            case 1:
                                newValue.Model = selectValue;
                                break;
                            case 2:
                                newValue.Input = selectValue;
                                break;
                            case 3:
                                newValue.InputValue = selectValue;
                                break;
                        }
                    }
                });
                if (newValue.InputValue) {
                    _plugin.settings.currentValue = newValue;
                    _plugin.settings.onUpdate($this.insmInputDisplay('getValue'));
                }
                else {
                    _plugin.settings.currentValue = null;
                    _plugin.settings.onUpdate($this.insmInputDisplay('getValue'));
                }
            });

            return $this;
        },
        getValue: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInputDisplay');

            if (_plugin.settings.currentValue && _plugin.settings.currentValue.Vendor == 'select') {
                _plugin.settings.currentValue.Vendor = null;
            }
            if (_plugin.settings.currentValue && _plugin.settings.currentValue.Model == 'select') {
                _plugin.settings.currentValue.Model = null;
            }
            if (_plugin.settings.currentValue && _plugin.settings.currentValue.Input == 'select') {
                _plugin.settings.currentValue.Input = null;
            }
            if (_plugin.settings.currentValue && _plugin.settings.currentValue.InputNumber == 'select') {
                _plugin.settings.currentValue.InputNumber = null;
            }

            return _plugin.settings.currentValue;
        },
        validate: function(){
            var $this = $(this);
            var _plugin = $this.data('insmInputDisplay');

            if(_plugin.settings.required === true && typeof $this.insmInputDisplay("getValue") === 'undefined'){
                return false;
            } else {
                return true;
            }
        },
        destroy: function(){

        }
    };


    function createOption(keyValue, vendors, children) {

        var option = $('<option/>', {
            text: keyValue,
            value: keyValue
        });

        option.data("children", children);
        return option;
    }

    $.fn.insmInputDisplay = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputDisplay');
        }
    };
})(jQuery);