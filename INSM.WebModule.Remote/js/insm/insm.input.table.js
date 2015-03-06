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
* Sebastian Ekström - Creuna AB
* Koji Wakayama - Creuna AB
*/

; (function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');
            var reformatKeyMap = {};

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        type: "Table",
                        values: [],
                        currentValue: [],
                        returnType: '',
                        objectHeaders: [],
                        initObject: {},
                        multiSelect: false,
                        required: true,
                        onUpdate: function (newValue) { }
                    }, options),
                    data: {
                        tables: [],
                        previousValue: [],
                        previousTables: []
                    },
                    htmlElements: {
                        addButton: $('<a/>')
                    }
                };
                $this.data('insmInputTable', _plugin);
            }


            if (!$.isArray(_plugin.settings.currentValue)) {
                _plugin.settings.currentValue = [_plugin.settings.currentValue];
            }

            _plugin.data.previousValue = _plugin.settings.currentValue;

            // Tables (current value)
            _plugin.data.tables = [];
            $.each(_plugin.settings.currentValue, function (index, currentTable) {
                var t = {};

                $.each(_plugin.settings.initObject, function (key, initStructure) {

                    var value = $.extend(true, {}, initStructure);
                    value.currentValue = currentTable[key];
                    
                    value.onUpdate = function (newValue) {
                        currentTable[key] = newValue;
                        _plugin.settings.onUpdate($this.insmInputTable('getValue'));
                    };

                    var title = value.pretty;
                    if(typeof title == 'undefined') {
                        title = key;
                    }

                    var css = value.css;
                    if (typeof css == 'undefined') {
                        css = 'tableElement';
                    }
                    // value should be constructed by the init object
                    t[key] = $('<div/>').attr('title', title).addClass(css).insmInput(value);

                });

                _plugin.data.tables.push(t);

            });

            _plugin.data.previousTables = _plugin.data.tables.slice();

            _plugin.settings.onUpdate($this.insmInputTable('getValue'));

            return $this;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');
            $.each(_plugin.data.tables, function (index, t) {
                $.each(t, function (key, value) {
                    value.detach();
                });
            });
            $this.empty();

            var tableWrapper = $('<div/>', {
                'class': "table-wrapper"
            });

            $.each(_plugin.data.tables, function (index, t) {
                var tableElement = $('<table/>');
                $.each(t, function (key, value) {
                    var th = $('<th />');
                    var td = $('<td />');
                    var tr = $('<tr />');
                    th.append(value.attr('title'));

                    if (_plugin.settings.initObject[key].tooltip) {
                        th.insmTooltip({
                            width: 200,
                            container: $('html'),
                            text: _plugin.settings.initObject[key].tooltip
                        });
                    }

                    td.append(value.insmInput('view'));
                    tr.append(th, td).appendTo(tableElement);
                });
                tableWrapper.append(tableElement);
            });
            $this.append(tableWrapper);

            return $this;
        },
        edit: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');
            $.each(_plugin.data.tables, function (index, t) {
                $.each(t, function (key, value) {
                    value.detach();
                });
            });
            $this.empty();

            var tableWrapper = $('<div/>', {
                'class': "table-wrapper"
            });

            $.each(_plugin.data.tables, function (index, t) {
                var tableElement = $('<table/>');
                $.each(t, function (key, value) {
                    var th = $('<th/>');
                    var td = $('<td/>');
                    var tr = $('<tr/>');
                    th.append(value.attr('title'));

                    if (_plugin.settings.initObject[key].tooltip) {
                        th.insmTooltip({
                            width: 200,
                            container: $('html'),
                            text: _plugin.settings.initObject[key].tooltip
                        });
                    }

                    td.append(value.insmInput('edit'));
                    tr.append(th, td).appendTo(tableElement);
                });

                tableWrapper.append(tableElement);

                if (_plugin.settings.multiSelect) {

                    var removeButton = $('<a/>', {
                        'class': "button delete-table-input",
                        href: "",
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
                                    return value != t;
                                });

                                var newValue = [];
                                $.each(_plugin.data.tables, function (index, t2) {
                                    var newTable = {};
                                    $.each(t2, function (key, value) {
                                        newTable[key] = value.insmInput('getValue');
                                    });
                                    newValue.push(newTable);
                                });
                                _plugin.settings.currentValue = newValue;
                                _plugin.settings.onUpdate($this.insmInputTable('getValue'));
                            }
                        })
                        
                        return false;
                    });

                    tableWrapper.append(removeButton);
                }
            });

            $this.append(tableWrapper);

            if (_plugin.settings.multiSelect) {
                _plugin.htmlElements.addButton = $('<a/>', {
                    'class': "button add-table-input",
                    text: "Add"
                }).click(function (e) {
                    e.preventDefault();
                    addTable(tableWrapper);
                    _plugin.settings.onUpdate($this.insmInputTable('getValue'));
                    return false;
                });

                $this.append(_plugin.htmlElements.addButton);
            }

            return $this;

            function addTable(parent) {
                var newTable = {};
                var newValueObject = {};
                _plugin.settings.currentValue.push(newValueObject);

                $.each(_plugin.settings.initObject, function (key, initStructure) {
                    var value = $.extend(true, {}, initStructure);
                    newValueObject[key] = initStructure.currentValue;
                    value.onUpdate = function (newValue) {
                        newValueObject[key] = newValue;
                        _plugin.settings.onUpdate($this.insmInputTable('getValue'));
                    };
                    var title = value.pretty;
                    if(typeof title == 'undefined'){
                        title = key;
                    }
                    // value should be constructed by the init object
                    newTable[key] = $('<div/>').attr('title', title).insmInput(value);
                });
                _plugin.data.tables.push(newTable);

                var tableElement = $('<table/>');
                $.each(newTable, function (key, value) {
                    var th = $('<th/>');
                    var td = $('<td/>');
                    var tr = $('<tr/>');
                    th.append(value.attr('title'));
                    td.append(value.insmInput('edit'));
                    tr.append(th, td).appendTo(tableElement);
                });
                var removeButton = $('<a/>', {
                    'class': "button delete-table-input",
                    href: "",
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
                                return value != newTable;
                            });

                            var newValue = [];
                            $.each(_plugin.data.tables, function (index, t2) {
                                var newTable = {};
                                $.each(t2, function (key, value) {
                                    newTable[key] = value.insmInput('getValue');
                                });
                                newValue.push(newTable);
                            });
                            _plugin.settings.currentValue = newValue;
                            _plugin.settings.onUpdate($this.insmInputTable('getValue'));
                        }
                    });
                    
                    return false;
                });

                parent.append(tableElement, removeButton);
            }
        },
        getValue: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');

            if (_plugin.settings.returnType === 'object') {
                var result = {};

                $.each(_plugin.settings.currentValue, function (index, value) {
                    var i = index + 1;

                    // Might be useful but is not tested 2013-05-13, Tobias
                    if (_plugin.settings.objectHeaders.length > 0) {
                        i = _plugin.settings.objectHeaders[index % _plugin.settings.objectHeaders.length];
                    }
                    result[i] = value;
                });

                return result;
            }

            if (!_plugin.settings.multiSelect) {

                if (_plugin.settings.currentValue[0]) {
                    return _plugin.settings.currentValue[0];
                }
                else {
                    return null;
                }
            }

            return _plugin.settings.currentValue;

        },
        validate: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');

            var result = true;

            if (_plugin.settings.required && _plugin.data.tables.length == 0) {
                _plugin.htmlElements.addButton.css({
                    borderColor: '#f00'
                });
                return false;
            }
            else {
                _plugin.htmlElements.addButton.css({
                    borderColor: ''
                });
            }

            $.each(_plugin.data.tables, function (index, t) {
                $.each(t, function (key, value) {
                    if (!value.insmInput('validate')) {
                        result = false;
                    }
                });
            });

            return result;
        },
        reset: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');

            _plugin.settings.currentValue = _plugin.data.previousValue;
            $this.insmInputTable(_plugin.settings);

            _plugin.settings.onUpdate($this.insmInputTable('getValue'));

            return $this;
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmInputTable');

            $.each(_plugin.data.tables, function (index, t) {
                $.each(t, function (key, value) {
                    value.insmInput('destroy');
                });
            });

            $this.data('insmInputTable', null);

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