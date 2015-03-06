/*
* INSM Asset
* This file contain the INSM Input String function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmInputTable(settings);
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
            var _plugin = $this.data('insmInputTable');
            
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        type: 'table',
                        defaultValue: {},
                        required: false,
                        multiSelect: false,
                        disabled: false,
                        objectDefinition: {},
                        value: {}
                    }, options),
                    data: {
                        tables: [],
                        previousValue: [],
                        previousTables: [],
                        view: ''
                    }
                };
                $this.data('insmInputTable', _plugin);
            }

            if (!$.isArray(_plugin.settings.value)) {
                _plugin.settings.value = [_plugin.settings.value];
            }

            _plugin.data.tables = [];

            $.each(_plugin.settings.value, function (index, tableValue) {
                var table = {};
             
                $.each(_plugin.settings.objectDefinition, function (key, structure) {
                    var property = $.extend(true, {}, structure);
                    if (tableValue[key]) {
                        property.value = tableValue[key];
                    }
                    table[key] = $('<div />').insmInput(property);
                });

                _plugin.data.tables.push(table);
            });

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');
            
            // Remove from DOM so they don't get deleted on empty() call
            $.each(_plugin.data.tables, function (index, t) {
                $.each(t, function (key, value) {
                    value.detach();
                });
            });
            $this.empty();

            var tableWrapper = $('<div/>', {
                'class': "inputTable"
            });

            $.each(_plugin.data.tables, function (index, t) {
                var tableElement = $('<table/>').addClass('vertical');
                $.each(t, function (key, value) {
                    var th = $('<th/>');

                    if (_plugin.settings.objectDefinition[key].tooltip) {
                        th.insmTooltip({
                            width: 200,
                            container: $('html'),
                            text: _plugin.settings.objectDefinition[key].tooltip
                        });
                    }

                    var td = $('<td/>');
                    var tr = $('<tr/>');
                    
                    th.append(_plugin.settings.objectDefinition[key].displayName || key);
                    td.append(value.insmInput('view'));
                    tr.append(th, td).appendTo(tableElement);
                });
                tableWrapper.append(tableElement);
            });

            $this.append(tableWrapper);
            
            _plugin.data.view = 'view';

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');

            $.each(_plugin.data.tables, function (index, table) {
                $.each(table, function (key, inputField) {
                    inputField.detach();
                });
            });
            $this.empty();

            var tableWrapper = $('<div/>', {
                'class': "inputTable"
            });
           
            $.each(_plugin.data.tables, function (index, table) {
                var tableElement = $('<table/>').addClass('vertical');
                $.each(table, function (key, inputField) {
                    var th = $('<th/>');

                    if (_plugin.settings.objectDefinition[key].tooltip) {
                        th.insmTooltip({
                            width: 200,
                            container: $('html'),
                            text: _plugin.settings.objectDefinition[key].tooltip
                        });
                    }

                    var td = $('<td/>');
                    var tr = $('<tr/>');
                    th.append(_plugin.settings.objectDefinition[key].displayName || key);
                    td.append(inputField.insmInput('edit'));
                    tr.append(th, td).appendTo(tableElement);
                });

                tableWrapper.append(tableElement);

                if (_plugin.settings.multiSelect) {

                    var removeButton = $('<button />', {
                        text: "Delete"
                    }).click(function (event) {
                        event.preventDefault();

                        $.insmDialog({
                            type: 'confirm',
                            title: 'Are you sure you want to delete this item?',
                            accept: function () {
                                removeButton.remove();
                                tableElement.remove();
                                // update current value
                                _plugin.data.tables = jQuery.grep(_plugin.data.tables, function (value) {
                                    return value != table;
                                });

                                var newValue = [];
                                $.each(_plugin.data.tables, function (index, t2) {
                                    var newTable = {};
                                    $.each(t2, function (key, value) {
                                        newTable[key] = value.insmInput('getValue');
                                    });
                                    newValue.push(newTable);
                                });
                            }
                        });
                        return false;
                    });

                    tableWrapper.append(removeButton);
                }
            });

            $this.append(tableWrapper);

            if (_plugin.settings.multiSelect) {
                var addButton = $('<button />', {
                    text: "Add"
                }).click(function (event) {
                    event.preventDefault();
                    addTable(tableWrapper);
                    //_plugin.settings.onUpdate($this.insmInputTable('getValue'));
                    return false;
                });

                $this.append(addButton);
            }

            function addTable(parent) {
                var tableElement = $('<table/>').addClass('vertical');
                
                var table = {};
                $.each(_plugin.settings.objectDefinition, function (key, inputParameters) {
                    // The data
                    table[key] = $('<div />').insmInput(inputParameters).insmInput('edit');

                    // The DOM elements
                    var th = $('<th/>');
                    var td = $('<td/>');
                    var tr = $('<tr/>');
                    th.append(_plugin.settings.objectDefinition[key].displayName || key);
                    td.append(table[key]);
                    tr.append(th, td).appendTo(tableElement);
                });

                _plugin.data.tables.push(table);

                parent.append(tableElement);

                if (_plugin.settings.multiSelect) {
                    var removeButton = $('<button />', {
                        text: "Delete"
                    }).click(function (event) {
                        event.preventDefault();

                        $.insmDialog({
                            type: 'confirm',
                            title: 'Are you sure you want to delete this item?',
                            accept: function () {
                                removeButton.remove();
                                tableElement.remove();
                                // update current value

                                _plugin.data.tables = jQuery.grep(_plugin.data.tables, function (value) {
                                    return value != table;
                                });

                                var newValue = [];
                                $.each(_plugin.data.tables, function (index, t2) {
                                    var newTable = {};
                                    $.each(t2, function (key, value) {
                                        newTable[key] = value.insmInput('getValue');
                                    });
                                    newValue.push(newTable);
                                });
                            }
                        });
                        return false;
                    });

                    parent.append(removeButton);
                }
            }


            _plugin.data.view = 'edit';

            return $this;
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');

            var value = [];
            $.each(_plugin.data.tables, function (index, t) {
                var tableValue = {};
                $.each(t, function (key, value) {
                    tableValue[key] = value.insmInput('getValue');
                });
                value.push(tableValue);
            });

            if (!_plugin.settings.multiSelect) {
                return value[0];
            }

            return value;
        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');

            var result = true;
            $.each(_plugin.data.tables, function (index, t) {
                $.each(t, function (key, value) {
                    if (!value.insmInput('validate')) {
                        result = false;
                    }
                });
            });

            return result;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');
            
            if (!$.isArray(options.value)) {
                options.value = [options.value];
            }

            //else {
            //    _plugin.settings.value = options.value;
            //}

            // New code
            // Should go through everything...
            var objectDefinitionChange = false;
            if (options.objectDefinition) {
                if ($.isEmptyObject(_plugin.settings.objectDefinition)) {
                    objectDefinitionChange = true;
                }
                else {
                    $.each(options.objectDefinition, function (key, property) {
                        $.each(property, function (propertyKey, propertyDefinition) {
                            if (!_.isEqual(_plugin.settings.objectDefinition[key][propertyKey], options.objectDefinition[key][propertyKey])) {
                                objectDefinitionChange = true;
                            }
                        });
                    });
                }
            }

            if (objectDefinitionChange) {
                $.extend(_plugin.settings.objectDefinition, options.objectDefinition);
                // Remove everything and start over
                $.each(_plugin.data.tables, function (index, table) {
                    $.each(table, function (key, value) {
                        value.insmInput('destroy');
                    });
                });

                //_plugin.data.view
                _plugin.data.tables = [];

                $.each(options.value, function (index, tableValue) {
                    var table = {};

                    $.each(_plugin.settings.objectDefinition, function (key, structure) {

                        var property = $.extend(true, {}, structure);
                        if (tableValue) {
                            property.value = tableValue[key];
                        }
                        table[key] = $('<div />').insmInput(property);
                        if (_plugin.data.view) {
                            table[key].insmInput(_plugin.data.view);
                        }
                    });

                    _plugin.data.tables.push(table);
                });
            }
            else {
                // Just do an update since the objects are the same
                $.each(_plugin.data.tables, function (index, table) {
                    $.each(table, function (key, value) {
                        value.insmInput('update', {
                            value: options.value[index][key]
                        });
                    });
                });

                // TODO: We should also remove any overflow tables or add additional tables...
            }

            return $this;
        },
        reset: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');

            if (_plugin) {
                $.each(_plugin.data.tables, function (index, t) {
                    $.each(t, function (key, value) {
                        value.insmInput('reset');
                    });
                });
            }

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');

            if (_plugin) {
                $.each(_plugin.data.tables, function (index, t) {
                    $.each(t, function (key, value) {
                        value.insmInput('destroy');
                    });
                });
            }

            $this.data('insmInputTable', null);
            $this.empty();

            return $this;
        }
    };

    $.fn.insmInputTable = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmInputTable');
        }
    };
})(jQuery);