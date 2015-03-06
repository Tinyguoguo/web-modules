/*
* INSM Player Details
* This file contain the INSM Player Details function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmPlayerDetails(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        getTabContainer: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmPlayerDetails');

            return _plugin.htmlElements.tabContainer;
        },
        init: function (options) {
            // Global vars
            var $this = $(this).addClass('insm-player-details');
            var _plugin = $this.data('insmPlayerDetails');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        ams: '',
                        app: 'Player Details',
                        version: manifest.version,
                        ssl: false,
                        upid: '',
                        playerId: 0,
                        framework: null,
                        teamViewerId: 0,
                        tabs: ['Information', 'Diagnostics', 'Plugins', 'Displays', 'Channels', 'System', 'Transfer', 'History'],
                        onDownload: function (player) { }
                    }, options),
                    htmlElements: {
                        tabContainer: $('<div />'),
                        playerInformation: $('<div />'),
                        playerDiagnostics: $('<div />'),
                        playerPlugins: $('<div />'),
                        playerDisplays: $('<div />'),
                        playerChannels: $('<div />'),
                        playerSystem: $('<div />'),
                        playerTransfer: $('<div />'),
                        playerStateHistory: $('<div />'),
                        clear: $('<div />').addClass('clear')
                    }
                };
                $this.data('insmPlayerDetails', _plugin);
            }

            // Framework is mandatory
            if (!_plugin.settings.framework) {
                if (!_plugin.settings.ams) {
                    $.insmNotification({
                        type: 'error',
                        text: 'No framework provided in INSM Player Details'
                    });
                    return $this;
                }

                _plugin.settings.framework = $.insmFramework({
                    ams: _plugin.settings.ams,
                    app: _plugin.settings.app,
                    version: _plugin.settings.version,
                    protocol: (_plugin.settings.ssl ? 'https' : 'http')
                });
            }

            $this.append(_plugin.htmlElements.tabContainer);

            var startTabs = {
                'Information': {
                    title: 'Player Information',
                    content: _plugin.htmlElements.playerInformation
                },
                'Diagnostics': {
                    title: 'Diagnostics',
                    content: _plugin.htmlElements.playerDiagnostics
                },
                'Plugins': {
                    title: 'Plugins',
                    content: _plugin.htmlElements.playerPlugins
                },
                'Displays': {
                    title: 'Displays',
                    content: _plugin.htmlElements.playerDisplays
                },
                'Channels': {
                    title: 'Channels',
                    content: _plugin.htmlElements.playerChannels
                },
                'System': {
                    title: 'System',
                    content: _plugin.htmlElements.playerSystem
                },
                'Transfer': {
                    title: 'Transfer',
                    content: _plugin.htmlElements.playerTransfer
                },
                'History': {
                    title: 'History',
                    content: _plugin.htmlElements.playerStateHistory
                }
            };

            var tabs = {};
            $.each(startTabs, function (key, object) {
                if ($.inArray(key, _plugin.settings.tabs) != -1) {
                    tabs[key] = startTabs[key];
                }
            });
            
            _plugin.htmlElements.tabContainer.insmTabs({
                tabs: tabs
            });

            _plugin.htmlElements.playerInformation.html(
                $('<div />').insmProgressBar()
            );
            _plugin.htmlElements.playerDiagnostics.html(
                $('<div />').insmProgressBar()
            );
            _plugin.htmlElements.playerDiagnostics.html(
                $('<div />').insmProgressBar()
            );
            _plugin.htmlElements.playerPlugins.html(
                $('<div />').insmProgressBar()
            );
            _plugin.htmlElements.playerDisplays.html(
                $('<div />').insmProgressBar()
            );
            _plugin.htmlElements.playerChannels.html(
                $('<div />').insmProgressBar()
            );
            _plugin.htmlElements.playerSystem.html(
                $('<div />').insmProgressBar()
            );
            _plugin.htmlElements.playerTransfer.html(
                $('<div />').insmProgressBar()
            );
            _plugin.htmlElements.playerStateHistory.html(
                $('<div />').insmProgressBar()
            );
            $.insmFramework('player', {
                upid: _plugin.settings.upid,
                success: function (player) {
                    if (!player) {
                        $.insmNotification({
                            type: 'error',
                            text: 'No player with upid "' + _plugin.settings.upid + '"'
                        });
                        return;
                    }
                    _plugin.settings.onDownload(player);

                    if (!player.PlayerStatus) {
                        player.PlayerStatus = player.Status;
                    }
                    if (!player.ContentStatus) {
                        player.ContentStatus = {
                        };
                    }
                    var generateStatusTables = function (headersArray, errorText) {
                        var ret = $('<div />').addClass('section');
                        if (headersArray.length == 0) {
                            return $('<div />').text(errorText);
                        } else {
                            $.each(headersArray, function (index, headers) {
                                ret.append(
                                    generateStatusTable(headers)
                                );
                            });
                        }
                        return ret.after($('<div />').addClass('clear'));
                    };


                    var generateStatusTable = function (headers) {
                        var $ret = $('<div />').append(
                            $('<h3 />').text(headers.title)
                        ).addClass('info-box');
                        $table = $('<table />').addClass('vertical no-border');
                        $.each(headers.data, function (index, header) {
                            if (!header) {
                                return false;
                            }
                            var title = "", status = "", tooltip = "", popup = "";
                            if (typeof header.title === 'function') { title = header.title(player); } else { title = header.title; }
                            if (typeof header.status === 'function') { status = header.status(player); } else { status = header.status; }
                            if (typeof header.tooltip === 'function') { tooltip = header.tooltip(player); } else { tooltip = header.tooltip; }
                            if (typeof header.popup === 'function') { popup = header.popup(player); } else { popup = header.popup; }
                            $table.append($('<tr />').append(
                                $('<td />').append(
                                    $('<div />').insmStatusBox({ title: title, status: status, tooltip: tooltip, popup: popup })
                                )
                            ));
                        });
                        return $ret.append($table);
                    };

                    var generateBarTable = function (headers) {
                        var $ret = $('<div />').addClass('info-box');
                        $ret.append($('<h3 />').text(headers.title));
                        $table = $('<table />').addClass('vertical');
                        $table.append(
                            $('<tr />').append(
                                $('<th />').append(
                                    headers.titleLabel
                                )
                            ).append(
                                $('<th />').append(
                                    headers.minLabel
                                )
                            )
                            .append($('<th />').append(headers.averageLabel))
                            .append($('<th />').append(headers.maxLabel)));
                        $.each(headers.data, function (index, header) {
                            if (!header) {
                                return false;
                            }
                            var title = "", unit = "%", min = 0, max = 0, average = 0;
                            if (typeof header.title === 'function') { title = header.title(player); } else { title = header.title; }
                            if (typeof header.unit === 'function') { unit = header.unit(player); } else { unit = header.unit; }
                            if (typeof header.min === 'function') { min = header.min(player); } else { min = header.min; }
                            if (typeof header.max === 'function') { max = header.max(player); } else { max = header.max; }
                            if (typeof header.average === 'function') { average = header.average(player); } else { average = header.average; }
                            var bar = $('<div />').insmBar({
                                unit: unit,
                                min: min,
                                max: max,
                                average: average,
                                prefix: header.prefix,
                                getHtmlElemets: true
                            });
                            $table.append($('<tr />').append(
                                $('<td />').append(title),
                                $('<td />').append(bar.min),
                                $('<td />').append(bar.barHolder),
                                $('<td />').append(bar.max)
                            ));
                        });
                        return $ret.append($table).after(
                            $('<div />').addClass('clear')
                        );
                    };

                    var averageFunc = function (sampleArray) {
                        var avg = 0;
                        var count = 0;
                        $.each(sampleArray, function (key, value) {
                            avg += value;
                            count++;
                        });
                        if (!count) return 0;
                        return Math.round(avg / count * 100) / 100;
                    };

                    systemUsage = {
                        cssId: 'system-usage',
                        cssClass: 'box',
                        title: 'System Usage',
                        titleLabel: 'Type',
                        maxLabel: 'Max',
                        minLabel: 'Min',
                        averageLabel: 'Average',
                        data: [
                            {
                                title: 'Disk Usage',
                                unit: 'B',
                                max: player.DiskUsage.UpperBound * 1000 * 1000,
                                min: player.DiskUsage.LowerBound * 1000 * 1000,
                                average: player.DiskUsage.Current * 1000 * 1000,
                                prefix: true
                            }
                        ]
                    };
                    if (player.SystemInfo.Type == 'Player') {
                        systemUsage.data.push(
                            {
                                title: 'Memory Usage',
                                unit: 'B',
                                max: player.MemoryUsage.UpperBound * 1000,
                                min: player.MemoryUsage.LowerBound * 1000,
                                average: player.MemoryUsage.Current * 1000,
                                prefix: true
                            },
                            {
                                title: 'Average CPU Usage',
                                unit: '%',
                                max: 100,//player.CPUUsage.UpperBound,
                                min: player.CPUUsage.LowerBound,
                                average: averageFunc(player.CPUUsage.Samples),
                                prefix: false
                            },
                            {
                                title: 'Network Usage',
                                unit: 'B/s',
                                max: player.NetworkUsage.UpperBound * 1000,
                                min: player.NetworkUsage.LowerBound * 1000,
                                average: averageFunc(player.NetworkUsage.Samples) * 1000,
                                prefix: true
                            },
                            {
                                title: 'Temperature',
                                unit: 'C',
                                max: player.Temperature.UpperBound,
                                min: player.Temperature.LowerBound,
                                average: averageFunc(player.Temperature.Samples),
                                prefix: false
                            }
                        );
                    }
                    
                    var transferStatus = {
                        cssId: 'transferStatus',
                        cssClass: 'box',
                        title: "",
                        data: [
                            //{
                            //    title: 'Transfer Service Status',
                            //    status: player.Transfer.Status.State == "OK" && $.insmFramework("getEntityVersion") - player.Transfer.Version > 0 ? "Transfer" : player.Transfer.Status.State,
                            //    tooltip: player.Transfer.Status.State == "OK" && $.insmFramework("getEntityVersion") - player.Transfer.Version > 0 ? 'The transfer service is transferring meta-data.' : 'State of the transfer service.',
                            //    popup: $('<div />').addClass('insm-player-details-popup').append(
                            //        $('<h5 />').text('Transfer Service Status')
                            //    ).append(
                            //        $('<p />').append(
                            //            $('<table />').addClass('vertical').append(
                            //                $('<tr />').append(
                            //                    $('<th />').text('State'),
                            //                    $('<td />').text(player.Transfer.Status.State == "OK" && $.insmFramework("getEntityVersion") - player.Transfer.Version > 0 ? 'Transferring' : player.Transfer.Status.State)
                            //                ),
                            //                $('<tr />').append(
                            //                    $('<th />').text('Timestamp when status last changed'),
                            //                    $('<td />').insmStatusBox({
                            //                        title: printDate(player.Transfer.Status.Timestamp, 'Y-m-d H:i:s'),
                            //                        status: 'x',
                            //                        tooltip: 'Timestamp updates when the status changes.'
                            //                    })
                            //                ),
                            //                $('<tr />').append(
                            //                    $('<th />').text('Message'),
                            //                    $('<td />').text(player.Transfer.Status.Message)
                            //                )
                            //            )
                            //        )
                            //    )
                            //},
                            {
                                title: 'Available entities on server: ' + $.insmFramework("getEntityVersion"),
                                status: 'x',
                                tooltip: 'Shows number of rows in AMS database.'
                            },
                            {
                                title: 'Downloaded entities: ' + player.Transfer.Version,
                                status: 'x',
                                tooltip: 'Shows number of rows in Media Player database.'
                            }
                        ]
                    };

                    var fileTransfer = [];
                    $.each(player.FileTransfer, function (key, file) {
                        fileTransfer.push({
                            cssId: 'file-transfer' + key,
                            cssClass: 'file-transfer box',
                            title: file.Name + ' Transfer Status',
                            data: [
                                {
                                    title: 'Bitrate ' + (file.Bitrate ? ' (' + file.Bitrate + ')' : ''),
                                    tooltip: 'Download bitrate of the file.',
                                    status: 'x'
                                },
                                {
                                    title: 'Duration ' + (file.Duration ? ' (' + file.Duration + ')' : ''),
                                    tooltip: 'Duration since the file started downloading.',
                                    status: 'x'
                                },
                                {
                                    title: 'Filename ' + (file.Filename ? ' (' + file.Filename + ')' : ''),
                                    tooltip: 'Filename of the file being downloaded.',
                                    status: 'x'
                                },
                                {
                                    title: 'Last Updated ' + (file.LastUpdated ? ' (' + file.LastUpdated + ')' : ''),
                                    tooltip: 'Last time the file transfer information was updated.',
                                    status: 'x'
                                },
                                {
                                    title: 'Media File ID ' + (file.MediaFileId ? ' (' + file.MediaFileId + ')' : ''),
                                    tooltip: 'The ID of the media file',
                                    status: 'x'
                                },
                                {
                                    title: 'Message ' + (file.Message ? ' (' + file.Message + ')' : ''),
                                    tooltip: 'Percentage downloaded.',
                                    status: 'x'
                                },
                                {
                                    title: 'Peer ' + (file.Peer ? ' (' + file.Peer + ')' : ''),
                                    tooltip: 'Peer the file is being downloaded from.',
                                    status: 'x'
                                },
                                {
                                    title: 'Percent ' + (file.Percent ? ' (' + file.Percent + ')' : ''),
                                    tooltip: 'Progress of the download in percentage',
                                    status: 'x'
                                },
                                {
                                    title: 'Size ' + (file.Size ? ' (' + file.Size + ')' : ''),
                                    tooltip: 'Size of the file being downloaded.',
                                    status: 'x'
                                },
                                {
                                    title: 'State ' + (file.State ? ' (' + file.State + ')' : ''),
                                    tooltip: 'Current state of the file being transferred.',
                                    status: file.State
                                }
                            ]
                        });
                    });


                    var serv = {
                        cssId: 'services',
                        cssClass: 'box',
                        title: "Services",
                        data:
                            [
                                {
                                    title: 'Player Service',
                                    status: player.Service.Player.Status.State,
                                    tooltip: 'State of the Player Service that is responsible for starting player and plugin service.',
                                    popup: $('<div />').addClass('insm-player-details-popup').append(
                                        $('<h5 />').text('Player Service')
                                    ).append(
                                        $('<p />').append(
                                            $('<table />').addClass('vertical').append(
                                                $('<tr />').append(
                                                    $('<th />').text('State'),
                                                    $('<td />').text(player.Service.Player.Status.State)
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Timestamp when status last changed'),
                                                    $('<td />').insmStatusBox({
                                                        title: printDate(player.Service.Player.Status.Timestamp, 'Y-m-d H:i:s'),
                                                        status: 'x',
                                                        tooltip: 'Timestamp updates when the status changes.'
                                                    })
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Message'),
                                                    $('<td />').text(player.Service.Player.Status.Message)
                                                )
                                            )
                                        )
                                    )
                                },
                                {
                                    title: 'Keep-alive Service',
                                    status: player.Service.KeepAlive.Status.State,
                                    tooltip: 'State of the keep alive service that is responsible for starting the player service in the visual session and starting monitored processes',
                                    popup: $('<div />').addClass('insm-player-details-popup').append(
                                        $('<h5 />').text('Keep-alive Service')
                                    ).append(
                                        $('<p />').append(
                                            $('<table />').addClass('vertical').append(
                                                $('<tr />').append(
                                                    $('<th />').text('State'),
                                                    $('<td />').text(player.Service.KeepAlive.Status.State)
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Timestamp when status last changed'),
                                                    $('<td />').insmStatusBox({
                                                        title: printDate(player.Service.KeepAlive.Status.Timestamp, 'Y-m-d H:i:s'),
                                                        status: 'x',
                                                        tooltip: 'Timestamp updates when the status changes.'
                                                    })
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Message'),
                                                    $('<td />').text(player.Service.KeepAlive.Status.Message)
                                                )
                                            )
                                        )
                                    )
                                },
                                {
                                    title: 'Transfer Service',
                                    status: player.Service.Transfer.Status.State,
                                    tooltip: 'State of the transfer service that is responsible for file and information from the AMS via other Media Players.',
                                    popup: $('<div />').addClass('insm-player-details-popup').append(
                                        $('<h5 />').text('Transfer Service')
                                    ).append(
                                        $('<p />').append(
                                            $('<table />').addClass('vertical').append(
                                                $('<tr />').append(
                                                    $('<th />').text('State'),
                                                    $('<td />').text(player.Service.Transfer.Status.State)
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Timestamp when status last changed'),
                                                    $('<td />').insmStatusBox({
                                                        title: printDate(player.Service.Transfer.Status.Timestamp, 'Y-m-d H:i:s'),
                                                        status: 'x',
                                                        tooltip: 'Timestamp updates when the status changes.'
                                                    })
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Message'),
                                                    $('<td />').text(player.Service.Transfer.Status.Message)
                                                )
                                            )
                                        )
                                    )
                                },
                                {
                                    title: 'Maintenance Service',
                                    status: player.Service.Maintenance.Status.State,
                                    tooltip: 'State of the maintenance service that is responsible for execution of maintenance tasks and commands issues by the AMS.',
                                    popup: $('<div />').addClass('insm-player-details-popup').append(
                                        $('<h5 />').text('Maintenance Service')
                                    ).append(
                                        $('<p />').append(
                                            $('<table />').addClass('vertical').append(
                                                $('<tr />').append(
                                                    $('<th />').text('State'),
                                                    $('<td />').text(player.Service.Maintenance.Status.State)
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Timestamp when status last changed'),
                                                    $('<td />').insmStatusBox({
                                                        title: printDate(player.Service.Maintenance.Status.Timestamp, 'Y-m-d H:i:s'),
                                                        status: 'x',
                                                        tooltip: 'Timestamp updates when the status changes.'
                                                    })
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Message'),
                                                    $('<td />').text(player.Service.Maintenance.Status.Message)
                                                )
                                            )
                                        )
                                    )
                                },
                                {
                                    title: 'Diagnostics Service',
                                    status: player.Service.Diagnostics.Status.State,
                                    tooltip: 'State of the diagnostics service that is responsible for collecting diagnostics information.',
                                    popup: $('<div />').addClass('insm-player-details-popup').append(
                                        $('<h5 />').text('Diagnostics Service')
                                    ).append(
                                        $('<p />').append(
                                            $('<table />').addClass('vertical').append(
                                                $('<tr />').append(
                                                    $('<th />').text('State'),
                                                    $('<td />').text(player.Service.Diagnostics.Status.State)
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Timestamp when status last changed'),
                                                    $('<td />').insmStatusBox({
                                                        title: printDate(player.Service.Diagnostics.Status.Timestamp, 'Y-m-d H:i:s'),
                                                        status: 'x',
                                                        tooltip: 'Timestamp updates when the status changes.'
                                                    })
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Message'),
                                                    $('<td />').text(player.Service.Diagnostics.Status.Message)
                                                )
                                            )
                                        )
                                    )
                                },
                                {
                                    title: 'Report Service',
                                    status: player.Service.Report.Status.State,
                                    tooltip: 'State of the diagnostics service that is responsible for sending diagnostics and statistics to the AMS via other media players.',
                                    popup: $('<div />').addClass('insm-player-details-popup').append(
                                        $('<h5 />').text('Report Service')
                                    ).append(
                                        $('<p />').append(
                                            $('<table />').addClass('vertical').append(
                                                $('<tr />').append(
                                                    $('<th />').text('State'),
                                                    $('<td />').text(player.Service.Report.Status.State)
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Timestamp when status last changed'),
                                                    $('<td />').insmStatusBox({
                                                        title: printDate(player.Service.Report.Status.Timestamp, 'Y-m-d H:i:s'),
                                                        status: 'x',
                                                        tooltip: 'Timestamp updates when the status changes.'
                                                    })
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Message'),
                                                    $('<td />').text(player.Service.Report.Status.Message)
                                                )
                                            )
                                        )
                                    )
                                },
                                {
                                    title: 'Server Service',
                                    status: player.Service.Server.Status.State,
                                    tooltip: 'State of the server service that is responsible for communication from other media players.',
                                    popup: $('<div />').addClass('insm-player-details-popup').append(
                                        $('<h5 />').text('Server Service')
                                    ).append(
                                        $('<p />').append(
                                            $('<table />').addClass('vertical').append(
                                                $('<tr />').append(
                                                    $('<th />').text('State'),
                                                    $('<td />').text(player.Service.Server.Status.State)
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Timestamp when status last changed'),
                                                    $('<td />').insmStatusBox({
                                                        title: printDate(player.Service.Server.Status.Timestamp, 'Y-m-d H:i:s'),
                                                        status: 'x',
                                                        tooltip: 'Timestamp updates when the status changes.'
                                                    })
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Message'),
                                                    $('<td />').text(player.Service.Server.Status.Message)
                                                )
                                            )
                                        )
                                    )
                                },
                                {
                                    title: 'Web Service',
                                    status: player.Service.Web.Status.State,
                                    tooltip: 'State of the web service that serves the RESR API for local integration and web templates.',
                                    popup: $('<div />').addClass('insm-player-details-popup').append(
                                        $('<h5 />').text('Web Service')
                                    ).append(
                                        $('<p />').append(
                                            $('<table />').addClass('vertical').append(
                                                $('<tr />').append(
                                                    $('<th />').text('State'),
                                                    $('<td />').text(player.Service.Web.Status.State)
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Timestamp when status last changed'),
                                                    $('<td />').insmStatusBox({
                                                        title: printDate(player.Service.Web.Status.Timestamp, 'Y-m-d H:i:s'),
                                                        status: 'x',
                                                        tooltip: 'Timestamp updates when the status changes.'
                                                    })
                                                ),
                                                $('<tr />').append(
                                                    $('<th />').text('Message'),
                                                    $('<td />').text(player.Service.Web.Status.Message)
                                                )
                                            )
                                        )
                                    )
                                }
                            ]
                    };

                    var play = {
                        cssId: 'player',
                        cssClass: 'box',
                        title: "Player Status",
                        data: [
                            {
                                title: 'Player Status',
                                status: player.PlayerStatus.State,
                                tooltip: 'State of the process that is playing a template or file.',
                                popup: $('<div />').addClass('insm-player-details-popup').append(
                                    $('<h5 />').text('Player Status')
                                ).append(
                                    $('<p />').append(
                                        $('<table />').addClass('vertical').append(
                                            $('<tr />').append(
                                                $('<th />').text('State'),
                                                $('<td />').text(player.PlayerStatus.State)
                                            ),
                                            $('<tr />').append(
                                                $('<th />').text('Timestamp when status last changed'),
                                                $('<td />').insmStatusBox({
                                                    title: printDate(player.PlayerStatus.Timestamp, 'Y-m-d H:i:s'),
                                                    status: 'x',
                                                    tooltip: 'Timestamp updates when the status changes.'
                                                })
                                            ),
                                            $('<tr />').append(
                                                $('<th />').text('Message'),
                                                $('<td />').text(player.PlayerStatus.Message)
                                            )
                                        )
                                    )
                                )
                            },
                            {
                                title: 'Shutdown Monitoring Status',
                                status: player.UptimeStatus?player.UptimeStatus.State:'Unknown',
                                tooltip: 'State of the player unexpect shutdown.',
                                popup: $('<div />').addClass('insm-player-details-popup').append(
                                    $('<h5 />').text('Shutdown Monitoring Status')
                                ).append(
                                    $('<p />').append(
                                        $('<table />').addClass('vertical').append(
                                            $('<tr />').append(
                                                $('<th />').text('State'),
                                                $('<td />').text(player.UptimeStatus?player.UptimeStatus.State:'Unknown')
                                            ),
                                            $('<tr />').append(
                                                $('<th />').text('Timestamp when status last changed'),
                                                $('<td />').insmStatusBox({
                                                    title: player.UptimeStatus?printDate(player.UptimeStatus.Timestamp, 'Y-m-d H:i:s'):'Unknown',
                                                    status: 'x',
                                                    tooltip: 'Timestamp updates when the status changes.'
                                                })
                                            ),
                                            $('<tr />').append(
                                                $('<th />').text('Message'),
                                                $('<td />').text(player.UptimeStatus?(player.UptimeStatus.Message && player.UptimeStatus.Message.length > 0 ? player.UptimeStatus.Message : ''):'Unknown')
                                            )
                                        )
                                    )
                                )
                            },
                            {
                                title: 'Online Status',
                                status: player.OnlineStatus?player.OnlineStatus.State:'Unknown',
                                tooltip: 'State of the player online or offline.',
                                popup: $('<div />').addClass('insm-player-details-popup').append(
                                    $('<h5 />').text('Online Status')
                                ).append(
                                    $('<p />').append(
                                        $('<table />').addClass('vertical').append(
                                            $('<tr />').append(
                                                $('<th />').text('State'),
                                                $('<td />').text(player.OnlineStatus? player.OnlineStatus.State:'Unknown')
                                            ),
                                            $('<tr />').append(
                                                $('<th />').text('Timestamp when status last changed'),
                                                $('<td />').insmStatusBox({
                                                    title: player.OnlineStatus?printDate(player.OnlineStatus.Timestamp, 'Y-m-d H:i:s'):'Unknown',
                                                    status: 'x',
                                                    tooltip: 'Timestamp updates when the status changes.'
                                                })
                                            ),
                                            $('<tr />').append(
                                                $('<th />').text('Message'),
                                                $('<td />').text(player.OnlineStatus?(player.OnlineStatus.Message && player.OnlineStatus.Message.length > 0 ? player.OnlineStatus.Message : ''):'Unknown')
                                            )
                                        )
                                    )
                                )
                            },
                            {
                                title: 'Content Status',
                                status: player.ContentStatus.State,
                                tooltip: 'State of a running template including Asset Player and Playlist Player.',
                                popup: $('<div />').addClass('insm-player-details-popup').append(
                                    $('<h5 />').text('Content Status')
                                ).append(
                                    $('<p />').append(
                                        $('<table />').addClass('vertical').append(
                                            $('<tr />').append(
                                                $('<th />').text('State'),
                                                $('<td />').text(player.ContentStatus.State)
                                            ),
                                            $('<tr />').append(
                                                $('<th />').text('Timestamp when status last changed'),
                                                $('<td />').insmStatusBox({
                                                    title: printDate(player.ContentStatus.Timestamp, 'Y-m-d H:i:s'),
                                                    status: 'x',
                                                    tooltip: 'Timestamp updates when the status changes.'
                                                })
                                            ),
                                            $('<tr />').append(
                                                $('<th />').text('Message'),
                                                $('<td />').text(player.ContentStatus.Message)
                                            )
                                        )
                                    )
                                )
                            },
                            {
                                title: 'Local Status',
                                status: player.LocalStatus.State,
                                tooltip: 'The aggregated local overall state calculated by the Media Player. The AMS uses this status along with its timestamp when calculating the Media Player State.',
                                popup: $('<div />').addClass('insm-player-details-popup').append(
                                    $('<h5 />').text('Local Status')
                                ).append(
                                    $('<p />').append(
                                        $('<table />').addClass('vertical').append(
                                            $('<tr />').append(
                                                $('<th />').text('State'),
                                                $('<td />').text(player.LocalStatus.State)
                                            ),
                                            $('<tr />').append(
                                                $('<th />').text('Timestamp when status last changed'),
                                                $('<td />').insmStatusBox({
                                                    title: printDate(player.LocalStatus.Timestamp, 'Y-m-d H:i:s'),
                                                    status: 'x',
                                                    tooltip: 'Timestamp updates when the status changes.'
                                                })
                                            ),
                                            $('<tr />').append(
                                                $('<th />').text('Message'),
                                                $('<td />').text(player.LocalStatus.Message)
                                            )
                                        )
                                    )
                                )
                            }
                        ]
                    };

                    
                    if (player.SystemInfo.Type == 'Player') {
                        play.data.push(
                            {
                                title: 'Monitored Processes (' + getObjectKeyCount(player.MonitoredProcesses) + ')',
                                status: 'x',
                                tooltip: 'State of the monitored processes that is started by the Keep Alive Service.',
                                popup: $('<div />').addClass('insm-player-details-popup').append(
                                    $('<h5 />').text('Monitored Processes')
                                ).append(
                                    $('<p />').append(
                                        $('<table />').addClass('vertical').append(
                                            function () {
                                                var rows = [];
                                                rows.push($('<tr />').append(
                                                    $('<th />').text('Process'),
                                                    $('<th />').text('State'),
                                                    $('<th />').text('Physical Memory'),
                                                    $('<th />').text('Virtual Memory')
                                                ));
                                                $.each(player.MonitoredProcesses, function (index, process) {
                                                    rows.push($('<tr />').append(
                                                        $('<th />').text(
                                                            process.Name
                                                        ),
                                                        $('<td />').text(
                                                            process.State
                                                        ),
                                                        $('<td />').text(
                                                            $.insmUtilities('addPrefix', {
                                                                number: process.PhysicalMemoryKb * 1000
                                                            }) + 'B'
                                                        ),
                                                        $('<td />').text(
                                                            $.insmUtilities('addPrefix', {
                                                                number: process.VirtualMemoryKb * 1000
                                                            }) + 'B'
                                                        )
                                                    ));
                                                });
                                                return rows;
                                            }
                                        )
                                    )
                                )
                            },
                            {
                                title: 'Processes  (' + getObjectKeyCount(player.Processes) + ')',
                                status: 'x',
                                tooltip: 'State of all running processes in the OS.',
                                popup: $('<div />').addClass('insm-player-details-popup').append(
                                    $('<h5 />').text('Processes')
                                ).append(
                                    $('<p />').append(
                                        $('<table />').addClass('vertical').append(
                                            function () {
                                                var rows = [];
                                                rows.push($('<tr />').append(
                                                    $('<th />').text('Process'),
                                                    $('<th />').text('State'),
                                                    $('<th />').text('Physical Memory'),
                                                    $('<th />').text('Virtual Memory')
                                                ));
                                                $.each(player.Processes, function (index, process) {
                                                    rows.push($('<tr />').append(
                                                        $('<th />').text(
                                                            process.Name
                                                        ),
                                                        $('<td />').text(
                                                            process.State
                                                        ),
                                                        $('<td />').text(
                                                            $.insmUtilities('addPrefix', {
                                                                number: process.PhysicalMemoryKb * 1000
                                                            }) + 'B'
                                                        ),
                                                        $('<td />').text(
                                                            $.insmUtilities('addPrefix', {
                                                                number: process.VirtualMemoryKb * 1000
                                                            }) + 'B'
                                                        )
                                                    ));
                                                });
                                                return rows;
                                            }
                                        )
                                    )
                                )
                            }
                        );
                    }

                    if (player.SystemInfo.Type !== 'Player') {
                        _plugin.htmlElements.tabContainer.find('[key=Displays]').hide();
                        _plugin.htmlElements.tabContainer.find('[key=Channels]').hide();
                    }

                    var displays = [];
                    $.each(player.Monitors, function (key, monitor) {
                        displays.push({
                            cssId: 'display' + key,
                            cssClass: 'display box',
                            title: "Physical Display " + key,
                            data: [
                                {
                                    title: 'State ' + monitor.State,
                                    tooltip: 'State of the display.',
                                    status: monitor.State
                                },
                                {
                                    title: 'Power State' + monitor.PowerState,
                                    tooltip: 'Power state of the display.',
                                    status: monitor.PowerState
                                },
                                {
                                    title: 'Correct Input' + (monitor.Input ? ' (' + monitor.Input + ')' : ''),
                                    tooltip: 'Signal input state of the display.',
                                    status: 'x'
                                },
                                {
                                    title: 'Orientation' + (monitor.Orientation ? ' (' + monitor.Orientation + ')' : ''),
                                    tooltip: 'Orientation of the display.',
                                    status: 'x'
                                },
                                {
                                    title: 'Display Temperature' + (monitor.Temperature.Current ? ' (' + monitor.Temperature.Current + ')' : ''),
                                    tooltip: 'Temperature of the display.',
                                    status: 'x'
                                },
                                {
                                    title: 'Display Brightness' + (monitor.Brightness ? ' (' + monitor.Brightness + ')' : ''),
                                    tooltip: 'Brightness of the display.',
                                    status: 'x'
                                }
                            ]
                        });
                    });

                    var displayDevices = [];
                    $.each(player.DisplayDevices, function (key, displayDevice) {
                        displayDevices.push({
                            cssId: 'display' + key,
                            cssClass: 'display box',
                            title: "Virtual Display " + key,
                            data: [
                                {
                                    title: 'State ' + displayDevice.State,
                                    tooltip: 'Overall State of the Virtual Display.',
                                    status: displayDevice.State
                                },
                                {
                                    title: 'DeviceName' + (displayDevice.DeviceName ? ' (' + displayDevice.DeviceName + ')' : ''),
                                    tooltip: 'Name of the Display from the Media Player OS.',
                                    status: 'x'
                                },
                                {
                                    title: 'Message' + (displayDevice.Message ? ' (' + displayDevice.Message + ')' : ''),
                                    tooltip: 'State message of the Display from the Media Player OS.',
                                    status: 'x'
                                },
                                {
                                    title: 'Orientation' + (displayDevice.Orientation ? ' (' + displayDevice.Orientation + ')' : ''),
                                    tooltip: 'The OS windows desktop orientation for the virtual view.',
                                    status: 'x'
                                },
                                {
                                    title: 'Position' + (displayDevice.Position ? ' (' + displayDevice.Position + ')' : ''),
                                    tooltip: 'The OS windows desktop position for the virtual view.',
                                    status: 'x'
                                },
                                {
                                    title: 'Resolution' + (displayDevice.Resolution ? ' (' + displayDevice.Resolution + ')' : ''),
                                    tooltip: 'The OS windows desktop resolution for the virtual view.',
                                    status: 'x'
                                }
                            ]
                        });
                    });


                    var plugins = [];
                    $.each(player.Plugins, function (key, plugin) {
                        plugins.push({
                            cssId: 'plugins' + key,
                            cssClass: 'plugins box',
                            title: "Plugin " + plugin.Name,
                            data: [
                                {
                                    title: 'Vendor ' + (plugin.Vendor ? ' (' + plugin.Vendor + ')' : ''),
                                    tooltip: '',
                                    status: 'x'
                                },
                                {
                                    title: 'Version ' + (plugin.Version ? ' (' + plugin.Version + ')' : ''),
                                    tooltip: 'The version of the plugin',
                                    status: 'x'
                                },
                                {
                                    title: 'State ' + (plugin.State ? ' (' + plugin.State + ')' : ''),
                                    tooltip: 'State of the plugin',
                                    status: plugin.State
                                },
                                {
                                    title: 'Message ' + (plugin.Message ? ' (' + plugin.Message + ')' : ''),
                                    tooltip: 'Last reported message from plugin',
                                    status: 'x'
                                },
                                {
                                    title: 'Settings ' + (plugin.Settings ? ' (' + plugin.Settings + ')' : ''),
                                    tooltip: 'Plugin setttings',
                                    status: 'x'
                                }
                            ]
                        });
                    });

                    var playerViews = [];
                    $.each(player.PlayerViews, function (key, playerView) {
                        playerViews.push({
                            cssId: 'playerview ' + key,
                            cssClass: 'playerview box',
                            title: "Channel " + key,
                            data: [
                                {
                                    title: 'State ' + playerView.State,
                                    tooltip: 'Overall state of the playing Channel on the Media Player.',
                                    status: playerView.State
                                },
                                {
                                    title: 'File Name' + (playerView.Name ? ' (' + playerView.Name + ')' : ''),
                                    tooltip: 'Name of the current template or file playing file in the Channel.',
                                    status: 'x'
                                },
                                {
                                    title: 'Template or File Version' + (playerView.Version ? ' (' + playerView.Version + ')' : ''),
                                    tooltip: 'Name of the current template or file playing file in the Channel.',
                                    status: 'x'
                                },
                                {
                                    title: 'Playing',
                                    tooltip: 'Playing state of the template or file in the Channel.',
                                    status: (playerView.Playing ? 'OK' : 'Error')
                                },
                                {
                                    title: 'Process State' + (playerView.ProcessState ? ' (' + playerView.ProcessState + ')' : ''),
                                    tooltip: 'State of the process (player.exe) playing this channel.',
                                    status: (playerView.ProcessState === 'IsRunning' ? 'OK' : 'Error')
                                },
                                {
                                    title: 'Template State ' + (playerView.TemplateMessage ? ' (' + playerView.TemplateMessage + ')' : ''),
                                    tooltip: 'Message from the template that is currently playing.',
                                    status: (playerView.PlayerState === 'Playing' ? 'OK' : 'Error')
                                }
                            ]
                        });
                    });


                    var playerEventLogs = $('<div />').addClass('info-box').append(
                        $('<h3>Player Event Logs</h3>')
                    );

                    $.each(player.EventLog, function (key, logType) {
                        var $holder = $('<div />').addClass('insm-player-details-popup').append($('<h5>' + key + ' Event Logs</h5>'));
                        if (logType.Log.length) {
                            var $table = $('<table />').addClass('event-log');
                            logType.Log.sort(function (a, b) {
                                return b.LocalTimestamp.localeCompare(a.LocalTimestamp);
                            });
                            $.each(logType.Log, function (key, logItem) {
                                $table.append(
                                    $('<tr />').append(
                                    $('<td />').append(printDate(logItem.LocalTimestamp, 'Y-m-d H:i:s')),
                                    $('<td />').append(logItem.State),
                                    $('<td />').append(logItem.Message)
                                ));
                            });
                            $holder.append($('<p />').append($table));
                        } else {
                            $holder.append($('<p />').append("No logs recorded for " + key));
                        }

                        playerEventLogs.append(
                            $('<a class="button">' + key + '</a>').click(function() {
                                $.insmPopup({
                                    content: $holder,
                                    backdropClickClose: true
                                });
                            })
                        );
                    });
                    
                    var $filesOnPlayerList = $('<ul>');
                    var $filesOnPlayer = $('<div class="info-box" />').append(
                        $('<h3 />').text('Files on Player'),
                        $('<div />').text('Files that have been downloaded to the Media Player'),
                        $filesOnPlayerList
                    );
                    if (player.DownloadedFileIds.length > 0) {
                        $.insmFramework('files', {
                            fileIds: player.DownloadedFileIds.join(','),
                            method: 'getfilesinfo',
                            success: function (result) {
                                result.MediaFiles.sort(function(fileA, fileB) {
                                    return fileA.Name.toLowerCase().localeCompare(fileB.Name.toLowerCase());
                                });
                                $.each(result.MediaFiles, function (index, file) {
                                    $filesOnPlayerList.append($('<li />').append(file.Name));
                                });
                            },
                            denied: function (message) {
                                // TODO
                            },
                            error: function (message) {
                                throw new Error(message);
                            }
                        });
                    }
                    
                    var offlineMessage = function () {
                        if (player.Status.Message && player.Status.Message.indexOf('EventId:1001') === 0) {
                            return $('<p />').addClass('note warning').text('Note: This player is offline and the information below is old!');
                        }
                        return null;
                    };

                    /// PLAYER DIAGNOSTICS ///
                    var statusTables;
                    if (player.SystemInfo.Type == 'Player') {
                        statusTables = generateStatusTables([play, serv]);
                    }
                    else {
                        statusTables = generateStatusTables([play]);
                    }
                    _plugin.htmlElements.playerDiagnostics.empty().append(
                        offlineMessage(),
                        statusTables,
                        $('<div />').addClass('clear')
                    );

                    _plugin.htmlElements.playerPlugins.empty().append(
                        offlineMessage(),
                        generateStatusTables(plugins, "No plugins available"),
                        $('<div />').addClass('clear')
                    );

                    _plugin.htmlElements.playerDisplays.empty().append(
                        offlineMessage(),
                        $('<h2 />').text('Physical displays'),
                        $('<div />').text('A physical display (or screen or projector) connected to the Media Player.'),
                        generateStatusTables(displays, "No displays reported"),
                        $('<h2 />').text('Virtual displays'),
                        $('<div />').text('That is the virtual desktop views which often but not always corresponding to the physical displays.'),
                        generateStatusTables(displayDevices, "No virtual displays reported"),
                        $('<div />').addClass('clear')
                    );

                    _plugin.htmlElements.playerChannels.empty().append(
                        offlineMessage(),
                        generateStatusTables(playerViews, "No playing channels available"),
                        $('<div />').addClass('clear')
                    );
                    _plugin.htmlElements.playerSystem.empty();
                    _plugin.htmlElements.playerSystem.append(offlineMessage());
                    _plugin.htmlElements.playerSystem.append(generateBarTable(systemUsage));
                    _plugin.htmlElements.playerSystem.append($('<div />').addClass('clear'));
                    if (player.SystemInfo.Type == 'Player') {
                        _plugin.htmlElements.playerSystem.append(playerEventLogs);
                    }
                    _plugin.htmlElements.playerSystem.append($('<div />').addClass('clear'));

                    /// PLAYER TRANSFER ///

                    _plugin.htmlElements.playerTransfer.empty();
                    _plugin.htmlElements.playerTransfer.append(
                        $('<table />').addClass('vertical no-border').append(
                            $('<tr />').append(
                                $('<th />').text('Sync State')
                            ).append(
                                $('<td />').append(function () {
                                    if (player.Transfer.Version != "0") {
                                        var diff = $.insmFramework("getEntityVersion") - player.Transfer.Version;
                                        if (diff > 0) {
                                            return $('<div />').insmStatusBox({ title: diff + " more to download", status: "Transfer", tooltip: 'The player has more to download' });
                                        } else {
                                            return $('<div />').insmStatusBox({ title: 'OK', status: "OK", tooltip: 'The player is up to date' });
                                        }
                                    }
                                    return $('<div />').insmStatusBox({ title: 'Unknown', status: "Error", tooltip: 'The player status is unknown' });
                                })
                            ),
                            $('<tr />').append(
                                $('<th />').text('On Demand Download State')
                            ).append(
                                $('<td />').append(
                                    $('<div />').insmStatusBox({
                                        title: player.Transfer.OnDemandStatus?player.Transfer.OnDemandStatus.State + (player.Transfer.OnDemandStatus.Message && player.Transfer.OnDemandStatus.Message.length >0 ? ': ' + player.Transfer.OnDemandStatus.Message : ''):'Unknown',
                                        status: player.Transfer.OnDemandStatus? player.Transfer.OnDemandStatus.State:'Unknown',
                                        tooltip: 'This shows if the player has downloaded, is in the process of downloading or has files to download but is not downloading the files. Note that the player is intelligent and calculates which files it needs.'
                                    })
                                )
                            )
                        )
                    );   
                    if (player.SystemInfo.Type == 'Player') {
                        _plugin.htmlElements.playerTransfer.append(
                           
                            offlineMessage(),
                            generateStatusTable(transferStatus),
                           
                            $('<div />').addClass('clear'),
                            $('<div />').addClass('info-box').append(
                                $('<h3 />').text('Currently downloading'),
                                generateStatusTables(fileTransfer, "No file is currently being downloaded.")
                            ),
                            $('<div />').addClass('clear')
                        );
                    }
                    _plugin.htmlElements.playerTransfer.append(
                        $filesOnPlayer,
                        $('<div />').addClass('clear')
                    );
                    // PLAYER StateHistory ////
                    _plugin.htmlElements.playerStateHistory.empty(); 
                    _plugin.htmlElements.playerStateHistory.append(function () {
                        
                        
                        

                        var historyTable = $('<table />').addClass('vertical no-border no-padding');
                        var infoContainer =  $('<div />').addClass('historyinfocontainer'); 
                        var lastDate = new Date('1900-01-01T00:00:00'); 
                       
                        var sortList = [];
                        var durationList = [];
                        
                        $.each(player.Status.Samples, function (key, value) {
                            sortList.push(key);
                        });
                        sortList.sort(function (a, b) {
                            return a < b ? 1 : -1;
                        });
                        $.each(player.Status.Samples, function (key, value) {
                            var date = new Date(key);
                            var duration;
                            var durationTxt = {
                                briefDuration: '',
                                accurateDuration:''                                
                            };
                            Date.dateDiff = function (datepart, fromdate, todate) {
                                datepart = datepart.toLowerCase();
                                var diff = todate - fromdate;
                                var divideBy = {
                                    w: 604800000,
                                    d: 86400000,
                                    h: 3600000,
                                    n: 60000,
                                    s: 1000
                                };
                                return Math.floor(diff / divideBy[datepart]);
                            }
                            Date.daysBetween = function (date1, date2) {
                                //Get 1 day in milliseconds
                                var one_week = 1000 * 60 * 60 * 24 * 7;

                                // Convert both dates to milliseconds
                                var date1_ms = date1.getTime();
                                var date2_ms = date2.getTime();

                                // Calculate the difference in milliseconds
                                var difference_ms = date2_ms - date1_ms;
                                //take out milliseconds
                                difference_ms = difference_ms / 1000;
                                var seconds = Math.floor(difference_ms % 60);
                                difference_ms = difference_ms / 60;
                                var minutes = Math.floor(difference_ms % 60);
                                difference_ms = difference_ms / 60;
                                var hours = Math.floor(difference_ms % 24);
                                difference_ms = difference_ms / 24;
                                var days = Math.floor(difference_ms % 7);
                                var weeks = Math.floor(difference_ms / 7);

                                return (weeks? weeks +' weeks,':'')+ (days? days+ ' days, ':'') + (hours?hours + ' hours, ':'') + (minutes?minutes + ' minutes, ':'') + (seconds?seconds + ' seconds':'');
                            }
                            //Set the two dates
                            if (lastDate == new Date('1900-01-01T00:00:00')) {
                                duration = 'Unknown';
                            } else {
                                duration = date - lastDate;
                                durationTxt.accurateDuration = Date.daysBetween(lastDate, date);
                                if (duration < 1000) {
                                    durationTxt.briefDuration = '~ < 1 seconds';
                                    durationTxt.accurateDuration = '~ < 1 seconds';
                                } else if (duration < 60000 || duration == 1000) {
                                    durationTxt.briefDuration = '~' + Date.dateDiff('s', lastDate, date) + ' seconds';
                                } else if ((60000 < duration && duration < 3600000) || duration == 60000) {
                                    durationTxt.briefDuration = '~' + Date.dateDiff('n', lastDate, date) + ' minutes';
                                } else if ((3600000 < duration && duration < 86400000) || duration == 3600000) {
                                    durationTxt.briefDuration = '~' + Date.dateDiff('h', lastDate, date) + ' hours';
                                } else if ((86400000 < duration && duration < 604800000) || duration == 86400000) {
                                    durationTxt.briefDuration = '~' + Date.dateDiff('d', lastDate, date) + ' days';
                                } else if (604800000 < duration || duration == 604800000) {
                                    durationTxt.briefDuration = '~' + Date.dateDiff('w', lastDate, date) + ' weeks';
                                }
                            }
                            lastDate = date;
                            durationList.push(durationTxt);
                            
                        });
                        durationList.push({
                            briefDuration: '~ Current',
                            accurateDuration: '~ Current'
                        });
                        $('<a class="button" />').text('Export to CSV').appendTo(_plugin.htmlElements.playerStateHistory).click(function () {
                            var csvData = player.Status.Samples;
                            if ($.isEmptyObject(csvData)) {
      
                                $.insmNotification({
                                    type: 'information',
                                    message: 'No rows in table'
                                });
                                return;
                            }
                            var sep = ",";
                            var csv = 'sep=' + sep + '\r\n';
                            csv += 'Date' + sep + 'State' + sep + 'Duration' + '\r\n';
                            var csvCountNumber = 1;
                        $.each(csvData, function (key, value) {
                            csv += printDate(key, 'Y-m-d H:i:s') + sep;
                            csv += value + sep;
                            csv += durationList[csvCountNumber].accurateDuration.replace(/\,/g, ' ') + sep;
                            csv += '\r\n';
                            csvCountNumber =csvCountNumber+ 1;
                        });
                            //csv = csv.substr(0, csv.length - 1) + '\r\n';
                            //$.each(csvData, function (key, value) {
                            //    csv += '"' + value + '"' + sep;
                            //});
                            //csv = csv.substr(0, csv.length - 1) + '\r\n';
                            //$.each(_csvColumns, function (title, column) {
                            //    csv += title + sep;
                            //});

                            //csv = csv.substr(0, csv.length - 1) + '\r\n';
                            //$.each(data, function (index, row) {
                            //    $.each(_csvColumns, function (title, column) {
                            //        csv += '"' + column.output(row) + '"' + sep;
                            //    });
                            //    csv = csv.substr(0, csv.length - 1) + '\r\n';
                            //});
                            //var d = new Date();
                            //var date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()

                            var filename = 'State_History' + $.datepicker.formatDate('yy-mm-dd', new Date());
                            $.insmFramework('convert', {
                                mimetype: 'text/csv',
                                data: csv,
                                filename: filename
                            });
                        });
                        var lastDate = new Date('1900-01-01T00:00:00');
                        var countNumber = 1;
                        $.each(player.Status.Samples, function (key, value) {
                            var year = '';
                            var month = '';
                            var day = '';
                            var date = new Date(key);
                            var durationTxt = durationList[countNumber];
                            countNumber = countNumber + 1;
                            if (lastDate.getFullYear() != date.getFullYear()) {      
                                lastDate = date;
                                year = date.getFullYear();
                                month = date.getMonth() + 1;
                                day = date.getDate();
                            } else {
                                year = '';
                                if (lastDate.getMonth() != date.getMonth() || lastDate.getDate() != date.getDate()) {
                                    
                                    lastDate = date;
                                    month = date.getMonth() + 1;
                                    day = date.getDate();
                                } else {
                                    lastDate = date;
                                    month = '';
                                    day = '';
                                }
                            }
                          
                            var infoContent = $('<table />').addClass('vertical no-border');
                            infoContent.append( 
                                $('<tr />').append(
                                    $('<th />').text('State')
                                ).append(
                                    $('<td>').text(value)
                                ),
                                
                                $('<tr />').append(
                                    $('<th />').text('Start at: ')
                                ).append(
                                    $('<td>').text(printDate(key,'Y-m-d H:i:s'))
                                ),
                                
                                $('<tr />').append(
                                    $('<th />').text('Duration: ')                                    
                                ).append(
                                    $('<td>').text(durationTxt.accurateDuration)
                                )                                
                            );
                            
                            historyTable.addClass('historytable').append(
                                $('<tr />').append(
                                    $('<td>').append($('<h5 />').text(year)),
                                    $('<td>').append($('<h5 />').text(typeof month == 'number'? day+'/'+month:'')),
                                    $('<td>').append($('<h5 />').text(date.getHours()+ ':'+date.getMinutes())),
                                    $('<td>').append($('<div />').insmBigStatusBox({
                                        status: value,
                                        infoArea: infoContainer,
                                        infoContent: infoContent,
                                        text:durationTxt.briefDuration
                                    }))
                                )
                            )
                        });
                        return $('<div />').append(                            
                            $('<div />').addClass('historycontainer').append(historyTable),
                            infoContainer                   
                        );
                    });
                    
                    /// PLAYER INFORMATION ////
                    _plugin.htmlElements.playerInformation.html(
                        $('<table />').addClass('vertical no-border').append(
                            
                            $('<tr />').append(
                                $('<th />').text('Fulfilment State')
                            ).append(
                                $('<td />').append(
                                    $('<div />').insmStatusBox({
                                        title: player.FulfilmentStatus ? player.FulfilmentStatus.State + (player.FulfilmentStatus.Message && player.FulfilmentStatus.Message.trim().length > 0 ? ': ' + player.FulfilmentStatus.Message : '') : 'Unknown',
                                        status: player.FulfilmentStatus ? player.FulfilmentStatus.State :'Unknown',
                                        tooltip: 'This is an aggregated state designed to show with reasonable confidence if the player has downloaded scheduled content and is healthy regardless of its current online state.'
                                    })
                                )
                            ),
                            $('<tr />').append(
                                $('<th />').text('Current State')
                            ).append(
                                $('<td />').append(
                                    $('<div />').insmStatusBox({
                                        title: player.Status.State + (player.Status.Message && player.Status.Message.trim().length > 0 ? ': ' + player.Status.Message : ''),
                                        status: player.Status.State,
                                        tooltip: 'The overall state of the player. Possible states in priority order are Error, Warning, Transferring, Unknown, OK. If a Media Player has a Warning and Error, the Error will show as it overrides the Warning. States can come from the Template and any of the Services running on the Media Player.'
                                    })
                                )
                            )
                        ).append(
                            $('<tr />').append(
                                $('<th />').text('Player Errors & Warnings')
                            ).append(function () {
                                var statusList = {
                                    "Content State": player.ContentStatus,
                                    "Local State": player.LocalStatus,
                                    "Online State" : player.OnlineStatus,
                                    "Player State": player.PlayerStatus,
                                    "On Demand Download State": player.Transfer.OnDemandStatus,
                                    "Shutdown Monitoring State": player.UptimeStatus,
                                    "Fulfilment State": player.FulfilmentStatus,
                                    'Player Service': player.Service.Player.Status,
                                    'Keep-alive Service': player.Service.KeepAlive.Status,
                                    'Transfer Service': player.Service.Transfer.Status,
                                    'Maintenance Service': player.Service.Maintenance.Status,
                                    'Diagnostics Service': player.Service.Diagnostics.Status,
                                    'Report Service': player.Service.Report.Status,
                                    'Server Service': player.Service.Server.Status,
                                    'Web Service': player.Service.Web.Status
                                };
                                var messageArea= $('<table />').addClass('vertical no-border');
                                $.each(statusList, function (key, value) {
                                    if (value) {
                                        if (value.State == "Error" || value.State == "Warning") {
                                            messageArea.append(
                                                $('<tr />').append(
                                                    $('<th />').text(key)
                                                ).append(
                                                    $('<td />').append(
                                                        $('<div />').insmStatusBox({
                                                            title: value.State + (value.EventId ? ' ' + value.EventId : '') + (value.Message ? ': ' + value.Message : ''),
                                                            status: value.State,
                                                            tooltip: 'This is a message area where any warnings or errors currently applicable to the player are written.'
                                                        })
                                                    )
                                                )
                                            )
                                        }
                                    }
                                });
                                if (player.Transfer.Version == "0") {
                                   
                                    messageArea.append(
                                        $('<tr />').append(
                                            $('<th />').text("Sync State")
                                        ).append(
                                            $('<td />').append(
                                                $('<div />').insmStatusBox({ title: 'Error: The player status is unknown', status: "Error", tooltip: 'This is a message area where any warnings or errors currently applicable to the player are written.'})
                                            )
                                        )
                                    )

                                }
                                return messageArea;
                            }),
                            $('<tr />').append(
                                $('<th />').text('Type'),
                                $('<td />').text(player.SystemInfo.Type)
                            )
                        ).append(
                            function() {
                                if(player.SystemInfo.Type == 'Player') {
                                    return $('<tr />').append(
                                        $('<th />').text('Player Engine')
                                    ).append(
                                        $('<td />').insmStatusBox({
                                            title: player.ContentStatus.Message,
                                            status: 'x',
                                            tooltip: 'Player Engine or file playing at the time/date in the timestamp given.'
                                        })
                                    );
                                }
                            }
                        ).append(
                            function () {
                                if (player.SystemInfo.Type == 'Player') {
                                    return $('<tr />').append(
                                        $('<th />').text('Team Viewer ID')
                                    ).append(
                                        $('<td />').append(player.SystemInfo.RCId)
                                    )
                                }
                            }
                        ).append(
                            $('<tr />').append(
                                $('<th />').text('Screen Content')
                            ).append(
                                $('<td />').append(
                                    $('<div />').insmPlayerPreview({
                                        upid: _plugin.settings.upid
                                    })
                                )
                            )
                        ).append(
                            $('<tr />').append(
                                $('<th />').text('Unique Player ID:')
                            ).append(
                                $('<td />').append(player.UniquePlayerId)
                            )
                        ).append(
                            $('<tr />').append(
                                $('<th />').text('Computer Name')
                            ).append(
                                $('<td />').append(player.SystemInfo.ComputerName)
                            )
                        ).append(
                            $('<tr />').append(
                                $('<th />').text('Time since last Restart')
                            ).append(
                                $('<td />').insmStatusBox({
                                    title: secondsToTime(player.SystemInfo.Uptime),
                                    status: 'x',
                                    tooltip: 'Time since last reboot of the Media Player.'
                                })
                            )
                        ).append(
                            $('<tr />').append(
                                $('<th />').text('Platform Version')
                            ).append(
                                $('<td />').insmStatusBox({
                                    title: player.SystemInfo.Version,
                                    status: 'x',
                                    tooltip: 'Version of the software that is currently installed on the Media Player.'
                                })
                            )
                        ).append(
                            function () {
                                if (player.SystemInfo.Type == 'Player') {
                                    return $('<tr />').append(
                                        $('<th />').text('Peer')
                                    ).append(
                                        $('<td />').append(player.SystemInfo.Peer)
                                    )
                                }
                            }
                        ).append(
                            function () {
                                if (player.SystemInfo.Type == 'Player') {
                                    return $('<tr />').append(
                                        $('<th />').text('Report Generated on Player')
                                    ).append(
                                        $('<td />').insmStatusBox({
                                            title: printDate(new Date(player.SystemInfo.LastUpdateOnPlayer), 'Y-m-d H:i:s'),
                                            status: 'x',
                                            tooltip: 'Time when player last generated diagnostics information locally on the player.'
                                        })
                                    )
                                }
                            }
                        ).append(
                            $('<tr />').append(
                                $('<th />').text('Report Sent to Server')
                            ).append(
                                function () {
                                    var date = new Date(player.SystemInfo.LastUpdateOnServer);

                                    if(isNaN(date.getTime()) || date < new Date('1980-01-01T00:00:00Z')) {
                                        return $('<td />').insmStatusBox({
                                            title: 'n/a',
                                            status: 'x',
                                            tooltip: 'Time when player sent the last generated diagnostics information to the AMS.'
                                        });
                                    }
                                    else {
                                        return $('<td />').insmStatusBox({
                                            title: printDate(date, 'Y-m-d H:i:s'),
                                            status: 'x',
                                            tooltip: 'Time when player sent the last generated diagnostics information to the AMS.'
                                        });
                                    }
                                }
                            )
                        ).append(
                            $('<tr />').append(
                                $('<th />').text('Time Since Last Report')
                            ).append(
                                function () {
                                    var date = new Date(player.SystemInfo.LastUpdateOnServer);

                                    if (isNaN(date.getTime()) || date < new Date('1980-01-01T00:00:00Z')) {
                                        return $('<td />').insmStatusBox({
                                            title: 'n/a',
                                            status: 'x',
                                            tooltip: 'Time since Player sent report to Server.'
                                        });
                                    }
                                    else {
                                        return $('<td />').insmStatusBox({
                                            title: function () {
                                                return secondsToTime((new Date($.insmFramework('getTimestamp')).getTime() - new Date(player.SystemInfo.LastUpdateOnServer).getTime()) / 1000);
                                            },
                                            status: 'x',
                                            tooltip: 'Time since Player sent report to Server.'
                                        });
                                    }
                                }
                            )
                        ).append(
                            function () {
                                if (player.SystemInfo.Type == 'Player') {
                                    return $('<tr />').append(
                                        $('<th />').text('Time Skew')
                                    ).append(
                                        $('<td />').insmStatusBox({
                                            title: secondsToTime(parseInt(player.SystemInfo.TimeSkew / 1000)),
                                            status: 'x',
                                            tooltip: 'Time difference between the Media Player and the AMS (or AMS Proxy). Difference in the time zones on the Media Player and AMS is accounted for.'
                                        })
                                    )
                                }
                            }
                        ).append(
                            $('<tr />').append(
                                $('<th />').text('IP Address')
                            ).append(
                                $('<td />').insmStatusBox({
                                    title: player.IPAddress,
                                    status: 'x',
                                    tooltip: 'The last reported local IP address of the Media Player'
                                })
                            )
                        ).append(
                            $('<tr />').append(
                                $('<th />').text('CPUs')
                            ).append(
                                $('<td />').append(nl2br(player.SystemInfo.CPU))
                            )
                        )
                    );
                },
                error: function (message) {
                    $.insmNotification({
                        type: 'error',
                        text: message
                    });
                },
                denied: function (message) {
                    $.insmFramework('login', {
                        success: function (data) {
                            $this.insmPlayerDetails(options);
                        },
                        error: function (message) {
                            $.insmNotification({
                                type: 'error',
                                text: message
                            });
                        }
                    });
                }
            });

            return $this;
        }
    };

    $.fn.insmPlayerDetails = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPlayerDetails');
        }
    };
})(jQuery);