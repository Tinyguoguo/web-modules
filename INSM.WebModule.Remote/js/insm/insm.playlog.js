/*
* INSM Playlog
* This file contain the INSM Playlog function.
* The script display a list of all players in an Instoremedia Assets Management Server (AMS).
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmPlaylog(settings);
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
"use strict";
(function ($) {
    //TODO: should this be moved to own plugin?
    $.fn.insmAssetPlaylogDetails = function (options) {
        $this = $(this);
        $this.empty();
        $testTimeline = $('<div />');

        var timeline = {
            data: [
                {
                    start: "2013-09-01T23:55:00",
                    duration: 3000,
                    hoverContent: "text",
                },
                {
                    start: "2013-09-01T12:00:00",
                    duration: 250,
                    hoverContent: $('<div><ul><li>Test</li><li>Test2</li></ul></div>'),
                }
            ],
            start: "2013-09-02T00:00:00",
            end: "2013-09-02T23:59:59"
        }

        $testTimeline.insmTimeline(timeline);

        return $this;
    }
})(jQuery);




(function ($) {
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmPlaylog');
            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        searchField: $('<div />').addClass('searchField'),
                        regionTree: $('<ul />').addClass('regionTree'),
                        playlogContainer: $('<div/>').addClass('playlogContainer'),
                        column: {
                            left: $('<div />').addClass('column'),
                            right: $('<div />').addClass('column mainColumn')
                        },
                        reportWrapper: $("<div/>", { class: "reportWrapper" })
                    },
                    settings: $.extend({
                        framework: null,
                        regionId: 1,
                        applicationName: 'Playlog',
                        ssl: false,
                        ams: '',
                        version: manifest.version
                    }, options)
                };
                $this.data('insmPlaylog', _plugin);

            }


            if (!_plugin.settings.framework) {
                if (!$.insmFramework('isInitialized')) {
                    $.insmFramework({
                        ams: _plugin.settings.ams,
                        app: _plugin.settings.applicationName,
                        version: _plugin.settings.version,
                        protocol: (_plugin.settings.ssl ? 'https' : 'http'),
                        session: (urlDecode($(document).getUrlParam('session')) || '')
                    });
                }
            }

            $.when($.insmFramework('initialized')).done(function () {
                _plugin.framework = $.insmFramework('getDeprecatedFramework');

                // Init HTML
                $this.append(
                    _plugin.htmlElements.column.left.append(
                        _plugin.htmlElements.searchField,
                        _plugin.htmlElements.regionTree
                    ),
                    _plugin.htmlElements.column.right.append(
                        _plugin.htmlElements.playlogContainer
                    )
                ).addClass('nowrap');

                // Init Views
                _plugin.htmlElements.column.left.insmViewHandler({
                    viewName: 'regionTree',
                    method: function () {
                        $this.insmPlaylog('displayRegionTree');
                    }
                });

                _plugin.htmlElements.column.right.insmViewHandler({
                    viewName: 'Playlog',
                    method: function (viewData) {
                        $this.insmPlaylog('displayPlaylog', viewData);
                    }
                });

                _plugin.htmlElements.column.left.insmViewHandler('show', {
                    viewName: 'regionTree'
                });



            });
            return $this;
        },
        displayPlaylog: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylog');

            _plugin.htmlElements.reportWrapper.empty();

            function populateNodeWithSimpleAssetData(node, dateInterval) {
                var retDef = $.Deferred();
                var defList = [];
                var playlogDef = $.Deferred();
                defList.push(playlogDef);
                if (node.upid) { //player
                    var not = $.insmNotification({
                        text: 'Downloading playlog from player ' + node.upid,
                        type: 'load',
                        duration: 0
                    });

                    $.insmFramework("playlog", {
                        upid: node.upid,
                        includeplaylog: false,
                        includeplayerengine: false,
                        fromDate: dateInterval.start,
                        toDate: dateInterval.end + "T23:59:00",
                        type: 'DataSet',
                        success: function (data) {
                            not.update({
                                text: 'Downloaded from player ' + node.upid,
                                type: 'successful',
                                duration: -1
                            });
                            node.assets = sortPlaylogs(data);
                            playlogDef.resolve();
                        }, error: function (message) {
                            $.insmNotification({
                                text: message,
                                type: 'error'
                            });
                        }, denied: function () {
                            $.insmNotification({
                                text: 'Denied',
                                type: 'error'
                            });
                            $this.insmPlaylog(_plugin.settings);
                        }
                    });
                } else { // region
                    playlogDef.resolve();
                    $.each(node.children, function (index, child) {
                        defList.push(populateNodeWithSimpleAssetData(child, dateInterval));
                    });
                }

                $.when.apply(this, defList).done(function () {
                    retDef.resolve();
                });
                return retDef;
            }

            var $timeIntervalInput = $('<div />').insmInput({
                type: 'dateinterval'
            }).insmInput('edit');
            var $CSVButton = $('<a />').text("Export to excel").addClass("button disabled csv");
            var $assetRadio = $('<label for="table-asset"><input type="radio" id="table-asset" name="table-type-selector" value="asset" checked="checked" />Asset</label>');
            var $playerRadio = $('<label for="table-player"><input type="radio" id="table-player" name="table-type-selector" value="player" disabled="disabled" />Player</label>');
            var $regionRadio = $('<label for="table-region"><input type="radio" id="table-region" name="table-type-selector" value="region" disabled="disabled" />Region</label>');

            if (regionHasChildren(options.node, 'region')) {
                $regionRadio.find('input').removeAttr("disabled");
            }
            if (regionHasChildren(options.node, 'player')) {
                $playerRadio.find('input').removeAttr("disabled");
            }

            var $fakeLinkToAssetPlaylogDetails = $('<a />').text("Asset Details").click(function () {
                $this.detatch().insmAssetPlaylogDetails();
            });

            var $tableStructTypeRadioButtons = $('<div />').addClass('table-type').text("Table type: ").append($assetRadio, $playerRadio, $regionRadio);

            var $table = $('<div />').addClass('table');
            var $goButton = $('<a />').text('Get statistics').addClass('button go').click(function () {


                if ($timeIntervalInput.insmInput('validate')) {
                    var cleanDataNode = cleanNodeStructure(options.node);
                    var deffered = populateNodeWithSimpleAssetData(cleanDataNode, $timeIntervalInput.insmInput('getValue'));
                    var not = $.insmNotification({
                        text: 'Downloading player data',
                        type: 'load',
                        duration: 0
                    });
                    deffered.done(function () {
                        var tableInformation;
                        not.update({ text: 'Player data downloaded', type: 'successful' });
                        var selected = $tableStructTypeRadioButtons.find("input:radio[name=table-type-selector]:checked").val();

                        var setTableAndButton = function () {
                            if (selected == "asset") {
                                tableInformation = groupByAssetTable(cleanDataNode);
                            } else if (selected == "player") {
                                tableInformation = groupByPlayerTable(cleanDataNode);
                            } else if (selected == "region") {
                                tableInformation = groupByRegionTable(cleanDataNode);
                            }
                            $table.empty().removeData();
                            $table.insmTablesorter({ headers: tableInformation.headers, data: tableInformation.data });
                            $CSVButton.insmSetCSVExportButton({ tableInformation: tableInformation, filename: 'Playlog' }).removeClass('disabled');
                        };
                        setTableAndButton();

                        $tableStructTypeRadioButtons.find("input:radio[name=table-type-selector]").change(function () {
                            selected = $(this).val();
                            setTableAndButton();
                        });

                    });
                }
            });
            var $timeIntervalInputWrapper = $('<div />').addClass('date-interval').text('Select date interval: ').append($timeIntervalInput);
            _plugin.htmlElements.reportWrapper.append($tableStructTypeRadioButtons, $timeIntervalInputWrapper, $goButton, $CSVButton, $table);
            _plugin.htmlElements.playlogContainer.append(_plugin.htmlElements.reportWrapper);
            return $this;
        },
        displayRegionTree: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylog');

            _plugin.htmlElements.searchField.insmSearchField({
                onSearch: function (searchstring) {
                    if (searchstring) {
                        var hits = 0;
                        _plugin.htmlElements.regionTree.insmListTree('unmarkNodes');
                        var selectedNodeId;
                        $.each(_plugin.htmlElements.regionTree.insmListTree('getAllNodes'), function (index, node) {
                            if (node.name.toLowerCase().indexOf(searchstring.toLowerCase()) >= 0) {
                                hits++;
                                selectedNodeId = index;
                                _plugin.htmlElements.regionTree
                                    .insmListTree('expandNode', {
                                        nodeId: index
                                    })
                                    .insmListTree('markNode', {
                                        nodeId: index
                                    });
                            }
                        });
                        if (hits == 1) {
                            $this.insmPlaylog('displayPlaylog', {
                                node: _plugin.htmlElements.regionTree.insmListTree('getNode', {
                                    id: selectedNodeId
                                })
                            });
                        }
                        $.insmNotification({
                            type: 'information',
                            text: hits + ' search hits'
                        });
                    }
                },
                onClear: function () {
                    _plugin.htmlElements.searchField.insmSearchField('clearSearchField');
                    _plugin.htmlElements.regionTree.insmListTree('unmarkNodes');
                }
            }).addClass('searchfield');
            var not = $.insmNotification({
                type: 'load',
                text: 'Getting region information'
            });
            $.insmFramework('regionTree', {
                regionId: _plugin.settings.regionId,
                includePlayers: true,
                success: function (regionTree) {
                    var tree = parseNodes(regionTree);
                    not.update({
                        text: 'Region information downloaded',
                        type: 'successful'
                    });
                    tree.root = true;
                    _plugin.htmlElements.regionTree.insmListTree({
                        tree: tree,
                        clickable: true,
                        selectable: false,
                        recursive: false,
                        lazyload: false,
                        onClick: function (node) {
                            _plugin.htmlElements.reportWrapper.empty();
                            $this.insmPlaylog('displayPlaylog', { node: node });
                        }
                    });
                },
                denied: function (data) {
                    _plugin.framework.login({
                        type: data.Type,
                        target: data.Target,
                        version: data.Version,
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
                        text: message
                    });
                }
            });

            return $this;
        }
    };

    function parseNodes(node) {
        if (node) {
            var children = [];
            $.each(node.Regions, function (index, child) {
                children.push(parseNodes(child));
            });
            $.each(node.Players, function (index, child) {
                children.push({
                    _class: "player " + child.State,
                    name: child.Name,
                    id: child.Id,
                    upid: child.UPId,
                    description: child.Description,
                    datasetId: child.DatasetId,
                    state: child.State
                });
            });
            return {
                _class: "region " + node.State,
                name: node.Name,
                id: node.Id,
                description: node.Description,
                datasetId: node.DatasetId,
                state: node.State,
                children: children
            };
        }
        return null;
    }

    function cleanNodeStructure(node) {
        var _node = {};

        if (node.upid) {
            _node.upid = node.upid;
        } else if (node.id) {
            _node.id = node.id;
        }
        if (node.name) {
            _node.name = node.name;
        }

        if (node.children && !node.upid) {
            _node.children = [];
            $.each(node.children, function (index, childNode) {
                _node.children.push(cleanNodeStructure(childNode));
            });
        }
        return _node;
    }

    function sortPlaylogs(data) {
        var assets = {};
        $.each(data, function (key, assetList) {
            $.each(assetList, function (assetId, asset) {
                if (asset.Type === "DataSet" && asset.LastStartTime && asset.Counts && asset.Duration) {
                    if (!assets[asset.Name]) {
                        assets[asset.Name] = {
                            lastStartTime: asset.LastStartTime,
                            counts: asset.Counts,
                            duration: asset.Duration,
                        };
                    } else {
                        assets[asset.Name].lastStartTime = assets[asset.Name].start > asset.LastStartTime ? assets[asset.Name].start : asset.LastStartTime;
                        assets[asset.Name].counts += asset.Counts;
                        assets[asset.Name].duration += asset.Duration;
                    }
                }
            });
        });
        return assets;
    }

    function regionHasChildren(node, type) {
        var res = false;
        if (node.upid) {
            return false;
        }
        if (type == 'player') {
            $.each(node.children, function (index, childNode) {
                if (!childNode.upid) {
                    if (regionHasChildren(childNode, type)) {
                        res = true;
                        return false;
                    }
                } else {
                    res = true;
                    return false;
                }
            });
        }
        if (type == 'region') {
            $.each(node.children, function (index, childNode) {
                if (!childNode.upid) {
                    res = true;
                    return false;
                }
            });
        }
        return res;
    }

    function groupByAssetTable(node) {
        var tableInfo = {};
        tableInfo.headers = {
            'Asset Name': {
                type: 'string',
                attr: 'assetName'
            },
            'No. Players': {
                type: 'string',
                attr: 'nrOfPlayers'
            },
            'Play instance': {
                type: 'string',
                attr: 'nrPlayInstance'
            },
            'Total playtime': {
                type: 'string',
                attr: 'totalPlaytime'
            },
            '% Total playtime': {
                type: 'string',
                attr: 'percentPlaytime'
            }
        }

        var assets = {};
        function structFunc(node) {
            if (node.assets) {
                $.each(node.assets, function (assetName, assetData) {

                    if (!assets[assetName]) {
                        assets[assetName] = {
                            assetName: assetName,
                            nrOfPlayers: 0,
                            nrPlayInstance: 0,
                            totalPlaytime: 0,
                            percentPlaytime: 0,
                        }
                    }
                    assets[assetName].nrOfPlayers++;
                    assets[assetName].nrPlayInstance += assetData.counts;
                    assets[assetName].totalPlaytime += assetData.duration;
                });
            } else {
                $.each(node.children, function (name, childNode) {
                    structFunc(childNode);
                });
            };
        }
        structFunc(node);

        var totalAssetsDuration = 0;
        var assetList = [];
        $.each(assets, function (name, asset) {
            assetList.push(asset);
            totalAssetsDuration += asset.totalPlaytime;
        });
        $.each(assetList, function (index, asset) {
            asset.percentPlaytime = ((asset.totalPlaytime / totalAssetsDuration) * 100).toFixed(2) + "%"
        });

        tableInfo.data = assets;
        return tableInfo;
    }


    function groupByPlayerTable(node) {
        var tableInfo = {};
        tableInfo.headers = {
            'Player Name': {
                type: 'string',
                attr: 'playerName'
            },
            'Asset Name': {
                type: 'string',
                attr: 'assetName'
            },
            'Play instance': {
                type: 'string',
                attr: 'nrPlayInstance'
            },
            'Total playtime': {
                type: 'string',
                attr: 'totalPlaytime'
            },
            '% Total playtime': {
                type: 'string',
                attr: 'percentPlaytime'
            }
        }

        var players = {};
        function structFunc(node) {
            if (node.assets) {
                if (!players[node.name]) {
                    players[node.name] = {};
                }
                $.each(node.assets, function (assetName, assetData) {

                    if (!players[node.name][assetName]) {
                        players[node.name][assetName] = {
                            assetName: assetName,
                            nrOfPlayers: 0,
                            nrPlayInstance: 0,
                            totalPlaytime: 0,
                            percentPlaytime: 0,
                        }
                    }
                    players[node.name][assetName].nrOfPlayers++;
                    players[node.name][assetName].nrPlayInstance += assetData.counts;
                    players[node.name][assetName].totalPlaytime += assetData.duration;
                });
            } else {
                $.each(node.children, function (name, childNode) {
                    structFunc(childNode);
                });
            };
        }
        structFunc(node);

        var totalAssetsDuration = 0;
        var playersList = [];
        $.each(players, function (playerName, assets) {
            $.each(assets, function (assetName, asset) {
                asset.playerName = playerName;
                playersList.push(asset);
                totalAssetsDuration += asset.totalPlaytime;
            });
        });
        $.each(playersList, function (index, asset) {
            asset.percentPlaytime = ((asset.totalPlaytime / totalAssetsDuration) * 100).toFixed(2) + "%"
        });
        tableInfo.data = playersList;
        return tableInfo;
    }


    function groupByRegionTable(node) {
        var tableInfo = {};
        tableInfo.headers = {
            'SubRegion/Player': {
                type: 'string',
                attr: 'subRegion'
            },
            'Asset name': {
                type: 'string',
                attr: 'assetName'
            },
            'No. Players': {
                type: 'string',
                attr: 'nrOfPlayers'
            },
            'Play instance': {
                type: 'string',
                attr: 'nrPlayInstance'
            },
            'Total playtime': {
                type: 'string',
                attr: 'totalPlaytime'
            },
            '% Total playtime': {
                type: 'string',
                attr: 'percentPlaytime'
            }
        }

        function structFunc(node, assetObject) {
            if (node.assets) {
                $.each(node.assets, function (assetName, assetData) {
                    if (!assetObject[assetName]) {
                        assetObject[assetName] = {
                            assetName: assetName,
                            nrOfPlayers: 0,
                            nrPlayInstance: 0,
                            totalPlaytime: 0,
                            percentPlaytime: 0,
                        }
                    }
                    assetObject[assetName].nrOfPlayers++;
                    assetObject[assetName].nrPlayInstance += assetData.counts;
                    assetObject[assetName].totalPlaytime += assetData.duration;
                });
            } else {
                $.each(node.children, function (name, childNode) {
                    structFunc(childNode, assetObject);
                });
            };
        }

        var regions = {};
        $.each(node.children, function (index, childNode) {
            var assets = {}
            regions[childNode.name] = assets;
            structFunc(childNode, assets);
        });

        var totalAssetsDuration = 0;
        var regionList = [];
        $.each(regions, function (regionName, assets) {
            $.each(assets, function (assetName, asset) {
                asset.subRegion = regionName;
                regionList.push(asset);
                totalAssetsDuration += asset.totalPlaytime;
            });
        });
        $.each(regionList, function (index, asset) {
            asset.percentPlaytime = ((asset.totalPlaytime / totalAssetsDuration) * 100).toFixed(2) + "%"
        });

        tableInfo.data = regionList;
        return tableInfo;
    }

    $.fn.insmPlaylog = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPlaylog');
        }
    };
})(jQuery);