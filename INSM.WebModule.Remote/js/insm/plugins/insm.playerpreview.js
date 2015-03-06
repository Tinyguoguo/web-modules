/*
* INSM Player Preview
* This file contain the INSM Player Preview plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmNotification(settings);
*
* File dependencies:
* jQuery 1.6.1
* Fancybox 1.3.4
* 
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlayerPreview');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        
                    },
                    settings: $.extend({
                        upid: '',
                        refreshIntervalLiveview: 200,
                        refreshIntervalScreenshot: 30000
                    }, options),
                    data: {
                        liveviewSrc: '',
                        refreshTimeout: null
                    }
                };
                $this.data('insmPlayerPreview', _plugin);
            }

            // TODO
            // Use getScreenshotUrl instead
            // Add some kind of loading indicator
            var screenshot = $.insmFramework('getScreenshot', {
                upid: _plugin.settings.upid
            }).click(function (e) {
                e.stopPropagation();
                $this.insmPlayerPreview('open');
            });
            _plugin.data.screenshotUrl = screenshot.attr('src');

            screenshot.load(function () {
                if (screenshot.is(':visible')) {
                    setTimeout(function () {
                        screenshot.attr('src', _plugin.data.screenshotUrl + '&timestamp=' + new Date().getTime());
                    }, _plugin.settings.refreshIntervalScreenshot);
                }
                else {
                    var intervalId = setInterval(function () {
                        if (screenshot.is(':visible')) {
                            clearInterval(intervalId);
                            screenshot.attr('src', _plugin.data.screenshotUrl + '&timestamp=' + new Date().getTime());
                        }
                    }, 6000);
                }
            });

            $this.html(screenshot).addClass('playerPreview').click(function() {
                $this.insmPlayerPreview('open');
            });

            return $this;
        },
        open: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlayerPreview');

            var liveviewImage = $.insmFramework('getLiveview', {
                upid: _plugin.settings.upid
            });

            var closed = false;

            liveviewImage.unbind('load');
            liveviewImage.load(function () {
                if (closed) {
                    return;
                }

                liveviewImage.insmPopup('resize', {
                    width: liveviewImage[0].naturalWidth,
                    height: liveviewImage[0].naturalHeight
                });
                liveviewImage.removeAttr('width');
                liveviewImage.removeAttr('height');

                _plugin.data.refreshTimeout = setTimeout(function () {
                    liveviewImage.attr('src', _plugin.data.liveviewSrc + '&timestamp=' + new Date().getTime());
                }, _plugin.settings.refreshIntervalLiveview);
            });

            _plugin.data.liveviewSrc = liveviewImage.attr('src');
            liveviewImage.attr('src', 'gfx/insm/loading.gif');
            
            $.insmPopup({
                content: liveviewImage.addClass('playerPreview-popup'),
                onClose: function () {
                    closed = true;
                    clearTimeout(_plugin.data.refreshTimeout);
                }
            });
            
            return $this;
        }
    };

    $.fn.insmPlayerPreview = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPlayerPreview');
            return null;
        }
    };

    $.insmPlayerPreview = function (method) {
        var div = $('<div />');
        return div.insmPlayerPreview.apply(div, arguments);
    };
})(jQuery);
