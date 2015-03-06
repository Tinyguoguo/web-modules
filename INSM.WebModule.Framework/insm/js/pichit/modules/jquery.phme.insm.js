/*
* Cygate Pichit
* This file contains the Cygate Pichit plugin. 
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').cygatePichit(options);
*
* Author:
* Tobias Rahm
* Instoremedia AB
*/

(function ($) {
    var methods = {
        init: function(options) {
            var $this = $(this);
            var _plugin = $this.data('cygatePichit');

            var defaults = {
                community: 'pic-hit-me-image-bank',
                pageStart: 0,
                pageEnd: 20,
                margin: 5,
                imageHeight: 250,
                maxWidth: $(window).width(),
                session: '',
                downloadUrl: 'https://cycastproxy.1net4u.com/Files.aspx?apiURL=http://10.0.26.229/CyCastPOC0133/ams&format=json&filename=filename.jpg&contentDirectoryId=23&method=uploadfile&active=true&name=Testfile&username=pocadmin01&password=pocadmin01&domain=1net4u'
            };

            //Modernizr.load({
            //    both: [
            //        '//pichit.me/static/js/plugins/jquery.tagsinput.js',
            //        '//pichit.me/static/js/foundation/foundation.js',
            //        '//pichit.me/static/js/libs/underscore-min.js',
            //        '//pichit.me/static/js/libs/backbone-min.js',
            //        '//pichit.me/static/js/store/shared/main.js',
            //        '//pichit.me/static/js/libs/jquery.imagesloaded.js',
            //        '//pichit.me/static/js/store/plugins/jquery.phme.gallery.js',
            //        '//pichit.me/static/js/store/plugins/jquery.phme.categories.js',
            //        '//pichit.me/static/js/store/apps/cygate/models.js',
            //        '//pichit.me/static/js/store/apps/cygate/collections.js',
            //        '//pichit.me/static/js/store/apps/cygate/views.js'
            //    ],
            //    complete: function () {
            //        console.log("resources loaded");  
            //        defaults.session = $.urlParam('session', $this.closest('iframe').attr('src'));
            //    }
            //});

            // This method is for initialization only. Defined variables in the _plugin object can be reached in
            // other methods using "$this.data('cygatePichit')".

            if (!_plugin) {
                _plugin = {
                    settings: $.extend({}, defaults, options)
                };
                $this.data('cygatePichit', _plugin);
            }

            return $this;
        },
        getTarget: function () {
            var $this = $(this);
            var _plugin = $this.data('cygatePichit');

            // This method should be a "singleton" and return the same div element every time.
            // The purpose is for the menu to know where the visuals will be. The div should be used in the method
            // "fullscreen" below.
            
            // The code below stores the div in _plugin.settings.target and creates a new div if it's the first time
            if (_plugin.settings.target) {
                return _plugin.settings.target;
            } else {          
                var $element = $('<div />', {
                    'id': 'gallerycontainer',
                    'class': 'cf'
                });

                $element.css({
                    'padding-top': '20px',
                    'position': 'relative',
                    'display': 'none'
                });
                
                _plugin.$searchHTML = $('<div/>', {
                    'class': 'row search-plugin'
                });

                _plugin.$searchHTML.css('padding', '0  0.625em');

                _plugin.$categoriesHTML = $('<div/>', {
                    id: 'categories-plugin',
                    'class': 'row categories-plugin'
                });
                _plugin.$galleryHTML = $('<div/>', {
                    id: 'gallery-plugin',
                    'class': 'row gallery-plugin'
                });

                $element.prepend($('<div class="row cf"><a class="medium button right download-photo secondary">Get photos</a></div>'));
                $('.download-photo').on('click', function() {
                    vent.trigger('gallery:download');
                });
                $element.append(_plugin.$searchHTML);
                $element.append(_plugin.$categoriesHTML);
                $element.append(_plugin.$galleryHTML);
                _plugin.$galleryHTML.append($('<a id="backToCategories" class="back link" style="margin-left:' + _plugin.settings.margin + 'px">Back to Categories</a>'));
                
                //var contributionCollection = new Phme.Collections.Contributions();
                //_plugin.searchView = new Phme.Views.SearchMainView({
                //    el: _plugin.$searchHTML
                //});
                //_plugin.galleryView = new Phme.Views.GalleryView({ 
                //    el: _plugin.$galleryHTML,
                //    collection: contributionCollection 
                //}, _plugin.settings);
                //_plugin.categoryView = new Phme.Views.CategoryView({ 
                //    el: _plugin.$categoriesHTML,
                //}, _plugin.settings);

                //_plugin.$galleryHTML.hide();

                //vent.on('search:success', function() {
                //    _plugin.$categoriesHTML.hide();
                //    _plugin.$galleryHTML.show();
                //});

                //vent.on('categories:click', function() {
                //    _plugin.$categoriesHTML.hide();
                //    _plugin.$galleryHTML.show();
                //});

                //vent.on('download:complete', function() {
                //    $this.cygatePichit('backToStart');
                //});

                //$('.back').on('click', function() {
                //    $this.cygatePichit('backToStart');
                //});

                _plugin.settings.target = $element;
            }

            return _plugin.settings.target;
        },
        preview: function (options) {
            var $this = $(this);
            var _plugin = $this.data('cygatePichit');

            // This method should be a "singleton" and return the same div all times that will be used as a menu button.
            // The CSS uses the class names module and module-preview

            // The below code returns the div if it already existed and creates a new div with a h2 header in it.
            // It adds the CSS class names mentioned above as well as a certain class for this module ("module-template")
            // to be used for design

            // _plugin.settings.show() should be called when the users wants to view the full module. After this callback
            // method is executed the menu will call the method "fullscreen".

            if (_plugin.settings.previewTarget) {
                return _plugin.settings.previewTarget;
            } else {
                _plugin.settings.previewTarget = $('<div />');
            }

            _plugin.settings.previewTarget.addClass('module module-preview module-template');


            _plugin.settings.previewTarget.click(function () {
                _plugin.settings.show();
            });

            _plugin.settings.previewTarget.html(
                $('<h2 />').text('Pichit Gallery')
            );

            return _plugin.settings.previewTarget;
        },
        fullscreen: function(options) {
            var $this = $(this);
            var _plugin = $this.data('cygatePichit');

            // This method is executed when the full module should be shown.
            // The div in _plugin.settings.target will be added to the DOM tree and take up all space available.
            

            // The code below fades in the target div. The rest is up to you.
            _plugin.settings.target.fadeIn();

            return _plugin.settings.target;
        },
        backToStart: function() {
            var $this = $(this);
            var _plugin = $this.data('cygatePichit');

            _plugin.$galleryHTML.fadeOut('fast');
            _plugin.$categoriesHTML.fadeIn('fast');
        },
        resize: function () {
            var $this = $(this);
            var _plugin = $this.data('cygatePichit');
            if (_plugin) {

            }

            return $this;
        },
        hasSettings: function () {
            return false;
        },
        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('cygatePichit');

            // This method is for clean up. Make sure intervals and timeouts are cleared and anything else that might still be used in the background.
            _plugin.searchView.remove();
            _plugin.galleryView.remove();
            _plugin.categoryView.remove();
            vent.undelegateEvents();

            $this.data('cygatePichit', null).empty();

            return $this;
        }
    };

    $.fn.cygatePichit = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.cygatePichit');
        }
    };

})(jQuery);