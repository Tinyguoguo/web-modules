/*
* INSM Table
* This file contain the INSM Table function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmPlaylistManagerTable(settings);
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
            var _plugin = $this.data('insmPlaylistManagerTable');

            if (!_plugin) {
                _plugin = {
                    htmlElements: {

                        table: $('<table />').addClass('insmTable'),
                        thead: $('<thead/>'),
                        theadRow: $('<tr />'),
                        tbody: $('<tbody />')
                    },
                    data: {
                       
                        sort: {
                            key: '',
                            order: ''
                        },
                        expandedItems:[],
                        selectedItems: [],
                        sortSubItems: function (a, b) {
                            if (a.modificationDate.toLowerCase() < b.modificationDate.toLowerCase()) {
                                return 1;
                            }
                            else if (a.modificationDate.toLowerCase() > b.modificationDate.toLowerCase()) {
                                return -1;
                            }
                            return 0;
                        }

                    },
                    callback: {

                        onSort: function () {
                            $this.insmPlaylistManagerTable('sort');
                            $this.insmPlaylistManagerTable('populateTable');
                        },
                        
                    },
                    settings: $.extend(true, {
                        selectable: false,
                        multiSelect: false,
                        onSelect: false,
                        onDeselect: false,
                        items: [],
                        
                        headers: {
                            
                        },

                    }, options)
                };
                $this.data('insmPlaylistManagerTable', _plugin);
            }
            // Create table
            _plugin.htmlElements.table.append(
                _plugin.htmlElements.thead.append(
                    _plugin.htmlElements.theadRow
                ),
                _plugin.htmlElements.tbody
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
                header.htmlElement = $('<th />').text(header.name).css({
                    width: header.width + '%'
                });
               
                
                if (header.sort !== false) {
                    header.htmlElement.addClass('is-sortable is-clickable').click(function () {
                        
                        $this.insmPlaylistManagerTable('sort', {
                            key: title
                        });
                    });
                }

                _plugin.htmlElements.theadRow.append(header.htmlElement);
            });

            $this.insmPlaylistManagerTable('update', {
                items: _plugin.settings.items
            });
          
            $this.append(
                _plugin.htmlElements.table
            );

            return $this;
        },
        select: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistManagerTable');
            
            if (!_plugin.settings.multiSelect) {
                $.each(_plugin.settings.items, function (index,item) {
                    if (_plugin.data.selectedItems.indexOf(item.id) > -1) {
                        $this.insmPlaylistManagerTable('deselect', { item: item });
                    }
                    if (item.subItems && item.subItems.length > 0) {
                        $.each(item.subItems, function (index, sub) {
                            if (_plugin.data.selectedItems.indexOf(sub.id) > -1) {
                                $this.insmPlaylistManagerTable('deselect', { item: sub });
                            }
                        });

                    }
                });
            }

            options.item._tr.addClass('is-selected');
            _plugin.data.selectedItems.push(options.item.id);

            if (typeof _plugin.settings.onSelect === 'function') {
                _plugin.settings.onSelect(_plugin.settings.items[options.id]);
            }
        },
        deselect: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistManagerTable');
            options.item._tr.removeClass('is-selected');

            if (typeof _plugin.settings.onDeselect === 'function') {
                _plugin.settings.onDeselect(_plugin.settings.items[options.id]);
            }
        },
        createRow: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistManagerTable');

            var row = $('<tr />');
            
            $.each(_plugin.settings.headers, function (title, header) {
                if (typeof header.output === 'function') {
                    row.append(
                        $('<td />').html(header.output(options.item))
                    );
                }
                else {

                    row.append(
                        $('<td />').text(options.items[title])
                    );
                }
            });
            
            if (_plugin.settings.selectable) {
                // If not selected run select.
                // If selected run deselect.
                row.click(function () {
                    $this.insmPlaylistManagerTable('select', {
                        item: options.item
                    });
                });
            }
            return row;
        },

        remove: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistManagerTable');

            throw new Error('Not implemented')

            return $this;
        },
        update: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistManagerTable');
            if (!options.items) {
                throw new Error('Missing parameter "items"');
            }
            
            _plugin.settings.items = options.items;

            $this.insmPlaylistManagerTable('sort');
            $this.insmPlaylistManagerTable('populateTable');
            return $this;
        },
        
        sort: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistManagerTable');
            if (options && options.key) {
                $.each(_plugin.settings.headers, function (title, header) {


                    if (typeof header.sort === 'function' && title == options.key) {
                        if (_plugin.data.sort.key == title) {
                            if (_plugin.data.sort.order == 'asc') {
                                _plugin.data.sort.order = 'desc';
                            }
                            else {
                                _plugin.data.sort.order = 'asc';
                            }
                        }
                        else {
                            _plugin.data.sort.key = title;
                            _plugin.data.sort.order = 'asc';
                        }
                    }
                });
            }
            $.each(_plugin.settings.headers, function (key, header) {
                header.htmlElement.removeClass('asc desc');
            });
            if (_plugin.data.sort.key != '') {
                _plugin.settings.headers[_plugin.data.sort.key].htmlElement.addClass(_plugin.data.sort.order);
            }
            $this.insmPlaylistManagerTable('populateTable');

            return $this;
        },
       
        populateTable: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistManagerTable');

            // Detach all rows
            for (var i = 0; i < _plugin.settings.items.length; i++) {
                if (_plugin.settings.items[i]._tr) {
                    _plugin.settings.items[i]._tr.detach();
                    for (var j = 0; j < _plugin.settings.items[i].subItems.length; j++) {
                        _plugin.settings.items[i].subItems[j]._tr.detach();
                    }
                }
            }

            // Sort tableData
            if (_plugin.data.sort.key) {
                if (typeof _plugin.settings.headers[_plugin.data.sort.key].sort === 'function') {
                    // Use the specified sort algorithm
                    _plugin.settings.items.sort(function (a, b) {
                        
                        var returnValue = _plugin.settings.headers[_plugin.data.sort.key].sort(a, b);
                        if (_plugin.data.sort.order == 'desc') {
                            returnValue *= -1;
                        }

                        return returnValue;
                    });
                }
                else {
                    throw new Error('No sorting algorithm defined');
                }
            }
            
            _plugin.htmlElements.tbody.empty();
 
            if (_plugin.settings.items.length==0) {
                var numberOfColumns = parseInt(getObjectKeyCount(_plugin.settings.headers));
                _plugin.htmlElements.tbody.append(
                    $('<tr />').append(
                        $('<td class="no-results" colspan="' + numberOfColumns + '"/>').append('No results available')
                    )
                );
            } else {
               
                $.each(_plugin.settings.items, function (index, item) {
          
                    if (item) {
                        if (!item._tr) {
                            item._tr = $this.insmPlaylistManagerTable('createRow', {
                                id: item.id,
                                item: item
                            });
                        }
                        _plugin.htmlElements.tbody.append(item._tr);
                    }
                    if (item.subItems && item.subItems.length > 0) {
                        
                        $.each(item.subItems, function (index, sub) {
                            
                            if (!sub._tr) {
                            
                                sub._tr = $this.insmPlaylistManagerTable('createRow', {
                                     id: sub.id,
                                     item: sub
                                });
                            }
                            
                            _plugin.htmlElements.tbody.append(sub._tr);
                        });   
                        if (_plugin.data.expandedItems.indexOf(item.id)>-1) {
                               $.each(item.subItems, function (index, sub) {
                                   sub._tr.show();
                               });

                        } else {
                              
                            $.each(item.subItems, function (index, sub) {
                                sub._tr.hide();
                            });
                        }
                        item.subItems.sort(function (a, b) {

                            var returnValue = _plugin.data.sortSubItems(a, b);
                            return returnValue;
                            
                        });
                    }


                });
            }
            return $this;
        },        
        expand: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistManagerTable');
            _plugin.data.expandedItems.push(options.item.id);
            $.each(options.item.subItems, function (index, sub) {
                sub._tr.fadeIn();
            });

        },
        collapse: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistManagerTable');
             _plugin.data.expandedItems.splice(_plugin.data.expandedItems.indexOf(options.item.id), 1);
            $.each(options.item.subItems, function (index, sub) {
                sub._tr.hide();
            });
        },
        destroy: function (options) {
            var $this = $(this);
            $this.data('insmPlaylistManagerTable', null).empty();

            return $this;
        }
    };

    $.fn.insmPlaylistManagerTable = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPlaylistManagerTable');
        }
    };

    $.insmPlaylistManagerTable = function (method) {
        return $('<div />').insmPlaylistManagerTable(arguments);
    };
})(jQuery);