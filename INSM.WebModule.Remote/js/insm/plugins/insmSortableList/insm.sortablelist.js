/*
* INSM Table
* This file contain the INSM Table function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmSortableList(settings);
*
* File dependencies:
* jQuery 1.8.2
* jQuery UI 1.8.23
* insmNotification
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');

            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        
                        controls: $('<div />').addClass('insmTableControls'),
                        search: $('<div />'),
                        pagination: $('<div />'),
                        limit: $('<div />'),
                        table: $('<table />').addClass('insmTable'),
                        thead: $('<thead/>'),
                        theadRow: $('<tr />'),
                        list: $('<ul />')
                    },
                    data: {
                        // All items
                        itemArray: [],
                        // Table items
                        tableData: [],
                        limit: 8,
                        offset: 0,
                        searchstring: '',
                        selectedItems: [],
                        sort: {
                            key: '',
                            order: ''
                        },
                        searchIndex: {}
                    },
                    callback: {
                        onSearch: function () {
                            $this.insmSortableList('filter');
                            $this.insmSortableList('sort');
                            $this.insmSortableList('populateTable');
                        },
                        onSort: function () {
                            $this.insmSortableList('sort');
                            $this.insmSortableList('populateTable');
                        },
                        onItemUpdate: function () {

                        },
                        onHoverCell: function () {

                        }
                    },
                    settings: $.extend(true, {
                        placeholderText: 'Search...',
                        headers: {},
                        items: {},
                        contents: {},
                        pagination: false,
                        search: true,
                        multiSelect: false,
                        selectable: true,
                        onSelect: function (row) {

                        }
                    }, options)
                };
                $this.data('insmSortableList', _plugin);
            }
            // Create controls
            if (_plugin.settings.search) {
                _plugin.htmlElements.search.insmSearchField({
                    placeholderText: _plugin.settings.placeholderText,
                    onSearch: function (searchstring) {
                        _plugin.data.searchstring = searchstring;
                        _plugin.callback.onSearch();
                    }
                });
            }

            if (!isNaN(_plugin.settings.limit)) {
                _plugin.data.limit = _plugin.settings.limit;
            }

            if (_plugin.settings.pagination) {
                _plugin.htmlElements.pagination.insmPagination({
                    items: 0,
                    limit: _plugin.data.limit,
                    offset: 0,
                    onChange: function (pagination) {
                        _plugin.data.offset = pagination.start;
                        $this.insmSortableList('populateTable');
                    }
                });
            } else {
                _plugin.data.limit = _plugin.settings.items.length;

            }

            _plugin.htmlElements.controls.append(
                _plugin.htmlElements.pagination,
                _plugin.htmlElements.limit,
                _plugin.htmlElements.search
            );


            // Create table
            _plugin.htmlElements.table.append(
                _plugin.htmlElements.thead.append(
                    _plugin.htmlElements.theadRow
                )
               
            );

            // Add table header row and calculate column width
            var totalWeight = 0;
            $.each(_plugin.settings.headers, function (title, header) {

                if (header.weight) {
                    totalWeight += header.weight;
                }
                else {
                    totalWeight += 1;
                }
            });
            $.each(_plugin.settings.headers, function (title, header) {
                header.width = ((header.weight || 1) / totalWeight) * 100;
            });
            $.each(_plugin.settings.headers, function (title, header) {
                header.htmlElement = $('<th />').text(title).css({
                    width: header.width + '%'
                });
                if (header.tooltip) {
                    header.htmlElement.insmTooltip({
                        content: header.tooltip
                    });
                }

                if (header.sortable !== false) {
                    header.htmlElement.addClass('is-sortable is-clickable').click(function () {
                        $this.insmSortableList('sort', {
                            key: title
                        });
                    });
                }
                _plugin.htmlElements.theadRow.append(header.htmlElement);
            });
            // Format items
            if ($.isArray(_plugin.settings.items)) {
                var items = {};
                for (var i = 0; i < _plugin.settings.items.length; i++) {
                    var item = _plugin.settings.items[i];
                    item.id = i;
                    items[i] = item;
                }
                _plugin.settings.items = items;
            }
            else {
                $.each(_plugin.settings.items, function (id, item) {
                    item.id = id;
                });
            }           
            // Create search index
            _plugin.data.searchIndex = {};

            $.each(_plugin.settings.items, function (id, item) {
                var indexes = _plugin.settings.searchIndex(item);
                $.each(indexes, function (i, index) {
                    index = index.toLowerCase();
                    if (!$.isArray(_plugin.data.searchIndex[index])) {
                        _plugin.data.searchIndex[index] = [];
                    }
                    _plugin.data.searchIndex[index].push(id);
                });
            });
            // Create sticky item
            _plugin.data.sticky = {};
            $this.insmSortableList('updateSticky');

            // Update data
            $this.insmSortableList('update', {
                items: _plugin.settings.items
            }).insmSortableList('filter').insmSortableList('populateTable');
            // Update pagination
            if (_plugin.settings.pagination) {
                _plugin.htmlElements.pagination.insmPagination('update', {
                    limit: _plugin.data.limit,
                    offset: _plugin.data.offset,
                    items: _plugin.data.itemCount
                });
            }
            // Add to DOM tree
            if (_plugin.settings.search || _plugin.settings.pagination) {
                $this.append(
                    _plugin.htmlElements.controls
                );
            }
            $this.append(
                _plugin.htmlElements.table,
                _plugin.htmlElements.list
            );
            return $this;
        },
        createRow: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');
            var row = $('<li />');
          
            if (typeof _plugin.settings.content.output === 'function') {
                row.append(
                    $('<div />').html(_plugin.settings.content.output(options.item))
                );
            }
            else {
                row.append(
                    $('<td />').text(options.item[header.key])
                );
            }
            

            if(typeof _plugin.settings.onSelect === 'function') {
                row.addClass('is-clickable').click(function () {
                    _plugin.settings.onSelect(_plugin.settings.items[options.id]);
                    // When clicking a row
                    if (_plugin.settings.selectable) {
                        if (!_plugin.settings.multiSelect) {
                            // Remove all selected stuff...
                            $.each(_plugin.data.selectedItems, function (index, id) {
                                _plugin.settings.items[id]._selected = false;
                                _plugin.settings.items[id]._tr.switchClass('is-selected', '', {
                                    duration: 100,
                                    queue: true
                                });
                            });
                            _plugin.data.selectedItems = [];
                        }

                        if (_plugin.settings.items[options.id]._selected) {
                            _plugin.settings.items[options.id]._selected = false;
                            _plugin.settings.items[options.id]._tr.switchClass('is-selected', '', {
                                duration: 100,
                                queue: true
                            });

                            if ($.isArray(_plugin.data.selectedItems)) {
                                var index = _plugin.data.selectedItems.indexOf(options.id);

                                if (index > -1) {
                                    _plugin.data.selectedItems.splice(index, 1);
                                }
                                else {
                                    throw new Error('The selected item was not in the list of selected items.');
                                }
                            }
                        }
                        else {
                            _plugin.settings.items[options.id]._selected = true;
                            _plugin.settings.items[options.id]._tr.switchClass('', 'is-selected', {
                                duration: 100,
                                queue: true
                            });
                            _plugin.data.selectedItems.push(options.id);
                        }
                    }
                });
            }
            return row;
        },
        updateSearchIndex: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');

            _plugin.data.searchIndex = {};
            $.each(_plugin.settings.items, function (id, item) {
                var indexes = _plugin.settings.searchIndex(item);
                $.each(indexes, function (i, index) {
                    index = index.toLowerCase();
                    if (!$.isArray(_plugin.data.searchIndex[index])) {
                        _plugin.data.searchIndex[index] = [];
                    }
                    _plugin.data.searchIndex[index].push(id);
                });
            });
            return $this;
        },
        updateSticky: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');
            _plugin.data.sticky = {};
            if (typeof _plugin.settings.sticky == 'function') {
               
                $.each(_plugin.settings.items, function (id, item) {
                    var sticky = _plugin.settings.sticky(item);
                    if (sticky) {
                        _plugin.data.sticky[id] = true;
                    }
                });
            }
            return $this;
        },
        remove: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');
            if (_plugin.settings.items[options.id]) {
                _plugin.settings.items[options.id]._tr.remove();
                delete _plugin.settings.items[options.id];
                delete _plugin.data.selectedItems[options.id.toString()];
                _plugin.data.itemArray = $.grep(_plugin.data.itemArray, function (value) {
                    return value != options.id;
                });
                $.each(_plugin.data.selectedItems, function (index, id) {
                    if (id === options.id) {
                        _plugin.data.selectedItems.splice(index, 1);
                    }
                });
                $this.insmSortableList('updateSearchIndex');
                $this.insmSortableList('updateSticky');
                $this.insmSortableList('filter');
                $this.insmSortableList('populateTable');
            }
            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');

            $.each(options.items, function (id, item) {
                if (typeof _plugin.settings.items[id] === 'undefined') {
                    // Create a new record
                    item.id = id;
                    _plugin.settings.items[id] = item;
                }
                else {
                    // Update an existing record
                    $.extend(_plugin.settings.items[id], item);
                }
                
                // If this id already has a table row we should just make a content swap and highlight
                if (typeof _plugin.settings.items[id]._tr !== 'undefined') {
                    var row = $this.insmSortableList('createRow', {
                        id: id,
                        item: item
                    });

                    _plugin.settings.items[id]._tr.empty().html(
                        row.children()
                    );

                    _plugin.settings.items[id]._tr.switchClass("", "is-highlighted", function () {
                        $(this).switchClass("is-highlighted", "", 2000);
                    });
                }
            });

            // Update the item array
            _plugin.data.itemArray = $.map(_plugin.settings.items, function (value, index) {
                return value.id;
            });
            $this.insmSortableList('updateSearchIndex');
            $this.insmSortableList('updateSticky');
            $this.insmSortableList('filter');
            _plugin.data.sort.key = '';
            _plugin.callback.onItemUpdate();

            return $this;
        },
        empty: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');

            $.each(_plugin.settings.items, function (id, item) {
                $this.insmSortableList('remove', {
                    id: id
                });
            });

            return $this;
        },
        filter: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');
            _plugin.data.tableData = [];

            if (_plugin.data.searchstring) {
                $.each(_plugin.data.searchIndex, function (index, itemIds) {
                    if (index.indexOf(_plugin.data.searchstring.toLowerCase()) > -1) {
                        _plugin.data.tableData = $.merge(_plugin.data.tableData, itemIds);
                    }
                });
                _plugin.data.tableData = $.unique(_plugin.data.tableData);
            }
            else {
                _plugin.data.tableData = _plugin.data.itemArray;
            }

            return $this;
        },
        deselectAll: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');

            $.each(_plugin.data.selectedItems, function (index, id) {
                _plugin.settings.items[id]._selected = false;
                _plugin.settings.items[id]._tr.switchClass('is-selected', '', {
                    duration: 100,
                    queue: true
                });
            });

            return $this;
        },
        getData: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');

            var data = [];
            var row;
            $.each(_plugin.data.tableData, function (index, id) {
                row = $.extend(true, {}, _plugin.settings.items[id]);
                delete row._tr;
                delete row._selected;
                data.push(row);
            });

            return data;
        },
        getSelected: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');

            if (_plugin.settings.multiSelect) {
                throw new Error('Not implemented');
            }
            else {
                var selectedItem = $.extend(true, {}, _plugin.settings.items[_plugin.data.selectedItems[0]]);
                delete selectedItem._selected;
                delete selectedItem._tr;
                return selectedItem;
            }
        },
        sort: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');

            if (options && options.key) {
                if (_plugin.data.sort.key == options.key) {
                    if (_plugin.data.sort.order == 'asc') {
                        _plugin.data.sort.order = 'desc';
                    }
                    else {
                        _plugin.data.sort.order = 'asc';
                    }
                }
                else {
                    _plugin.data.sort.key = options.key;
                    _plugin.data.sort.order = 'asc';
                }


                $.each(_plugin.settings.headers, function (key, header) {
                    header.htmlElement.removeClass('asc desc');
                });
                _plugin.settings.headers[_plugin.data.sort.key].htmlElement.addClass(_plugin.data.sort.order);
                if (_plugin.data.sort.key) {
                    var sortData = [];
                    var stickData = [];
                    if (!$.isEmptyObject(_plugin.data.sticky)) {
                        $.each(_plugin.data.tableData, function (index, value) {
                            if (!_plugin.data.sticky[value]) {
                                sortData.push(value);
                            } else {
                                stickData.unshift(value);
                            }
                        });
                    } else {
                        sortData = _plugin.data.tableData;
                    }

                    if (typeof _plugin.settings.headers[_plugin.data.sort.key].sort === 'function') {

                        // Use the specified sort algorithm
                        sortData.sort(function (a, b) {
                            var returnValue = _plugin.settings.headers[_plugin.data.sort.key].sort(_plugin.settings.items[a], _plugin.settings.items[b]);
                            if (_plugin.data.sort.order == 'desc') {
                                returnValue *= -1;
                            }

                            return returnValue;
                        });
                    }
                    else if (typeof _plugin.settings.headers[_plugin.data.sort.key].sort === 'string' && typeof _plugin.settings.headers[_plugin.data.sort.key].key === 'string') {
                        switch (_plugin.settings.headers[_plugin.data.sort.key].sort) {
                            case 'string':
                            case 'text':
                                sortData.sort(function (a, b) {
                                    var aOutput = _plugin.settings.items[a][_plugin.settings.headers[_plugin.data.sort.key].key];
                                    var bOutput = _plugin.settings.items[b][_plugin.settings.headers[_plugin.data.sort.key].key];
                                    var returnValue = 0;

                                    if (aOutput < bOutput) {
                                        returnValue = -1;
                                    }
                                    else if (aOutput > bOutput) {
                                        returnValue = 1;
                                    }
                                    if (_plugin.data.sort.order == 'desc') {
                                        returnValue *= -1;
                                    }

                                    return returnValue;
                                });
                                break;
                            default:
                                throw new Error('No native sorting algorithm identified by "' + _plugin.settings.headers[_plugin.data.sort.key].sort + '"');
                                break;
                        }
                    }
                    else if (typeof _plugin.settings.headers[_plugin.data.sort.key].output === 'function') {
                        // Use the output function to decide order
                        // TODO: Add support for type. User has to specify type on each header and the below code should adjust to that type.
                        sortData.sort(function (a, b) {
                            var aOutput = _plugin.settings.headers[_plugin.data.sort.key].output(_plugin.settings.items[a]);
                            var bOutput = _plugin.settings.headers[_plugin.data.sort.key].output(_plugin.settings.items[b]);
                            var returnValue = 0;

                            if (aOutput < bOutput) {
                                returnValue = -1;
                            }
                            else if (aOutput > bOutput) {
                                returnValue = 1;
                            }
                            if (_plugin.data.sort.order == 'desc') {
                                returnValue *= -1;
                            }

                            return returnValue;
                        });
                    }
                    if (stickData.length > 0) {
                        $.each(stickData, function (index, value) {
                            sortData.unshift(value);
                        });
                        _plugin.data.tableData = sortData;
                    }
                }
                $this.insmSortableList('populateTable');
            }

            return $this;
        },
        createControls: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');



            return $this;
        },
        populateTable: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSortableList');

            // Detach all rows
            for (var i = 0; i < _plugin.data.itemArray.length; i++) {
                if (_plugin.settings.items[_plugin.data.itemArray[i]]._tr) {
                    _plugin.settings.items[_plugin.data.itemArray[i]]._tr.detach();
                }
            }

            // Sort tableData
            

            // Append relevant rows
            _plugin.data.itemCount = _plugin.data.tableData.length;
            var lastItemIndex = _plugin.data.tableData.length;
          
            if (parseInt(lastItemIndex) > parseInt(_plugin.data.offset + _plugin.data.limit)) {
                lastItemIndex = parseInt(_plugin.data.offset + _plugin.data.limit);
            }
            _plugin.htmlElements.list.empty();
            if (_plugin.data.offset >= lastItemIndex) {
                _plugin.data.offset -= _plugin.data.limit;
                if (_plugin.data.offset < 0) {
                    _plugin.data.offset = 0;
                }
            }
            for (var i = _plugin.data.offset; i < lastItemIndex; i++) {
                if (_plugin.settings.items[_plugin.data.tableData[i]]) {
                    if (!_plugin.settings.items[_plugin.settings.items[_plugin.data.tableData[i]].id]._tr) {

                        _plugin.settings.items[_plugin.settings.items[_plugin.data.tableData[i]].id]._tr = $this.insmSortableList('createRow', {
                            id: _plugin.settings.items[_plugin.data.tableData[i]].id,
                            item: _plugin.settings.items[_plugin.data.tableData[i]]
                        });
                    }
                    _plugin.htmlElements.list.append(_plugin.settings.items[_plugin.settings.items[_plugin.data.tableData[i]].id]._tr);
                }
            }

            if (_plugin.data.offset == lastItemIndex) {
                var numberOfColumns = parseInt(getObjectKeyCount(_plugin.settings.headers));
                _plugin.htmlElements.list.append(
                    $('<tr />').append(
                        $('<td class="no-results" colspan="' + numberOfColumns + '"/>').append('No results available')
                    )
                );
            }

            // Update pagination
            if (_plugin.settings.pagination) {
                _plugin.htmlElements.pagination.insmPagination('update', {
                    limit: _plugin.data.limit,
                    offset: _plugin.data.offset,
                    items: _plugin.data.itemCount
                });
            }

            return $this;
        },
        destroy: function (options) {
            var $this = $(this);
            $this.data('insmSortableList', null).empty();

            return $this;
        }
    };

    $.fn.insmSortableList = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmSortableList');
        }
    };

    $.insmSortableList = function (method) {
        return $('<div />').insmSortableList(arguments);
    };
})(jQuery);