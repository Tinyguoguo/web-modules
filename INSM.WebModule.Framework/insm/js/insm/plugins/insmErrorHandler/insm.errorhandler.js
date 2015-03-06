/*
* INSM Error Handler
* This file contain the INSM Error Handler plugin
* 
* This file may only be used by Instoremedia AB or its customers and partners.
* 
* Called by $('identifier').insmErrorHandler(settings);
* 
* Author:
* Tobias Rahm
* INSM AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $('html').eq(0);
            var _plugin = $this.data('insmErrorHandler');

            // If the plugin hasn't been initialized yet
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        message: 'No message',
                        url: 'No url',
                        line: 'No line'
                    }, options),
                    htmlElements: {
                        overlay: $('<div />')
                    },
                    data: {
                        iterator: 0,
                        loadingTasks: {}
                    }
                };
                $this.data('insmErrorHandler', _plugin);
            }
            
            var fileInfo = _plugin.settings.url.split('/');
            fileInfo = fileInfo[fileInfo.length - 1] + ': line ' + _plugin.settings.line;

            var systemData = $.insmFramework('getSystemInformation');

            var details = $('<div />').insmInput({
                type: 'table',
                objectDefinition: {
                    application: {
                        displayName: 'Application',
                        type: 'string',
                        value: systemData.application.name + ' ' + systemData.application.version
                    },
                    apiUrl: {
                        displayName: 'API URL',
                        type: 'string',
                        value: systemData.apiUrl
                    },
                    target: {
                        displayName: 'Target',
                        type: 'string',
                        value: systemData.type + ' ' + systemData.target + ' ' + systemData.version
                    },
                    file: {
                        displayName: 'File',
                        type: 'string',
                        value: fileInfo
                    },
                    message: {
                        displayName: 'Message',
                        type: 'string',
                        value: _plugin.settings.message
                    }
                }
            }).insmInput('view').hide();

            var errorPopup = $.insmPopup({
                content: $('<div class="errorPopup" />').append(
                    $('<h2 />').text('Sorry, something went wrong!'),
                    $('<p />').text('Sorry, something has gone wrong with the Instoremedia system.'),
                    $('<a />').append(
                    ).text('Show details').click(function () {
                        if (details.is(':visible')) {
                            details.hide('slow');
                            $(this).text('Show details');
                            errorPopup.center();
                        }
                        else {
                            details.show('slow');
                            $(this).text('Hide details');
                            errorPopup.center();
                        }
                    }),
                    details
                ),
                showCloseButton: false,
                backdropTransparency: false
            });

            $('*').css({
                overflow: 'hidden'
            });

            return $;
        },
        destroy: function () {
            var $this = $('html').eq(0);
            $this.data('insmErrorHandler', null);

            return $;
        }
    };

    $.insmErrorHandler = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmErrorHandler');
        }
    };
})(jQuery);
