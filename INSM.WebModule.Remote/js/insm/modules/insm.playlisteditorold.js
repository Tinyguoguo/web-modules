/*
* INSM Playlist Editor
* This file contain the INSM Playlist Editor function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmPlaylistEditor(settings);
*
* File dependencies:
* jQuery 1.8.2
* jQuery UI 1.8.23
* insmNotification
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');
            if (!_plugin) {
                _plugin = {
                    htmlElements: {

                    },
                    data: {
                        players: {},
                        playerUpdateListeners: []
                    },
                    settings: $.extend({
                        apiUrl: '',
                        applicationName: 'Playlist Editor',
                        version: manifest.version,
                        containerCallback: function (module) {

                        },
                        show: function () { },
                        target: null,
                        previewTarget: null,
                        thumbnailTarget: null
                    }, options)
                };
                $this.data('insmPlaylistEditor', _plugin);
            }

            var frameworkNotificationHandle = $.insmNotification({
                type: 'load',
                text: 'Initializing Instoremedia',
                duration: 0
            });

            if (!$.insmFramework('isInitialized')) {
                $.insmFramework({
                    apiUrl: _plugin.settings.apiUrl,
                    applicationName: _plugin.settings.applicationName,
                    version: _plugin.settings.version,
                    session: (urlDecode($(document).getUrlParam('session')) || '')
                });
            }

            $.when($.insmFramework('initialized')).done(function () {
                frameworkNotificationHandle.remove();
                $this.insmPlaylistEditor('prepareData');
            });
            return $this;
        },
        prepareData: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            //$.insmService('register', {
            //    subscriber: 'insmPlaylistEditor',
            //    type: 'player',
            //    update: function (player) {
            //        _plugin.data.players[player.id] = player;

            //        $.each(_plugin.data.playerUpdateListeners, function (index, listener) {
            //            listener();
            //        });
            //    },
            //    remove: function (player_id) {
            //    }
            //});

            return $this;
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            }
            else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview playlistEditor playlistEditor-preview').html(
                $('<h2 />').addClass('title').text('Playlist Editor')
            );

            return _plugin.settings.previewTarget;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            if (_plugin.settings.target) {
                return _plugin.settings.target;
            }
            else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        fullscreen: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');

            if (!_plugin.settings.target) {
                $this.insmPlaylistEditor('getTarget').fadeIn();
            }

            _plugin.settings.target.addClass('playlistEditor playlistEditor-table');
            _plugin.settings.target.html($('<h2 />').text('Playlist Editor'));

            _plugin.data.playerUpdateListeners.push(function () {
                var statusSummary = {
                    unknown: 0,
                    offline: 0,
                    error: 0,
                    warning: 0
                };

                $.each(_plugin.data.players, function (id, player) {
                    statusSummary[player.state.toLowerCase()]++;
                });

                _plugin.settings.target.append('Players was updated');
            });


            return _plugin.settings.target;
        },
        onClose: function (options) {
            options.success();
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlaylistEditor');


            $this.data('insmPlaylistEditor', null).empty();

            return $this;
        }
    };

    $.fn.insmPlaylistEditor = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPlaylistEditor');
        }
    };

    //$.insmPlaylistEditor = function (method) {
    //    return $('html').insmPlaylistEditor(arguments);
    //};
})(jQuery);