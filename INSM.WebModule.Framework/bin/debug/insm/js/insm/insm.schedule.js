/*
* INSM Schedule
* This file contain the INSM Schedule function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmSchedule(settings);
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
            var _plugin = $this.data('insmSchedule');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        regionId: 1,
                        templateContentDirectoryId: 0,
                        templateContentDirectoryName: '',
                        playlistContentDirectoryId: 0,
                        playlistContentDirectoryName: '',
                        applicationName: 'System Configuration'
                    }, options),
                    data: {
                        playlistId: 0,
                        channelId: 0,
                        fileId: 0,
                        layoutId: 0,
                        channelName: "",
                        parameterDataSet: null
                    },
                    htmlElements: {
                        channelSelector: $('<div />'),
                        currentPlaylist: $('<div />'),
                        playlistSelector: $('<div />'),
                        filesSelector: $('<div />'),
                        sleepMode: $('<div />'),
                        saveButton: $('<div />'),
                        datasetEditor: $('<div />')
                    }
                };
                $this.data('insmSchedule', _plugin);
            }

            if (!(_plugin.settings.templateContentDirectoryId || _plugin.settings.templateContentDirectoryName) &&
                !(_plugin.settings.playlistContentDirectoryId || _plugin.settings.playlistContentDirectoryName)) {
                $.insmNotification({
                    type: 'error',
                    text: 'Configuration error: INSM Schedule settings are missing content dir for template, playlist or playlist dataset.'
                });
                return null;
            }

            if (!$.insmFramework('isInitialized')) {
                $.insmFramework({
                    ams: _plugin.settings.ams,
                    protocol: _plugin.settings.ssl ? 'https' : 'http',
                    app: _plugin.settings.applicationName
                });
            }

            $.insmFramework('initialized').done(function () {
                $.insmFiles({ framework: $.insmFramework('getDeprecatedFramework') });
                
                //get template dir
                if (!_plugin.settings.templateContentDirectoryId) {
                    $.insmFramework('files', {
                        contentDirectoryName: _plugin.settings.templateContentDirectoryName,
                        regionId: _plugin.settings.regionId,
                        method: 'GetDirectoryInfo',
                        success: function (directory) {
                            _plugin.settings.templateContentDirectoryId = directory.Id;

                            // get playlist dir
                            if (!_plugin.settings.playlistContentDirectoryId) {
                                $.insmFramework('files', {
                                    contentDirectoryName: _plugin.settings.playlistContentDirectoryName,
                                    regionId: _plugin.settings.regionId,
                                    method: 'GetDirectoryInfo',
                                    success: function (directory) {
                                        _plugin.settings.playlistContentDirectoryId = directory.Id;
                                        $this.insmSchedule('displaySchedule');
                                    },
                                    error: function (message) {
                                        throw new Error(message);
                                    },
                                    denied: function (data) {
                                        var unauthNotificationHandle = $.insmNotification({
                                            type: 'unauthorized',
                                            text: data.Message,
                                            duration: 0
                                        });
                                        $.insmFramework('login', {
                                            success: function () {
                                                unauthNotificationHandle.update({
                                                    type: 'successful',
                                                    text: 'You are now authenticated',
                                                    duration: -1
                                                });
                                                $this.insmSchedule(options);
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                $this.insmSchedule('displaySchedule');
                            }
                        },
                        error: function (message) {
                            $.insmNotification({
                                type: 'error',
                                text: message
                            });
                        },
                        denied: function (data) {
                            var unauthNotificationHandle = $.insmNotification({
                                type: 'unauthorized',
                                text: data.Message,
                                duration: 0
                            });
                            $.insmFramework('login', {
                                success: function () {
                                    unauthNotificationHandle.update({
                                        type: 'successful',
                                        text: 'You are now authenticated',
                                        duration: -1
                                    });
                                    $this.insmSchedule(options);
                                }
                            });
                        }
                    });
                }
                else if (!_plugin.settings.playlistContentDirectoryId) {
                    // Copy pasted from above...
                    // get playlist dir
                    $.insmFramework('files', {
                        contentDirectoryName: _plugin.settings.playlistContentDirectoryName,
                        regionId: _plugin.settings.regionId,
                        method: 'GetDirectoryInfo',
                        success: function (directory) {
                            _plugin.settings.playlistContentDirectoryId = directory.Id;
                            $this.insmSchedule('displaySchedule');
                        },
                        error: function (message) {
                            throw new Error(message);
                        },
                        denied: function (data) {
                            var unauthNotificationHandle = $.insmNotification({
                                type: 'unauthorized',
                                text: data.Message,
                                duration: 0
                            });
                            $.insmFramework('login', {
                                success: function () {
                                    unauthNotificationHandle.update({
                                        type: 'successful',
                                        text: 'You are now authenticated',
                                        duration: -1
                                    });
                                    $this.insmSchedule(options);
                                }
                            });
                        }
                    });
                }
                else {
                    $this.insmSchedule('displaySchedule');
                }
            });

            return $this;
        },
        login: function () {
            $this = $(this);
            var _plugin = $this.data('insmSchedule');

            var authNotificationHandle = $.insmNotification({
                type: 'unauthorized',
                text: 'Authentication needed',
                duration: 0
            });

            $.insmFramework('login', {
                success: function () {
                    authNotificationHandle.update({
                        type: 'successful',
                        text: 'Authentication successful',
                        duration: -1
                    });
                    $this.insmSchedule('displaySchedule');
                }
            });
        },
        empty: function (stage) {
            var $this = $(this);
            var _plugin = $this.data('insmSchedule');

            var stages = ['channelSelector', 'currentPlaylist', 'playlistSelector', 'filesSelector', 'sleepMode', 'saveButton'];
            var emptyFlag = false;
            $.each(stages, function (index, value) {
                if (value == stage) {
                    emptyFlag = true;
                }
                if (emptyFlag) {
                    _plugin.htmlElements[value].empty();
                }
            });
        },
        displaySchedule: function () {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmSchedule');
            $.when($.insmFramework('initialized')).done(function () {
                $.insmFramework('channels', {
                    success: function (channels) {
                        $this.insmSchedule('empty', 'channelSelector');

                        channelsSorted = [];
                        $.each(channels, function (index, object) {
                            channelsSorted.push(object);
                        });

                        channelsSorted.sort(function (a, b) {
                            var nameA = a.Name.toLowerCase(), nameB = b.Name.toLowerCase();
                            if (nameA < nameB) //sort string ascending
                                return -1;
                            if (nameA > nameB)
                                return 1;
                            return 0; //default return value (no sorting)
                        });

                        

                        var $select = $('<select />').change(function () {
                            if ($(this).val() != "None") {
                                _plugin.data.channelId = $(this).val();
                                _plugin.data.layoutId = channels[$(this).val()].LayoutId;
                                _plugin.data.channelName = channels[$(this).val()].Name;
                                $this.insmSchedule('handleChannelChange');
                            }
                        });

                        $select.append('<option value="None"> - select channel - </option>');
                        $.each(channelsSorted, function (index, channel) {
                            $select.append('<option value="' + channel.Id + '" >' + channel.Name + '</option>');
                        });
                        _plugin.htmlElements.channelSelector.append($select);
                    },
                    error: function (message) {
                        throw new Error(message);
                    },
                    denied: function (data) {
                        var unauthNotificationHandle = $.insmNotification({
                            type: 'unauthorized',
                            text: data.Message,
                            duration: 0
                        });
                        $.insmFramework('login', {
                            success: function (data) {
                                unauthNotificationHandle.update({
                                    type: 'successful',
                                    text: 'You are now authenticated',
                                    duration: -1
                                });
                                $this.insmSchedule('displaySchedule');
                            }
                        });
                    }
                });
            });

            $this.html(
                $('<table />').append(
                    $('<tr />').append(
                        $('<th />').text('Channel'),
                        $('<td />').append(_plugin.htmlElements.channelSelector)
                    ),
                    $('<tr />').append(
                        $('<th />').text('Template'),
                        $('<td />').append(_plugin.htmlElements.filesSelector)
                    ),
                    $('<tr />').append(
                        $('<th />').text('Sleep mode'),
                        $('<td />').append(_plugin.htmlElements.sleepMode)
                    ),
                    $('<tr />').append(
                        $('<th />').text('Template Dataset'),
                        $('<td />').append(_plugin.htmlElements.datasetEditor)
                    ),
                    $('<tr />').append(
                        $('<th />'),
                        $('<td />').append(_plugin.htmlElements.saveButton)
                    )
                )
            );

            return $this;
        },
        handleChannelChange: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSchedule');
            $.insmFramework('schedule', {
                method: 'get',
                regionId: _plugin.settings.regionId || 1,
                channelId: _plugin.data.channelId,
                success: function (scheduleData) {
                    if (scheduleData == null) {
                        $.insmNotification({ text: 'Schedule data was null.', type: 'error' });
                        return;
                    }
                    if (scheduleData.length > 0) {
                        _plugin.data.playlistId = scheduleData[0].Playlist.Id;

                        $.insmFramework('getPlaylist', {
                            id: _plugin.data.playlistId,
                            success: function (playlist) {
                                $.insmFramework('getDataset', {
                                    id: playlist.Items[0].SubItems[0].DataSetId,
                                    success: function (dataset) {
                                        _plugin.htmlElements.datasetEditor.insmInput('destroy').insmInput({
                                            type: "table",
                                            multiSelect: false,
                                            required: false,
                                            currentValue: [dataset],
                                            initObject: {
                                                Name: {
                                                    type: "string",
                                                    currentValue: []
                                                },
                                                Description: {
                                                    type: "string",
                                                    currentValue: [],
                                                    required: false
                                                },
                                                Items: {
                                                    type: "dataset",
                                                    currentValue: {},
                                                    onItemClick: function (item) {
                                                        if (item.Type === "DataSet") {
                                                            $this.insmDatasetEditor('displayDatasetEditor', {
                                                                datasetId: item.DataSetId
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                        $this.insmSchedule('handlePlaylist');
                                    },
                                    error: function (message) {
                                        throw new Error(message);
                                    },
                                    denied: function (data) {
                                        $.insmNotification({
                                            type: 'unauthorized',
                                            text: data.Message
                                        });
                                    }
                                });
                            },
                            error: function (message) { $.insmNotification({ text: message, type: 'error' }); },
                            denied: function () { $this.insmSchedule('login'); }
                        });
                    }
                    else {
                        _plugin.htmlElements.datasetEditor.insmInput('destroy').insmInput({
                            type: "table",
                            multiSelect: false,
                            required: false,
                            currentValue: [{
                                Name: 'Playlist Dataset',
                                Description: '',
                                Items: {
                                    'PlaybackDataKey': {
                                        Type: 'Text',
                                        Value: _plugin.data.channelName
                                    }
                                }
                            }],
                            initObject: {
                                Name: {
                                    type: "string",
                                    currentValue: []
                                },
                                Description: {
                                    type: "string",
                                    currentValue: [],
                                    required: false
                                },
                                Items: {
                                    type: "dataset",
                                    currentValue: {},
                                    onItemClick: function (item) {
                            
                                        if (item.Type === "DataSet") {
                                            $this.insmDatasetEditor('displayDatasetEditor', {
                                                datasetId: item.DataSetId
                                            });
                                        }
                                    }
                                }
                            }
                        }).insmInput('edit');
                        _plugin.data.playlistId = 0;
                        $this.insmSchedule('handlePlaylist');
                    }
                },
                error: function (message) { $.insmNotification({ text: message, type: 'error' }); },
                denied: function () { $this.insmSchedule('login'); }
            });
        },
        handlePlaylist: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSchedule');
            var fileId = 0;
            var fileIdDeferred = new $.Deferred();

            var channelDataNotificationHandle = $.insmNotification({
                type: 'load',
                text: 'Loading channel data'
            });

            if (_plugin.data.playlistId) {
                $.insmFramework('playlist', {
                    method: 'get',
                    playlistId: _plugin.data.playlistId,
                    success: function (data) {
                        _plugin.data.parameterDataSet = data.Items[0].Parameters;
                        var sleepModeValue = 'Remove';
                        if (data.Items[0].Parameters.Items.SleepMode && data.Items[0].Parameters.Items.SleepMode.Value) {
                            sleepModeValue = data.Items[0].Parameters.Items.SleepMode.Value;
                        }
                        _plugin.htmlElements.sleepMode.insmInput({
                            type: 'dropdown',
                            required: true,
                            values: {
                                Pause: 'Pause',
                                Stop: 'Stop',
                                Suspend: 'Suspend',
                                Remove: 'Remove'
                            },
                            currentValue: sleepModeValue
                        }).insmInput('edit');

                        fileId = data.Items[0].SubItems[0].FileId;
                        fileIdDeferred.resolve();
                    },
                    error: function (message) { $.insmNotification({ text: message, type: 'error' }); },
                    denied: function () { $this.insmSchedule('login'); }
                });
            }
            else {
                _plugin.htmlElements.sleepMode.insmInput({
                    type: 'dropdown',
                    required: true,
                    values: {
                        Pause: 'Pause',
                        Stop: 'Stop',
                        Suspend: 'Suspend',
                        Remove: 'Remove'
                    },
                    currentValue: 'Remove'
                }).insmInput('edit');
                fileIdDeferred.resolve();
            }

            fileIdDeferred.done(function () {
                $.insmFiles('getFilesInfo', {
                    contentDirectoryId: _plugin.settings.templateContentDirectoryId,
                    type: 'mediafile',
                    success: function (data) {
                        _plugin.htmlElements.filesSelector.empty();
                        _plugin.htmlElements.saveButton.empty();
                        _plugin.htmlElements.filesSelector;
                        var $select = $('<select />');
                        
                        if (_plugin.settings.enableEdit) {
                            $select.change(function () {
                                if ($(this).val() != "None") {
                                    _plugin.data.fileId = $(this).val();
                                    $this.insmSchedule('handleTemplateChange');
                                }
                            });
                        }
                        else {
                            $select.attr('disabled', 'disabled');
                        }
                        $select.append('<option value="None">select</option>');
                        $.each(data.MediaFiles, function (index, mediaFile) {
                            $select.append('<option value="' + mediaFile.Id + '" >' + mediaFile.Name + '</option>');
                        });
                        if (fileId) {
                            $select.val(fileId).trigger('change');
                        }
                        _plugin.htmlElements.filesSelector.append($select);
                        _plugin.htmlElements.datasetEditor.insmInput('edit');
                        channelDataNotificationHandle.update({
                            type: 'successful',
                            text: 'Channel data loaded successfully',
                            duration: -1
                        });
                    },
                    error: function (message) { $.insmNotification({ text: message, type: 'error' }); },
                    denied: function () { $this.insmSchedule('login'); }
                });
            });
        },
        handleTemplateChange: function () {
            var $this = $(this);
            var _plugin = $this.data('insmSchedule');
            $this.insmSchedule('empty', 'saveButton');

            _plugin.htmlElements.saveButton.append($('<a class="button">Save</a>').click(function () {
                if (!_plugin.htmlElements.sleepMode.insmInput('validate')) {
                    return false;
                }

                var savingTemplateNotificationHandle = $.insmNotification({
                    text: 'Scheduling template to channel',
                    type: 'load'
                });
                var def = $.Deferred();
                
                if (!_plugin.data.playlistId) {
                    $.insmFramework('playlist', {
                        method: 'get',
                        name: _plugin.data.channelName,
                        contentDirectoryId: _plugin.settings.playlistContentDirectoryId,
                        success: function (data) {
                            var id = 0;
                            $.each(data, function (index, playlist) {
                                id = playlist.Id;
                            });
                            if (id) {
                                _plugin.data.playlistId = id;
                                def.resolve();
                            } else {
                                $.insmFramework('playlist', {
                                    method: 'set',
                                    name: _plugin.data.channelName,
                                    contentDirectoryId: _plugin.settings.playlistContentDirectoryId,
                                    success: function (data) {
                                        _plugin.data.playlistId = data.Id;
                                        
                                        def.resolve();
                                    },
                                    error: function (message) {
                                        savingTemplateNotificationHandle.update({
                                            text: message,
                                            type: 'error'
                                        });
                                    },
                                    denied: function () { $this.insmSchedule('login'); }
                                });
                            }
                        },
                        error: function (message) {
                            savingTemplateNotificationHandle.update({
                                text: message,
                                type: 'error'
                            });
                        },
                        denied: function () { $this.insmSchedule('login'); }
                    });
                } else {
                    def.resolve();
                }

                // We have a playlist
                def.done(function () {
                    $.insmFramework('playlist', {
                        method: 'set',
                        mediaFileId: _plugin.data.fileId,
                        playlistId: _plugin.data.playlistId,
                        layoutId: _plugin.data.layoutId, // The channels layout id
                        success: function (playlist) {

                            var playlistDeferred = new $.Deferred();
                            // The parameter dataset get's a negative id so we have to fetch the whole playlist again to see what the id actually is.
                            //if (playlist.Items[0].SubItems[0].DataSetId <= 0) {
                                $.insmFramework('playlist', {
                                    method: 'get',
                                    playlistId: _plugin.data.playlistId,
                                    success: function (completePlaylist) {
                                        playlist = completePlaylist;
                                        var parameterDataset = playlist.Items[0].Parameters;
                                        parameterDataset.Items.SleepMode = {
                                            Type: "Text",
                                            Value: _plugin.htmlElements.sleepMode.insmInput('getValue')
                                        };
                                        
                                        $.insmFramework('dataset', {
                                            method: 'set',
                                            datasetId: parameterDataset.Id,
                                            value: JSON.stringify(parameterDataset),
                                            success: function (data) {
                                                playlistDeferred.resolve();
                                            },
                                            error: function (message) {
                                                throw new Error(message);
                                            },
                                            denied: function () {
                                                
                                            }
                                        });
                                    },
                                    denied: function () {
                                        $this.insmSchedule('login');
                                    },
                                    error: function (message) {
                                        savingTemplateNotificationHandle.update({
                                            text: message,
                                            type: 'error'
                                        });
                                    }
                                });
                            //}
                            //else {
                            //    playlistDeferred.resolve();
                            //}

                            var datasetDeferred = new $.Deferred();
                            playlistDeferred.done(function () {
                                var newDataset = _plugin.htmlElements.datasetEditor.insmInput('getValue');
                                newDataset.Id = playlist.Items[0].SubItems[0].DataSetId;

                                $.insmFramework('dataset', {
                                    method: 'set',
                                    datasetId: newDataset.Id,
                                    value: JSON.stringify(newDataset),
                                    success: function (data) {
                                        $.insmFramework('schedule', {
                                            method: 'get',
                                            regionId: _plugin.settings.regionId,
                                            channelId: _plugin.data.channelId,
                                            success: function (scheduleData) {
                                                if (scheduleData.length == 0) {
                                                    $.insmFramework('schedule', {
                                                        method: 'set',
                                                        playlistId: _plugin.data.playlistId,
                                                        channelId: _plugin.data.channelId,
                                                        regionId: _plugin.settings.regionId,
                                                        isRecurring: true,
                                                        success: function (schedule) {
                                                            savingTemplateNotificationHandle.update({
                                                                text: 'The template was scheduled successfully',
                                                                type: 'successful'
                                                            });
                                                        },
                                                        denied: function () {
                                                            $this.insmSchedule('login');
                                                        },
                                                        error: function (message) {
                                                            savingTemplateNotificationHandle.update({
                                                                text: message,
                                                                type: 'error'
                                                            });
                                                        }
                                                    });
                                                }
                                                else {
                                                    savingTemplateNotificationHandle.update({
                                                        text: 'The template was scheduled successfully',
                                                        type: 'successful'
                                                    });
                                                }
                                            },
                                            error: function (message) {
                                                savingTemplateNotificationHandle.update({
                                                    text: message,
                                                    type: 'error'
                                                });
                                            },
                                            denied: function () { $this.insmSchedule('login'); }
                                        });
                                        datasetDeferred.resolve();
                                    },
                                    error: function (message) {
                                        throw new Error(message);
                                    },
                                    denied: function () {
                                        $this.insmSchedule('login');
                                    }
                                });
                            });
                        },
                        error: function (message) {
                            savingTemplateNotificationHandle.update({
                                text: message,
                                type: 'error'
                            });
                        },
                        denied: function () {
                            $this.insmSchedule('login');
                        }
                    });
                });
            }));
        },
        destroy: function () {
            $this = $(this);
            $this.empty().data('insmSchedule', null);
            return $this;
        }
    };

    $.fn.insmSchedule = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmSchedule');
        }
    };
})(jQuery);