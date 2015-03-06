/*
* INSM Feedback Overlay
* This file contain the INSM Feedback Overlay plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmFeedbackOverlay(settings);
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
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFeedbackOverlay');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        overlay: $('<div />')
                    },
                    data: {
                        iterator: 0,
                        loadingTasks: {}
                    }
                };
                $this.data('insmFeedbackOverlay', _plugin);
            }

            // Init html
            _plugin.htmlElements.overlay.addClass('insm-feedback-overlay');
            
            $('html').eq(0).append(_plugin.htmlElements.overlay);
            var index = _plugin.data.iterator;
            _plugin.data.iterator++;
            _plugin.data.loadingTasks[index] = {
                timer: null,
                active: false
            };
            
            _plugin.data.loadingTasks[index].timer = setTimeout(function () {
                _plugin.data.loadingTasks[index].active = true;
                $.insmFeedbackOverlay('showLoader');
            }, 200);

            return {
                remove: function () {
                    clearTimeout(_plugin.data.loadingTasks[index].timer);
                    _plugin.data.loadingTasks[index].active = false;
                    $.insmFeedbackOverlay('hideLoader');
                }
            }
        },
        showLoader: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFeedbackOverlay');

            if (_plugin.htmlElements.overlay.is(':visible')) {
                return $;
            }

            $.each(_plugin.data.loadingTasks, function(index, loadingTask) {
                if (loadingTask.active) {
                    _plugin.htmlElements.overlay.stop(true).fadeIn('fast');
                    return false;
                }
            });

            return $;
        },
        hideLoader: function () {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmFeedbackOverlay');

            if (!_plugin.htmlElements.overlay.is(':visible')) {
                return $;
            }

            var hide = true;
            $.each(_plugin.data.loadingTasks, function (index, loadingTask) {
                if (loadingTask.active) {
                    hide = false;
                    return false;
                }
            });

            if (hide) {
                _plugin.htmlElements.overlay.stop(true).fadeOut('fast');
            }

            return $;
        },
        destroy: function () {
            var $this = $('html').eq(0);
            $this.data('insmFeedbackOverlay', null);

            return $;
        }
    };

    $.insmFeedbackOverlay = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmFeedbackOverlay');
        }
    };
})(jQuery);
