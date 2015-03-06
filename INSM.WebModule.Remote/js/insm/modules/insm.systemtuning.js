/*
* INSM System Tuning
* This file contain the INSM System Tuning function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmSystemTuning(settings);
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
            var _plugin = $this.data('insmSystemTuning');

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        // TODO: Change application name
                        applicationName: 'System Tuning',
                        version: manifest.version,
                        header: true
                    }, options),
                    htmlElements: {
                        header: $('<div />'),
                        content: $('<div />'),
                        systemInformation: {
                            container: $('<div />'),
                            playerSettings: {
                                container: $('<div />'),
                                table: $('<table />')
                            },
                            timings: {
                                container: $('<div />'),
                                table: $('<table />')
                            }
                        },
                        graphs: {
                            container: $('<div />')
                        }
                    },
                    data: {
                        intervalTimer: null,
                        fullscreenInitialized: false,
                        graphParameters: {
                            Resources: {
                                CPUUsage: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                MemoryUsage: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                DiskSpaceUsage: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                }
                            },
                            Services: {
                                AggregationRun: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                IntegrationRun: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                }
                            },
                            Players: {
                                NumOfPlayersOK: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                NumOfPlayersWarning: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                NumOfPlayersError: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                NumOfPlayersOffline: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                }
                            },
                            Calls: {
                                NumOfPeers: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                NumOfCurrentConnections: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                NumOfTotalCallsPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                MaxConnectionTime: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                NumOfDbTotalConnections: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                MaxDbConnectionTime: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                NumOfBusinessCallsPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                NumOfManagementCallsPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                NumOfWebAPICallsPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                NumOfGetCommandCallsPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                EntityVersion: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                }
                            },
                            Network: {
                                ConnectionInitiatedPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                ConnectionAcceptedPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                ConnectionFailedPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                ConnectionResetPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                PackageSentPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                PackageReceivedPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                PackageTimeoutsPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                PackageErrorsPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                SegmentSentdPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                SegmentReceivedPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                SegmentResetPerSecond: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                PortsStateOK: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                PortsStateWarning: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                },
                                PortsStateError: {
                                    container: $('<div />').addClass('graph-container'),
                                    data: [],
                                    plot: null,
                                    title: $('<h3 />')
                                }
                            }
                        }
                    },
                    subscriptions: {
                        start: function () { },
                        stop: function () { }
                    },
                    permissions: {
                        region: {
                            read: true,
                            write: true
                        },
                        file: {
                            read: true,
                            write: true
                        }
                    }
                };
                $this.data('insmSystemTuning', _plugin);
            }

            if (!$.insmFramework('isInitialized')) {
                $.insmFramework({
                    apiUrl: _plugin.settings.apiUrl,
                    applicationName: _plugin.settings.applicationName,
                    version: _plugin.settings.version,
                    session: (urlDecode($(document).getUrlParam('session')) || '')
                });
            }

            if (!_plugin.settings.regionId) {
                // Read users region tree instead
                _plugin.settings.regionId = $.insmFramework('getUser').regionTree.id;
            }
            else {
                _plugin.settings.showRegionPicker = false;
            }

            return $this;
        },
        showTooltip: function (options) {
            $( '<div id="tooltip"></div>' ).css( {
                position: 'absolute',
                display: 'none',
                top: options.y + 5,
                left: options.x + 15,
                border: '1px solid #fdd',
                padding: '2px',
                backgroundColor: '#fee',
                opacity: 0.90
            } ).appendTo( "body" ).fadeIn( 200 );
            $( '#tooltip' ).html( options.title + ': <strong>' + options.value + '</strong>' );
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSystemTuning');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            }
            else {
                _plugin.settings.previewTarget = $('<div />');
            }

            // TODO: Change class name
            _plugin.settings.previewTarget.addClass('module module-preview system-tuning');


            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            // TODO: Change module title
            _plugin.settings.previewTarget.html(
                $('<h2 />').text('System Tuning')
            );

            return _plugin.settings.previewTarget;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSystemTuning');

            if (_plugin.settings.target) {
                return _plugin.settings.target;
            }
            else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        fullscreen: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSystemTuning');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function () {
                    $this.insmSystemTuning('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;


            // Init HTML
            _plugin.settings.target.fadeIn();
            _plugin.settings.target.empty();

            // TODO: Define content
            _plugin.settings.target.addClass('system-tuning');

            if (_plugin.settings.header) {
                _plugin.settings.target.append(
                    _plugin.htmlElements.header.addClass('header').append(
                        $('<div />').addClass('company-logo'),
                        $('<div />').addClass('module-logo')
                    )
                );
            }

            _plugin.settings.target.append(
                _plugin.htmlElements.content.addClass('content').append(
                    _plugin.htmlElements.systemInformation.container.addClass('system-information').append(
                        _plugin.htmlElements.systemInformation.playerSettings.container.addClass('player-settings').append(
                            $('<h2 />').text('Player Settings'),
                            _plugin.htmlElements.systemInformation.playerSettings.table.addClass('vertical')
                        ),
                        _plugin.htmlElements.systemInformation.timings.container.addClass('timings').append(
                            $('<h2 />').text('Timings'),
                            _plugin.htmlElements.systemInformation.timings.table.addClass('vertical')
                        )
                    ),
                    _plugin.htmlElements.graphs.container.addClass('graphs')
                )
            );

            $.each(_plugin.data.graphParameters, function (category, graphs) {
                $.each(graphs, function (name, graph) {
                    _plugin.htmlElements.graphs.container.append(
                        $('<div class="graph" />').append(
                            graph.title.text(name),
                            graph.container
                        )
                    );
                });
            });

            _plugin.htmlElements.content.hide();
            setTimeout(function () {
                _plugin.htmlElements.content.fadeIn();
                $this.insmSystemTuning('setSubscriptions', {
                    view: 'default'
                });
            }, 500);

            $this.insmSystemTuning('resize');

            return _plugin.settings.target;
        },
        resize: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSystemTuning');
            if (_plugin) {
                var target = _plugin.settings.target.insmUtilities('size');
                var header = _plugin.htmlElements.header.insmUtilities('size', { actualSize: true });

                _plugin.htmlElements.content.css({
                    height: parseInt(target.height - header.height) + 'px'
                });
            }

            return $this;
        },
        startSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSystemTuning');

            _plugin.subscriptions.start();

            return $this;
        },
        stopSubscriptions: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSystemTuning');

            if (_plugin) {
                return _plugin.subscriptions.stop();
            }

            return $this;
        },
        renderData: function() {
            var $this = $(this);
            var _plugin = $this.data('insmSystemTuning');

            $.insmFramework('systemData', {
                success: function (systemData) {
                    _plugin.htmlElements.systemInformation.playerSettings.table.empty();
                    $.each(systemData.AppSettings, function (index, setting) {
                        _plugin.htmlElements.systemInformation.playerSettings.table.append(
                            $('<tr />').append(
                                $('<th />').text(setting.Name),
                                $('<td />').text(setting.Value),
                                $('<td />').append(
                                    $('<a />').addClass('icon help').insmTooltip({
                                        container: $this,
                                        text: setting.Key + '<br />' + setting.Description
                                    })
                                )
                            )
                        );
                    });
                    _plugin.htmlElements.systemInformation.timings.table.empty();
                    $.each(systemData.Timings, function (index, timing) {
                        _plugin.htmlElements.systemInformation.timings.table.append(
                            $('<tr />').append(
                                $('<th />').text(index),
                                $('<td />').text(timing.Value),
                                $('<td />').append(
                                    $('<a />').addClass('icon help').insmTooltip({
                                        container: $this,
                                        text: timing.Description
                                    })
                                )
                            )
                        );
                    });

                    $.each(_plugin.data.graphParameters, function (category, graphs) {
                        $.each(graphs, function (name, graph) {

                            graph.title.insmTooltip({
                                container: $this,
                                text: systemData[category][name].Description
                            })

                            graph.data = [];
                            $.each(systemData[category][name].Measure, function (timestamp, value) {
                                graph.data.push([new Date(timestamp).valueOf(), value]);
                            });

                            var series = [];
                            series.push({
                                label: name || '',
                                lines: {
                                    show: true
                                },
                                points: {
                                    show: true
                                },
                                data: graph.data
                            });

                            if (graph.plot == null) {
                                // Plot it
                                graph.plot = $.plot(
                                    graph.container,
                                    series,
                                    {
                                        xaxis: {
                                            mode: "time"
                                        },
                                        yaxis: {
                                            tickDecimals: 0
                                        },
                                        legend: {
                                            show: false,
                                            backgroundOpacity: 0
                                        },
                                        grid: {
                                            hoverable: true
                                        }
                                    }
                                );

                                graph.container.bind("plothover", function (event, pos, item) {
                                    if (item) {
                                        if (typeof previousPoint == 'undefined' || previousPoint != item.datapoint) {
                                            previousPoint = item.datapoint;

                                            $("#tooltip").remove();
                                            var x = item.datapoint[0], y = item.datapoint[1];
                                            $this.insmSystemTuning('showTooltip', {
                                                x: item.pageX,
                                                y: item.pageY,
                                                title: item.series.label,
                                                value: y
                                            });
                                            $("#tooltip").css({
                                                marginLeft: '-' + parseInt($("#tooltip").outerWidth() + 20) + 'px'
                                            });
                                        }
                                    } else {
                                        $("#tooltip").remove();
                                        previousPoint = null;
                                    }
                                });
                            }
                            else {
                                // Update existing plot
                                graph.plot.setData(series);
                                graph.plot.setupGrid();
                                graph.plot.draw();
                            }
                        });
                    });

                    $this.insmSystemTuning('resize');
                }
            });

            return $this;
        },
        setSubscriptions: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmSystemTuning');

            switch (options.view.toLowerCase()) {
                case 'default':
                    _plugin.subscriptions.start = function () {
                        $this.insmSystemTuning('renderData');

                        _plugin.data.intervalTimer = setInterval(function () {
                            $this.insmSystemTuning('renderData');
                        }, 6000);
                    }
                    $this.insmSystemTuning('stopSubscriptions');
                    $this.insmSystemTuning('startSubscriptions');

                    _plugin.subscriptions.stop = function () {
                        clearInterval(_plugin.data.intervalTimer);
                    }
                    break;
                default:
                    throw new Error('View "' + options.view + '" not recognised');
                    break;
            }

            return $this;
        },
        hasSettings: function () {
            return false;
        },
        onClose: function (options) {
            options.success();
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSystemTuning');

            $this.insmSystemTuning('stopSubscriptions');
            $this.data('insmSystemTuning', null).empty();

            return $this;
        }
    };

    $.fn.insmSystemTuning = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmSystemTuning');
        }
    };

})(jQuery);