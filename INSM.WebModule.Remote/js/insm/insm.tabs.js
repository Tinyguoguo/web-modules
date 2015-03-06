/*
* INSM Tabs
* This file contain the INSM Tabs function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmTabs(settings);
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
            var _plugin = $this.data('insmTabs');
            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        tabsMenu: $('<ul />'),
                        tabsContent: $('<div />').addClass('insm-tabs-content')
                    },
                    settings: $.extend({
                        tabs: null,
                        onSelect: function (index) {

                        }
                    }, options)
                };
                $this.data('insmTabs', _plugin);
            }



            var tabFromUrl = (urlDecode($(document).getUrlParam('tab')) || '');

            if (!_plugin.settings.tabs) {
                $.insmNotification({
                    type: 'error',
                    text: 'No tabs defined in INSM Tabs'
                });
                return $this;
            }

            $this.append(_plugin.htmlElements.tabsMenu).append(_plugin.htmlElements.tabsContent).addClass('insm-tabs');

            var showFirst = true;
            var index = 0;
            $.each(_plugin.settings.tabs, function (key, tab) {
                var contentContainer = $('<div />').append(tab.content);
                function add(index) {
                    _plugin.htmlElements.tabsMenu.append(
                        $('<li />')
                        .text(tab.title)
                        .attr('key', key)
                        .click(function () {
                            _plugin.htmlElements.tabsMenu.children().removeClass('selected');
                            $(this).addClass('selected');
                            _plugin.htmlElements.tabsContent.children().hide();
                            contentContainer.fadeIn();
                            _plugin.settings.onSelect(index);
                        }).css({
                            cursor: 'pointer'
                        })
                    );
                };
                add(index);
                

                if (options.autoOpen === tab.title || tabFromUrl === key) {
                    showFirst = false;
                    _plugin.htmlElements.tabsMenu.find('li[key=' + key + ']').addClass('selected');
                }
                else {
                    contentContainer.hide();
                }

                _plugin.htmlElements.tabsContent.append(
                    contentContainer
                );

                index++;
            });

            if (showFirst) {
                _plugin.htmlElements.tabsMenu.children().first().addClass('selected');
                _plugin.htmlElements.tabsContent.children().first().show();
            }


            return $this;
        },
        stateChange: function(options) {
            // tab = PlayerDiagnostics

        },
        append: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTabs');

            $.each(options.tabs, function (key, tab) {
                var contentContainer = $('<div />').html(tab.content);
                _plugin.htmlElements.tabsContent.append(
                    contentContainer.hide()
                );
                _plugin.htmlElements.tabsMenu.append(
                    $('<li />')
                        .text(tab.title)
                        .click(function () {
                            _plugin.htmlElements.tabsMenu.children().removeClass('selected');
                            $(this).addClass('selected');
                            _plugin.htmlElements.tabsContent.children().hide();
                            contentContainer.fadeIn();
                        }).css({
                            cursor: 'pointer'
                        })
                );
            });
            return $this;
        },
        prepend: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTabs');

            $.each(options.tabs, function (title, tab) {
                var contentContainer = $('<div />').html(tab.content);
                _plugin.htmlElements.tabsContent.prepend(
                    contentContainer.hide()
                );
                _plugin.htmlElements.tabsMenu.prepend(
                    $('<li />')
                        .text(tab.title)
                        .click(function () {
                            _plugin.htmlElements.tabsMenu.children().removeClass('selected');
                            $(this).addClass('selected');
                            _plugin.htmlElements.tabsContent.children().hide();
                            contentContainer.fadeIn();
                        }).css({
                            cursor: 'pointer'
                        })
                );
            });
            return $this;
        },
        select: function (options) {
            // Global vars
            var $this = $(this);
            var _plugin = $this.data('insmTabs');
            _plugin.htmlElements.tabsMenu.find('li').eq(options.index).trigger('click');
            return $this;
        }
    };

    $.fn.insmTabs = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        return $.error('Method ' + method + ' does not exist on $.insmTabs');
    };
})(jQuery);