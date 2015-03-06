/*
* INSM flipdemo
* This file contains the INSM flipdemo plugin.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmFlipDemo(settings);
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
            var _plugin = $this.data('insmFlipDemo');
                        
            if (!_plugin) {
                _plugin = {

                    settings: $.extend({
                        onPublish: function (playlist) {
                            alert('Publish ' + playlist.name);
                        },
                        onRemove: function (playlist) {
                            alert('Remove ' + playlist.name);

                        },
                        onInUse: function (playlist) {
                            alert('InUse ' + playlist.name);

                        },
                        onEdit: function (playlist) {
                            alert('Edit ' + playlist.name);
                        },
                        apiUrl: '',
                        applicationName: 'FlipDemo',
                        version: manifest.version,
                        header: true
                    }, options),
                    htmlElements: {
                        header: $('<div />'),
                        content: {
                            container: $('<div />').addClass('module-wrapper'),
                            header: {
                                container: $('<div />').addClass('sub-header'),
                                title: $('<h2 />'),
                                backButton: $('<a />').text('Back').addClass('back')
                            },
                            views: {
                                container: $('<div />').addClass('content'),
                                flipcontainer: $('<div />'),
                                textfront: $('<h2 />').text('testfront'),
                                textback: $('<h2 />').text('testback'),
                                testbutton: $('<button />').text('Click').addClass('testbutton'),
                                testbutton2: $('<button />').text('Click2').addClass('testbutton'),
                                testbutton3: $('<button />').text('Click3').addClass('testbutton'),
                                testbutton4: $('<button />').text('Click4').addClass('testbutton'),
                                testbutton5: $('<button />').text('Click5').addClass('testbutton'),
                                tableDiv: $('<div />')
                            }

                        }
                    },
                    data: {

                    },              
                };
                $this.data('insmFlipDemo', _plugin);
            }
            return $this;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmFlipDemo');
            
            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {
                _plugin.settings.target = $('<div />');
            }

            return _plugin.settings.target;
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmFlipDemo');

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            } else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview flipdemo');


            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            _plugin.settings.previewTarget.html(
                $('<h2 />').text('FlipDemo')
            );

            return _plugin.settings.previewTarget;
        },
        fullscreen: function(options) {
            var $this = $(this);
            var _plugin = $this.data('insmFlipDemo');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function() {
                    $this.insmFlipDemo('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;

            // Init HTML
            _plugin.settings.target.addClass('flipdemo').fadeIn();
            _plugin.settings.target.empty();

            if (_plugin.settings.header) {
                _plugin.settings.target.append(
                    _plugin.htmlElements.header.addClass('header').append(
                        $('<div />').addClass('company-logo'),
                        $('<div />').addClass('module-logo')
                    )
                );
            }
            var testItems= [{
                id: '43242342',
                name: 'test',
                modificationDate: '2014-11-12 12:00:00',
                modifiedBy: 'Guo',
                orientation: 'Landscape',
                resolution: '1080x1920',
                inUse: false,
                subItems: [{
                    id: 'fdggggf',
                    name: 'test',
                    modificationDate: '2014-11-08 12:10:27',
                    modifiedBy: 'Tobias',
                    orientation: 'aandscape',
                    resolution: '1920x1080',
                    inUse: false
                }, {
                    id: '34234234111111111111111',
                    name: 'test',
                    modificationDate: '2014-11-06 12:10:27',
                    modifiedBy: 'Tobias',
                    orientation: 'aandscape',
                    resolution: '1920x1080',
                    inUse: false
                }, {
                    id: 'ioiopipuptypopououoptuot',
                    name: 'test',
                    modificationDate: '2014-11-10 12:10:27',
                    modifiedBy: 'Tobias',
                    orientation: 'aandscape',
                    resolution: '1920x1080',
                    inUse: false
                }]
            }, {
                id: '4444',
                name: '78979797',
                modificationDate: '2012-11-07 14:32:59',
                modifiedBy: 'Tobias',
                orientation: 'Landscape',
                resolution: '1920x1080',
                inUse: false,
                subItems: []
            }, {
                id: 'opopopopopopop',
                name: '0påpåpåpåpå',
                modificationDate: '2011-11-08 14:32:59',
                modifiedBy: 'Guo',
                orientation: 'zzzze',
                resolution: '1920x1080',
                inUse: false,
                subItems: [{
                    id: 'fdgfffsdfaafwrwer2324234',
                    name: 'test',
                    modificationDate: '2014-11-08 12:10:27',
                    modifiedBy: 'Tobias',
                    orientation: 'aandscape',
                    resolution: '1920x1080',
                    inUse: false
                }, {
                    id: 'nmnmnmbmbmbmvmvmvmcmcmxxmxmzxmzmzmzmxmxmccvmvmvmvmvmcxx',
                    name: 'test',
                    modificationDate: '2014-11-06 12:10:27',
                    modifiedBy: 'Tobias',
                    orientation: 'aandscape',
                    resolution: '1920x1080',
                    inUse: false
                }]
            }, {
                id: '34234234ddd',
                name: 'test',
                modificationDate: '2014-11-06 12:10:27',
                modifiedBy: 'Tobias',
                orientation: 'aandscape',
                resolution: '1920x1080',
                inUse: false,
                subItems: []
            }, {
                id: 'uuuuutyutyutyutyutyutyu',
                name: 'test',
                modificationDate: '2014-11-06 12:10:27',
                modifiedBy: 'Tobias',
                orientation: 'aandscape',
                resolution: '1920x1080',
                inUse: false,
                subItems: []
            }, {
                id: '+0+0+0+0+0+0+',
                name: 'test',
                modificationDate: '2014-11-06 12:10:27',
                modifiedBy: 'Tobias',
                orientation: 'aandscape',
                resolution: '1920x1080',
                inUse: false,
                subItems: []
            }, {
                id: 'mcmcmcmcm',
                name: 'test',
                modificationDate: '2014-11-06 12:10:27',
                modifiedBy: 'Tobias',
                orientation: 'aandscape',
                resolution: '1920x1080',
                inUse: false,
                subItems: []
            }, {
                id: 'zzzzzzzzzzzzzzzzzzzz',
                name: 'test',
                modificationDate: '2014-11-06 12:10:27',
                modifiedBy: 'Tobias',
                orientation: 'aandscape',
                resolution: '1920x1080',
                inUse: false,
                subItems: []
            }, {
                id: 'zxczxczxvvzvzvcvzcvzxcvzcvzcvsdfs',
                name: 'test',
                modificationDate: '2014-11-06 12:10:27',
                modifiedBy: 'Tobias',
                orientation: 'aandscape',
                resolution: '1920x1080',
                inUse: false,
                subItems: []
            }, {
                id: 'bnbvmvmncnmnmcvxv',
                name: 'test',
                modificationDate: '2014-11-06 12:10:27',
                modifiedBy: 'Tobias',
                orientation: 'aandscape',
                resolution: '1920x1080',
                inUse: false,
                subItems: []
            }]
            _plugin.settings.target.append(
                _plugin.htmlElements.content.container.append(
                    _plugin.htmlElements.content.views.container.append(
                         _plugin.htmlElements.content.views.tableDiv.insmPlayListGrid({
                             onPublish: _plugin.settings.onPublish,
                             onRemove: _plugin.settings.onRemove,
                             onInUse: _plugin.settings.onInUse,
                             onEdit: _plugin.settings.onEdit,
                             items: testItems
                         }),
                        
                         _plugin.htmlElements.content.views.flipcontainer.insmFlip({
                             frontDiv: _plugin.htmlElements.content.views.textfront,
                             backDiv: _plugin.htmlElements.content.views.textback  
                         }
                         ),
                         _plugin.htmlElements.content.views.testbutton.click(function () {
                             testItems[7].inUse = true;
                             testItems[0].subItems[0].inUse = false;

                             _plugin.htmlElements.content.views.tableDiv.insmPlayListGrid('update', {
                                 items: testItems
                             });

                         }),
                         _plugin.htmlElements.content.views.testbutton2.click(function () {

                             testItems[7].inUse = false;
                             testItems[0].subItems[0].inUse = true;

                             _plugin.htmlElements.content.views.tableDiv.insmPlayListGrid('update', {
                                 items: testItems
                             });

                         }),
                         _plugin.htmlElements.content.views.testbutton3.click(function () {

                             _plugin.htmlElements.content.views.tableDiv.insmPlayListGrid('highLight', {
                                 item: testItems[5]
                             });

                         }),
                         _plugin.htmlElements.content.views.testbutton4.click(function () {

                             _plugin.htmlElements.content.views.tableDiv.insmPlayListGrid('highLight', {
                                 item: testItems[3]
                             });

                         }),
                         _plugin.htmlElements.content.views.testbutton5.click(function () {

                             _plugin.htmlElements.content.views.tableDiv.insmPlayListGrid('highLight', {
                             });
                         })
                    )
                )
            );            
        },
        
        resize: function() {
            var $this = $(this);
            var _plugin = $this.data('insmFlipDemo');
            if (_plugin) {
                var totalHeight = _plugin.settings.target.height();
                var headerHeight = _plugin.htmlElements.header.outerHeight(true);

                var contentContainerHeight = parseInt(totalHeight - headerHeight);
                _plugin.htmlElements.content.container.css({
                    height: contentContainerHeight + 'px'
                });

                var viewsContainerMargin = _plugin.htmlElements.content.views.container.outerHeight(true) - _plugin.htmlElements.content.views.container.height();

                _plugin.htmlElements.content.views.container.css({
                    height: parseInt(contentContainerHeight - viewsContainerMargin) + 'px'
                });

                //var height = parseInt(contentContainerHeight - viewsContainerMargin - textHeight - inputContainerMargin - _plugin.htmlElements.content.views.playerId.input.id.outerHeight(true) - _plugin.htmlElements.content.views.playerId.input.unconfiguredListTitle.outerHeight(true));

                //if (height < 50) {
                //    height = 50
                //}

               
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
            var _plugin = $this.data('insmFlipDemo');

            //$this.insmFlipDemo('stopSubscriptions');
            $this.data('insmFlipDemo', null).empty();

            return $this;
        },
       
       
    };

    $.fn.insmFlipDemo = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmFlipDemo');
        }
    };

})(jQuery);