/*
* INSM Statistcs
* This file contain the INSM Statistics function.
* 
* Called by $('identifier').insmStatistics(settings);
* 
* Author:
* Mikael Berglund
* Instoremedia AB
*/
"use strict";
(function ($) {
    var methods = {
        init: function (settings) {
            var $this = $(this);
            var _plugin = $this.data('insmStatistics');

            if (!_plugin) {
                _plugin = {
                    data: {
                        fullscreenInitialized: false,
                        itemList: {
                            regions: {},
                            players: {}
                        },
                        playerCountLookup: {},
                        totalPlayerPlayback: {},
                        timePeriodFormat: null,
                        groupBy: 0,
                        tableInformation: {},
                        renderTimeperiod: function (timeperiod) {
                            var returnValue = timeperiod.substring(0, 4);
                            if (timeperiod.length > 4) {
                                returnValue += '-' + timeperiod.substring(4, 6);

                                if (timeperiod.length > 6) {
                                    returnValue += '-' + timeperiod.substring(6, 8);

                                    if (timeperiod.length > 8) {
                                        returnValue += ' ' + timeperiod.substring(8, 10);

                                        if (timeperiod.length > 10) {
                                            returnValue += ':' + timeperiod.substring(10, 12);

                                            if (timeperiod.length > 12) {
                                                returnValue += ':' + timeperiod.substring(12, 14);
                                            }
                                        }
                                        else {
                                            // Add ":00 - XX:00"
                                            var hour = timeperiod.substring(8, 10);
                                            if (hour.charAt(0) == 0) {
                                                hour = hour.charAt(1);
                                            }
                                            hour = parseInt(hour) + 1;
                                            if (parseInt(hour) < 10) {
                                                hour = '0' + hour;
                                            }
                                            returnValue += ':00 - ' + hour + ':00';
                                        }
                                    }
                                }
                            }
                            return returnValue;
                        }
                    },
                    htmlElements: {
                        header: $('<div />'),
                        body: $('<div />'),
                        regionPicker: $('<div />'),
                        statistics: {
                            container: $('<div/>'),
                            controls: $('<div />'),
                            content: $('<div />')
                        },
                        reportWrapper: $('<div />')
                    },
                    settings: $.extend({
                        region: 0,
                        target: null,
                        previewTarget: null,
                        show: function () { },
                        allowedTypes: {
                            template: 'Template',
                            playerEngine: 'Player Engine',
                            mediaFile: 'File',
                            dataset: 'Asset'
                        },
                        allowedFilters: {
                            keyname: "For all", // will be changed to the selected type from the list above
                            keynameAndRegion: "Per Region",
                            keynameAndPlayer: "Per Player"
                        },
                        regionId: null,
                        applicationName: 'Statistics',
                        ssl: false,
                        ams: '',
                        version: manifest.version || 'dev'
                    }, settings),
                    subscriptions: {
                        start: function () { },
                        stop: function () { }
                    }
                };

                $this.data('insmStatistics', _plugin);

                $this.insmStatistics('getAmsSettings').done(function () {
                    $this.insmStatistics('setSubscriptions');
                });
            }

            return $this;
        },
        getAmsSettings: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmStatistics');

            return $.insmFramework('amsSettings', {
                key: 'statisticsTimeperiodFormat',
                success: function (amsSettings) {
                    var value = amsSettings.Value;
                    var defaultValue = amsSettings.DefaultValue;
                    if (value) {
                        _plugin.data.timePeriodFormat = value;
                    }
                    else if (defaultValue) {
                        _plugin.data.timePeriodFormat = defaultValue;
                    }
                }
            });
        },
        getStatistics: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmStatistics');

            var statisticsDef = $.Deferred();
            var filterKey = options.filter;
            if (options.filter == 'keynameAndRegion') {
                filterKey = 'keynameAndPlayer';
            }

            var statisticsObject = {
                upid: options.node.upid,
                regionId: options.node.id,
                fromDate: options.dateInterval.start,
                toDate: options.dateInterval.end,
                type: options.type,
                filter: filterKey,
                success: function (data) {
                    statisticsDef.resolveWith(this, [data]);
                },
                warning: function (data) {
                    $.insmNotification({
                        type: 'warning',
                        message: data.Message
                    });
                    statisticsDef.resolveWith(this, [data]);
                },
                denied: function () {
                    $this.insmStatistics('getStatistics', options);
                }
            }
            if (options.node.upid) {
                delete statisticsObject.regionId;
            } else {
                delete statisticsObject.upid;
            }

            $.insmFramework("statistics", statisticsObject);
            return statisticsDef;
        },
        statisticsToTableData: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmStatistics');
            var tableInformation = {
                headers: {},
                data: []
            }

            // Define headers

            // If expanded mode has been set
            if (options.accumulation != 'total') {
                tableInformation.headers["Time Period"] = {
                    type: 'string',
                    output: function (row) {
                        return _plugin.data.renderTimeperiod(row.timeperiod);
                    },
                    tooltip: 'The time interval which the data were collected.'
                };
            }

            if (options.filter == "keynameAndRegion") {
                // Add a column for region
                tableInformation.headers["Region"] = {
                    type: 'string',
                    output: function (row) {
                        return row.region;
                    },
                    tooltip: 'The name of the region in which the data were collected.'
                };
                tableInformation.headers["Player count"] = {
                    type: 'string',
                    output: function (region) {
                        return region.playerCount;
                    },
                    tooltip: 'The number of players that have contributed statistics for this item.'
                };
            }
            if (options.filter == "keynameAndPlayer") {
                // Add a column for region and player
                tableInformation.headers["Region"] = {
                    type: 'string',
                    output: function (row) {
                        return row.region;
                    },
                    tooltip: 'The name of the region in which the data were collected.'
                };
                tableInformation.headers["Player"] = {
                    type: 'string',
                    output: function (player) {
                        return player.name;
                    },
                    tooltip: 'The name of the player which collected the data.'
                };
            }

            // The chosen type "Template", "Player Engine", "File" or "Asset"
            tableInformation.headers[_plugin.settings.allowedTypes[options.type]] = {
                type: 'string',
                output: function (row) {
                    return row.typeName;
                },
                tooltip: 'The name of the recorded item or event.'
            };

            // TODO: Add this when the template sends that information
            //tableInformation.headers["Key name"] = { type: 'string', attr: 'key' };
            tableInformation.headers["Incremental count"] = {
                type: 'integer',
                output: function (row) {
                    return row.count;
                },
                tooltip: 'The number of times this occurred in the time interval.'
            };
            tableInformation.headers["Incremental duration"] = {
                type: 'string',
                attr: 'duration',
                output: function (row) {
                    return $.insmUtilities('secondsToPrettyTime', row.duration);
                },
                sort: function (a, b) {
                    if (a.duration < b.duration) {
                        return -1;
                    }
                    if (a.duration > b.duration) {
                        return 1;
                    }
                    return 0;
                },
                tooltip: 'The duration this was recorded during the time interval.'
            };

            if (options.filter == "keynameAndPlayer") {
                // Add a column for region and player
                tableInformation.headers["% Airtime"] = {
                    type: 'string',
                    output: function (player) {
                        if (!_plugin.data.totalPlayerPlayback[player.name]) {
                            return '-';
                        }
                        var percentage = Math.round(player.duration / _plugin.data.totalPlayerPlayback[player.name] * 1000)/10;
                        return percentage;
                    },
                    sort: function (a, b) {
                        if (a.duration < b.duration) {
                            return -1;
                        }
                        if (a.duration > b.duration) {
                            return 1;
                        }
                        return 0;
                    },
                    tooltip: 'The percentage of time this occurred on this player compared to the other records.<br />Dash ("-") means that the player did not record anything during that interval in that region.'
                };
            }

            if (options.accumulation != 'total') {
                tableInformation.headers["Total count"] = {
                    type: 'integer',
                    output: function (row) {
                        return row.totalCount;
                    },
                    tooltip: 'The total number of times this has occurred from the beginning of time.'
                };

                tableInformation.headers["Total duration"] = {
                    type: 'string',
                    output: function (row) {
                        return $.insmUtilities('secondsToPrettyTime', row.totalDuration);
                    },
                    sort: function (a, b) {
                        if (a.totalDuration < b.totalDuration) {
                            return -1;
                        }
                        if (a.totalDuration > b.totalDuration) {
                            return 1;
                        }
                        return 0;
                    },
                    tooltip: 'The total duration this has occurred since the beginning of time.'
                };
            }

            function idToName(id, filterType) {
                if (filterType == "keynameAndPlayer" ||filterType == "keynameAndRegion") {
                    // Name of the player
                    return _plugin.data.itemList.players[id].name;
                }
                return null;
            }

            function idToRegion(id, filterType) {
                if (filterType == "keynameAndPlayer" ||filterType == "keynameAndRegion") {
                    if (_plugin.data.itemList.players[id]) {
                        if (_plugin.data.itemList.regions[_plugin.data.itemList.players[id].regionId]) {
                            return _plugin.data.itemList.regions[_plugin.data.itemList.players[id].regionId].name;
                        }
                        return 'Removed region';
                    }
                    return 'Unknown';
                }

                return null;
            }

            var totalDuration = 0;
            if (options.statistics) {
                // Grouped data: player/region/timeperiod/typeName/key
                var groupedData = {};

                var grids = options.statistics.Grids;
                $.each(grids, function (index, grid) {
                    _plugin.data.playerCountLookup = {};
                    $.each(grid.Rows, function (index, row) {
                        var name = idToName(grid.Id, options.filter);
                        var region = idToRegion(grid.Id, options.filter);

                        
                        if (!_plugin.data.playerCountLookup[region]) {
                            _plugin.data.playerCountLookup[region] = [];
                        }
                        if ($.inArray(name, _plugin.data.playerCountLookup[region]) == -1) {
                            _plugin.data.playerCountLookup[region].push(name);
                        }
                        

                        var typeName = row.C1;

                        // TODO: Find out which file this is. Probably is a template. Don't forget to edit below. Search for "key"
                        var key = row.Id;
                        var timeperiod;
                        if (options.accumulation != 'total') {
                            timeperiod = row.TP.toString();
                            if (_plugin.data.groupBy > 0) {
                                timeperiod = timeperiod.substring(0, _plugin.data.groupBy);
                            }
                        }
                        else {
                            timeperiod = 'Aggregated';
                        }
                        //row.gridId = idToName(grid.Id, options.filter);
                        //row.region = idToRegion(grid.Id, options.filter);
                        //tableInformation.data.push(row);
                        //totalDuration += parseInt(row.C4);

                        if (!groupedData[name]) {
                            groupedData[name] = {};
                        }
                        if (!groupedData[name][region]) {
                            groupedData[name][region] = {};
                        }
                        if (!groupedData[name][region][typeName]) {
                            groupedData[name][region][typeName] = {};
                        }
                        if (!groupedData[name][region][typeName][key]) {
                            groupedData[name][region][typeName][key] = {};
                        }
                        if (!groupedData[name][region][typeName][key][timeperiod]) {
                            groupedData[name][region][typeName][key][timeperiod] = {
                                incrementalCount: 0,
                                incrementalDuration: 0,
                                totalCount: 0,
                                totalDuration: 0
                            };
                        }

                        groupedData[name][region][typeName][key][timeperiod].incrementalCount += parseInt(row.C3);
                        groupedData[name][region][typeName][key][timeperiod].incrementalDuration += parseFloat(row.C5);
                        groupedData[name][region][typeName][key][timeperiod].totalCount += parseInt(row.C2);
                        groupedData[name][region][typeName][key][timeperiod].totalDuration += parseFloat(row.C4);
                        groupedData[name][region][typeName][key][timeperiod].playerCount = _plugin.data.playerCountLookup[region].length;
                        //if(name !== null && region === null) {
                        //    groupedData[name][region][typeName][key][timeperiod].playerCount = getObjectKeyCount(_plugin.data.itemList.regions[grid.Id].players); groupedData[name][region][typeName][key][timeperiod].playerCount = getObjectKeyCount(_plugin.data.itemList.regions[grid.Id].players);
                        //}
                    });
                });

                var tableData = [];
                _plugin.data.totalPlayerPlayback = {};
                $.each(groupedData, function (name, d1) {
                    $.each(d1, function (region, d2) {
                        $.each(d2, function (typeName, d3) {
                            $.each(d3, function (key, d4) {
                                $.each(d4, function (timeperiod, d5) {
                                    var data = {
                                        name: name,
                                        region: region,
                                        typeName: typeName,
                                        key: key,
                                        timeperiod: timeperiod,
                                        playerCount: d5.playerCount,
                                        count: d5.incrementalCount,
                                        duration: d5.incrementalDuration,
                                        totalCount: d5.totalCount,
                                        totalDuration: d5.totalDuration
                                    };

                                    if (!_plugin.data.totalPlayerPlayback[name]) {
                                        _plugin.data.totalPlayerPlayback[name] = 0;
                                    }
                                    _plugin.data.totalPlayerPlayback[name] += data.duration;

                                    if (options.filter == "keynameAndPlayer") {
                                        delete data.playerCount;
                                    }
                                    else if (options.filter !== "keynameAndRegion") {
                                        delete data.playerCount;
                                        delete data.region;
                                        delete data.name;
                                    }

                                    // TODO: Remove this when key is set to something useful
                                    delete data.key;

                                    tableData.push(data);
                                });
                            });
                        });
                    });
                });
                tableInformation.data = tableData;
            }
            return tableInformation;
        },
        resize: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmStatistics');

            if (_plugin) {
                var target = _plugin.settings.target.insmUtilities('size');
                var header = _plugin.htmlElements.header.insmUtilities('size', { actualSize: true });
                var regionPicker = _plugin.htmlElements.regionPicker.insmUtilities('size', { actualSize: true });
                
                _plugin.htmlElements.statistics.container.css({
                    width: parseInt(target.width - regionPicker.width) + 'px'
                });


                var statisticsControls = _plugin.htmlElements.statistics.controls.insmUtilities('size', { actualSize: true });

                _plugin.htmlElements.statistics.container.css({
                    height: parseInt(target.height - header.height) + 'px'
                });

                var contentMargin = _plugin.htmlElements.statistics.content.insmUtilities('size', { actualSize: true }).height - _plugin.htmlElements.statistics.content.insmUtilities('size').height;

                _plugin.htmlElements.statistics.content.css({
                    height: parseInt(target.height - statisticsControls.height - header.height - contentMargin) + 'px'
                });

                _plugin.htmlElements.regionPicker.css({
                    height: parseInt(target.height - header.height) + 'px'
                });


                _plugin.htmlElements.regionPicker.insmRegionPicker('resize');
            }

            return $this;
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmStatistics');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            }
            else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview statistics');

            var previewContainer = $('<div />').click(function (e) {
                e.stopPropagation();
                _plugin.settings.show();
            });

            previewContainer.append($('<h2 />').text('Statistics'));

            _plugin.settings.previewTarget.html(previewContainer);

            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            return _plugin.settings.previewTarget;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmStatistics');
            
            if (_plugin.settings.target) {
                return _plugin.settings.target;
            }
            else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        changeRegion: function () {
            var $this = $(this);
            var _plugin = $this.data('insmStatistics');

            _plugin.htmlElements.reportWrapper.empty();

            var regionName = $('<h2 />').text(_plugin.settings.region.name);
            var outPutTable = $('<div />').addClass('statisticsDataTable');

            var dateInterval;

            switch (_plugin.data.timePeriodFormat) {
                case 'y':
                    dateInterval = {
                        displayName: 'Date Interval',
                        type: 'dateIntervalYear',
                        required: true,
                        maxDate: $.datepicker.formatDate('yy', new Date()),
                        value: {
                            start: $.datepicker.formatDate('yy', new Date()),
                            end: $.datepicker.formatDate('yy', new Date())
                        }
                    };
                    break;
                case 'm':
                    dateInterval = {
                        displayName: 'Date Interval',
                        type: 'dateIntervalMonth',
                        required: true,
                        maxDate: $.datepicker.formatDate('yy-mm', new Date()),
                        value: {
                            start: $.datepicker.formatDate('yy-mm', new Date()),
                            end: $.datepicker.formatDate('yy-mm', new Date())
                        }
                    };
                    break;
                default:
                    dateInterval = {
                        displayName: 'Date Interval',
                        type: 'dateInterval',
                        required: true,
                        maxDate: $.datepicker.formatDate('yy-mm-dd', new Date()),
                        value: {
                            start: $.datepicker.formatDate('yy-mm-dd', new Date()),
                            end: $.datepicker.formatDate('yy-mm-dd', new Date())
                        }
                    };
                    break;
            }
            var defaultValue = null;
            $.each(_plugin.settings.allowedTypes, function (key, value) {
                if (!defaultValue) {
                    defaultValue = key;
                    return false;
                }
            });
            var inputTableStructure = {
                type: {
                    displayName: 'Data Source',
                    type: 'string',
                    availableValues: _plugin.settings.allowedTypes,
                    value: defaultValue,
                    required: true
                },
                filter: {
                    displayName: 'Aggregation',
                    type: 'string',
                    availableValues: {
                        keyname: 'Total',
                        keynameAndRegion: 'Region',
                        keynameAndPlayer: 'Player'
                    },
                    value: 'keyname',
                    required: true
                },
                dateInterval: dateInterval,
                accumulation: {
                    displayName: 'Accumulation',
                    type: 'string',
                    availableValues: {
                        total: 'Total',
                        none: 'None'
                    },
                    value: 'total',
                    required: true
                }
            };

            var inputTable = $('<div />').insmInput({
                type: 'table',
                objectDefinition: inputTableStructure
            }).insmInput('edit');


            var exportButton = $('<button disabled="disabled" />').click(function () {
                var data = outPutTable.insmTable('getData');

                if (data.length == 0) {
                    $.insmNotification({
                        type: 'information',
                        message: 'No rows in table'
                    });
                    return;
                }

                var sep = ",";
                var csv = 'sep=' + sep + '\r\n';

                $.each(_plugin.data.tableInformation.headers, function (title, header) {
                    csv += (title) + sep;
                });

                "Result has "

                csv = csv.substr(0, csv.length - 1) + '\r\n';
                $.each(data, function (index, row) {
                    $.each(_plugin.data.tableInformation.headers, function (title, header) {
                        csv += '"'+(header.output(row))+'"' + sep;
                    });
                    csv = csv.substr(0, csv.length - 1) + '\r\n';
                });
                var d = new Date();
                var date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();

                var settings = inputTable.insmInput('getValue');
                var filename = _plugin.settings.region.name + '.' + settings.dateInterval.start + '.' + settings.dateInterval.end + '.' + $.datepicker.formatDate('yy-mm-dd', new Date());
                $.insmFramework('convert', {
                    mimetype: 'text/csv',
                    data: csv,
                    filename: filename
                });

            }).text('Export table data');

            var getStatisticsButton = $('<button />').click(function () {
                if (inputTable.insmInput('validate')) {
                    var settings = inputTable.insmInput('getValue');
                    outPutTable.empty().insmLoader();

                    $this.insmStatistics('getStatistics', {
                        node: _plugin.settings.region,
                        type: settings.type,
                        dateInterval: settings.dateInterval,
                        filter: settings.filter
                    }).done(function (statistics) {
                        outPutTable.insmLoader('destroy');
                        _plugin.data.tableInformation = $this.insmStatistics('statisticsToTableData', {
                            filter: settings.filter,
                            type: settings.type,
                            statistics: statistics,
                            accumulation: settings.accumulation
                        });

                        if (_plugin.data.tableInformation.data.length == 0) {
                            exportButton.attr('disabled', 'disabled');
                        }
                        else {
                            exportButton.removeAttr('disabled');
                        }

                        outPutTable.hide().fadeIn().insmTable('destroy').insmTable({
                            headers: _plugin.data.tableInformation.headers,
                            items: _plugin.data.tableInformation.data,
                            selectable: false,
                            searchIndex: function (item) {
                                var searchArray = [];
                                if (item.key) {
                                    searchArray.push(item.key);
                                }
                                if (item.typeName) {
                                    searchArray.push(item.typeName);
                                }
                                if (item.name) {
                                    searchArray.push(item.name);
                                }
                                if (item.region) {
                                    searchArray.push(item.region);
                                }
                                if (item.timeperiod) {
                                    searchArray.push(_plugin.data.renderTimeperiod(item.timeperiod));
                                }
                                return searchArray;
                            }
                        }).insmTable('populateTable');

                        //var filename = _plugin.settings.region.name + '.' + settings.dateInterval.start + '.' + settings.dateInterval.end;// + '.' + $.datepicker.formatDate('yy-mm-dd', new Date());
                        //$CSVButton.insmSetCSVExportButton({
                        //    tableInformation: _plugin.data.tableInformation,
                        //    filename: filename
                        //}).removeClass('disabled');
                    });
                }
            }).text('Show statistics');
            

            _plugin.htmlElements.reportWrapper.append(
                regionName,
                inputTable.addClass('inputFields'),
                $('<div />').addClass('controls').append(
                    getStatisticsButton,
                    exportButton
                ),
                outPutTable
            ).hide().fadeIn();

            _plugin.htmlElements.statistics.content.append(_plugin.htmlElements.reportWrapper);
            return $this;

            return $this;
        },
        generateRegionLookupTable: function () {
            var $this = $(this);
            var _plugin = $this.data('insmStatistics');

            return $.insmFramework('regionTree', {
                regionId: _plugin.settings.regionId,
                includePlayers: true,
                success: function (regionTree) {
                    function parseNodes(node) {
                        _plugin.data.itemList.regions[node.id] = node;
                        $.each(node.children, function (index, child) {
                            parseNodes(child);
                        });
                        $.each(node.players, function (index, child) {
                            child.regionId = parseInt(node.id);
                            _plugin.data.itemList.players[child.upid] = child;
                        });
                    }
                    if (!$.isEmptyObject(regionTree)) {
                        parseNodes(regionTree);
                    }
                },
                denied: function (data) {
                    $.insmFramework('login', {
                        success: function () {
                            $.insmViewHandler('show', {
                                viewName: 'regionTree'
                            });
                        }
                    });
                },
                error: function (message) {
                    $.insmNotification({
                        type: 'error',
                        message: message
                    });
                }
            });
        },
        fullscreen: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmStatistics');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function () {
                    $this.insmSystemDetails('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;

            var deferred = $this.insmStatistics('generateRegionLookupTable');
            deferred.done(function () {
                // Init html
                _plugin.settings.target.addClass('statistics').append(
                    _plugin.htmlElements.header.addClass('header').append(
                        $('<div />').addClass('company-logo'),
                        $('<div />').addClass('module-logo')
                    ),
                    _plugin.htmlElements.body.addClass('container').append(
                        _plugin.htmlElements.regionPicker.addClass('regionPicker expanded'),
                        _plugin.htmlElements.statistics.container.addClass('statisticsContainer').append(
                            _plugin.htmlElements.statistics.controls.addClass('controls'),
                            _plugin.htmlElements.statistics.content.addClass('content')
                        )
                    )
                );

                // Fix sizes on elements
                setTimeout(function () {

                    _plugin.htmlElements.regionPicker.insmRegionPicker({
                        applicationName: _plugin.settings.applicationName,
                        onSelect: function (region) {
                            _plugin.settings.region = region;
                            $this.insmStatistics('changeRegion');
                        }
                    });

                    $this.insmStatistics('resize');
                }, 1);
            });
            
            return $this;
        },
        hasSettings: function (options) {
            return false;
        },
        onClose: function (options) {
            options.success();
        },
        setSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmStatistics');

            _plugin.subscriptions.start = function () {
                //$.insmService('register', {
                //    subscriber: _plugin.settings.applicationName,
                //    type: 'player',
                //    update: function (player) {
                //        _plugin.data.itemList.players[player.upid] = player;
                //    },
                //    remove: function () {
                //        // TODO: Is this needed?
                //    }
                //});
            };

            $this.insmStatistics('stopSubscriptions');
            $this.insmStatistics('startSubscriptions');

            _plugin.subscriptions.stop = function () {
                //$.insmService('unregister', {
                //    subscriber: _plugin.settings.applicationName,
                //    type: 'player'
                //});
            };

            return $this;
        },
        startSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmStatistics');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmStatistics');

            _plugin.subscriptions.stop();

            return $this;
        }
    };

    $.fn.insmStatistics = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmStatistics');
            return null;
        }
    };

})(jQuery);
