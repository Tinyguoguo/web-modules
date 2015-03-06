var AddOnTemplateInformationManager = {
    version: "0.0.1",

    options: {
        targetedTemplateFileId: null,
    },

    _create: function () {
        rootUI = this.element;
    },

    _init: function () {
        //console.log("_init.AddOnTemplateInformation");
        rootUI = this.element;
        rootUI.html("<p style='display:none'>data</p>");
        _plugin = {};
        _plugin.htmlElements = {
            content: {
                dialog: {
                    container: $("<div />").addClass("insm-infomain-div"),
                }
            }
        };
        //Append html on root target
        rootUI.append(_plugin.htmlElements.content.dialog.container);
        AddOnTemplateInformationManager._setUpInformationLabels();
    },

    //first set up template information labels only
    _setUpInformationLabels: function () {
        //console.log("set up for labels");
        templateInfo = $("<div class='insm-templateInfo-outer'/>");
        templateInfo.append($("<p/>").text('TemplateName : '));
        templateInfo.append($("<p/>").text('DisplayName :'));
        templateInfo.append($("<p/>").text('Version : '));
        templateInfo.append($("<p/>").text('FileId : '));
        templateInfo.append($("<p/>").text('Active : '));
        templateInfo.append($("<p/>").text('Hidden : '));
        templateInfo.append($("<p/>").text('Used modified version : '));
        templateInfo.append($("<p/>").text('Modified version displayName'));
        _plugin.htmlElements.content.dialog.container.append(templateInfo);
    },

    // Show template information as per file id
    //showTemplateInfo: function (targetedFileId, templateDataArray) {

    //    $(".insm-templateInfo-outer").empty();
    //    $.each(templateDataArray, function (index, value) {
    //        if (templateDataArray[index]["TemplateFileId"] === targetedFileId) {
    //            templateInfo.append($("<p/>").text('TemplateName :  ').append($("<span/>").addClass('insm-rightpanel-templateInfo').text(value.TemplateName)));
    //            templateInfo.append($("<p/>").text('DisplayName :  ' + value.DisplayName));
    //            templateInfo.append($("<p/>").text('Version :  ' + value.Version));
    //            templateInfo.append($("<p/>").text('FileId :  ' + value.TemplateFileId));
    //            templateInfo.append($("<p/>").text('Active :  ').append($("<span/>").addClass('insm-rightpanel-templateInfo').text(value.TemplateActive)));
    //            templateInfo.append($("<p/>").text('Hidden :  ').append($("<span/>").addClass('insm-rightpanel-templateInfo').text(value.TemplateHidden)));
    //            templateInfo.append($("<p/>").text('Used modified version  :  ').append($("<span/>").addClass('insm-rightpanel-templateInfo').text(value.TemplateUsedModifiedVersion)));
    //            templateInfo.append($("<p/>").text('Modified version displayName :  ' + value.TemplateModifiedVersionDisplayName));
    //        }
    //    });
    //},
    
    //Show template information as per file id
    showInfoOnSelectedTemplateItems: function (value) {
        $(".insm-templateInfo-outer").empty();
        templateInfo.append($("<p/>").text('TemplateName :  ').append($("<span/>").addClass('insm-rightpanel-templateInfo').text(value.TemplateName)));
        templateInfo.append($("<p/>").text('DisplayName :  ' + value.DisplayName));
        templateInfo.append($("<p/>").text('Version :  ' + value.Version));
        templateInfo.append($("<p/>").text('FileId :  ' + value.TemplateFileId));
        templateInfo.append($("<p/>").text('Active :  ').append($("<span/>").addClass('insm-rightpanel-templateInfo').text(value.TemplateActive)));
        templateInfo.append($("<p/>").text('Hidden :  ').append($("<span/>").addClass('insm-rightpanel-templateInfo').text(value.TemplateHidden)));
        templateInfo.append($("<p/>").text('Used modified version  :  ').append($("<span/>").addClass('insm-rightpanel-templateInfo').text(value.TemplateUsedModifiedVersion)));
        templateInfo.append($("<p/>").text('Modified version display name :  ' + value.TemplateModifiedVersionDisplayName));        
    },

    _destroy: function () {
        rootUI.empty();
    },
};

(function ($, undefined) {
    var rootUI, templateInfo, _plugin;
    $.widget("insm.AddOnsTemplateInformation", AddOnTemplateInformationManager);
})(jQuery);
