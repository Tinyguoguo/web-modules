/*
* INSM File Manager
* This file contain the INSM File Manager function.
* The script display a list of all files in an Instoremedia Assets Management Server (AMS).
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmDatasetEditor(settings);
*
* Author:
* Tobias Rahm, Mikael Berglund
* Instoremedia AB
*/

(function ($) {
    $.fn.insmFileManager = function (settings) {
        // Global variables
        var _target = $(this);

        $.insmLocalization('addLocale', {
            'default': {
                uploadFile: 'Upload File'
            }
        });

        if (typeof settings.localization === 'object') {
            $.insmLocalization('addLocale', settings.localization);
        }
        if ($.isArray(settings.locale)) {
            $.insmLocalization('locale', settings.locale);
        } else if (settings.locale === 'string') {
            $.insmLocalization('locale', [settings.locale]);
        }

        var $table; //holds the table with all files.

        var _contentDirectoryId = settings.contentDirectoryId;
        var _contentDirectoryName = settings.contentDirectoryName;
        var _regionId = settings.regionId;
        var _applicationName = settings.applicationName || 'File Store';
        var _enableModuleAccessCheck = settings.enableModuleAccessCheck || false;
        var _enableUpload = false;
        var _defaultActiveValue = false;
        var _filesToEdit = [];
        var _csvColumns = settings.csvColumns || {};
        

        var _accessLevel = '';

        var params = {
            ams: settings.ams,
            ssl: settings.ssl,
            app: _applicationName,
            version: (manifest.version ? manifest.version : 'Unknown'),
            rootId: ($(document).getUrlParam('rootid') ? $(document).getUrlParam('rootid') : ($(document).getUrlParam('rootId') ? $(document).getUrlParam('rootId') : settings.rootId))
        };

        // Format params
        if (params.ams.indexOf('http://') === 0) {
            params.ams = params.ams.substring(7);
        }
        // Validate params
        if (!(params.ams && (_contentDirectoryId || _contentDirectoryName))) {
            _target.load('html/readme.html');
            return null;
        }

        // Init insmFramework plugin
        $.insmFramework({
            ams: params.ams,
            app: params.app,
            version: params.version,
            protocol: (params.ssl ? 'https' : 'http')
        });
        var _framework;
        var frameworkInit = new $.Deferred();

        var _parseFileFunction = function (file) {
            if (typeof file.Attributes == 'undefined') {
                file.Attributes = {
                    Active: false,
                    StartDate: '',
                    EndDate: '',
                    Orientation: '',
                    Resolution: ''
                };
            }
            return {
                active: (file.Attributes.Active == 'False' ? false : true),
                category: (typeof file.Attributes.Category != 'undefined' ? file.Attributes.Category : ''),
                creationDate: (typeof file.CreationDate != 'undefined' ? file.CreationDate : ''),
                creator: (typeof file.Creator != 'undefined' ? file.Creator : ''),
                description: (typeof file.Description != 'undefined' ? file.Description : ''),
                duration: (typeof file.Attributes.Duration != 'undefined' ? file.Attributes.Duration : ''),
                orientation: (typeof file.Attributes.Orientation != 'undefined' ? file.Attributes.Orientation : ''),
                resolution: (typeof file.Attributes.Resolution != 'undefined' ? file.Attributes.Resolution : ''),
                id: (typeof file.Id != 'undefined' ? file.Id : ''),
                mimeType: (typeof file.MimeType != 'undefined' ? file.MimeType : ''),
                modificationDate: (typeof file.ModificationDate != 'undefined' ? file.ModificationDate : ''),
                modifier: (typeof file.Modifier != 'undefined' ? file.Modifier : ''),
                name: (typeof file.Name != 'undefined' ? file.Name : ''),
                startDate: (typeof file.Attributes.StartDate != 'undefined' ? file.Attributes.StartDate : ''),
                endDate: (typeof file.Attributes.EndDate != 'undefined' ? file.Attributes.EndDate : ''),
                size: (typeof file.Length != 'undefined' ? file.Length : '')
            };
        };

        var _filePropertyFields = {
            File: {
                attr: 'name',
                type: 'string',
                editable: true
            },
            MimeType: {
                attr: 'mimeType',
                type: 'string',
                editable: false,
                output: function (file) {
                    if (file.mimeType) {
                        return $.insmMimetypes({ mimetype: file.mimeType });
                    }
                    else {
                        return '';
                    }
                }
            },
            Size: {
                attr: 'size',
                type: 'int',
                editable: false
            },
            Created: {
                attr: 'creationDate',
                type: 'date',
                editable: false,
                output: function (file) {
                    return (typeof file.created == 'undefined' ? '' : printDate(new Date(file.created), 'Y-m-d H:i:s'));
                }
            },
            'Start Date': {
                attr: 'startDate',
                type: 'date',
                editable: true,
                output: function (file) {
                    return file.startDate.substring(0, 10);
                }
            },
            'End Date': {
                attr: 'endDate',
                type: 'date',
                editable: true,
                output: function (file) {
                    return file.endDate.substring(0, 10);
                }
            },
            Available: {
                attr: 'active',
                type: 'bool',
                editable: true,
                output: function (file) {
                    return (typeof file.active == 'undefined' ? '' : file.active);
                }
            },
            Resolution: {
                attr: 'resolution',
                type: 'string',
                editable: true
            },
            Orientation: {
                attr: 'orientation',
                type: 'selectable',
                values: {
                    Landscape: 'Landscape',
                    Portrait: 'Portrait'
                },
                editable: true
            },
            Duration: {
                attr: 'duration',
                type: 'string',
                editable: false,
                output: function (file) {
                    return (typeof file.duration == 'undefined' ? '' : file.duration);
                }
            }
        };

        var _headers = {
            Edit: {
                type: 'checkbox',
                output: function (file) {
                    var $checkbox = $('<input type="checkbox" />');
                    var found = false;

                    $.each(_filesToEdit, function (index, f) {
                        if (f.id === file.id) {
                            found = true;
                        }
                    });

                    if (found) $checkbox.attr('checked', true); else $checkbox.attr('checked', false);

                    $checkbox.change(function () {
                        var remove = false;
                        _filesToEdit = $.map(_filesToEdit, function (f) {
                            if (f.id == file.id) {
                                remove = true;
                                return null;
                            }
                            return f;
                        });
                        if (!remove) {
                            _filesToEdit.push(file);
                        }
                    });
                    return $checkbox;
                },
                sort: false
            },
            Preview: {
                type: 'string',
                output: function (file) {
                    var thumbnailUrl = $.insmFiles('getThumbnailUrl', {
                        fileId: file.id
                    });

                    return $('<img />').addClass('adjust-width').attr('src', thumbnailUrl).insmPreviewWindow({
                        fileId: file.id,
                        mimeType: file.mimeType
                    });
                },
                search: false,
                sort: false
            },
            Name: {
                attr: 'name',
                type: 'string',
                output: function (file) {
                    var name = $('<a />').text(file.name).click(function () {
                        $.insmViewHandlerOld('file-view').init(file).show();
                    });
                    return name;
                }
            },
            'Type': {
                attr: 'mimeType',
                type: 'string',
                output: function (file) {
                    if (file.mimeType) {
                        return $.insmMimetypes({ mimetype: file.mimeType });
                    }
                    else {
                        return '';
                    }
                },
                sort: function (fileA, fileB) {
                    if (!fileA || !$.insmMimetypes({ mimetype: fileA.mimeType })) {
                        return -1;
                    }
                    else if (!fileB || !$.insmMimetypes({ mimetype: fileB.mimeType })) {
                        return 1;
                    }
                    return $.insmMimetypes({ mimetype: fileA.mimeType }).localeCompare($.insmMimetypes({ mimetype: fileB.mimeType }));
                }
            },
            Resolution: {
                attr: 'resolution',
                type: 'string',
                output: function (file) {
                    if (typeof file.resolution != 'undefined') {
                        return file.resolution;
                    }
                    return '';
                },
                sort: function (fileA, fileB) {
                    if (!fileA.resolution) {
                        return -1;
                    }
                    if (!fileB.resolution) {
                        return 1;
                    }
                    var resA = fileA.resolution.split('x');
                    var resB = fileB.resolution.split('x');

                    if (parseInt(resA[0]) < parseInt(resB[0])) {
                        return -1;
                    }
                    if (parseInt(resA[0]) > parseInt(resB[0])) {
                        return 1;
                    }
                    if (parseInt(resA[1]) < parseInt(resB[1])) {
                        return -1;
                    }
                    if (parseInt(resA[1]) > parseInt(resB[1])) {
                        return 1;
                    }
                    return 0;
                }
            },
            Orientation: {
                attr: 'orientation',
                type: 'string',
                output: function (file) {
                    if (typeof file.orientation != 'undefined') {
                        return file.orientation;
                    }
                    return '';
                }
            },
            Status: {
                output: function (file) {
                    var status = 'Not Available';

                    var fiveDaysAgo;
                    if (file.active) {
                        status = 'Available';
                        if (parseInt(Date.parse(file.endDate)) > 0 && parseInt(Date.parse(file.endDate)) < new Date().getTime()) {
                            status = 'Expired';
                        }
                        else if (parseInt(Date.parse(file.startDate)) > 0 && parseInt(Date.parse(file.startDate)) < new Date().getTime()) {
                            status = 'Available';
                        }
                        else if (parseInt(Date.parse(file.startDate)) > 0) {
                            status = 'Not Available';
                        }
                    }
                    else {
                        // It might be new
                        var d = new Date(file.creationDate);
                        var fiveDaysAgo = new Date();
                        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
                        if (d > fiveDaysAgo) {
                            status = 'New';
                        }
                    }

                    return status;
                },
                sort: function (fileA, fileB) {
                    var fileAStatus = 'Not Available';
                    var fileBStatus = 'Not Available';


                    var fiveDaysAgo;
                    if (fileA.active) {
                        fileAStatus = 'Available';
                        if (parseInt(Date.parse(fileA.endDate)) > 0 && parseInt(Date.parse(fileA.endDate)) < new Date().getTime()) {
                            fileAStatus = 'Expired';
                        }
                        else if (parseInt(Date.parse(fileA.startDate)) > 0 && parseInt(Date.parse(fileA.startDate)) < new Date().getTime()) {
                            fileAStatus = 'Available';
                        }
                        else if (parseInt(Date.parse(fileA.startDate)) > 0) {
                            fileAStatus = 'Not Available';
                        }
                    }
                    else {
                        // It might be new
                        var d = new Date(fileA.creationDate);
                        var fiveDaysAgo = new Date();
                        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
                        if (d > fiveDaysAgo) {
                            fileAStatus = 'New';
                        }
                    }

                    if (fileB.active) {
                        fileBStatus = 'Available';
                        if (parseInt(Date.parse(fileB.endDate)) > 0 && parseInt(Date.parse(fileB.endDate)) < new Date().getTime()) {
                            fileBStatus = 'Expired';
                        }
                        else if (parseInt(Date.parse(fileB.startDate)) > 0 && parseInt(Date.parse(fileB.startDate)) < new Date().getTime()) {
                            fileBStatus = 'Available';
                        }
                        else if (parseInt(Date.parse(fileB.startDate)) > 0) {
                            fileBStatus = 'Not Available';
                        }
                    }
                    else {
                        // It might be new
                        var d = new Date(fileB.creationDate);
                        var fiveDaysAgo = new Date();
                        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
                        if (d > fiveDaysAgo) {
                            fileBStatus = 'New';
                        }
                    }

                    return fileAStatus.localeCompare(fileBStatus);
                }
            },
            Created: {
                attr: 'creationDate',
                type: 'date',
                output: function (file) {
                    var d = new Date(file.creationDate);
                    return printDate(d, 'Y-m-d H:i:s');
                }
            },
            'Start Date': {
                attr: 'startDate',
                type: 'date',
                output: function (file) {
                    if (typeof file.startDate == 'string') {
                        return file.startDate.substring(0, 10);
                    }
                    return '';
                }
            },
            'End Date': {
                attr: 'endDate',
                type: 'date',
                output: function (file) {
                    if (typeof file.endDate == 'string') {
                        return file.endDate.substring(0, 10);
                    }
                    return '';
                }
            },
            'Duration': {
                attr: 'duration',
                type: 'string',
                output: function (file) {
                    if (file.duration) {
                        var s = Math.floor(file.duration / 1000);
                        var h = Math.floor(s / (60 * 60));
                        s -= h * (60 * 60);
                        var m = Math.floor(s / 60);
                        s -= m * 60;
                        return h + "h " + m + "m " + s + "s";
                    }
                    return '';
                },
                sort: function (fileA, fileB) {
                    if (!fileA.duration) {
                        return -1;
                    }
                    else if (!fileB.duration) {
                        return 1;
                    }
                    return parseInt(fileA.duration) - parseInt(fileB.duration);
                }
            }
        };

        $.insmFramework('initialized').done(function () {

            $.insmAccess({
                enableModuleAccessRestriction: settings.enableModuleAccessCheck
            });

            $.insmAccess('getModuleAccess', {
                module: _applicationName.toLowerCase(),
                success: function (data) {
                    _accessLevel = data.AccessLevel;

                    if (_accessLevel == 'Deny') {
                        $.insmPopup({
                            backdropTransparency: false,
                            content: $('<div />').text('Permission denied'),
                            autoOpen: true,
                            showCloseButton: false,
                            backdropClickClose: false
                        });
                    }
                    else {
                        if (!settings.useMultipleSelect || _accessLevel != 'Write') {
                            delete _headers.Edit;
                        }
                        _framework = $.insmFramework('getDeprecatedFramework');
                        $.insmFiles({
                            framework: _framework
                        });
                        $.insmPreviewWindow({
                            framework: _framework
                        });
                        frameworkInit.resolve();

                    }
                },
                denied: function () {
                    $.insmFramework('login', {
                        success: function () {
                            _target.insmFileManager(settings);
                        }
                    });
                }
            });
        });

        if (typeof settings.applicationName == 'string') {
            _applicationName = settings.applicationName;
        }
        if (typeof settings.parseFileFunction == 'function') {
            _parseFileFunction = settings.parseFileFunction;
        }
        if (typeof settings.tableHeaders == 'object') {
            _headers = settings.tableHeaders;
        }
        if (typeof settings.filePropertyFields == 'object') {
            _filePropertyFields = settings.filePropertyFields;
        }
        if (typeof settings.enableUpload == 'boolean') {
            _enableUpload = settings.enableUpload;
        }
        if (typeof settings.defaultActiveValue == 'boolean') {
            _defaultActiveValue = settings.defaultActiveValue;
        }

        // View registrations
        // Three views in total:
        //  table-view
        //  file-view
        //  edit-view
        $.insmViewHandlerOld('add', 'table-view', {
            show: function () {
                $.insmViewHandlerOld('hideOther', 'table-view');
                $('#insm-control-panel .table-view').fadeIn();
                $('#insm-module-content .table-view').fadeIn();
                return this;
            },
            hide: function () {
                $('#insm-control-panel .table-view').hide();
                $('#insm-module-content .table-view').hide();
                return this;
            },
            init: function () {
                // Controls
                _filesToEdit = [];

                var $controlPanel = $('#insm-control-panel .table-view').empty();
                var $refresh = $('<a class="button">Refresh</a>').appendTo($controlPanel).click(function () {
                    $(".insm-previewwindow").remove();
                    $.insmViewHandlerOld('table-view').init();
                });
                
                if (settings.useMultipleSelect && _accessLevel == 'Write') {
                    $('<a class="edit button">Edit selected files</a>').click(function () {
                        if (_filesToEdit.length > 0) {
                            $.insmFiles('checkFilesNotInUse', { files: _filesToEdit }).done(function () {
                                $.insmViewHandlerOld('edit-view').show(_filesToEdit);
                            });
                        } else {
                            $.insmNotification({
                                type: 'warning',
                                text: 'No files selected'
                            });
                        }
                    }).appendTo($controlPanel);

                    $('<a class="button">Clear selected files</a>').click(function () {
                        _filesToEdit = [];
                        $("input[type=checkbox]").attr('checked', false);
                    }).appendTo($controlPanel);
                }
                // Breadcrumbs
                $('#insm-breadcrumbs').insmBreadcrumbs('clear');
                $('#insm-breadcrumbs').insmBreadcrumbs('push', {
                    title: _applicationName
                });
                // Content
                if (!$table) {
                    $table = $('<table />').addClass('horizontal zebra row-highlight');
                    $('#insm-module-content .table-view').html($('<div />').html($table));
                }

                var downloadFilesNotificationHandle = $.insmNotification({
                    type: 'load',
                    text: 'Downloading information',
                    duration: 0
                });

                if (!_contentDirectoryId) {
                    $.insmFramework('regionTree', {
                        success: function (regionTree) {
                            $.insmFramework('files', {
                                contentDirectoryName: _contentDirectoryName,
                                regionId: _regionId || regionTree.Id,
                                method: 'GetDirectoryInfo',
                                success: function (directory) {
                                    _contentDirectoryId = directory.Id;
                                    whenContentDirectoryFound();
                                },
                                error: function (message) {
                                    downloadFilesNotificationHandle.update({
                                        type: 'error',
                                        text: message
                                    });
                                },
                                denied: function (data) {
                                    downloadFilesNotificationHandle.update({
                                        type: 'unauthorized',
                                        text: data.Message,
                                        duration: 0
                                    });
                                    $.insmFramework('login', {
                                        success: function () {
                                            downloadFilesNotificationHandle.update({
                                                type: 'successful',
                                                text: 'You are now authenticated'
                                            });
                                            $.insmViewHandlerOld('table-view').init();
                                        }
                                    });
                                }
                            });
                        },
                        error: function (message) {
                            downloadFilesNotificationHandle.update({
                                type: 'error',
                                text: message
                            });
                        },
                        denied: function (data) {
                            downloadFilesNotificationHandle.update({
                                type: 'unauthorized',
                                text: data.Message,
                                duration: 0
                            });
                            $.insmFramework('login', {
                                success: function () {
                                    downloadFilesNotificationHandle.update({
                                        type: 'successful',
                                        text: 'You are now authenticated'
                                    });
                                    $.insmViewHandlerOld('table-view').init();
                                }
                            });
                        }
                    });
                }
                else {
                    whenContentDirectoryFound();
                }

                function whenContentDirectoryFound() {
                    if (_enableUpload && _accessLevel == 'Write') {
                        $('<a class="button" />').text($.insmLocalization('get', 'uploadFile')).appendTo($controlPanel).insmMediaUpload({
                            contentDirectoryId: _contentDirectoryId,
                            framework: _framework,
                            active: _defaultActiveValue,
                            callbacks: {
                                onUpload: function () {
                                    $refresh.trigger('click');
                                }
                            }
                        });
                    }

                    if (!$.isEmptyObject(_csvColumns)) {
                        $('<a class="button" />').text('Export to CSV').appendTo($controlPanel).click(function () {
                            var data = $table.insmTablesorter('getData');
                            if (data.length == 0) {
                                $.insmNotification({
                                    type: 'information',
                                    message: 'No rows in table'
                                });
                                return;
                            }

                            var sep = ",";
                            var csv = 'sep=' + sep + '\r\n';

                            $.each(_csvColumns, function (title, column) {
                                csv += title + sep;
                            });

                            csv = csv.substr(0, csv.length - 1) + '\r\n';
                            $.each(data, function (index, row) {
                                $.each(_csvColumns, function (title, column) {
                                    csv += '"' + column.output(row) + '"' + sep;
                                });
                                csv = csv.substr(0, csv.length - 1) + '\r\n';
                            });
                            var d = new Date();
                            var date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();

                            var filename = 'FileData' + $.datepicker.formatDate('yy-mm-dd', new Date());
                            $.insmFramework('convert', {
                                mimetype: 'text/csv',
                                data: csv,
                                filename: filename
                            });
                        });
                    }

                    $.insmFramework('files', {
                        contentDirectoryId: _contentDirectoryId,
                        method: 'getFilesInfo',
                        success: function (data) {
                            var files = data.MediaFiles.reverse();
                            if (typeof _parseFileFunction == 'function') {
                                $.each(files, function (index, file) {
                                    files[index] = _parseFileFunction(file);
                                });
                            }
                            downloadFilesNotificationHandle.update({
                                type: 'successful',
                                text: 'Successfully downloaded information'
                            });

                            if ($table.insmTablesorter('isInitialized')) {
                                $table.insmTablesorter('update', {
                                    data: files
                                });
                            } else {

                                $table.insmTablesorter({
                                    headers: _headers,
                                    data: files,
                                    currentSortHeader: _headers.Created,
                                    currentSortKey: 'Created',
                                    currentSortOrder: 'ASC',
                                    paginationPosition: 'top',
                                    searchPosition: 'top',
                                    limitControlPosition: 'top',
                                    autoSearch: false
                                })
                            }
                        },
                        error: function (message) {
                            downloadFilesNotificationHandle.update({
                                type: 'error',
                                text: message
                            });
                        },
                        denied: function (data) {
                            downloadFilesNotificationHandle.update({
                                type: 'unauthorized',
                                text: data.Message,
                                duration: 0
                            });

                            $.insmFramework('login', {
                                success: function () {
                                    downloadFilesNotificationHandle.update({
                                        type: 'successful',
                                        text: 'You are now authenticated'
                                    });
                                    $.insmViewHandlerOld('table-view').init();
                                }
                            });
                        }
                    });
                }

                //$.insmFiles('get', {
                //    settings: insmFilesParameters,
                //    callbacks: {
                //        success: function (files) {
                //            files.reverse();

                //            downloadFilesNotificationHandle.update({
                //                type: 'successful',
                //                text: 'Successfully downloaded information'
                //            });
                //            table.insmTablesorter({
                //                headers: _headers,
                //                data: files,
                //                sortKey: 'creationDate',
                //                sortOrder: 'DESC'
                //            });
                //        },
                //        error: function (message) {
                //            downloadFilesNotificationHandle.update({
                //                type: 'error',
                //                text: message
                //            });
                //        },
                //        denied: function (data) {
                //            downloadFilesNotificationHandle.update({
                //                type: 'unauthorized',
                //                text: data.Message,
                //                duration: 0
                //            });
                //            _framework.login({
                //                type: data.Type,
                //                target: data.Target,
                //                version: data.Version
                //            }).done(function () {
                //                downloadFilesNotificationHandle.update({
                //                    type: 'successful',
                //                    text: 'You are now authenticated'
                //                });
                //                $.insmViewHandlerOld('table-view').init();
                //            });
                //        }
                //    }
                //});

                return this;
            }
        });

        $.insmViewHandlerOld('add', 'file-view', {
            show: function () {
                $.insmViewHandlerOld('hideOther', 'file-view');
                $('#insm-control-panel .file-view').fadeIn();
                $('#insm-module-content .file-view').fadeIn();
                return this;
            },
            hide: function () {
                $('#insm-control-panel .file-view').hide();
                $('#insm-module-content .file-view').hide();
                return this;
            },
            init: function (file) {
                // Controls
                $('#insm-control-panel .file-view').empty();

                $('#insm-control-panel .file-view').append(
                    $('<a />').addClass('button close').text('Back')
                );

                if (_accessLevel == 'Write') {
                    $('#insm-control-panel .file-view').append(
                        $('<a />').addClass('button edit').text('Edit'),
                        $('<a />').addClass('button delete').text('Delete')
                    );
                }

                // Breadcrumbs
                $('#insm-breadcrumbs').insmBreadcrumbs('clear');
                $('#insm-breadcrumbs').insmBreadcrumbs('push', {
                    title: _applicationName,
                    onClick: function () {
                        $.insmViewHandlerOld('table-view').init().show();
                    }
                });

                // Content
                $('#insm-module-content .file-view').empty();

                $.insmFramework('files', {
                    fileId: file.id,
                    method: 'getFileInfo',
                    success: function (data) {
                        var file = _parseFileFunction(data);

                        $('#insm-module-content .file-view')
                            .html(
                                $('<h2 />').text(file.name)
                            ).append(
                                $('<h4 />').text('Preview')
                            ).append(
                                $('<div />')
                                    .addClass('preview')
                                    .html(
                                            $('<img />').attr('alt', 'No preview available').attr('src', $.insmFiles('getThumbnailUrl', {
                                                fileId: file.id
                                            }, null, _framework))
                                    ).insmPreviewWindow({
                                        fileId: file.id,
                                        mimeType: file.mimeType
                                    })
                            ).append(
                                $('<h4 />').text('Properties')
                            );

                        var propertyTable = $('<table class="vertical no-border" />');

                        $.each(_filePropertyFields, function (index, field) {
                            propertyTable.append(
                                $('<tr />').append(
                                    $('<th />').text(index)
                                ).append(
                                    $('<td />').append((typeof field.output == 'function' ? field.output(file) : file[field.attr]))
                                )
                            );
                        });

                        //var $entity = $('<a class="button" > ' + file.id + ' </a>');
                        //$entity.insmPopup({
                        //    content: function () {
                        //        return $('<div style="background-color: white; padding: 10px;">').insmEntityViewer(
                        //            {
                        //                id: file.id,
                        //                type: 'MediaFile'
                        //            },
                        //            function () { $entity.insmPopup('center'); }
                        //            , settings);
                        //    }
                        //});

                        //propertyTable.append(
                        //    $('<tr />').append(
                        //        $('<th />').text('Entity history')
                        //    ).append(
                        //        $('<td />').append($entity)
                        //    )
                        //);

                        $('#insm-module-content .file-view').append(propertyTable);




                        $('#insm-breadcrumbs').insmBreadcrumbs('push', {
                            title: file.name
                        });

                        // Listeners
                        _target.find('#insm-control-panel .file-view a.edit').click(function () {
                            $.insmFiles('checkFilesNotInUse', { files: [file] }).done(function () {
                                $.insmViewHandlerOld('edit-view').show([file]);
                            });
                        });
                        _target.find('#insm-control-panel .file-view a.close').click(function () {
                            $.insmViewHandlerOld('table-view').init().show();
                        });
                        _target.find('#insm-control-panel .file-view a.delete').click(function () {
                            if (file.active) {
                                $.insmNotification({
                                    type: 'warning',
                                    text: 'Can\'t remove file that is available, please edit file and try again'
                                });
                                return;
                            }

                            if (_filePropertyFields['Start Date'] && _filePropertyFields['End Date'] && !(parseInt(Date.parse(file.endDate), 10) > 0 && new Date(file.endDate) < new Date())) {
                                $.insmNotification({
                                    type: 'warning',
                                    text: 'Can\'t remove file that has not yet expired. Please edit the files end-date and try again'
                                });
                                return;
                            }
                            $.insmFiles('checkFilesNotInUse', { files: [file] }).done(function () {
                                if (confirm("Are you sure you want to delete the file(s)?")) {
                                    _framework.files('deleteFile', {
                                        fileId: file.id
                                    }, {
                                        success: function () {
                                            $.insmViewHandlerOld('table-view').init().show();
                                        },
                                        denied: function () {
                                            //TODO: HANDLE THIS FFS½!
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
                        });
                    },
                    denied: function (data) {
                        var notificationHandle = $.insmNotification({
                            type: 'unauthorized',
                            text: data.Message
                        });
                        $.insmFramework('login', {
                            success: function () {
                                notificationHandle.update({
                                    type: 'successful',
                                    text: 'Authenticated'
                                });
                                $.insmViewHandlerOld('file-view').init(file).show();
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

                return this;
            }
        });

        $.insmViewHandlerOld('add', 'edit-view', {
            hide: function () {
                $('#insm-control-panel .edit-view').hide();
                $('#insm-module-content .edit-view').hide();
                return this;
            },
            show: function (files) {
                $.insmFiles('setFilesInUse', { files: files });

                // Controls
                var $controlPanel = $('#insm-control-panel .edit-view').empty();
                $('<a class="button save">Save</a>').appendTo($controlPanel);
                $('<a class="button cancel">Cancel</a>').appendTo($controlPanel);

                // Breadcrumbs
                $('#insm-breadcrumbs').insmBreadcrumbs('clear');
                $('#insm-breadcrumbs').insmBreadcrumbs('push', {
                    title: _applicationName,
                    onClick: function () {
                        $.insmViewHandlerOld('table-view').init().show();
                    }
                });

                var $content = $('#insm-module-content .edit-view').empty();

                if (settings.useMultipleSelect) {
                    var $quickSelect = $('<select>').append('<option value="default"> --- </option>').append('<option value="delete"> Delete all </option>').append('<option value="activate"> Mark all as available </option>').append('<option value="deactivate"> Mark all as unavailable </option>');
                    $('<div> Quick select </div> ').addClass('insm-filemanager quick-select').append($quickSelect).appendTo($content);
                    $quickSelect.change(function () {
                        if ($(this).val() == "delete") {

                            //check for active files!
                            var filenameActive = '';
                            var filecountActive = 0;

                            $.each(files, function (index, file) {
                                if (file.active) {
                                    filecountActive++;
                                    filenameActive = file.name;
                                }
                            });

                            if (filecountActive) {
                                if (filecountActive == 1) {
                                    $.insmNotification({
                                        type: 'warning',
                                        text: 'File ' + filenameActive + ' is still active. Can\'t remove active files. Please edit and retry.'
                                    });
                                } else {
                                    $.insmNotification({
                                        type: 'warning',
                                        text: filecountActive + ' files are still active. Can\'t remove active files. Please edit and retry.'
                                    });
                                }
                                return;
                            }

                            //check if date is after set end date (ie. Expired)
                            var filenameNotExpired = '';
                            var filecountNotExpired = 0;
                            $.each(files, function (index, file) {
                                if (!(parseInt(Date.parse(file.endDate), 10) > 0 && new Date(file.endDate) < new Date())) {
                                    filecountNotExpired++;
                                    filenameNotExpired = file.name;
                                }
                            });
                            if (filecountNotExpired) {
                                if (filecountNotExpired == 1) {
                                    $.insmNotification({
                                        type: 'warning',
                                        text: 'File ' + filenameNotExpired + ' is not Expired. Please edit end-date to a day before today and retry.'
                                    });
                                } else {
                                    $.insmNotification({
                                        type: 'warning',
                                        text: filecountNotExpired + ' files has not Expired. Please edit end-date to a day before today and retry.'
                                    });
                                }
                                return;
                            }



                            if (confirm("Are you sure you want to delete all selected files?")) {
                                var deferreds = [];
                                $.each(files, function (index, file) {
                                    deferreds.push(_framework.files('deleteFile', {
                                        fileId: file.id
                                    }, {
                                        success: function () {

                                        },
                                        denied: function () {
                                            $.insmNotification({
                                                type: 'error',
                                                text: 'Access denied'
                                            });
                                        },
                                        error: function (message) {
                                            $.insmNotification({
                                                type: 'error',
                                                text: message
                                            });
                                        }
                                    }));
                                    $.when.apply(null, deferreds).done(function () {
                                        _filesToEdit = [];
                                        $.insmViewHandlerOld('table-view').init().show();
                                    });
                                });

                            } else {
                                $(this).val("default");
                            }
                        } else if ($(this).val() == "activate") {
                            $('input[type=checkbox][data-propertykey=Available]').attr('checked', true);
                        } else if ($(this).val() == "deactivate") {
                            $('input[type=checkbox][data-propertykey=Available]').attr('checked', false);
                        }
                    });

                }


                $.each(files, function (index, file) {
                    // Content
                    var propertyTable = $('<table class="fileInfo vertical no-border" />'); //.css({ display: 'inline-block', margin: '8px', padding: '8px' });

                    var $previewTd = $('<td />').append(
                        $('<div />')
                            .addClass('preview')
                            .html(
                                $('<img />')
                                    .attr('alt', 'No preview available')
                                    .attr('src', $.insmFiles('getThumbnailUrl', { fileId: file.id }, null, _framework))
                            ).insmPreviewWindow({
                                fileId: file.id,
                                mimeType: file.mimeType
                            })
                    );
                    var $previewTh = $('<th />').text("Preview");

                    propertyTable.append($('<tr />').append($previewTh).append($previewTd));

                    $.each(_filePropertyFields, function (index, field) {
                        propertyTable.append(
                            $('<tr />').append(
                                $('<th />').text(index)
                            ).append(
                                $('<td />').html(
                                    function () {
                                        switch (field.type) {
                                            case 'string':
                                            case 'int':
                                                if (field.editable) {
                                                    return $('<input fileid="' + file.id + '" data-propertyKey="' + index + '" type="text" />').val(file[field.attr]);
                                                }
                                                return (typeof field.output == 'function' ? field.output(file) : file[field.attr]);
                                            case 'selectable':
                                                if (field.editable) {
                                                    var selectElement = $('<select fileid="' + file.id + '" data-propertyKey="' + index + '" />');
                                                    $.each(field.values, function (key, value) {
                                                        selectElement.append(
                                                            $('<option value="' + value + '" />').text(key)
                                                        );
                                                    });
                                                    return selectElement.val(file[field.attr]);
                                                }
                                                return (typeof field.output == 'function' ? field.output(file) : file[field.attr]);
                                            case 'date':
                                                if (field.editable) {
                                                    return $('<input fileid="' + file.id + '" data-propertyKey="' + index + '" type="text" class="datepicker" value="' + (typeof file[field.attr] != 'undefined' ? file[field.attr].substring(0, 10) : '') + '" />');
                                                }
                                                break;
                                            case 'bool':
                                                if (field.editable) {
                                                    return $('<input fileid="' + file.id + '" data-propertyKey="' + index + '" type="checkbox" ' + (file[field.attr] ? 'checked="checked"' : '') + '/>');
                                                }
                                                break;
                                            default:
                                                $.insmNotification({
                                                    type: 'error',
                                                    text: 'Type "' + field.type + '" no recognised in INSM File Manager'
                                                });
                                                break;
                                        }
                                        return (typeof field.output == 'function' ? field.output(file) : file[field.attr]);
                                    }
                                )
                            )
                        );
                    });

                    $content.append(propertyTable);
                });

                $content.find('input.datepicker').datepicker({
                    dateFormat: 'yy-mm-dd'
                });

                if (files.length == 1) {
                    $('#insm-breadcrumbs').insmBreadcrumbs('push', {
                        title: files[0].name,
                        onClick: function () {
                            $.insmViewHandlerOld('file-view').init(files[0]).show();
                        }
                    });

                    $('#insm-breadcrumbs').insmBreadcrumbs('push', {
                        title: 'Edit'
                    });
                }
                else {
                    $('#insm-breadcrumbs').insmBreadcrumbs('push', {
                        title: 'Multiple Edit'
                    });
                }

                // Listeners
                _target.find('#insm-control-panel .edit-view a.save').click(function () {
                    var fileUpdates = [];
                    if (_filePropertyFields['Start Date'] && _filePropertyFields['End Date']) {
                        var error = false;
                        $.each(files, function (index, file) {
                            var isChecked = $('input[data-propertyKey="Available"][fileid="' + file.id + '"]').is(':checked');
                            var fileStartDate = $('input[data-propertyKey="Start Date"][fileid="' + file.id + '"]').val();
                            var fileEndDate = $('input[data-propertyKey="End Date"][fileid="' + file.id + '"]').val();
                            if (isChecked && !(fileEndDate && fileStartDate)) {
                                $.insmNotification({
                                    type: 'warning',
                                    text: 'Can\'t activate a file without a start and end date. Dates missing for file: ' + file.name
                                });
                                error = true;
                                return false;
                            }
                            if (fileStartDate > fileEndDate) {
                                $.insmNotification({
                                    type: 'warning',
                                    text: 'Start date has to be set to a date prior to the end date'
                                });
                                error = true;
                                return false;
                            }
                        });
                        if (error) {
                            return false;
                        }
                    }
                    $.each(files, function (index, file) {

                        var fileUpdate = {
                            FileId: file.id
                        };
                        $.each(_filePropertyFields, function (index, field) {
                            switch (field.type) {
                                case 'string':
                                case 'int':
                                    if ($('input[data-propertyKey="' + index + '"][fileid="' + file.id + '"]').length == 1) {

                                        fileUpdate[field.attr] = $('input[data-propertyKey="' + index + '"][fileid="' + file.id + '"]').val();
                                    }
                                    break;
                                case 'selectable':
                                    if ($('select[data-propertyKey="' + index + '"][fileid="' + file.id + '"]').length == 1) {
                                        fileUpdate[field.attr] = $('select[data-propertyKey="' + index + '"][fileid="' + file.id + '"]').val();
                                    }
                                    break;
                                case 'date':
                                    if ($('input[data-propertyKey="' + index + '"][fileid="' + file.id + '"]').length == 1) {
                                        var dateString = $('input[data-propertyKey="' + index + '"][fileid="' + file.id + '"]').val();
                                        if (parseInt(Date.parse(dateString), 10) > 0) {
                                            var date = new Date(dateString);
                                            if (field.attr == "endDate") {
                                                //add one extra days offset (end date should be inclusive i.e <= not <)
                                                date.setSeconds(date.getSeconds() + (24 * 60 * 60) - 1);
                                            }
                                            // ReSharper disable UseOfImplicitGlobalInFunctionScope
                                            fileUpdate[field.attr] = getTString(date);
                                            // ReSharper restore UseOfImplicitGlobalInFunctionScope
                                        }
                                        else {
                                            fileUpdate[field.attr] = '';
                                        }
                                    }
                                    break;
                                case 'bool':
                                    if ($('input[data-propertyKey="' + index + '"][fileid="' + file.id + '"]').length == 1) {

                                        var isChecked = $('input[data-propertyKey="' + index + '"][fileid="' + file.id + '"]').is(':checked');
                                        fileUpdate[field.attr] = (isChecked ? true : false);
                                    }
                                    break;
                                default:
                                    $.insmNotification({
                                        type: 'error',
                                        text: 'Type "' + field.type + '" no recognised in INSM File Manager'
                                    });
                                    break;
                            }
                        });
                        fileUpdates.push($.insmFiles('updateFile', fileUpdate));

                    });

                    $.when.apply(null, fileUpdates).done(function () {
                        if (files.length > 1) {
                            $.insmFiles('setFilesNotInUse', { files: files });
                            $.insmViewHandlerOld('table-view').init().show();
                        } else {
                            $.insmFiles('setFilesNotInUse', { files: files });
                            $.insmViewHandlerOld('file-view').init(files[0]).show();
                        }
                    });
                });


                _target.find('#insm-control-panel .edit-view a.cancel').click(function () {
                    $.insmFiles('setFilesNotInUse', { files: files });
                    if (files.length == 1) {
                        $.insmViewHandlerOld('file-view').init(files[0]).show();
                    }
                    else {
                        $.insmViewHandlerOld('table-view').init().show();
                    }
                });


                $.insmViewHandlerOld('hideOther', 'edit-view');
                $content.fadeIn();
                $controlPanel.fadeIn();
                return this;
            },
            destroy: function () {
                return this;
            }
        });

        frameworkInit.done(function () {
            initialize().done(function () {
                $.insmViewHandlerOld('table-view').init().show();
            });
        });

        // Live listeners
        if (_target.find('a.view-dataset').length > 0) {
            _target.find('a.view-dataset').live('click', function () {
                $.insmViewHandlerOld('file-view').init($(this).attr('data-id')).show();
                $.insmViewHandlerOld('table-view').hide();
            });
        }

        return this;

        function initialize() {
            var deferred = new $.Deferred();

            _target.empty();
            _target.append('\
                <div id="insm-breadcrumbs">\
                    \
                </div>\
                <div id="insm-control-panel">\
                    <div class="table-view">\
                    </div>\
                    <div class="file-view">\
                    </div>\
                    <div class="edit-view">\
                    </div>\
                </div>\
                <div id="insm-module-content">\
                    <div class="table-view">\
                        <div class="insm-dataseteditor-table">\
                            <table class="horizontal"></table>\
                        </div>\
                    </div>\
                    <div class="file-view">\
                        <div class="insm-dataseteditor-dataset"></div>\
                    </div>\
                    <div class="edit-view">\
                        <div class="insm-dataseteditor-dataset"></div>\
                    </div>\
                </div>\
            ');

            deferred.resolve();
            return deferred;
        }
    };

})(jQuery);

jQuery.expr[':'].icontains = function (a, i, m) {
    return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};
