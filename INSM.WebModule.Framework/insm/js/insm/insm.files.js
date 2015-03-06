/*
* INSM Dataset Editor
* This file contain the INSM Dataset Editor function.
* The script display a list of all players in an Instoremedia Assets Management Server (AMS).
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmDatasetEditor(settings);
*
* File dependencies:
* jQuery 1.6.1
* Fancybox 1.3.4
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
    var _activityFlag = false;
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFiles');
            //If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    framework: null
                };
                $this.data('insmFiles', _plugin);
            }

            if (typeof options.framework == 'object') {
                _plugin.framework = options.framework;
            }
            else {
                _plugin.framework = $.insmFramework('getDeprecatedFramework');
            }
            return $this;
        },
        getThumbnailUrl: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFiles');

            if (!_plugin.framework) {
                _plugin.framework = $.insmFramework('getDeprecatedFramework');
            }

            if (!options.fileId) {
                $.insmNotification({
                    type: 'error',
                    text: 'File Id not set in INSM Files getThumbnailUrl'
                });
                return null;
            }

            var url = _plugin.framework.settings.protocol + '://' + _plugin.framework.settings.ams + '/Files.aspx?method=getThumbnail&fileid=' + options.fileId;

            if (_plugin.framework.settings.session) {
                url += '&session=' + _plugin.framework.settings.session;
            }
            return url;
        },
        getPreviewUrl: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFiles');

            if (!_plugin || !_plugin.framework) {
                if (!_plugin) {
                    _plugin = {};
                }
                _plugin.framework = $.insmFramework('getDeprecatedFramework');
            }

            if (!options.fileId) {
                $.insmNotification({
                    type: 'error',
                    text: 'File Id not set in INSM Files getThumbnailUrl'
                });
                return null;
            }

            var url = _plugin.framework.settings.protocol + '://' + _plugin.framework.settings.ams + '/Files.aspx?method=getPreview&fileid=' + options.fileId;

            if (_plugin.framework.settings.session) {
                url += '&session=' + _plugin.framework.settings.session;
            }
            return url;
        },
        getFileInfo: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFiles');
            if (!_plugin || !_plugin.framework) {
                _plugin.framework = $.insmFramework('getDeprecatedFramework');
            }

            var params = {
                fileId: options.fileId
            };

            var callbacks = {
                success: options.success,
                error: options.error,
                denied: options.denied
            };

            return _plugin.framework.files('getFileInfo', params, callbacks);
        },
        getFilesInfo: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFiles');

            if (!_plugin || !_plugin.framework) {
                _plugin.framework = $.insmFramework('getDeprecatedFramework');
            }

            var params = {
                contentdirectoryid: options.contentDirectoryId,
                type: options.type
            };

            var callbacks = {
                success: options.success,
                error: options.error,
                denied: options.denied
            };

            return _plugin.framework.files('getfilesinfo', params, callbacks);
        },
        getInnerFile: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFiles');

            if (!_plugin || !_plugin.framework) {
                _plugin.framework = $.insmFramework('getDeprecatedFramework');
            }

            var callbacks = {
                success: function (data) {

                },
                error: function (message) {
                    $.insmNotification({
                        type: 'error',
                        text: message
                    });
                },
                denied: function (data) {
                    $.insmNotification({
                        type: 'unauthorized',
                        text: 'Access denied'
                    });
                }
            };

            _plugin.framework.files('getInnerFile', options, callbacks);
        },
        getPreviewInfo: function (options, callbacks) {

            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFiles');

            if (!_plugin || !_plugin.framework) {
                _plugin.framework = $.insmFramework('getDeprecatedFramework');
            }
            return _plugin.framework.files('getPreviewInfo', options, callbacks);
        },
        getUrl: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFiles');

            if (!_plugin || !_plugin.framework) {
                _plugin.framework = $.insmFramework('getDeprecatedFramework');
            }

            if (!options.fileId) {
                $.insmNotification({
                    type: 'error',
                    text: 'File Id not set in INSM Files getUrl'
                });
                return null;
            }

            var url = _plugin.framework.settings.protocol + '://' + _plugin.framework.settings.ams + '/Files.aspx?fileid=' + options.fileId;
            if (_plugin.framework.settings.session) {
                url += '&session=' + _plugin.framework.settings.session;
            }
            return url;
        },
        updateFile: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFiles');

            if (!_plugin || !_plugin.framework) {
                _plugin.framework = $.insmFramework('getDeprecatedFramework');
            }

            if (!options.FileId) {
                $.insmNotification({
                    type: 'error',
                    text: 'File Id not set in INSM Files getUrl'
                });
                return null;
            }

            var fileUpdate = options;

            var fileUpdateNotificationHandle = $.insmNotification({
                type: 'load',
                text: 'Updating file',
                duration: 0
            });

            var def = $.Deferred();
            var callbacks = {
                success: function (data) {
                    def.resolveWith(this, [data]);
                    fileUpdateNotificationHandle.update({
                        type: 'successful',
                        text: 'Successfully updated file'
                    });
                },
                error: function (message) {
                    def.rejectWith(this, [message]);
                    fileUpdateNotificationHandle.update({
                        type: 'error',
                        text: message
                    });
                },
                denied: function (data) {
                    def.rejectWith(this, ['denied']);
                    fileUpdateNotificationHandle.update({
                        type: 'error',
                        text: 'User denied. Please refresh your browser.'
                    });
                }
            };

            _plugin.framework.files('updateFile', options, callbacks);
            return def;
        },
        get: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFiles');

            if (!_plugin || !_plugin.framework) {
                _plugin.framework = $.insmFramework('getDeprecatedFramework');
            }

            var settings = $.extend({
                recursive: false,
                parseFile: function (file) {
                    if (typeof file.Attributes == 'undefined') {
                        file.Attributes = {
                            Active: false,
                            StartDate: null,
                            EndDate: null,
                            Category: null
                        };
                    }
                    return {
                        active: (file.Attributes.Active == 'True' ? true : false),
                        category: file.Attributes.Category,
                        creationDate: file.CreationDate,
                        creator: file.Creator,
                        description: file.Description,
                        id: file.Id,
                        mimeType: file.MimeType,
                        modificationDate: file.ModificationDate,
                        modifier: file.Modifier,
                        name: file.Name,
                        startDate: new Date(file.Attributes.StartDate),
                        endDate: new Date(file.Attributes.EndDate),
                        size: file.Length
                    };
                }
            }, options.settings);

            // Evaluate settings
            if (typeof settings.contentDirectoryId == 'undefined') {
                // We need a content directory
                $.insmNotification({
                    type: 'error',
                    text: 'No content directory specified in INSM Files'
                });
                return null;
            }

            var deferred = new $.Deferred();

            var contentDirectoryListDeferred = [];

            var contentDirectories = [{
                id: settings.contentDirectoryId,
                path: ''
            }];

            function parseRecursiveDirectories(contentDirectoryId, path) {
                contentDirectoryListDeferred.push(_plugin.framework.files('getdirectoryinfo', {
                    contentdirectoryid: contentDirectoryId,
                    includesubdirectories: true
                }, {
                    success: function (data) {
                        if (typeof data.ContentDirectories != 'undefined' && data.ContentDirectories != null) {
                            $.each(data.ContentDirectories, function (index, dir) {
                                parseRecursiveDirectories(dir.Id, path + '/' + dir.Name);
                                contentDirectories.push({
                                    id: dir.Id,
                                    path: path + '/' + dir.Name
                                });
                            });
                        }
                    }
                }));
            }

            function getFiles() {
                var getFilesDeferredList = [];
                var result = [];
                $.each(contentDirectories, function (index1, directory) {
                    getFilesDeferredList.push(_plugin.framework.files('getfilesinfo', {
                        contentdirectoryid: directory.id
                    },
                        {
                            success: function (data) {
                                $.each(data.MediaFiles, function (index2, file) {
                                    file.Path = directory.path;
                                    result.push(settings.parseFile(file));
                                });
                                return;
                            },
                            error: function (message) {
                                options.callbacks.error(message);
                            },
                            denied: function (data) {
                                options.callbacks.denied(data);
                            }
                        }
                    ));
                });

                $.when.apply(null, getFilesDeferredList).done(function () {
                    options.callbacks.success(result);
                });
            }

            if (settings.recursive) {
                parseRecursiveDirectories(settings.contentDirectoryId, '');

                $.when.apply(null, contentDirectoryListDeferred).done(function () {
                    getFiles();
                });
            }
            else {
                getFiles();
            }



            return deferred;
        },
        checkFilesNotInUse: function (options) {
            var deferred = $.Deferred();
            if (_activityFlag) {
                deferred.reject();
                return deferred;
            }
            else {
                _activityFlag = true;
            }
            var getActivity = [];
            var fileResponses = [];
            var error = false;
            $.each(options.files, function (index, file) {
                getActivity.push($.insmFramework('activity', {
                    type: 'mediafile',
                    method: 'get',
                    id: file.id,
                    success: function (data) {
                        if (data) {
                            if (data.length != 0) {
                                fileResponses.push({ file: file, data: data });
                            }
                        }
                    },
                    error: function (message) {
                        $.insmNotification({
                            type: 'error',
                            text: message
                        });
                        error = true
                    },
                    denied: function () {
                        $.insmNotification({
                            type: 'error',
                            text: 'Access denied'
                        });
                        error = true;
                    }
                }));
            });

            $.when.apply($, getActivity).done(function () {
                if (error == true) {
                    deferred.reject();
                } else if (fileResponses.length == 0) {
                    deferred.resolve();
                } else {
                    $.each(fileResponses, function (index, obj) {
                        $.insmNotification({
                            type: 'warning',
                            text: 'File ' + obj.file.name + ' is in use by user ' + obj.data[0].User
                        });
                    });
                    deferred.reject();
                }
                _activityFlag = false;
            });
            return deferred;
        },
        setFilesInUse: function (options) {
            $.each(options.files, function (index, file) {
                $.insmFramework('activity', {
                    type: 'mediafile',
                    method: 'set',
                    id: file.id,
                    success: function (data) {
                    },
                    error: function (message) {
                        $.insmNotification({
                            type: 'error',
                            text: message
                        });
                        error = true
                        return false;
                    },
                    denied: function () {
                        $.insmNotification({
                            type: 'error',
                            text: 'Access denied'
                        });
                        error = true;
                        return false;
                    }
                });
            });
        },
        setFilesNotInUse: function (options) {
            $.each(options.files, function (index, file) {
                $.insmFramework('activity', {
                    type: 'mediafile',
                    method: 'remove',
                    id: file.id,
                    success: function (data) {
                    },
                    error: function (message) {
                        $.insmNotification({
                            type: 'error',
                            text: message
                        });
                        error = true
                        return false;
                    },
                    denied: function () {
                        $.insmNotification({
                            type: 'error',
                            text: 'Access denied.'
                        });
                        error = true;
                        return false;
                    }
                });
            });
        }
    };

    $.insmFiles = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmFiles');
            return null;
        }
    };

})(jQuery);
