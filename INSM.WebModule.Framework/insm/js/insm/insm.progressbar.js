/*
* INSM Progress Bar
* This file contain the INSM Progress Bar function.
* The script display a list of all players in an Instoremedia Assets Management Server (AMS).
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmProgressBar(settings);
* 'identifier' must be an input[type=file]
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
    var methods = {
        init: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmProgressBar');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        text: 'Loading',
                        progress: 1,
                        animationDuration: 1000
                    }, options),
                    htmlElements: {
                        progressBackground: $('<div />').addClass('progressbackground'),
                        progressText: $('<div />').addClass('progresstext')
                    }
                };
                $this.data('insmProgressBar', _plugin);
            }

            $this.append(
                _plugin.htmlElements.progressBackground
            ).append(
                _plugin.htmlElements.progressText
            ).addClass('insm-progressbar');

            // Fixes bug where $this has wrong width
            setTimeout(function () {
                $this.insmProgressBar('render', {
                    noAnimation: true
                });
            }, 1);

            return $this;
        },
        isInitialized: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmProgressBar');
            return !!_plugin;
        },
        update: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmProgressBar');
            if (!_plugin) {
                $.insmNotification({
                    type: 'error',
                    text: 'call to update before init in insmProgressbar'
                });
            }
            if (options.text) {
                _plugin.settings.text = options.text;
            }
            if (options.progress) {
                _plugin.settings.progress = parseFloat(options.progress);
                if (_plugin.settings.progress > 1) {
                    _plugin.settings.progress = 1;
                }
            }
            if (options.animationDuration) {
                _plugin.settings.animationDuration = options.animationDuration;
            }


            $this.insmProgressBar('render');

            return $this;
        },
        render: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmProgressBar');
            if (!_plugin) { return null; }
            _plugin.htmlElements.progressText.text(_plugin.settings.text);

            $this.css('width', $this.parent().insmUtilities('size',{ignoreVisibleCheck:true}).width - 2);
          
            if (_plugin.settings.progress >= 0) {
                
                if (_plugin.htmlElements.progressBackground.width() < $this.width() && _plugin.htmlElements.progressBackground.width() > 0) {
                    _plugin.htmlElements.progressBackground.stop(true).animate({
                        width: parseInt($this.width() * _plugin.settings.progress, 10) + 'px'
                    }, _plugin.settings.animationDuration, 'linear');
                }
                else {
                    _plugin.htmlElements.progressBackground.stop(true).css({
                        width: parseInt($this.width() * _plugin.settings.progress, 10) + 'px'
                    });
                }
            }
            else {
                _plugin.htmlElements.progressBackground.stop(true).css({
                    width: $this.width() + 'px'
                });
            }
            return $this;
        }
    };

    $.fn.insmProgressBar = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmProgressBar');
            return null;
        }
    };
})(jQuery);
