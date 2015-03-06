var volumeBar = {
    version: "0.0.1",

    options: {
        onChange:null
    },
    /*
    Description:Startup function for plugin
    Parameters:none
    Return:none
    */
    _init: function () {
     
    },
    /*
    Description:Rendering function for plugin
    Parameters:
    Return:
    */
    _create: function () {
        contextObject_volumeBar = this;
        rootUI_volumeBar = this.element;
        //rootUI_volumeBar.html("<p>data</p>")
        var _plugin;
        _plugin = {};

        _plugin.htmlElements = {
            content: {
                container: $("<div />").addClass("insm-playlist-manager-volumebar"),
                Header: $("<div />").addClass("insm-playlist-manager-header")
            }
        };
        rootUI_volumeBar
            .append(_plugin.htmlElements.content.container
                .append(_plugin.htmlElements.content.Header));

        dragableUI=_plugin.htmlElements.content.Header.draggable(
            {
                containment: "parent",
                axis: "x",
                drag: function (event, ui) {
                    var value = ui.position.left;
                    var maxvalue = _plugin.htmlElements.content.container.width() - _plugin.htmlElements.content.Header.width();
                    var volumeValue = value / maxvalue;
                    contextObject_volumeBar._trigger('onChange', event, volumeValue);
                }
            }
        );

        headerHandler = _plugin.htmlElements.content.Header;
        containerHandler = _plugin.htmlElements.content.container;
    },

    /*
    Description:Disable/Enable StatusBar
    Parameters:Flag for disable/enable statusbar
    Return:none
    */
    setStatus: function (flag) {
        if (flag) {
            dragableUI.draggable("enable");
        } else {
            dragableUI.draggable("disable");
        }
    },
    /*
    Description:Rendering function for plugin
    Parameters:set header position to zero
    Return:none
    */
    setHeaderPositiontoZero: function () {
        headerHandler.css("left", "0px");
    },
    /*
    Description:set header position to perticular value
    Parameters:Value
    Return:none
    */
    setHeaderPosition: function (value) {
        var maxvalue = containerHandler.width() - headerHandler.width();
        var leftpos = value * maxvalue;
        headerHandler.css("left", leftpos + "px");
    },

    /*
    Description:get header position 
    Parameters:Value
    Return:number
    */
    getHeaderPostion: function (value) {
        var maxvalue = containerHandler.width() - headerHandler.width();
        var leftpos = value * maxvalue;
        return leftpos;
    },

    /*
    Description:Destructor for plugin
    Parameters:none
    Return:none
    */
    _destroy: function () {
    },

};

(function ($, undefined) {
    var contextObject_volumeBar, rootUI_volumeBar;
    var headerHandler,containerHandler,dragableUI;
    $.widget("insm.volumeBar", volumeBar);
})(jQuery);