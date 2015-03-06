
var AddOnRightPanelTemplateInformationManager = {
    version: "0.0.1",

    options: {
        targetedTemplateFileId: null,
    },

    _create: function () {        
        contextObject_templateInfo = this;
        rootUI = this.element;
    },

    _init: function () {
        //console.log("_init.AddOnRightPanelTemplateInformationManager");
        rootUI = this.element;
        rootUI.html("<p style='display:none'>data</p>");

        var _plugin = {};
        _plugin.htmlElements = {
            content: {
                dialog: {
                    container: $("<div />").addClass("insm-info-inside-outer"),
                    content: {
                        container: $("<div class='insm-info-inside' />").attr("id", "insm-static-info-div"),
                    }
                }
            }
        };
        //Append html on root target
        rootUI.append(_plugin.htmlElements.content.dialog.container.append(_plugin.htmlElements.content.dialog.content.container));
    },
    
    // show template related information for addon manager first screen.
    showRightPanelTemplateInformation: function () {
        var templateRightSideInfo;
        var templateRightSideInfoInside;
        templateRightSideInfo = $("<div class='insm-templateinfo-middle-div' />").text('Addon Templates used :');
        $("#insm-static-info-div").append(templateRightSideInfo);
        contextObject_templateInfo.templateDataArray = $.data(document, "templateVersionInformationData");
        $.each(contextObject_templateInfo.templateDataArray, function (index, value) {
            var displayName = value.DisplayName;
            displayName = displayName.split(';');
            templateRightSideInfoInside = $("<div class='insm-info-inside'/>");
            if (value.TemplateActive == 'True') {
                templateRightSideInfoInside.append($("<p/>").text(displayName[0]).append($("<span/>").text(value.Version)));
                $("#insm-static-info-div").append(templateRightSideInfoInside);
            }
        });
    },
    
    // show message for addon manager third screen.
    showMessageInfoForSelectTemplate: function () {
        var msgInformation = $("<p/>").text("This view only shows older version of the template. If you select a version, that version's settings will be copied in. The changes will not be saved until you press 'Save'");
        $(".insm-info-inside").append(msgInformation);
    },
    
    _destroy: function () {
        rootUI.empty();
    },
};

(function ($, undefined) {
    var rootUI;
    var templateDataArray = new Array();
    $.widget("insm.AddOnsRightPanelInformation", AddOnRightPanelTemplateInformationManager);
})(jQuery);

