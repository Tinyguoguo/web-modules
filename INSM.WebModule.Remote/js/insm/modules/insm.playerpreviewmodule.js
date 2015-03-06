/*
* INSM PlayerPreview
* This file contains the INSM playerPreview plugin.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmPlayerPreviewModule(settings);
*
* File dependencies:
* jQuery 1.8.2
* jQuery UI 1.8.23
* insmNotification
*
* Author:
* Guo Yang
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlayerPreviewModule');
                        
            if (!_plugin) {
                _plugin = {

                    settings: $.extend({
                        target: null,
                        region: 0,
                        apiUrl: '',
                        applicationName: 'PlayerPreviewModule',
                        version: manifest.version,
                        header: true
                    }, options),
                    htmlElements: {
                        header: $('<div />'),
                        content: {
                            container: $('<div />'),
                            header: {
                                container: $('<div />').addClass('sub-header'),
                                title: $('<h2 />'),
                                //backButton: $('<a />').text('Back').addClass('back')
                            },
                            views: {
                                playerpreviewmodcontainer: $('<div />').addClass('content'),
                                regionPicker: $('<div />'),
                                fromScreen: $('<div />').addClass('screencontainer'),
                                screenLeft: $('<div />').addClass('screen'),
                                screenRight: $('<div />').addClass('screen'),
                                descriptionSource: $('<p />').text('Source'),
                                descriptionDestination: $('<p />').text('Destination'),
                                playButton: $('<button type="button" disabled />').text('Preview').addClass('playbutton'),
                                toScreen: $('<div />').addClass('screencontainer'),
                                playerIconLeft: $('<div />').addClass('playericon'),
                                playerNameLeft: $('<p />'),
                                playerLiveViewButton: $('<button />').addClass('liveviewbutton').text('Live View'),
                                useGuideLeft:$('<p />').text('Drag and drop a player here').addClass('description'),
                                // playerInfoLeft: $('<div />'),
                                playerIconRight: $('<div />').addClass('playericon'),
                                playerNameRight:$('<p />'),
                                playerStateRight: $('<div />').addClass('state'),
                                arrowLeft: $('<div />').addClass('playarrow'),
                                arrowRight: $('<div />').addClass('playarrow'),
                                useGuideRight:$('<p />').text('Drag and drop a player here').addClass('description'),
                                buttonContainer: $('<div />').addClass('buttoncontainer'),
                                loadingDiv : $('<div/>').addClass('loader')                               
                            }
                        }
                    },
                    data: {
                        itemList: {
                            regions: {},
                            players: {}
                        },
                        previewSettings: {
                            fromUpid: '',
                            toUpid: '',
                            isPreviewing: '',
                            fromName: '',
                            destinationName:''
                        },
                        nodeNameLookup: {
                            
                        },

                    },              
                };
                $this.data('insmPlayerPreviewModule', _plugin);
            }

            
            return $this;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlayerPreviewModule');
            
            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmPlayerPreviewModule');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            } else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview playerpreviewmodule');


            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            _plugin.settings.previewTarget.html(
                $('<h2 />').text('Player Preview')
            );

            return _plugin.settings.previewTarget;
        },
        //checkPlayerStatus: function (options) {
        //    var $this = $(this);
        //    var _plugin = $this.data('insmPlayerPreviewModule');
        //    _plugin.data.previewSettings.fromUpid = options.node.upid;
        //    _plugin.data.previewSettings.fromName = options.node.name;
           

        //    _plugin.htmlElements.content.views.playButton.text('Preview').removeAttr('disabled');
        //    _plugin.htmlElements.content.views.playerStateRight.text('Destination Player is prepared for previewing').addClass('state-info').removeClass('state-transfer state-warning');
        //    _plugin.data.previewSettings.isPreviewing = false;
        //    if (_plugin.data.previewSettings.toUpid != '' && _plugin.data.previewSettings.toUpid != _plugin.data.previewSettings.fromUpid && !_plugin.data.previewSettings.isPreviewing) {
        //        _plugin.htmlElements.content.views.playButton.removeAttr('disabled');
        //        _plugin.htmlElements.content.views.playerStateRight.text('Destination Player is prepared for previewing').addClass('state-info').removeClass('state-transfer state-warning');
        //    }
        //    else {
        //        _plugin.htmlElements.content.views.playButton.attr('disabled', 'disabled');
        //        if (_plugin.data.previewSettings.toUpid == _plugin.data.previewSettings.fromUpid) {
        //            _plugin.htmlElements.content.views.playerStateRight.text('Source and Destination can not be the same player ').addClass('state-warning').removeClass('state-transfer state-info');
        //        }
        //    }


        //},
        fullscreen: function (options) {

            var $this = $(this);
            var _plugin = $this.data('insmPlayerPreviewModule');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function() {
                    $this.insmPlayerPreviewModule('resize');
                }, 1);
                return $this;
            }
            
            _plugin.data.fullscreenInitialized = true;

            // Init html
            _plugin.settings.target.addClass('playerpreviewmodule').show();
            _plugin.settings.target.empty();
            _plugin.settings.target.append(
                _plugin.htmlElements.header.addClass('header').append(
                    $('<div />').addClass('company-logo'),
                    $('<div />').addClass('module-logo')
                ),
                    
                _plugin.htmlElements.content.container.addClass('container').append(
                    _plugin.htmlElements.content.views.regionPicker.addClass('regionPicker expanded'),
                    _plugin.htmlElements.content.views.playerpreviewmodcontainer.append(
                           
                        _plugin.htmlElements.content.views.fromScreen.append(
                            _plugin.htmlElements.content.views.descriptionSource.addClass('playername'),
                            _plugin.htmlElements.content.views.screenLeft.append(_plugin.htmlElements.content.views.useGuideLeft)
                               
                        ),
                        _plugin.htmlElements.content.views.buttonContainer.append(
                            _plugin.htmlElements.content.views.arrowLeft, 
                            _plugin.htmlElements.content.views.playButton.click(function (e) {
                                    
                                _plugin.htmlElements.content.views.playButton.text('Loading...').attr('disabled', 'disabled');
                                _plugin.htmlElements.content.views.playerStateRight.text('Loading...').addClass('state-transfer').removeClass('state-info state-warning');
                                if (!_plugin.data.previewSettings.isPreviewing) {
                                       
                                    _plugin.data.previewSettings.isPreviewing = true;
                                    $.insmFramework('clonePlayer', {
                                        sourcePlayerId: _plugin.data.previewSettings.fromUpid,
                                        desinationPlayerId: _plugin.data.previewSettings.toUpid,
                                        success: function () {
                                            _plugin.htmlElements.content.views.playButton.text('Stop').removeAttr('disabled');
                                            _plugin.htmlElements.content.views.playerStateRight.text('Currently Previewing ' + _plugin.data.previewSettings.fromName).addClass('state-info').removeClass('state-transfer state-warning');

                                        },
                                        offline: function () {
                                            _plugin.htmlElements.content.views.playButton.text('Preview').removeAttr('disabled');
                                            _plugin.htmlElements.content.views.playerStateRight.text('Connect to server timeout, please chose another player as destination or try again later. ').addClass('state-warning').removeClass('state-transfer state-info');
                                            _plugin.data.previewSettings.isPreviewing = false;
                                        }
                                    })
                                }
                                else {
                                        
                                    $.insmFramework('restorePlayer', {
                                        playerId: _plugin.data.previewSettings.toUpid,
                                        success: function () {

                                            _plugin.htmlElements.content.views.playButton.text('Preview').removeAttr('disabled');
                                            _plugin.htmlElements.content.views.playerStateRight.text('Destination Player is prepared for previewing').addClass('state-info').removeClass('state-transfer state-warning');
                                        },
                                        offline: function () {
                                            _plugin.htmlElements.content.views.playButton.text('Preview').removeAttr('disabled');
                                            _plugin.htmlElements.content.views.playerStateRight.text('Connect to server timeout, restore player unsuccessful. ').addClass('state-warning').removeClass('state-transfer state-info');
                                        }
                                    });
                                    _plugin.data.previewSettings.isPreviewing = false;
                                }
                            }),
                            _plugin.htmlElements.content.views.arrowRight
                        ),
                        _plugin.htmlElements.content.views.toScreen.append(
                            _plugin.htmlElements.content.views.descriptionDestination.addClass('playername'),
                            _plugin.htmlElements.content.views.screenRight.append(_plugin.htmlElements.content.views.useGuideRight)
                                 
                        )
                    )
                )
            );

                       
            _plugin.htmlElements.content.views.regionPicker.insmRegionPicker({
                applicationName: _plugin.settings.applicationName,
                includePlayers: true,
                clickable: false,
                onlySearchPlayers: true,
                draggable: function (options) {
                    if (options.node.upid) {
                        draggableSettings = [
                                {
                                    metadata: options.node,
                                    target: _plugin.htmlElements.content.views.fromScreen,
                                    onDrop: function () {
                                        $('.symboltext-from').remove();
                                        options.node._htmlElement.find('.item-text').before($('<span/>').text('Source').addClass('symboltext-from'));
                                        if (_plugin.data.previewSettings.isPreviewing) {
                                                    
                                            _plugin.htmlElements.content.views.playButton.text('Stopping...').attr('disabled', 'disabled');
                                            _plugin.htmlElements.content.views.playerStateRight.text('Stopping...').addClass('state-transfer').removeClass('state-info state-warning');
                                                    
                                            $.insmFramework('restorePlayer', {
                                                playerId: _plugin.data.previewSettings.toUpid,
                                                success: function () {
                                                    
                                                    _plugin.htmlElements.content.views.playButton.text('Preview').removeAttr('disabled');
                                                    _plugin.htmlElements.content.views.playerStateRight.text('Destination Player is prepared for previewing').addClass('state-info').removeClass('state-transfer state-warning');
                                                    _plugin.data.previewSettings.isPreviewing = false;
                                                    
                                                },
                                                offline: function () {
                                                    _plugin.htmlElements.content.views.playButton.text('Preview').removeAttr('disabled');
                                                    _plugin.htmlElements.content.views.playerStateRight.text(_plugin.data.previewSettings.destinationName+' Connect to server timeout, restore player unsuccessful. ').addClass('state-warning').removeClass('state-transfer state-info');
                                                    _plugin.data.previewSettings.isPreviewing = false;
                                                }
                                            });
                                        }
                                        _plugin.htmlElements.content.views.screenLeft.empty();
                                        _plugin.htmlElements.content.views.screenLeft.css('border-style', 'solid').append(
                                            _plugin.htmlElements.content.views.playerLiveViewButton,
                                            _plugin.htmlElements.content.views.playerIconLeft,
                                            _plugin.htmlElements.content.views.playerNameLeft.text(options.node.name).addClass('playername')
                                           // _plugin.htmlElements.content.views.playerStateLeft.text('State: '+options.node.state).addClass('playername'),
                                           // _plugin.htmlElements.content.views.playerVersionLeft.text('Version: '+options.node.version).addClass('playername')
                                        )
                                        _plugin.data.previewSettings.fromUpid = options.node.upid;
                                        _plugin.data.previewSettings.fromName = options.node.name;
                                        if (_plugin.data.previewSettings.toUpid != '' && _plugin.data.previewSettings.toUpid != _plugin.data.previewSettings.fromUpid && !_plugin.data.previewSettings.isPreviewing) {
                                            if (_plugin.data.previewSettings.toState == 'Offline') {
                                                _plugin.htmlElements.content.views.playButton.attr('disabled', 'disabled');
                                                _plugin.htmlElements.content.views.playerStateRight.text('Destination Player is Offline').addClass('state-warning').removeClass('state-transfer state-warninfo');
                                            } else {
                                                _plugin.htmlElements.content.views.playButton.removeAttr('disabled');
                                                _plugin.htmlElements.content.views.playerStateRight.text('Destination Player is prepared for previewing').addClass('state-info').removeClass('state-transfer state-warning');
                                            }
                                        }
                                        else {
                                            _plugin.htmlElements.content.views.playButton.attr('disabled', 'disabled');
                                            if (_plugin.data.previewSettings.toUpid == _plugin.data.previewSettings.fromUpid) {
                                                _plugin.htmlElements.content.views.playerStateRight.text('Source and Destination can not be the same player ').addClass('state-warning').removeClass('state-transfer state-info');
                                            }
                                        }
                                    }
                                },
                                {
                                    metadata: options.node,
                                    target: _plugin.htmlElements.content.views.toScreen,
                                    onDrop: function () {
                                        $('.symboltext-to').remove();
                                        options.node._htmlElement.find('.item-text').before($('<span/>').text('Destination').addClass('symboltext-to'));
                                        if (_plugin.data.previewSettings.isPreviewing) {
                                            _plugin.htmlElements.content.views.playButton.text('Stopping...').attr('disabled', 'disabled');

                                            _plugin.htmlElements.content.views.playerStateRight.text('Stopping').addClass('state-transfer').removeClass('state-info state-warning');

                                            $.insmFramework('restorePlayer', {
                                                playerId: _plugin.data.previewSettings.toUpid,
                                                success: function () {
                                                    if (options.node.state == 'Offline') {
                                                        _plugin.htmlElements.content.views.playButton.text('Preview');
                                                        _plugin.htmlElements.content.views.playerStateRight.text('Destination Player is Offline').addClass('state-warning').removeClass('state-transfer state-warninfo');
                                                        _plugin.data.previewSettings.isPreviewing = false;
                                                    } else {
                                                        _plugin.htmlElements.content.views.playButton.text('Preview').removeAttr('disabled');
                                                        _plugin.htmlElements.content.views.playerStateRight.text('Destination Player is prepared for previewing').addClass('state-info').removeClass('state-transfer state-warning');
                                                        _plugin.data.previewSettings.isPreviewing = false;
                                                    }
                                                },
                                                offline: function () {
                                                    _plugin.htmlElements.content.views.playButton.text('Preview').removeAttr('disabled');
                                                    _plugin.htmlElements.content.views.playerStateRight.text(_plugin.data.previewSettings.destinationName+' Connect to server timeout, restore player unsuccessful. ').addClass('state-warning').removeClass('state-transfer state-info');
                                                    _plugin.data.previewSettings.isPreviewing = false;
                                                }

                                            });
                                        } else {
                                            if (options.node.state == 'Offline') {
                                                _plugin.htmlElements.content.views.playButton.attr('disabled', 'disabled');
                                                _plugin.htmlElements.content.views.playerStateRight.text('Destination Player is Offline').addClass('state-warning').removeClass('state-transfer state-warninfo');
                                            } else {
                                                _plugin.htmlElements.content.views.playerStateRight.text('Destination Player is prepared for previewing').addClass('state-info').removeClass('state-transfer state-warning');              
                                            }
                                            
                                        }
                                        _plugin.htmlElements.content.views.screenRight.empty()
                                        _plugin.htmlElements.content.views.screenRight.css('border-style','solid').append(
                                            _plugin.htmlElements.content.views.playerIconRight,
                                            _plugin.htmlElements.content.views.playerNameRight.text(options.node.name).addClass('playername'),
                                            _plugin.htmlElements.content.views.playerStateRight                                      
                                        )
                                        //if (_plugin.data.previewSettings.fromUpid == '') {

                                        //    _plugin.htmlElements.content.views.playerStateRight.text('Drag and drop a player to Source').addClass('state-info').removeClass('state-transfer state-warning');
                                        //}
                                        _plugin.data.previewSettings.destinationName = options.node.name;
                                        _plugin.data.previewSettings.toUpid = options.node.upid;
                                        _plugin.data.previewSettings.toState = options.node.state;
                                        if (_plugin.data.previewSettings.fromUpid != '' && _plugin.data.previewSettings.toUpid != _plugin.data.previewSettings.fromUpid && !_plugin.data.previewSettings.isPreviewing) {
                                            if (_plugin.data.previewSettings.toState == 'Offline') {
                                                _plugin.htmlElements.content.views.playButton.attr('disabled', 'disabled');
                                                _plugin.htmlElements.content.views.playerStateRight.text('Destination Player is Offline').addClass('state-warning').removeClass('state-transfer state-warninfo');
                                            } else {
                                                _plugin.htmlElements.content.views.playButton.removeAttr('disabled');
                                                _plugin.htmlElements.content.views.playerStateRight.text('Destination Player is prepared for previewing').addClass('state-info').removeClass('state-transfer state-warning');
                                            }
                                        }
                                        else {
                                            _plugin.htmlElements.content.views.playButton.attr('disabled', 'disabled');
                                            if (_plugin.data.previewSettings.toUpid == _plugin.data.previewSettings.fromUpid) {
                                                _plugin.htmlElements.content.views.playerStateRight.text('Source and Destination can not be the same player ').addClass('state-warning').removeClass('state-info state-transfer');
                                            } 
                                        }
                                    }
                                }

                            ]
                                
                        if (options.element == '') {
                            options.node._htmlElement.insmDragDrop({
                                destinations: draggableSettings
                            })
                        }
                        else {
                            options.node._htmlElement.insmDragDrop({
                                element: options.element,
                                destinations: draggableSettings
                            })
                        }

                    }
                },
                nodeOutput: function (node) {
                            
                    if (node.upid) {
                               
                        var span = $('<span />').text(node.name);
                        _plugin.data.nodeNameLookup[node.upid] = span
                        return span;
                    }
                    else {
                        // Is a region
                        return node.name;
                    }
                },
                onSelect: function (region) {
                    _plugin.settings.region = region;
                    //$this.insm('changeRegion');
                }
            });
                        

            return $this;
        },
        resize: function() {
            var $this = $(this);
            var _plugin = $this.data('insmPlayerPreviewModule');
            if (_plugin) {
                var target = _plugin.settings.target.insmUtilities('size');
                
                var header = _plugin.htmlElements.header.insmUtilities('size', { actualSize: true });
                var totalHeight = _plugin.settings.target.height();
                var headerHeight = _plugin.htmlElements.header.outerHeight(true);
                
                var contentContainerHeight = parseInt(totalHeight - headerHeight);
                _plugin.htmlElements.content.container.css({
                    height: contentContainerHeight + 'px'
                });

                var viewsContainerMargin = _plugin.htmlElements.content.views.playerpreviewmodcontainer.outerHeight(true) - _plugin.htmlElements.content.views.playerpreviewmodcontainer.height();

                _plugin.htmlElements.content.views.playerpreviewmodcontainer.css({
                    height: parseInt(contentContainerHeight - viewsContainerMargin) + 'px'
                });
                _plugin.htmlElements.content.views.regionPicker.css({
                    height: parseInt(contentContainerHeight - viewsContainerMargin) + 'px'
                });
                var regionPicker = _plugin.htmlElements.content.views.regionPicker.insmUtilities('size', { actualSize: true });

                _plugin.htmlElements.content.views.playerpreviewmodcontainer.css({
                    width: parseInt(target.width - regionPicker.width) + 'px'
                });
                _plugin.htmlElements.content.views.regionPicker.css({
                    height: parseInt(target.height - header.height) + 'px'
                });


                _plugin.htmlElements.content.views.regionPicker.insmRegionPicker('resize');
            }

            return $this;
        },

        hasSettings: function () {
            return false;
        },
        onClose: function (options) {
            options.success();
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmPlayerPreviewModule');

            //$this.insmPlayerPreviewModule('stopSubscriptions');
            $this.data('insmPlayerPreviewModule', null).empty();

            return $this;
        },
       
       
    };

    $.fn.insmPlayerPreviewModule = function (method) {
        
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmPlayerPreviewModule');
        }
    };

})(jQuery);