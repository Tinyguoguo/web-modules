/*
* INSM List Tree
* This file contain the INSM List Tree function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmListTree(settings);
*
* File dependencies:
* jQuery 1.6.1
* 
* Author:
* Mikael Berglund
* Instoremedia AB
*/

(function ($) {
    var methods = {
        close: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPreviewWindow');
            _plugin.data.isLoaded = false;
            $("video").each(function () {
                this.pause();
            });

            if (_plugin.data.backdrop) {
                _plugin.data.backdrop.remove();
            }
            if (_plugin.data.container) {
                _plugin.data.container.empty().remove();
            }
            if (_plugin.data.innerContainer) {
                _plugin.data.innerContainer.empty().remove();
            }
            if (_plugin.data.previewObject) {
                _plugin.data.previewObject.remove();
            }
            if (_plugin.data.preloadObject) {
                _plugin.data.preloadObject.remove();
            }
            clearTimeout(_plugin.data.timeoutHandle);
            if (_plugin.data.previewObject) {
                _plugin.data.previewObject.html("");
            }
            _plugin.data.previewObject = null;
            _plugin.data.killAll = true;
        },
        init: function (options) {
            var $this;
            if (this instanceof $) {
                $this = $(this);
                if (typeof (options.autoOpen) == 'undefined' || options.autoOpen) {
                    //if it is an element we asume we want the click behavior.
                    $this.click(function () {
                        $(this).insmPreviewWindow('open');
                    });
                }
            } else {
                $this = $("<div />");
                $this.insmPreviewWindow(options);
                return $this;
            }

            // Global vars
            var _plugin = $this.data('insmPreviewWindow');

            if ($.insmFramework('isInitialized')) {
                $.insmFiles({
                    framework: $.insmFramework('getDeprecatedFramework')
                });
            } else {
                $.insmNotification({ 'text': 'Framework needs to be initialized before calling a preview window.', type: error });
            }


            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    data: {
                        killAll: false,
                        backdrop: $('<div />').addClass('insm-previewwindow backdrop'),
                        container: $('<div />').addClass('insm-previewwindow container'),
                        innerContainer: $('<div />').addClass('insm-previewwindow inner-container'),
                        closeButton: $('<div >X</div>').addClass('insm-previewwindow close'),
                        loadingScreen: $('<div />').addClass('insm-previewwindow loading-screen'),
                        previewObject: null,
                        isLoaded: false,
                        preloadObject: $('<img />'),
                        timeoutHandle: null,
                        previousWidth: 0,
                        previousHeight: 0
                    },
                    settings: $.extend({
                        fileId: 0,
                        autoOpen: false,
                        updateInterval: 0,
                        upid: null,
                        height: null,
                        useScreenView: false,
                        content: null,
                        backgroundColor: '#000'
                    }, options)
                };
                $this.data('insmPreviewWindow', _plugin);
            }
            if (_plugin.settings.autoOpen) {
                $this.insmPreviewWindow('open');
            }

            $this.addClass('insm-previewwindow-link');
                       
            return $this;
        },
        open: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPreviewWindow');
            if (!_plugin) {
                $.insmNotification({
                    type: 'error',
                    text: "Missing plugin settings for file preview."
                });
                return $this;
            }

            _plugin.data.killAll = false;

            function getPreviewObjectForPlayer(upid, height, useScreenView) {
                if (useScreenView) {
                    return $('<img />').attr('src', $.insmFramework('screenviewUrl', { upid: upid, display: false, height: height }));
                } else {
                    return $('<img />').attr('src', $.insmFramework('screenshotUrl', { upid: upid, display: 0, width: null, height: height }));
                }
            }

            var whenObjectIsLoaded = function () {
                if (!_plugin.data.isLoaded) {
                    _plugin.data.closeButton.prependTo(_plugin.data.container);
                    _plugin.data.closeButton.click(function () {
                        $this.insmPreviewWindow('close');
                    });

                    _plugin.data.loadingScreen.remove();
                    _plugin.data.container.center();
                    _plugin.data.previewObject.animate({ opacity: 1 }, 200);
                    _plugin.data.isLoaded = true;

                    //autoplay is buggy ;/ so if its a movie, lets play it.
                    if (_plugin.data.previewObject.is("video")) {
                        _plugin.data.previewObject.get(0).play();
                    }

                }
                if (_plugin.settings.updateInterval) {
                    _plugin.data.timeoutHandle = setTimeout(function () {
                        $this.insmPreviewWindow('update');
                    }, _plugin.settings.updateInterval);
                }
            };

            var whenObjectFailedLoad = function () {
                _plugin.data.container.animate({ opacity: 0 }, 400, function () {
                    $this.insmPreviewWindow('close');
                    $.insmNotification({
                        type: 'warning',
                        text: "Preview file could not be loaded."
                    });
                });
            };

            function getPreviewObjectForFile(fileId) {
                var pause = 1000;
                var def = $.Deferred();
                var done = false;
                var progress = 100;
                var loop = function () {
                    if (!done) {
                        $.insmFiles('getPreviewInfo', { fileId: fileId },
                            {
                                error: function (message) {
                                    $.insmNotification({
                                        type: 'error',
                                        text: message
                                    });
                                    done = true;
                                    def.reject();
                                },
                                denied: function () {
                                    // TODO: Recover
                                    $.insmNotification({
                                        type: 'error',
                                        text: 'User not authenticated'
                                    });
                                    $(this).insmPreviewWindow('close');
                                },
                                success: function (data) {
                                    if (data.State == "Available") {
                                        var previewUrl = $.insmFiles('getPreviewUrl', { fileId: fileId });
                                        var mimeType = data.MimeType;
                                        if (mimeType.indexOf("audio") === 0) {
                                            mimeType = "audio";
                                        } else if (mimeType.indexOf("video") === 0) {
                                            mimeType = "video";
                                        } else if (mimeType.indexOf("image") === 0) {
                                            mimeType = "image";
                                        }
                                        switch (mimeType) {
                                            case 'audio':
                                                previewUrl = $.insmFiles('getUrl', { fileId: fileId });
                                                _plugin.data.previewObject = $('<audio controls><source src="' + previewUrl + '" type="' + data.MimeType + '">Your browser does not support the audio preview.</audio> ');
                                                break;
                                            case 'video':
                                                _plugin.data.previewObject = $('<video width="320" src="' + previewUrl + '" type="' + data.MimeType + '" controls loop>' +
                                                    'This content appears if the video tag or the codec is not supported.' +
                                                    '</video>');
                                                break;
                                            case 'image':
                                                _plugin.data.previewObject = $('<img />').attr('src', previewUrl);
                                                break;
                                            default:
                                                $.insmNotification({
                                                    type: 'warning',
                                                    text: 'No preview available'
                                                });
                                        }
                                        done = true;
                                        def.resolve();
                                    }
                                    else if (data.State == "NotAvailable") {
                                        done = true;
                                        def.reject();
                                    }
                                    else {
                                        progress = data.Progress;
                                    }
                                }
                            }

                        ).done(function () {
                            if (!_plugin.data.killAll) {
                                def.notify(progress);
                                timeoutHandle = setTimeout(loop, pause);
                            }
                        });
                    }
                };
                loop();
                return def;
            }

            // get object.
            var deferred = $.Deferred();
            if (_plugin.settings.customContent) {
                _plugin.data.previewObject = _plugin.settings.customContent;
                deferred.resolve();
            } else if (_plugin.settings.upid) {
                var height = _plugin.settings.height ? _plugin.settings.height : 480;
                _plugin.data.previewObject = getPreviewObjectForPlayer(_plugin.settings.upid, height, _plugin.settings.useScreenView);
                deferred.resolve();
            } else {
                var progressBar = $('<div />').insmProgressBar({
                    text: 'Checking for preview',
                    progress: 1
                });
                _plugin.data.loadingScreen.html(
                    progressBar
                );
                getPreviewObjectForFile(_plugin.settings.fileId).progress(function (data) {
                    if (!_plugin.data.killAll && progressBar.insmProgressBar('isInitialized')) {
                        progressBar.insmProgressBar('update', {
                            text: 'Rendering preview',
                            progress: parseFloat(data)
                        });
                        _plugin.data.container.center();
                    }
                }).done(function () {
                    if (!_plugin.data.killAll) {
                        deferred.resolve();
                    }
                }).fail(function () {
                    if (!_plugin.data.killAll) {
                        $.insmNotification({
                            type: 'warning',
                            text: 'Preview not available'
                        });
                        $this.insmPreviewWindow('close');
                    }
                });
            }

            _plugin.data.innerContainer.css({ backgroundColor: _plugin.settings.backgroundColor });
            _plugin.data.backdrop.animate({ opacity: 0.5 }, 100);

            _plugin.data.backdrop.appendTo('html').click(function () {
                $this.insmPreviewWindow('close');
            });

            _plugin.data.innerContainer.append(_plugin.data.loadingScreen);
            _plugin.data.innerContainer.append(_plugin.data.preloadObject.hide());

            _plugin.data.container.append(_plugin.data.innerContainer);
            _plugin.data.innerContainer.animate({ opacity: 1 }, 200);


            _plugin.data.container.animate({ opacity: 1 }, 400);


            deferred.done(function () {
                _plugin.data.previewObject.addClass('insm-previewwindow preview-object');
                _plugin.data.innerContainer.append(_plugin.data.previewObject);
                if (_plugin.data.previewObject.is("img, script, frame, iframe, window")) {
                    // only those elements has load event trigger.
                    _plugin.data.previewObject.load(whenObjectIsLoaded);
                    _plugin.data.previewObject.bind('error', whenObjectFailedLoad);
                } else if (_plugin.data.previewObject.is('video, audio')) {
                    _plugin.data.previewObject.bind('loadstart', whenObjectIsLoaded);
                } else {
                    setTimeout(function () {
                        whenObjectIsLoaded();
                    }, 100);
                }
                _plugin.data.container.center();
            });
            _plugin.data.container.appendTo('html');
            _plugin.data.container.center();

            return $this;
        },

        update: function () {

            /**
              * http://stackoverflow.com/a/10997390/11236
              */
            function updateUrlParameter(url, param, paramVal) {
                var newAdditionalUrl = "";
                var tempArray = url.split("?");
                var baseUrl = tempArray[0];
                var additionalUrl = tempArray[1];
                var temp = "";
                if (additionalUrl) {
                    tempArray = additionalUrl.split("&");
                    for (var i = 0; i < tempArray.length; i++) {
                        if (tempArray[i].split('=')[0] != param) {
                            newAdditionalUrl += temp + tempArray[i];
                            temp = "&";
                        }
                    }
                }
                var rowsTxt = temp + "" + param + "=" + paramVal;
                return baseUrl + "?" + newAdditionalUrl + rowsTxt;
            }

            var $this = $(this);
            var _plugin = $this.data('insmPreviewWindow');
            if (!_plugin) {
                $.insmNotification({
                    type: 'error',
                    text: "Missing plugin settings for Preview Window."
                });
                return;
            }
            if (!_plugin.data.previewObject.is("img")) {
                // can only update images right now.
                return;
            }

            _plugin.data.preloadObject.one('load', function () {
                _plugin.data.previewObject.attr("src", $(this).attr("src"));
            });

            _plugin.data.preloadObject.attr('src', updateUrlParameter(_plugin.data.previewObject.attr('src'), "timestamp", new Date().getTime()));
            return;
        }
    };

    $.insmPreviewWindow = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPreviewWindow');
            return null;
        }
    };

    $.fn.insmPreviewWindow = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPreviewWindow');
            return null;
        }
    };
})(jQuery);