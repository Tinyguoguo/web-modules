/*
* INSM Channel
* This file contain the INSM Channel function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmChannel(settings);
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
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmChannel');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        tableHeaders: {},
                        enableEdit: true
                    }, options),
                    data: {
                        layouts: [],
                        channels: [],
                        hasContentScheduled: false
                    },
                    htmlElements: {
                        channelTable: $('<div />')
                    }
                };
                $this.data('insmChannel', _plugin);
            }

            if (!$.insmFramework('isInitialized')) {
                $.insmFramework({
                    ams: _plugin.settings.ams,
                    protocol: _plugin.settings.ssl ? 'https' : 'http',
                    app: _plugin.settings.app
                });
            }

            $this.insmViewHandler({
                viewName: 'table-view',
                method: function (data) {
                    $this.insmChannel('displayTable');
                }
            });

            $this.insmViewHandler({
                viewName: 'channel-view',
                method: function (data) {
                    $this.insmChannel('displayChannel', data);
                }
            });

            $this.insmViewHandler('show', {
                viewName: 'table-view'
            });

            return $this;
        },
        displayTable: function () {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmChannel');
            
            $.when($.insmFramework('initialized')).done(function () {
                var $notificationChannel = $.insmNotification({
                    type: 'load',
                    text: 'Downloading channel information',
                    duration: 0
                });
                $.insmFramework('channels', {
                    success: function (channels) {
                        $.insmFramework('layouts', {
                            success: function (layouts) {
                                $notificationChannel.update({
                                    type: 'successful',
                                    text: 'Download complete',
                                    duration: -1
                                });

                                $this.empty();

                                if (_plugin.settings.enableEdit) {
                                    $this.append(
                                        $('<a />').addClass('button').text('New Channel').click(function () {
                                            $this.insmViewHandler('show', {
                                                viewName: 'channel-view'
                                            });
                                        })
                                    );
                                }

                                var channelList = [];
                                $.each(channels, function (key, channel) {
                                        channel.Layout = layouts[channel.LayoutId];
                                        channelList.push(channel);
                                });
                                _plugin.htmlElements.channelTable.insmTablesorter({
                                    data: channelList.reverse(),
                                    headers: _plugin.settings.tableHeaders,
                                    paginationPosition: 'top',
                                    searchPosition: 'top',
                                    limitControlPosition: 'top'
                                });
                                $this.append(_plugin.htmlElements.channelTable);
                            },
                            denied: function () {
                                $notificationChannel.update({
                                    type: 'unauthorized',
                                    text: 'Authentication needed'
                                });

                                $.insmFramework('login', {
                                    success: function () {
                                        $notificationChannel.update({
                                            type: 'successful',
                                            text: 'Authentication successful'
                                        });

                                        $this.insmChannel('displayTable');
                                    }
                                });
                            },
                            error: function (message) {
                                $notificationChannel.update({
                                    type: 'error',
                                    text: message
                                });
                            }
                        });
                    },
                    denied: function () {
                        $notificationChannel.update({
                            type: 'unauthorized',
                            text: 'Authentication needed'
                        });

                        $.insmFramework('login', {
                            success: function () {
                                $notificationChannel.update({
                                    type: 'successful',
                                    text: 'Authentication successful'
                                });

                                $this.insmChannel('displayTable');
                            }
                        });
                    },
                    error: function (message) {
                        $notificationChannel.update({
                            type: 'error',
                            text: message
                        });
                    }
                });
            });

            return $this;
        },
        displayChannel: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmChannel');

            $this.hide();
            var displayChannelNotificationHandle = $.insmNotification({
                type: 'load',
                text: 'Loading channel data',
                duration: 0
            });

            if (!_plugin) {
                $.insmNotification({
                    type: 'error',
                    text: 'INSM Channel not initialized'
                });
                return $this;
            }

            if (!options) {
                options = {
                    channel: {}
                };
            }
            options.channel = $.extend({
                Name: '',
                Description: '',
                LayoutId: 0
            }, options.channel);

            $.when($.insmFramework('initialized')).done(function () {
                $.insmFramework('layouts', {
                    method: 'get',
                    types: 'Channel',
                    success: function (layouts) {
                        var channelInputData = {
                            name: $('<input type="text" />').val(options.channel.Name),
                            description: $('<textarea />').val(options.channel.Description),
                            layout: function () {
                                var layoutSelect = $('<select/>');
                                $.each(layouts, function (index, layout) {
                                    if (layout.Attributes.Type == 'Channel' && getObjectKeyCount(layout.Views) == 1) {
                                        layoutSelect.append(
                                            $('<option value="' + layout.Id + '" ' + (options.channel.LayoutId == layout.Id ? 'selected="selected"' : '') + ' />').text(layout.Name)
                                        );
                                    }
                                });

                                return layoutSelect;
                            }()
                        };

                        $this.html(
                            $('<a />').addClass('button').text('Back').click(function () {
                                $this.insmViewHandler('show', {
                                    viewName: 'table-view'
                                });
                            })
                        );

                        if (options.channel.Id) {
                            if (_plugin.settings.enableEdit) {
                                $this.append(
                                    $('<a />').addClass('button warning margin-left').text('Delete channel').click(function () {
                                        if (_plugin.data.hasContentScheduled) {
                                            alert("You need to remove the scheduled player engine before you can delete the channel.");
                                            return false;
                                        }
                                        $.insmDialog({
                                            type: 'confirm',
                                            title: 'Delete channel?',
                                            message: 'This cannot be undone. Are you sure?',
                                            accept: function () {
                                                var saveNotificationHandle = $.insmNotification({
                                                    type: 'load',
                                                    text: 'Deleting',
                                                    duration: 0
                                                });
                                                var channelData = {
                                                    channelid: options.channel.Id,
                                                    method: 'remove',
                                                    success: function (data) {
                                                        saveNotificationHandle.update({
                                                            type: 'successful',
                                                            text: 'Deleted'
                                                        });
                                                        options.channel.Id = 0;

                                                        $this.insmChannel('displayTable');
                                                    },
                                                    denied: function (data) {
                                                        saveNotificationHandle.update({
                                                            type: 'unauthorized',
                                                            text: 'Unauthorized'
                                                        });
                                                    },
                                                    error: function (data) {
                                                        saveNotificationHandle.update({
                                                            type: 'error',
                                                            text: data
                                                        });
                                                    }
                                                };
                                                $.insmFramework('channels', channelData);
                                            }
                                        });
                                    })
                                );
                            }

                            var $scheduledInfo = $('<div><p style="padding: 10px;" >Checking scheduling...</p></div>');
                            $this.append($scheduledInfo);

                            $.insmFramework('schedule', {
                                channelId: options.channel.Id,
                                regionId: 1,
                                success: function (data) {
                                    if (data.length) {
                                        if (_plugin.settings.enableEdit) {
                                            var $removeButton = $('<a />').text('Remove Player engine').addClass('button').click(function () {
                                                if (!confirm("The player engine will be removed from this channel if you proceeed. \nYou will not be able to undo this action. Are you sure?")) {
                                                    return false;
                                                }
                                                var removingContentNotificationHandle = $.insmNotification({
                                                    type: 'load',
                                                    text: 'Removing scheduled content from channel',
                                                    duration: 0
                                                });
                                                $.insmFramework('schedule', {
                                                    scheduleItemId: data[0].Id,
                                                    regionId: 1,
                                                    method: 'remove',
                                                    success: function (data) {
                                                        $this.insmChannel('displayChannel', options);
                                                        removingContentNotificationHandle.update({
                                                            type: 'successful',
                                                            text: 'Scheduled content has been removed'
                                                        });
                                                    },
                                                    error: function (message) {
                                                        removingContentNotificationHandle.update({
                                                            text: message,
                                                            type: 'error'
                                                        });
                                                    },
                                                    denied: function (message) {
                                                        $.insmFramework('login', {
                                                            success: function () {
                                                                $this.insmChannel('displayTable');
                                                            }
                                                        });
                                                    }
                                                });
                                            });
                                        }
                                        $scheduledInfo.empty().append($('<p style="padding: 10px;">Channel has a player engine scheduled.<br/></p>').append(
                                            $removeButton,
                                            $('<div />').css({
                                                paddingTop: '16px'
                                            }).text('NOTE: Changing the name of a channel might affect playback. Make sure you have the correct playback data key set on this channel in "Player Engine".')
                                        ));
                                        _plugin.data.hasContentScheduled = true;
                                        $this.fadeIn();
                                        displayChannelNotificationHandle.update({
                                            type: 'successful',
                                            text: 'Channel data loaded',
                                            duration: -1
                                        });
                                    } else {
                                        $scheduledInfo.empty().append('<p style="padding: 10px;">Channel has no content scheduled.</p>');
                                        _plugin.data.hasContentScheduled = false;
                                        $this.fadeIn();
                                        displayChannelNotificationHandle.update({
                                            type: 'successful',
                                            text: 'Channel data loaded',
                                            duration: -1
                                        });
                                    }
                                },
                                error: function (message) {
                                    $.insmNotification({
                                        text: message,
                                        type: 'error'
                                    });
                                },
                                denied: function () {
                                    $.insmFramework('login', {
                                        success: function () {
                                            $notificationChannel.update({
                                                type: 'successful',
                                                text: 'Authentication successful'
                                            });

                                            $this.insmChannel('displayTable');
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            $this.fadeIn();
                            displayChannelNotificationHandle.update({
                                type: 'successful',
                                text: 'Channel data loaded',
                                duration: -1
                            });
                        }

                        $this.append(
                            $('<table />').addClass('vertical no-border').append(
                                $('<tr />').append(
                                    $('<th />').text('Name')
                                ).append(
                                    $('<td />').append(
                                        channelInputData.name
                                    )
                                )
                            ).append(
                                $('<tr />').append(
                                    $('<th />').text('Description')
                                ).append(
                                    $('<td />').append(
                                        channelInputData.description
                                    )
                                )
                            ).append(
                                $('<tr />').append(
                                    $('<th />').text('Layout')
                                ).append(
                                    $('<td />').append(
                                        channelInputData.layout
                                    )
                                )
                            )
                        );
                        
                        if (_plugin.settings.enableEdit) {
                            $this.append(
                                $('<a />').addClass('button margin-left').text('Save').click(function () {
                                    if (channelInputData.name.val() == "") {
                                        channelInputData.name.css({
                                            borderColor: '#f00'
                                        });
                                        return false;
                                    }
                                    else {
                                        channelInputData.name.css({
                                            borderColor: null
                                        });
                                    }
                                    var saveNotificationHandle = $.insmNotification({
                                        type: 'load',
                                        text: 'Saving',
                                        duration: 0
                                    });
                                    var channelData = {
                                        method: 'set',
                                        name: channelInputData.name.val(),
                                        description: channelInputData.description.val(),
                                        layoutid: parseInt(channelInputData.layout.val()),
                                        success: function (data) {
                                            $this.insmChannel('displayTable');
                                            saveNotificationHandle.update({
                                                type: 'successful',
                                                text: 'Saved'
                                            });
                                        },
                                        denied: function (data) {
                                            saveNotificationHandle.update({
                                                type: 'unauthorized',
                                                text: 'Unauthorized'
                                            });
                                        },
                                        error: function (data) {
                                            saveNotificationHandle.update({
                                                type: 'error',
                                                text: data
                                            });
                                        }
                                    };

                                    if (options.channel.Id) {
                                        channelData.channelid = options.channel.Id;
                                    }

                                    $.insmFramework('channels', channelData);
                                })
                            );
                        }
                    },
                    denied: function () {
                        var authNotificationHandle = $.insmNotification({
                            type: 'unauthorized',
                            text: 'Authentication needed'
                        });

                        $.insmFramework('login', {
                            success: function () {
                                authNotificationHandle.update({
                                    type: 'successful',
                                    text: 'Authentication successful'
                                });

                                $this.insmLayout('displayTable');
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
            });

            return $this;
        }
    };

    $.fn.insmChannel = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmChannel');
        }
    };
})(jQuery);