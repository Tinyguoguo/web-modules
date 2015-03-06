/*
* INSM Template Image
* This file contain the INSM Template Image function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmAsset(settings);
*
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
            var _plugin = $this.data('insmTemplateText');

            _plugin = {
                htmlElements: {
                    formatValue: {}
                },
                settings: $.extend({
                    framework: null,
                    dataset: null,
                    initialized: false,
                    filechangeCallback: function (name) {

                    },
                    mediaContentDirectoryId: 0,
                    readableFileStatus: function () { },
                    type: '',
                    filecache: []
                }, options),
                data: {
                    file: {
                        Id: 0,
                        cachedId: 0
                    }
                },
                properties: {
                    Movie: {
                        PlayUntilFinished: {
                            type: 'bool',
                            currentValue: 'true',
                        }
                    },
                    Image: {

                    }
                }
            };

            $this.data('insmTemplateText', _plugin);
            if (!_plugin.settings.type) {
                if (_plugin.settings.dataset && _plugin.settings.dataset.Items && _plugin.settings.dataset.Items.Image) {
                    _plugin.settings.type = 'Image';
                } else if (_plugin.settings.dataset && _plugin.settings.dataset.Items && _plugin.settings.dataset.Items.Movie) {
                    _plugin.settings.type = 'Movie';
                } else {
                    //something is wrong. Let's default to image :(
                    _plugin.settings.type = 'Image';
                }
            }

            //set id if exist or create new dataset structure of not
            if (_plugin.settings.dataset && _plugin.settings.dataset.Items && _plugin.settings.dataset.Items[_plugin.settings.type]) {
                _plugin.data.file.Id = _plugin.settings.dataset.Items[_plugin.settings.type].FileId;
            } else {
                var id = (_plugin.settings.dataset && _plugin.settings.dataset.Id) || false;
                _plugin.settings.dataset = {
                    Items: {
                        Repeat: {
                            Type: 'Boolean',
                            Value: 'False'
                        }
                    }
                }
                _plugin.settings.dataset.Items[_plugin.settings.type] = { Type: _plugin.settings.type }

                if (id) { _plugin.settings.dataset.Id = id }
            }
            // Populate with default dataset items
            var datasetItems = {};
            $.each(_plugin.properties[_plugin.settings.type], function (index, value) {
                datasetItems[index] = value;
            });

            //overwrite default value with value from server if exists.
            $.each(datasetItems, function (index) {
                if (typeof _plugin.settings.dataset.Items[index] != 'undefined' && typeof _plugin.settings.dataset.Items[index].Value != 'undefined') {
                    if (datasetItems[index].Type == 'boolean' || datasetItems[index].Type == 'bool') {
                        //special case boolean comes as text 'True' or 'False' => change to actual boolean values.
                        _plugin.settings.dataset.Items[index].Value = _plugin.settings.dataset.Items[index].Value &&
                            !(typeof _plugin.settings.dataset.Items[index].Value == 'string' && _plugin.settings.dataset.Items[index].Value.toLowerCase() == "false");
                    }
                    datasetItems[index].Value = _plugin.settings.dataset.Items[index].Value;
                    datasetItems[index].currentValue = _plugin.settings.dataset.Items[index].Value;
                }
            });

            //Make sure all items from server are preserved in the data.
            _plugin.settings.dataset.Items = $.extend({}, _plugin.settings.dataset.Items, datasetItems);
            _plugin.settings.initialized = true;

            return $this;
        },
        getContentProperties: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');
            if (_plugin.settings.type == 'Movie') {
                return ['PlayUntilFinished']
            }
            return [];
        },
        generateProperties: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');

            var $table = $('<table />').addClass('vertical');
            $.each(options.properties, function (key) {
                var item = _plugin.settings.dataset.Items[key];
                item.tag = key;
                if (!_plugin.htmlElements.formatValue[item.tag]) {
                    _plugin.htmlElements.formatValue[item.tag] = $('<div />').insmInput(item);
                }

                var title = key;
                if (title == 'PlayUntilFinished') {
                    title = 'Play Until Finished';
                }

                $table.append(
                    $('<tr />').append(
                        $('<th />').text(title)
                    ).append(
                        $('<td />').append(
                            options.edit ? _plugin.htmlElements.formatValue[item.tag].insmInput('edit') : _plugin.htmlElements.formatValue[item.tag].insmInput('view')
                        )
                    )
                );
            });

            return $table;
        },
        view: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');
            var $table = $this.insmTemplateText('generateProperties', { properties: _plugin.properties[_plugin.settings.type] });
            $this.insmTemplateText('getFileInfo').done(function (data) {
                data = fileFormat(data);
                $table.append(
                    $('<tr />').append(
                        $('<th />').text('Template Type'),
                        $('<td />').text(_plugin.settings.type)
                    ),
                    $('<tr />').append(
                        $('<th />').text('Preview'),
                        $('<td />').append($this.insmTemplateText('getPreview'))
                    ),
                    $('<tr />').append(
                        $('<th />').text('Filename'),
                        $('<td />').text(data.filename)
                    ),
                    $('<tr />').append(
                        $('<th />').text('Available'),
                        $('<td />').text(data.active)
                    ),
                    $('<tr />').append(
                        $('<th />').text('Start Date').insmTooltip({
                            container: $('html'),
                            text: 'Dates are inclusive and start and end at midnight (media player) time'
                        }),
                        $('<td />').text(data.startDate.substr(0,10))
                    ),
                    $('<tr />').append(
                        $('<th />').text('End Date').insmTooltip({
                            container: $('html'),
                            text: 'Dates are inclusive and start and end at midnight (media player) time'
                        }),
                        $('<td />').text(data.endDate.substr(0, 10))
                    ),
                    $('<tr />').append(
                        $('<th />').text('Orientation'),
                        $('<td />').text(data.orientation)
                    )
                );
            }).fail(function (data) {
                $this.text(data);
            });
            $this.html($table);
            return $this;
        },
        isInitialized: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');
            if (_plugin) {
                return _plugin.settings.initialized;
            } else {
                return false;
            }

        },
        getThumbnail: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');
            if (!_plugin.data.file.Id) {
                return $("<span>").html("No " + _plugin.settings.type + " selected");
            }
            var thumbnailUrl = $.insmFiles('getThumbnailUrl', {
                fileId: _plugin.data.file.Id
            });

            return $('<img />').attr('src', thumbnailUrl).attr('alt', _plugin.settings.dataset.Items[_plugin.settings.type].Value);
        },
        getPreview: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');
            return $this.insmTemplateText('getThumbnail').insmPreviewWindow({
                fileId: _plugin.data.file.Id
            }).addClass('clickable');
        },
        getName: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');
            return _plugin.data.file.name;
        },
        getFileInfo: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');

            var def = $.Deferred();
            if (!_plugin.data.file.Id) {
                def.resolveWith(this, [{}]);
                return def;
            }

            if (_plugin.data.file.cachedId > 0 && _plugin.data.file.cachedId == _plugin.data.file.Id) {
                def.resolveWith(this, [_plugin.data.file.cachedData]);
                return def;
            }

            if ($.insmFileCache('get',_plugin.data.file.Id)) {
                def.resolveWith(this, [$.insmFileCache('get', _plugin.data.file.Id)]);
                return def;
            }

            $.insmFiles({ framework: _plugin.settings.framework });
            $.insmFiles('getFileInfo', {
                fileId: _plugin.data.file.Id,
                success: function (data) {
                    _plugin.data.file.cachedId = _plugin.data.file.Id;
                    _plugin.data.file.cachedData = data;
                    def.resolveWith(this, [data]);
                },
                error: function (message) {
                    $.insmNotification({
                        text: message,
                        type: 'error'
                    });
                    def.rejectWith(this, [message]);
                },
                denied: function () {
                    $.insmNotification({
                        text: 'Session expired, please refresh your browser',
                        type: 'error'
                    });
                    def.rejectWith(this, ['denied']);
                }
            });

            return def;
        },
        getTemplateInfo: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');
            var def = $.Deferred();
            var status = {
                files: [],
                state: ""
            }
            $this.insmTemplateText('getFileInfo').done(function (data) {
                status.state = _plugin.settings.readableFileStatus(fileFormat(data));
                status.files.push(data);
                def.resolveWith(this, [status]);
            }).fail(function (data) {
                def.rejectWith(this, [data]);
            });
            return def;
        },
        selectFile: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');
            var def = $.Deferred();
            var fileType = _plugin.settings.type == 'Movie' ? 'video' : 'image';

            $.insmFileBrowser({
                framework: _plugin.settings.framework,
                mediaContentDirectoryId: _plugin.settings.mediaContentDirectoryId,
                currentFileId: _plugin.data.file.Id,
                usePreview: true,
                fileType: fileType,
                onSelect: function (file) {
                    _plugin.data.file = file;
                    def.resolve();
                },
                filter: function (file) {
                    if (fileFormat(file).status == 'ok' || fileFormat(file).status == 'in future') {
                        return true;
                    } else {
                        return false;
                    }
                }
            });
            return def;
        },
        editView: function () {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');

            var $table = $this.insmTemplateText('generateProperties', { properties: _plugin.properties[_plugin.settings.type], edit: true });

            var fileinfo = $('<span />').text("No " + _plugin.settings.type + " selected");
            var changebutton = $('<a class="button">Change ' + _plugin.settings.type + ' File</a>');
            var setMedia = function () {

                fileinfo.text('Loading file info.');
                $this.insmTemplateText('getFileInfo').done(function (data) {
                    data = fileFormat(data);

                    fileinfo.empty().append(
                        $('<tr />').append(
                            $('<th />').text('Preview'),
                            $('<td />').append($this.insmTemplateText('getPreview'))
                        ),
                        $('<tr />').append(
                            $('<th />').text('Filename'),
                            $('<td />').text(data.filename)
                        ),
                        $('<tr />').append(
                            $('<th />').text('Available'),
                            $('<td />').text(data.active)
                        ),
                        $('<tr />').append(
                            $('<th />').text('Start Date'),
                            $('<td />').text(data.startDate.substr(0, 10))
                        ),
                        $('<tr />').append(
                            $('<th />').text('End Date'),
                            $('<td />').text(data.endDate.substr(0, 10))
                        ),
                        $('<tr />').append(
                            $('<th />').text('Orientation'),
                            $('<td />').text(data.orientation)
                        )
                    );
                }).fail(function (data) {
                    fileinfo.empty().text(data);
                });
            };

            if (_plugin.data.file.Id) {
                setMedia();
            }

            changebutton.click(function () {
                $this.insmTemplateText('selectFile').done(function () {
                    if (_plugin.settings.filechangeCallback) {
                        _plugin.settings.filechangeCallback(_plugin.data.file.Name);
                    }
                    setMedia();
                });
            }).addClass('clickable');

            $table.append(
                    $('<tr />').append(
                        $('<td />').append(fileinfo),
                        $('<td />').append(changebutton)
                    )
                );
            _plugin.htmlElements.editViewTable = $table;
            $this.html($table);
            return $this;
        },
        getDateInterval: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');
            var def = $.Deferred();
            $this.insmTemplateText('getFileInfo').done(function (data) {
                if (!data.startDate || !data.endDate) {
                    def.resolveWith(this, [0]);
                } else {
                    def.resolveWith(this, [{ start: new Date(data.startDate + localDateOffset()), end: new Date(data.endDate + localDateOffset()) }]);
                }
            });
            return def;
        },
        validate: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');
            var def = $.Deferred();
            $this.insmTemplateText('updateDataset');
            var tmpVal = true;
            $.each(_plugin.properties[_plugin.settings.type], function (key, object) {
                tmpVal = _plugin.htmlElements.formatValue[key].insmInput('validate') && tmpVal;
            });

            if (!tmpVal) {
                def.rejectWith(this, ['Please check template properties']);
            } else if (_plugin.settings.dataset.Items[_plugin.settings.type].FileId) {
                def.resolve();
            } else {
                def.rejectWith(this, ["You must select a file for " + _plugin.settings.type + " template"]);
                $this.css({
                    border: '1px solid #e67'
                });
            }
            return def;
        },
        updateDataset: function (options) {
            //update dataset so if fits the htmlData. This should be called from insmAsset. 
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');

            // Update image id into dataset
            _plugin.settings.dataset.Items[_plugin.settings.type].FileId = _plugin.data.file.Id;
            _plugin.settings.dataset.Items[_plugin.settings.type].Value = _plugin.data.file.Name;
            $.each(_plugin.properties[_plugin.settings.type], function (key, object) {
                if (_plugin.settings.dataset.Items[key]) {
                    //Fetch from html and save into dataset.
                    var val = _plugin.htmlElements.formatValue[key].insmInput('getValue');
                    var item = _plugin.settings.dataset.Items[key];
                    item.Value = val;


                    //Simplify dataset.
                    var reObject = {
                        Value: item.Value
                    };
                    switch (object.type) {
                        case 'bool':
                        case 'boolean':
                            reObject.Type = 'Boolean';
                            break;
                        default:
                            reObject.Type = 'Text';
                            break;
                    }
                    _plugin.settings.dataset.Items[key] = reObject;
                }
            });
            if (!_plugin.settings.dataset.Name) {
                _plugin.settings.dataset.Name = "Content";
            }
            return _plugin.settings.dataset;
        },
        getProperty: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmTemplateText');
            return _plugin.settings.dataset.Items[options.key];
        }
    };

    $.fn.insmTemplateText = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmTemplateText');
            return null;
        }
    };
})(jQuery);