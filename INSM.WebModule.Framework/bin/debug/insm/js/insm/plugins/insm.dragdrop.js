/*
* INSM Asset
* This file contain the INSM DragDrop function.
*
* This file may only be used by Instoremedia AB or its customers and partners.
*
* Called by $('identifier').insmDragDrop(settings);
*
* File dependencies:
* jQuery 1.6.1
* insmNotification
*
* Authors:
* Guo Yang
*/

(function ($) {
    var methods = {
        init: function (options) {
            var $this = $(this);
            var _plugin = $this.data('insmDragDrop');
            if (!_plugin) {
                _plugin = {
                    settings: $.extend({
                        element:$this,
                        destinations:[ {
                            target: $('<div />'),
                            onDrop: function () {
                                alert("Dropped!");
                            },
                            metadata: {}
                        }]
                    }, options)               
                };

                _plugin.settings.element.attr('draggable', 'true');
                
                _plugin.settings.element.css('cursor', 'alias');
            
                jQuery.event.props.push('dataTransfer');

                    
                _plugin.settings.element.on(
                    'dragend',
                    function (e) {                      
                        $.each(_plugin.settings.destinations, function (index, destination) {

                            destination.target.unbind('drop');
                            destination.target.unbind('dragover');
                        });
                    }
                )
                _plugin.settings.element.on(
                    'dragstart',
                    function (e) {
                        e.dataTransfer.setData('Text',"");
                    $.each(_plugin.settings.destinations, function (index, destination) {
                        
                        destination.target.on(
                            'drop',
                            function (e) {
                                
                                e.preventDefault();
                                e.stopPropagation();
                                destination.onDrop(destination.metadata);
                            }
                       );
                        destination.target.on(
                            'dragover',
                             function (e) {
                                 e.preventDefault();
                                 e.stopPropagation();
                             }
                        );
                    });

                });

            }
            return $this;
        },

        destroy: function () {
            var $this = $(this);
            var _plugin = $this.data('insmDragDrop');
             _plugin.settings.target.destinations.empty();

            return $this;
        }
    };

    $.fn.insmDragDrop = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on $.insmDragDrop');
        }
    };
})(jQuery);