/*
* INSM File Browser
* This file contain the INSM File Browser function.
* The script display a list of all players in an Instoremedia Assets Management Server (AMS).
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmFileBrowser(settings);
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
    function parseContentDirectory(directory) {
        directory.isDirectory = true;
        directory.addClass = 'contentDirectory';

        directory.directoryId = directory.Id;

        if (!directory.title) {
            directory.title = directory.Name;
        }
        if (directory.Name) {
            delete directory.Name;
        }

        directory.children = [];
        if (directory.ContentDirectories) {
            $.each(directory.ContentDirectories, function (index, value) {
                directory.children.push(parseContentDirectory(value));
            });
        }

        return directory;
    }

    var methods = {
        init: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFileBrowser');
            
            if (_plugin) {
                //remove all previous html elements from DOM.
                $.each(_plugin.data, function (index, object) {
                    if (object instanceof jQuery) {
                        object.empty().remove();
                    }
                });
            }
            
            //If the plugin hasn't been initialized yet
            _plugin = {
                data: {
                    files: {}
                },
                htmlElements: {
                    mainContainer: $('<div />').addClass('insm-file-browser'),
                    body: $('<div />').addClass('insm-file-browser-body'),
                    filesTable: $('<div class="insm-file-browser-wrapper"> Loading files </div>'),
                    fileDetails: null,
                    fileInfoContainer: $('<div />').addClass('insm-file-browser-file-info'),
                    header: $('<div />').addClass('insm-file-browser-header'),
                    footer: $('<div />').addClass('insm-file-browser-footer')
                },
                settings: $.extend({
                    mediaContentDirectoryId: options.mediaContentDirectoryId,
                    onSelect: function () {

                    },
                    currentFileId: 0,
                    fileType: '',
                    usePreview: false,
                    filter: function (file) { return true; },
                    closeOnSelect: true,
                    headers: {
                        Preview: {
                            type: 'string',
                            output: function (item) {
                                return $('<img />').attr('src', $.insmFiles('getThumbnailUrl', { fileId: item.Id })).css('height','100%');
                            },
                            weight: 0.1,
                            search: false
                        },
                        'File Name': {
                            type: 'string',
                            output: function (item) {
                                return item.Name;
                            },
                            sort: function (a, b) {
                                if (a.Name > b.Name) {
                                    return 1;
                                }
                                else if (a.Name < b.Name) {
                                    return -1;
                                }
                                return 0;
                            }
                        },
                        Modified: {
                            type: 'string',
                            output: function (item) {
                                return printDate(item.ModificationDate, 'Y-m-d H:i:s');
                            },
                            sort: function (a, b) {
                                var dateA = printDate(a.ModificationDate, 'Y-m-d H:i:s');
                                var dateB = printDate(b.ModificationDate, 'Y-m-d H:i:s');

                                if (dateA > dateB) {
                                    return 1;
                                }
                                else if (dateA < dateB) {
                                    return -1;
                                }
                                return 0;
                            }
                        },
                        Size: {
                            type: 'string',
                            output: function (item) {
                                return $.insmUtilities('addPrefix', {
                                    number: item.Length
                                }) + 'b';

                            },
                            sort: function (a, b) {
                                if (parseInt(a.Length) > parseInt(b.Length)) {
                                    return 1;
                                }
                                else if (parseInt(a.Length) < parseInt(b.Length)) {
                                    return -1;
                                }
                                return 0;
                            }
                        }
                    }
                }, options)
            };

            if (!_plugin.settings.usePreview) {
                delete _plugin.settings.headers.Preview
            }
            $this.data('insmFileBrowser', _plugin);

            _plugin.htmlElements.backdrop = $.insmPopup({
                backdropTransparency: true,
                backdropClickClose: false,
                showCloseButton: false,
                autoOpen: true,
                content: '',
            });

            // Init window
            _plugin.htmlElements.mainContainer.append(
                _plugin.htmlElements.header.append($('<h2/>').text('File Browser')).append(
                    $('<a />').addClass('button').text('Close').click(function () {
                        $.insmFileBrowser('close');
                    })
                )
            );
            _plugin.htmlElements.body.append(_plugin.htmlElements.fileInfoContainer);
            _plugin.htmlElements.body.append($('<div />').addClass('insm-file-browser-list').append(_plugin.htmlElements.filesTable));

            _plugin.htmlElements.mainContainer.append(_plugin.htmlElements.body);

            $this.append(_plugin.htmlElements.mainContainer);

            _plugin.htmlElements.mainContainer.append(
                $('<div />').addClass('clear')
            ).append(
                _plugin.htmlElements.footer.append(
                    $('<a />').addClass('button').text('Select').click(function () {
                        if (!_plugin.data.files[_plugin.htmlElements.fileInfoContainer.attr('data-fileId')]) {
                            return false;
                        }
                        if (typeof _plugin.settings.onSelect == 'function') {
                            _plugin.settings.onSelect(_plugin.data.files[_plugin.htmlElements.fileInfoContainer.attr('data-fileId')]);
                            if (_plugin.settings.closeOnSelect) {
                                $.insmFileBrowser('close');
                            }
                        }
                        else {
                            $.insmNotification({
                                type: 'error',
                                text: 'No callback method defined. Module is not setup properly'
                            });
                        }
                    })
                ).append(
                    $('<a />').addClass('button').text('Close').click(function () {
                        $.insmFileBrowser('close');
                    })
                )
            ).draggable({
                containment: "html",
                handle: _plugin.htmlElements.header,
                zIndex: 100
            }).css("z-index", "100").position({ my: "top-50%", at: "center", of: window });

            // Show list
            // Download content from directory
            $.insmFramework('getFilesInfo',
                {
                    contentdirectoryid: _plugin.settings.mediaContentDirectoryId,

                    success: function (data) {

                        var filteredFiles = [];
                        var dataFiles = [];

                        _plugin.data.files = {};

                        var allowedFileType = function (file) {
                            if (_plugin.settings.fileType) {
                                if (_plugin.settings.fileType.length > 0 ? file.MimeType.toLowerCase().indexOf(_plugin.settings.fileType.toLowerCase()) > -1 : true) {
                                    return true;
                                }
                            } else {
                                return true;
                            }
                            return false;
                        };

                        $.each(data.MediaFiles, function (key, file) {
                            if (allowedFileType(file) && (typeof _plugin.settings.filter == 'function' ? _plugin.settings.filter(file) : true)) {
                                filteredFiles.push(file);
                            }
                        });

                        if (filteredFiles.length > 0) {
                            dataFiles = filteredFiles;
                        }

                        dataFiles.sort(function (a, b) {
                            var dateA = printDate(a.ModificationDate, 'Y-m-d H:i:s');
                            var dateB = printDate(b.ModificationDate, 'Y-m-d H:i:s');

                            if (dateA > dateB) {
                                return -1;
                            }
                            else if (dateA < dateB) {
                                return 1;
                            }
                            return 0;
                        });

                        $.each(dataFiles, function (key, file) {
                            _plugin.data.files[file.Id] = file;
                        });

                        _plugin.htmlElements.filesTable.insmTablesorter({
                            paginationPosition: 'top',
                            searchPosition: 'top',
                            limitControlPosition: 'top',
                            data: dataFiles,
                            offset: 0,
                            limit: 10,
                            onSelect: function (fileId) {
                                $.insmFileBrowser('showFile', fileId);
                            },
                            headers: _plugin.settings.headers
                        });

                        if (_plugin.settings.currentFileId) {
                            _plugin.htmlElements.filesTable.insmTablesorter('selectRow', {
                                selector: function (item) {
                                    return item.Id == _plugin.settings.currentFileId;
                                }
                            });

                            $.insmFileBrowser('showFile', _plugin.settings.currentFileId);
                        }
                    },
                    denied: function (message) {
                        $.insmNotification({
                            type: 'unauthorized',
                            text: message
                        });
                    },
                    error: function (message) {
                        $.insmNotification({
                            type: 'error',
                            text: message
                        });
                    }
                }
            );
        },
        close: function (options) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFileBrowser');
            _plugin.htmlElements.backdrop.insmPopup('close');
            _plugin.htmlElements.mainContainer.remove();
            $this.data('insmFileBrowser', null);
        },
        showFile: function (fileId) {
            // Global vars
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFileBrowser');
            if (!_plugin.data.files[fileId]) {
                return;
            }
            _plugin.htmlElements.fileDetails =
                $('<table />').addClass('no-border vertical').append(
                    $('<tr />').append(
                        $('<th />').text('Name')
                    ).append(
                        $('<td />').text(_plugin.data.files[fileId].Name)
                    )
                ).append(
                    $('<tr />').append(
                        $('<th />').text('Size')
                    ).append(
                        $('<td />').text(displayFileSize(_plugin.data.files[fileId].Length))
                    )
                ).append(
                    $('<tr />').append(
                        $('<th />').text('Length')
                    ).append(
                        $('<td />').text('-')
                    )
                );

            var $preview = null;
            var previewUrl = $.insmFiles('getPreviewUrl', { fileId: fileId });
            var mimeType = _plugin.data.files[fileId].MimeType;
            if (mimeType.indexOf("audio") === 0) {
                mimeType = "audio";
            } else if (mimeType.indexOf("video") === 0) {
                mimeType = "video";
            } else if (mimeType.indexOf("image") === 0) {
                mimeType = "image";
            }
            var $previewDiv = $('<div />').html("Loading preview");
            switch (mimeType) {
                case 'audio':
                    previewUrl = $.insmFiles('getUrl', { fileId: fileId });
                    var src = 
                    $preview = $('<audio controls><source id="preview" src="' + previewUrl + '" type="' + data.MimeType + '" >Your browser does not support the audio preview.</audio> ');
                    $preview.children("#preview").on('canplay canplaythrough', function(){
                        $previewDiv.html($preview);
                    });
                    break;
                case 'video':
                    $preview = $('<video width="300" src="' + previewUrl + '" type="' + data.MimeType + '" controls loop>' +
                        'This content appears if the video tag or the codec is not supported.' +
                        '</video>');
                    $preview.on("canplay", function (e) {
                        $previewDiv.html($preview);
                    });
                    $preview.on("error", function (e) {
                        var error = $preview.get(0).error;
                        switch (error.code) {
                            case error.MEDIA_ERR_ABORTED:
                                $previewDiv.html("fetching aborted at the user's request");
                                break;
                            case error.MEDIA_ERR_NETWORK:
                                $previewDiv.html("a network error caused the browser to stop fetching the media");
                                break;
                            case error.MEDIA_ERR_DECODE:
                                $previewDiv.html("an error occurred while decoding the media");
                                break;
                            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                $previewDiv.html("the media indicated by the src attribute was not suitable");
                                break;
                            default:
                                $previewDiv.html("an error occurred");
                                break;
                        }
                    });
                    
                    break;
                case 'image':
                    $preview = imageDynamicResize(previewUrl, _plugin);
                    $preview.load(function () {
                        $previewDiv.html($preview);
                    }).error(function () {
                        $previewDiv.html("Image could not be loaded");
                    })
                    break;
                default:
                    $previewDiv.html("No preview available");
            }
            // Display preview
            _plugin.htmlElements.fileInfoContainer.attr('data-fileId', fileId);
            _plugin.htmlElements.fileInfoContainer.empty().append($previewDiv).append(_plugin.htmlElements.fileDetails);
        }
    };


    function imageDynamicResize(URL, _plugin) {

        var url = URL;
        var img = $('<img />').load(function () {
            img.show();
            var holderHeight = _plugin.htmlElements.filesTable.height() - _plugin.htmlElements.fileDetails.height();
            var holderWidth = 300; //300 should be replaced with data from css. 
            var imgHeight = this.height;
            var imgWidth = this.width;
            var scaleY = holderHeight / imgHeight;
            var scaleX = holderWidth / imgWidth;
            if (scaleY < scaleX) {
                img.css('height', holderHeight + 'px');
            } else {
                img.css('width', holderWidth + 'px');
            }
            img.removeAttr("width").removeAttr("height"); //ie9 bug fix: https://groups.google.com/forum/#!topic/mootools-users/RJ1w7rJSQvM
        });
        img.attr('src', URL);
        return img;
    }

    $.insmFileBrowser = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmFileBrowser');
        }
    };
})(jQuery);