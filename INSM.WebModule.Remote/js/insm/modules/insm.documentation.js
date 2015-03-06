/*
* INSM Playlist Editor
* This file contain the INSM Playlist Editor function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmDocumentation(settings);
*
* File dependencies:
* jQuery 1.8.2
* jQuery UI 1.8.23
*
* Author:
* Emre ERTURK
* BitLogic AB
*/
//test
(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmDocumentation');

            if (!_plugin) {
                _plugin = {
                    htmlElements: {
                        page: {
                            container: $('<div class="page-container row-fluid"><div />'),
                            sideBar: $('<div class="page-sidebar"><div />'),
                            content: $('<div class="page-content"><div />'),
                            contentContainer: $('<div class="container-fluid">'),
                            row: $('<div class="row-fluid">')
                        },
                        fullscreen: {
                            rightColumn: $('<div />'),
                            leftColumn: $('<div />'),
                            header: $('<div />'),
                            assetManager: $('<div />'),
                            playlists: $('<div />'),
                            playlistContainer: $('<div />'),
                            playlistAddContainer: $('<div />'),
                            input: {
                                addNewButton: $('<button />'),
                                addNewInputName: $('<div />'),
                                savePlaylist: $('<button />'),
                                deletePlaylist: $('<button />')
                            },
                            controls: {
                                container: $('<div />'),
                                //addToPlaylist: $('<a />'),
                                viewSelector: $('<select />')
                            },
                            playlistsContentText: {
                                header: $('<h2 />'),
                                body: $('<span />')
                            }
                        }
                    },
                    data: {
                        fullscreenInitialized: false,
                        selectedPlaylist: {},
                        assetsInSelectedPlaylist: {},
                        currentPlaylistItems: [],
                        selectedAssetId: 0,
                        selectedAssetIndex: 0,
                        assets: {},
                        playlists: {},
                        currentPlaylist: {
                            name: '',
                            items: []
                        },
                        playlistTotalTime: 0,
                        playlistTotalItems: 0,
                        isEditing: false,
                        currentAsset: {},
                        playerUpdateListeners: [],
                        tableSearchIndex: function (asset) {
                            var searchArray = [];
                            $.merge(searchArray, asset.name.split(' '));
                            return searchArray;
                        },
                        tableHeaders: {
                            themeDefault: {
                                Name: {
                                    key: 'name'
                                },
                                'Last modified': {
                                    key: 'modificationDate'
                                }
                            }
                        }
                    },
                    subscriptions: {
                        start: function () { },
                        stop: function () { }
                    },
                    settings: $.extend({
                        apiUrl: '',
                        playlistAssetTypeValue: 'documentation',
                        applicationName: 'Documentation',
                        version: manifest.version,
                        containerCallback: function (module) {

                        },
                        show: function () { },
                        target: null,
                        previewTarget: null,
                        thumbnailTarget: null,
                        regionId: null
                    }, options)
                };
                $this.data('insmDocumentation', _plugin);

                if (!_plugin.settings.regionId) {
                    _plugin.settings.regionId = $.insmFramework('getUser').regionTree.id;
                }
            }

            return $this;
        },
        isInitialized: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmDocumentation');

            if (_plugin) {
                return true;
            }
            else {
                return false;
            }
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('insmDocumentation');

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
            var _plugin = $this.data('insmDocumentation');

            if (_plugin.data.fullscreenInitialized) {
                setTimeout(function () {
                    $this.insmSystemDetails('resize');
                }, 1);
                return $this;
            }

            _plugin.data.fullscreenInitialized = true;

            // Init HTML
            _plugin.settings.target.addClass('documentation container').fadeIn();
            if (!_plugin.settings.regionId) {
                _plugin.settings.target.append(
                    $('<div class="single-message" />').append(
                        $('<h2 />').text('Unsufficient access'),
                        $('<p />').text('Sorry, but you don\'t have permission to a region and can therefore not use the Documentation.')
                    )
                );
                return;
            }

            // Starts Rendering
            _plugin.settings.target.empty().append(
               _plugin.htmlElements.fullscreen.header.addClass('header').append(
                       $('<div />').addClass('company-logo'),
                       $('<div />').addClass('module-logo')
                   ),
                   _plugin.htmlElements.page.container.append(_plugin.htmlElements.page.sideBar, _plugin.htmlElements.page.content.append(_plugin.htmlElements.page.contentContainer))
                   );

            $this.insmDocumentation('getMenuContent');
            $this.insmDocumentation('resize');
            _plugin.htmlElements.fullscreen.assetManager.insmAssetManager('resize');

            return _plugin.settings.target;
        },
        resize: function () { },
        hasSettings: function () {
            return false;
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
        getMenuContent: function () {
            var url = 'https://212.16.187.165/Test333/AMS/?method=GetDocumentation&user=test&password=test';

            //following ajax will be sync
            $.ajax({
                //async:false,
                url: url,
                dataType: 'jsonp',
                error: function (message) {
                    $.insmNotification({
                        type: 'error',
                        text: message
                    });
                },
                success: function (data) {
                    //SetJtemplates
                    var $pageSidebar = $('.page-sidebar');
                    $pageSidebar.setTemplateURL('html/insm/modules/documentation/insm.documentation.sideBarMenu.html');
                    $pageSidebar.processTemplate(data.Result);
                    methods.handleSidebarMenu();
                }
            });
        },
        getDocumentationContent: function (sender) {
            //App.scrollTop();
            var $menuContainer = jQuery('.page-sidebar ul');
            var $pageContentFluid = $('.page-content .container-fluid');
            var $pageContentBody = $('.page-content .page-content-body');

            $menuContainer.children('li.active').removeClass('active');
            $menuContainer.children('arrow.open').removeClass('open');

            sender.parents('li').each(function () {
                sender.addClass('active');
                sender.children('a > span.arrow').addClass('open');
            });
            sender.parents('li').addClass('active');
            //App.blockUI(pageContent, false);
            $.ajax({
                url: sender.attr("data-url"),
                dataType: 'jsonp',
                success: function (data) {
                    //App.unblockUI(pageContent);
                    $pageContentFluid.setTemplateURL('html/insm/modules/documentation/insm.documentation.pageContent.html');
                    $pageContentFluid.processTemplate(data.Result);
                    methods.handlePortletTools();
                    //App.fixContentHeight(); // fix content height
                    //App.initUniform(); // initialize uniform elements
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    $pageContentFluid.html('<h4>Could not load the requested content.</h4>');
                    //App.unblockUI(pageContent);
                },
            });
        },
        handleSidebarMenu: function () {
            jQuery('.page-sidebar').on('click', 'li > a', function (e) {



                if ($(this).next().hasClass('sub-menu') == false) {
                    if ($('.btn-navbar').hasClass('collapsed') == false) {
                        $('.btn-navbar').click();
                    }
                    return;
                }


                var parent = $(this).parent().parent();
                var the = $(this);


                parent.children('li.open').children('a').children('.arrow').removeClass('open');
                parent.children('li.open').children('.sub-menu').slideUp(200);
                parent.children('li.open').removeClass('open');

                var sub = jQuery(this).next();
                var slideOffeset = -200;
                var slideSpeed = 200;

                if (sub.is(":visible")) {
                    jQuery('.arrow', jQuery(this)).removeClass("open");
                    jQuery(this).parent().removeClass("open");
                    sub.slideUp(slideSpeed, function () {
                        if ($('body').hasClass('page-sidebar-fixed') == false && $('body').hasClass('page-sidebar-closed') == false) {
                            //App.scrollTo(the, slideOffeset);
                        }
                        methods.handleSidebarAndContentHeight();
                    });
                } else {
                    jQuery('.arrow', jQuery(this)).addClass("open");
                    jQuery(this).parent().addClass("open");
                    sub.slideDown(slideSpeed, function () {
                        if ($('body').hasClass('page-sidebar-fixed') == false && $('body').hasClass('page-sidebar-closed') == false) {
                            //App.scrollTo(the, slideOffeset);
                        }
                        methods.handleSidebarAndContentHeight();
                    });
                }

                e.preventDefault();
            });

            // handle ajax links
            jQuery('.page-sidebar').on('click', ' li > a.ajaxify', function (e) {
                e.preventDefault();
                var $sender = $(this);
                methods.getDocumentationContent($sender);
            });
        },
        handleSidebarAndContentHeight: function () {
            var content = $('.page-content');
            var sidebar = $('.page-sidebar');
            var body = $('body');
            var height;

            if (body.hasClass('page-sidebar-fixed')) {
                height = _calculateFixedSidebarViewportHeight();
            } else {
                height = sidebar.height() + 20;
            }
            if (height >= content.height()) {
                content.attr('style', 'min-height:' + height + 'px !important');
            }
        },
        handlePortletTools: function () {
            var $portletTool = $('.portlet > .portlet-title > .tools > .collapse, .portlet .portlet-title > .tools > .expand');
            $portletTool.unbind();
            $portletTool.on('click', function (e) {
                e.preventDefault();
                var el = jQuery(this).closest(".portlet").children(".portlet-body");
                if (jQuery(this).hasClass("collapse")) {
                    jQuery(this).removeClass("collapse").addClass("expand");
                    el.slideUp(200);
                } else {
                    jQuery(this).removeClass("expand").addClass("collapse");
                    el.slideDown(200);
                }
            });
        }
    };
    $.fn.insmDocumentation = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.Documentation');
        }
    };

})(jQuery);