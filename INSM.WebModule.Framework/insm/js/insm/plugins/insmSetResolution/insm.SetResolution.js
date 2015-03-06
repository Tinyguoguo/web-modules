/// <reference path="../../js/insm/framework/utility/insmEnums.js" />
var contextObject_preview, rootUI_preview;
var SetResolutionUIManager = {
    version: "0.0.1",
    //Declare option value and events
    options: {
      
    },

    // Initilization of plugin
    _init: function () {
        alert("in func");
        contextObject_preview = this;
        rootUI_preview = this.element;
       
        var resolutionValues = $.data(document, "resolutionInfo");
        console.log(resolutionValues);
        

    },

   

    //Create this plugin
    _create: function () {
        contextObject_preview = this;
        rootUI_preview = this.element;
    },

    // Destroy this plugin by empty the target root 
    _destroy: function () {
        rootUI_preview.empty();
    },

  
};

(function ($, undefined) {
    $.widget("insm.SetResolution", SetResolutionUIManager);
})(jQuery);