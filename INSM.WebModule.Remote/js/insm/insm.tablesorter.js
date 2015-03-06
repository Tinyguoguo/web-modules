/*
* INSM Tablesorter
* This file contain the INSM Tablesorter function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmTablesorter(settings);
*
* File dependencies:
* jQuery 1.6.1
* GetUrlParam 2.1
* insm.framework
* insm.utilities
* insm.tooltip
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTablesorter');
            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        table: $('<table />').addClass('insm-tablesorter').addClass('horizontal zebra'),
                        tableBody: $('<tbody />'),
                        tableControlsTop: $('<div />').addClass('insm-tablesorter-controls-top'),
                        tableControlsBottom: $('<div />').addClass('insm-tablesorter-controls-bottom')
                    },
                    data: $.extend({
                        autoSearch: true,
                        searchPlaceholderText: 'Search...',
                        limit: 10,
                        offset: 0,
                        onSelect: null,
                        headers: {},
                        data: {},
                        tableData: [],
                        searchstring: '',
                        cssWidth: {},
                        highlightIndex: [],
                        currentSortHeader: null,
                        currentSortKey: null,
                        currentSortOrder:null,
                        paginationPosition: 'both',
                        searchPosition: 'both',
                        limitControlPosition: 'both',
                        listeners: { search: [], offset: [], limit: [], rowCount: [] }
                    }, options),
                    framework: null
                };
                $this.data('insmTablesorter', _plugin);
            }

            //calcualte table width
            var totalWeight = 0;
            $.each(_plugin.data.headers, function (key, header) {
                if (header.weight) { totalWeight += header.weight; } else { totalWeight += 1; }
            });
            $.each(_plugin.data.headers, function (key, header) {
                _plugin.data.cssWidth[key] = ((header.weight || 1) / totalWeight) * 100;
            });

            // Clean table
            $this.empty().append(
                _plugin.htmlElements.tableControlsTop
            ).append(
                _plugin.htmlElements.table
            );

            // Add headers
            var thead = $('<thead />');
            var theadRow = $('<tr />');
            $.each(_plugin.data.headers, function (key, header) {
                var $th = $('<th />').text(key);
                if (_plugin.data.currentSortHeader) {
                    if (_plugin.data.currentSortHeader.attr == header.attr)
                    {
                        _plugin.data.currentSortHeader._sortOrder;
                        header._sortOrder = _plugin.data.currentSortOrder;
                    } else {
                        header._sortOrder = 'ASC';
                    }
                } else {
                  header._sortOrder = 'ASC';
                }
                if (header.tooltip) {
                    $th.insmTooltip({
                        container: $('html'),
                        text: header.tooltip
                    });
                }
                if (typeof header.sort == 'boolean' && header.sort == false) {
                    // Do nothing
                }
                else {
                    $th.addClass('order-none').attr('key', key).click(function () {
                        if (header._sortOrder == 'ASC') {
                            header._sortOrder = 'DESC';
                        }
                        else if (header._sortOrder == 'DESC') {
                            header._sortOrder = 'ASC';
                        }
                        else {
                            header._sortOrder = 'ASC';
                        }
                        $this.insmTablesorter('sort', {
                            header: header,
                            key: key
                        });
                        $this.insmTablesorter('populateTable');
                    });
                }
                theadRow.append($th);
            });

            _plugin.htmlElements.table.append(
                thead.append(
                    theadRow
                )
            );

            _plugin.htmlElements.table.append(
                _plugin.htmlElements.tableBody
            );

            // init search field
            var searchfieldTop = $('<div />');
            if (_plugin.data.searchPosition.toLowerCase() == 'top' || _plugin.data.searchPosition.toLowerCase() == 'both') {
                searchfieldTop.addClass('insm-tablesorter-search').insmSearchField({
                    autoSearch: _plugin.data.autoSearch,
                    placeholderText: _plugin.data.searchPlaceholderText,
                    onClear: function () {
                        $this.insmTablesorter('clearSearch');
                    },
                    onSearch: function (searchstring) {
                        $this.insmTablesorter('search', {
                            searchstring: searchstring,
                            caller: searchfieldTop // make sure NOT to update this caller (don't interrupt the users typing!)
                        });
                    }
                });
            }

            var searchfieldBot = $('<div />');
            if (_plugin.data.searchPosition.toLowerCase() == 'bottom' || _plugin.data.searchPosition.toLowerCase() == 'both') {
                searchfieldBot.addClass('insm-tablesorter-search').insmSearchField({
                    autoSearch: _plugin.data.autoSearch,
                    placeholderText: _plugin.data.searchPlaceholderText,
                    onClear: function () {
                        $this.insmTablesorter('clearSearch');
                    },
                    onSearch: function (searchstring) {
                        $this.insmTablesorter('search', {
                            searchstring: searchstring,
                            caller: searchfieldBot  // make sure NOT to update this caller (don't interrupt the users typing!)
                        });
                    }
                });
            }

            _plugin.data.listeners.search.push(searchfieldBot.insmListener({
                onEvent: function (context, parameters) {
                    context.insmSearchField('setInputField', { text: parameters.search });
                }
            }));

            _plugin.data.listeners.search.push(searchfieldTop.insmListener({
                onEvent: function (context, parameters) {
                    context.insmSearchField('setInputField', { text: parameters.search });
                }
            }));

            // add search fields.
            if (_plugin.data.searchPosition.toLowerCase() == 'top' || _plugin.data.searchPosition.toLowerCase() == 'both') {
                _plugin.htmlElements.tableControlsTop.append(searchfieldTop);
            }
            if (_plugin.data.searchPosition.toLowerCase() == 'bottom' || _plugin.data.searchPosition.toLowerCase() == 'both') {
                _plugin.htmlElements.tableControlsBottom.append(searchfieldBot);
            }


            // Limit control
            var limitControlTop = $('<select />').addClass('insm-tablesorter-limitcontrol').append(
                $('<option value="10" />').text('10 rows'),
                $('<option value="25" />').text('25 rows'),
                $('<option value="50" />').text('50 rows'),
                $('<option value="100" />').text('100 rows')
            );

            var searchChangefunc = function () {
                _plugin.data.limit = $(this).val();
                _plugin.data.offset = _plugin.data.offset - (_plugin.data.offset % _plugin.data.limit);
                //notify observers
                $.each(_plugin.data.listeners.limit, function (index, limitlisteners) {
                    limitlisteners.insmListener('onEvent', { limit: _plugin.data.limit, offset: _plugin.data.offset });
                });
                $this.insmTablesorter('populateTable');
            };

            var limitListenerEvent = {
                onEvent: function (context, parameters) {
                    // Pagination
                    context.val(parameters.limit);
                }
            };

            var limitControlBot = limitControlTop.clone();
            limitControlTop.insmListener(limitListenerEvent);
            limitControlBot.insmListener(limitListenerEvent);
            limitControlTop.change(searchChangefunc);
            limitControlBot.change(searchChangefunc);

            _plugin.data.listeners.limit.push(limitControlTop);
            _plugin.data.listeners.limit.push(limitControlBot);

            var setPage = function (pageNumber, limit) {
                _plugin.data.offset = pageNumber * limit;
                $this.insmTablesorter('populateTable');

                $.each(_plugin.data.listeners.offset, function (index, listener) {
                    listener.insmListener('onEvent', {
                        offset: _plugin.data.offset
                    });
                });
            };

            var paginationListenerEvent = {
                onEvent: function (context, parameters) {
                    // Pagination

                    var offset = parameters.offset ? parameters.offset : _plugin.data.offset;
                    var limit = parameters.limit ? parameters.limit : _plugin.data.limit;
                    var currentPage = (offset - (offset % limit)) / limit;
                    var maxOffset = _plugin.data.tableData.length - 1;
                    var lastPage = (maxOffset - (maxOffset % limit)) / limit;

                    var newPaginator = $('<div class="insm-tablesorter-paginator" />');
                    if (currentPage > 0) {
                        $('<a class="button prev"><<</a>').click(function () {
                            setPage(0, limit);
                        }).appendTo(newPaginator);
                        $('<a class="button prev"><</a>').click(function () {
                            setPage(currentPage - 1, limit);
                        }).appendTo(newPaginator);
                    } else {
                        $('<a class="button disabled prev"><<</a>').appendTo(newPaginator);
                        $('<a class="button disabled prev"><</a>').appendTo(newPaginator);
                    }

                    var pageStartTarget = currentPage - 3 >= 0 ? currentPage - 3 : 0;
                    pageStartTarget = (pageStartTarget > lastPage - 6) ? lastPage - 6 : pageStartTarget;
                    pageStartTarget = (pageStartTarget < 0) ? 0 : pageStartTarget;
                    var pageEndTarget = (pageStartTarget + 6 <= lastPage) ? pageStartTarget + 6 : lastPage;


                    for (var pageTarget = pageStartTarget; pageTarget <= pageEndTarget; pageTarget++) {

                        //capture the current index, http://stackoverflow.com/questions/3023874/arguments-to-javascript-anonymous-function
                        function capture(tmpPageTarget, tmpLimit) { return function () { setPage(tmpPageTarget, tmpLimit); }; };
                        var button = $('<a class="button">' + (pageTarget + 1) + '</a>');

                        if (pageTarget >= 0 && pageTarget <= lastPage) {
                            button.click(capture(pageTarget, limit));
                        } else {
                            button.css('visibility', 'hidden');
                        }
                        if (pageTarget == currentPage) {
                            button.addClass("button selected");
                        }
                        button.appendTo(newPaginator);
                    }

                    if (currentPage < lastPage) {
                        $('<a class="button next">></a>').click(function () {
                            setPage(currentPage + 1, limit);
                        }).appendTo(newPaginator);
                        $('<a class="button next">>></a>').click(function () {
                            setPage(lastPage, limit);
                        }).appendTo(newPaginator);
                    } else {
                        $('<a class="button disabled next">></a>').appendTo(newPaginator);
                        $('<a class="button disabled next">>></a>').appendTo(newPaginator);
                    }
                    context.empty().append(newPaginator);
                }
            };

            var paginationTop = $('<div />').addClass('insm-tablesorter-pagination');
            var paginationBot = paginationTop.clone();
            paginationTop.insmListener(paginationListenerEvent);
            paginationBot.insmListener(paginationListenerEvent);

            _plugin.data.listeners.offset.push(paginationTop);
            _plugin.data.listeners.offset.push(paginationBot);
            _plugin.data.listeners.rowCount.push(paginationTop);
            _plugin.data.listeners.rowCount.push(paginationBot);
            _plugin.data.listeners.limit.push(paginationTop);
            _plugin.data.listeners.limit.push(paginationBot);


            if (_plugin.data.paginationPosition.toLowerCase() == 'top' ||
                _plugin.data.paginationPosition.toLowerCase() == 'both') {
                _plugin.htmlElements.tableControlsTop.append(paginationTop);
            }
            if (_plugin.data.paginationPosition.toLowerCase() == 'bottom' ||
                 _plugin.data.paginationPosition.toLowerCase() == 'both') {
                _plugin.htmlElements.tableControlsBottom.append(paginationBot);
            }

            if (_plugin.data.limitControlPosition.toLowerCase() == 'top' ||
                _plugin.data.limitControlPosition.toLowerCase() == 'both') {
                _plugin.htmlElements.tableControlsTop.append(limitControlTop);
            }
            if (_plugin.data.limitControlPosition.toLowerCase() == 'bottom' ||
                _plugin.data.limitControlPosition.toLowerCase() == 'both') {
                _plugin.htmlElements.tableControlsBottom.append(limitControlBot);
            }

            // Add table data (searching without searchstring gives us all rows)

            $this.insmTablesorter('search');

            //trigger all listeners so that all controls are up-to-date:
            $.each(_plugin.data.listeners, function (index1, type) {
                $.each(type, function (index2, listeners) {
                    listeners.insmListener('onEvent', { search: _plugin.data.searchstring });
                });
            });

            return $this;
        },
        'isInitialized': function () {
            var $this = $(this);
            var _plugin = $this.data('insmTablesorter');
            return _plugin ? true : false;
        },
        'clearSearch': function () {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTablesorter');

            _plugin.data.searchstring = "";

            $.each(_plugin.data.listeners.search, function (index1, searchbox) {
                searchbox.insmListener('onEvent', { search: "" });
            });

            $this.insmTablesorter('search');
        },
        'update': function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTablesorter');
            _plugin.data.data = options.data;
            $this.insmTablesorter('search');
            return $this;
        },
        selectRow: function(options){
            var $this = $(this);
            var _plugin = $this.data('insmTablesorter');
            $.each(_plugin.data.data, function (index, rowData) {
                if (options.selector(rowData)) {
                    _plugin.data.offset = index - (index % _plugin.data.limit);
                    $this.insmTablesorter('search');
                    $this.insmTablesorter('highlight', { index: [index] });
                    return false;
                }
            });
            return $this;
        },
        highlight: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTablesorter');
            _plugin.htmlElements.tableBody.find('.highlight').removeClass('highlight');
            $.each(options.index, function (i, index) {
                _plugin.htmlElements.tableBody.find('[index=' + index + ']').addClass('highlight');
            });
            _plugin.data.highlightIndex = options.index
            return $this;
        },
        'populateTable': function (options) {
            // Global vars
            var $this = $(this);
            _plugin = $this.data('insmTablesorter');

            if (!_plugin) {
                return $this;
            }

            if (!options) {
                options = {
                    paginationStart: _plugin.data.offset,
                    paginationEnd: 0
                };

                var end = parseInt(_plugin.data.offset) + parseInt(_plugin.data.limit);
                if (end > _plugin.data.tableData.length) {
                    end = _plugin.data.tableData.length;
                }
                options.paginationEnd = end;
            }

            _plugin.htmlElements.tableBody.empty();
            

            if (options.paginationEnd > _plugin.data.tableData.length) {
                options.paginationEnd = _plugin.data.tableData.length;
            }
            if (_plugin.data.tableData.length == 0) {
                _plugin.htmlElements.tableBody.append(
                    $('<tr />').append(
                        $('<td class="no-content" colspan="' + getObjectKeyCount(_plugin.data.headers) + '"/>').text($.isEmptyObject(_plugin.data.data) ? 'Nothing to display' : 'No matching search result')
                    )
                );
            }
            for (var i = options.paginationStart; i < options.paginationEnd; i++) {
                var rowHtml = $('<tr  index="' + i + '" />');
                if ($.inArray(i, _plugin.data.highlightIndex) != -1) {
                    rowHtml.addClass('highlight');
                }
                // For each header
                $.each(_plugin.data.headers, function (key, header) {
                    rowHtml.append(
                        function () {

                            var $td = $('<td class="insm-tablesorter-content" key="' + key + '" />');
                            $td.css("width", _plugin.data.cssWidth[key] + "%");

                            if (typeof header.tdClass == 'function') {
                                $td.addClass(header.tdClass(_plugin.data.tableData[i]));
                            }

                            if (typeof header.output == 'function') {
                                $td.append(header.output(_plugin.data.tableData[i]));
                            } else if (_plugin.data.tableData[i][header.attr]) {
                                $td.append(_plugin.data.tableData[i][header.attr]);
                            } else if (_plugin.data.tableData[i][key]) {
                                $td.append(_plugin.data.tableData[i][key]);
                            }

                            rowHtml.append($td);
                        }
                    )
                });
                var index = i;
                var f = function(index){
                    if (_plugin.data.onSelect) {
                        rowHtml.click(function () {
                            if (_plugin.data.tableData && _plugin.data.tableData[index]) {
                                $this.insmTablesorter('highlight', { index: [index] });
                                _plugin.data.onSelect(_plugin.data.tableData[index].Id);
                            }
                        });
                    }
                };
                f(index);
                _plugin.htmlElements.tableBody.append(rowHtml);

            }

            return $this;
        },
        'sort': function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTablesorter');

            if (!_plugin) {
                return $this;
            }
            if (options && options.header) {
                _plugin.data.currentSortHeader = options.header;
            }
            if (!_plugin.data.currentSortHeader) {
                return $this;
            }
            if (options && options.key) {
                _plugin.data.currentSortKey = options.key;
            }
            if (!_plugin.data.currentSortKey) {
                return $this;
            }

            if (typeof _plugin.data.currentSortHeader.sort === 'function') {
                _plugin.data.tableData.sort(function (a, b) {
                    return _plugin.data.currentSortHeader.sort(a, b) * (_plugin.data.currentSortHeader._sortOrder === 'DESC' ? 1 : -1);
                });
            }
            else {
                _plugin.data.tableData.sort(function (a, b) {
                    var order = (_plugin.data.currentSortHeader._sortOrder === 'DESC' ? 1 : -1);

                    var attribute = _plugin.data.currentSortHeader.attr ? _plugin.data.currentSortHeader.attr : _plugin.data.currentSortKey;
                    
                    if (a[attribute] && b[attribute]) {
                        if (typeof a[attribute] == 'string') {
                            return order * a[attribute].localeCompare(b[attribute]);
                        }
                        if (a[attribute] < b[attribute]) {
                            return order;
                        }
                        else if (a[attribute] > b[attribute]) {
                            return order * -1;
                        }
                        else {
                            return 0;
                        }
                    } else if (a[attribute]) {
                        return order;
                    } else if (b[attribute]) {
                        return order * -1;
                    } else {
                        return 0;
                    }
                });
            }

            //fix the table head flag ui.
            _plugin.htmlElements.table.find("thead > tr > th").each(function (index, td) {
                var $td = $(td);
                if ($td.attr('key')) {
                    if (typeof _plugin.data.currentSortHeader === 'bool' && _plugin.data.currentSortHeader === false) {
                        $td.removeClass('order-asc order-desc order-none');
                    }
                    else {
                        
                        $td.addClass('order-none').removeClass('order-asc order-desc');
                        if ($td.attr('key') == _plugin.data.currentSortKey) {
                            
                            if (_plugin.data.currentSortHeader._sortOrder == 'ASC') {
                                $td.addClass('order-asc');
                            } else {
                                $td.addClass('order-desc');
                            }
                        }
                    }
                }
            });
            return $this;
        },
        'search': function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTablesorter');

            if (options && typeof options.searchstring != 'undefined') {
                _plugin.data.searchstring = options.searchstring.toLowerCase();
            }


            _plugin.htmlElements.tableBody.empty();
            _plugin.htmlElements.tableBody.append(
                $('<tr />').append(
                    $('<td class="no-content" colspan="' + getObjectKeyCount(_plugin.data.headers) + '"/>').text('Searching...')
                )
            );

            setTimeout(function () {
                function searchStringToArray(searchString) {
                    //if trim is not buit in: http://stackoverflow.com/questions/498970/how-do-i-trim-a-string-in-javascript
                    if (!String.prototype.trim) {
                        String.prototype.trim = function () {
                            return this.replace(/^\s+|\s+$/g, '');
                        };
                    }
                    searchString = " " + searchString + " ";
                    var searchArray = [],
                        finished = false,
                        pos = 0,
                        startQ = 0,
                        endQ = 0,
                        s = "";
                    while (!finished) {
                        startQ = searchString.substring(pos).indexOf(" \"");
                        if (startQ != -1) {
                            startQ += pos + 1;
                            s = searchString.substring(pos, startQ).trim();
                            if (s) searchArray = searchArray.concat(s.split(" "));
                            pos = startQ;
                            var endQ = searchString.substring(pos + 1).indexOf("\" ");
                            if (endQ != -1) {
                                endQ += pos + 1;
                                s = searchString.substring(startQ + 1, endQ);
                                if (s) searchArray.push(s);
                                pos = endQ + 1;
                            } else {
                                s = searchString.substring(startQ).trim();
                                if (s) searchArray = searchArray.concat(s.split(" "));
                                finished = true;
                            }
                        } else {
                            s = searchString.substring(pos).trim();
                            if (s) searchArray = searchArray.concat(s.split(" "));
                            finished = true;
                        }
                    }
                    return searchArray;
                }
                _plugin.data.tableData = [];
                var searchArray = searchStringToArray(_plugin.data.searchstring);
                // Filter data
                $.each(_plugin.data.data, function (index, rowData) {
                    if (_plugin.data.searchstring) {
                        var found = true;
                        // Check all columns

                        $.each(searchArray, function (index, searchString) {
                            var foundInHeader = false;
                            $.each(_plugin.data.headers, function (key, header) {
                                if (typeof header.search == 'function') {
                                    if (header.search({
                                        item: rowData,
                                        searchString: searchString
                                    })) {
                                        foundInHeader = true;
                                        return false;
                                    }
                                } else if (typeof header.output == 'function') {
                                    if (header.output(rowData) !== null && header.output(rowData).toString().toLowerCase().indexOf(searchString) >= 0) {
                                        foundInHeader = true;
                                        return false;
                                    }
                                }
                                if (rowData[header.attr]) {
                                    if (rowData[header.attr].toString().toLowerCase().indexOf(searchString) >= 0) {
                                        foundInHeader = true;
                                        return false;
                                    }
                                } else if (rowData[key]) {
                                    if (rowData[key].toString().toLowerCase().indexOf(searchString) >= 0) {
                                        foundInHeader = true;
                                        return false;
                                    }
                                }
                            });
                            if (!foundInHeader) {
                                found = false;
                                return false;
                            }
                        });

                        if (found) {
                            _plugin.data.tableData.push(rowData);
                        }
                    }
                    else {
                        _plugin.data.tableData.push(rowData);
                    }
                });
                
                //always sort the data after altering the tableData.
                $this.insmTablesorter('sort');

                //if rowCount changes then maybe we have to update offset.
                if (_plugin.data.offset >= _plugin.data.tableData.length) {
                    _plugin.data.offset = _plugin.data.tableData.length - (_plugin.data.tableData.length % _plugin.data.limit);
                }

                //notify observers of searchstring
                if (_plugin.data.searchstring && _plugin.data.listeners.search.length > 0) {
                    $.each(_plugin.data.listeners.search, function (index1, searchbox) {
                        if (options && options.caller) {
                            if (searchbox.length != options.caller.length || searchbox.length != searchbox.filter(options.caller).length) {
                                searchbox.insmListener('onEvent', { search: _plugin.data.searchstring });
                            }
                        } else {
                            searchbox.insmListener('onEvent', { search: _plugin.data.searchstring });
                        }
                    });
                } else {
                    $.each(_plugin.data.listeners.search, function (index1, searchbox) {
                        searchbox.insmListener('onEvent', { search: "" });
                    });
                }

                //notify observers of rowCount
                if (_plugin.data.listeners.rowCount.length > 0) {
                    $.each(_plugin.data.listeners.rowCount, function (index1, func) {
                        func.insmListener('onEvent', { rowCount: _plugin.data.tableData.length });
                    });
                }

                $this.insmTablesorter('populateTable');
            }, 100);

            

            return $this;
        },
        getData: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTablesorter');

            var data = [];
            var row;

            $.each(_plugin.data.data, function (index, rowData) {
                row = $.extend(true, {}, rowData);
                delete row._tr;
                delete row._selected;
                data.push(row);
            });

            return data;
        },
        isInitialized: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTablesorter');

            if (_plugin) {
                return true;
            }
            else {
                return false;
            }
        }
    };



    $.fn.insmTablesorter = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmTablesorter');
            return false;
        }
    };
})(jQuery);