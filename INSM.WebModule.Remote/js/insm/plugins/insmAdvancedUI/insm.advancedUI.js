/// <reference path="../../js/insm/framework/utility/insmEnums.js" />
/// <reference path="~/js/insm/framework/utility/insmEnums.js" />
var contextObject_advancedUI, rootUI_advancedUI;
AdvancedUIManager = {
    version: "0.0.1",
    //Declare option value and events
    options: {
        mediaId: null,
        mediaType: null,
        advancedData: null
    },

    //Create this plugin
    _create: function () {
        contextObject_advancedUI = this;
        rootUI_advancedUI = this.element;
    },
    
    // Initilization of plugin
    _init: function () {
        contextObject_advancedUI = this;
        rootUI_advancedUI = this.element;
        $(rootUI_advancedUI).empty();
        this._setAdvancedHtmlByMediaType();
    },

    // Set Html for side preivew and middle content
    _setAdvancedHtmlByMediaType: function () {
        //html for content
        var _plugin = {};

        _plugin.htmlElements = {
            title: {
                container: $('<div/>')
            },
            imageContent: {
                title: $('<div/>').text("Background color").addClass('marginTop marginBottom'),
                colorPicker: $('<span/>').attr('id', 'imageBGColorPicker')
            },
            movieContent: {
                playerOption: {
                    container: $('<div/>'),
                    title: $('<div/>').text("Movie Player"),
                    select: $('<select/>').attr('id', 'moviePlayerOption').addClass('Select marginTop'),
                },
                colorContainer: {
                    title: $('<div/>').text("Background color").addClass('marginTop marginBottom'),
                    colorPicker: $('<span/>').attr('id', 'movieBGColorPicker')
                },
                memoryContainer: {
                    memoryContainer: {
                        container: $('<div/>').addClass('marginTop'),
                        title: $('<span/>').text("Unloads and clears up memory after each play(Use when memory is an issue)").addClass('marginLeft'),
                        input: $('<input type="checkbox">').attr('id', 'movieMemoryCheck'),
                    }
                }
            },
            flashContent: {
                memoryContainer: {
                    container: $('<div/>').addClass('marginTop'),
                    title: $('<span/>').text("Unloads after each play(recommended)").addClass('marginLeft'),
                    input: $('<input type="checkbox">').attr('id', 'flashMemoryCheck'),
                }
            },
            informationContent: {
                fontScale: {
                    title: $('<div/>').text("Font Scale").addClass('marginTop'),
                    input: $('<input/>').attr('id', 'setInfoFontScale').attr('name', 'value').addClass('insm-spinner-input')
                },
                marginScale: {
                    title: $('<div/>').text("Margin Scale").addClass('marginTop'),
                    input: $('<input />').attr('id', 'setInfoMarginScale').attr('name', 'value').addClass('insm-spinner-input')
                },
            },
            newsFeedContent: {
                username: {
                    title: $('<div/>').text("Username").addClass('marginTop'),
                    input: $('<input type="text"/>').attr('id', 'uName')
                },
                password: {
                    title: $('<div/>').text("Password").addClass('marginTop'),
                    input: $('<input type="text"/>').attr('id', 'uPwd')
                },
                fontScale: {
                    title: $('<div/>').text("Font Scale").addClass('marginTop'),
                    input: $('<input/>').attr('id', 'setNSFontScale').attr('name', 'value').addClass('insm-spinner-input')
                },
                marginScale: {
                    title: $('<div/>').text("Margin Scale").addClass('marginTop'),
                    input: $('<input />').attr('id', 'setNSMarginScale').attr('name', 'value').addClass('insm-spinner-input')
                },
                maxNoOfItems: {
                    title: $('<div/>').text("Max number pf items").addClass('marginTop'),
                    input: $('<input />').attr('id', 'setNSMaxNoItems').attr('name', 'value').addClass('insm-spinner-input')
                },
                noRssFeed: {
                    title: $('<div/>').text("Text shown when no rss feed").addClass('marginTop'),
                    input: $('<input type="text"/>').attr('id', 'noRssFeed')
                },
            },
        };


        //render content html by media type
        switch (contextObject_advancedUI.options.mediaType) {
            case Menutype.IMAGE:
                //set image content html
                rootUI_advancedUI.append(_plugin.htmlElements.imageContent.title).append(_plugin.htmlElements.imageContent.colorPicker);
                //set image backgorund color advanced data
                _plugin.htmlElements.imageContent.colorPicker.colorPicker({ selectedcolor: $.data(document, "currentMediaItem")[0].advancedData.imageBgColor, currentColorValue: $.data(document, "currentMediaItem")[0].advancedData.imageBgColor });

                break;
            case Menutype.MOVIE:
                //set movie content html
                rootUI_advancedUI.append(_plugin.htmlElements.movieContent.playerOption.title)
                    .append(_plugin.htmlElements.movieContent.playerOption.select)
                    .append(_plugin.htmlElements.movieContent.colorContainer.title)
                    .append(_plugin.htmlElements.movieContent.colorContainer.colorPicker)
                    .append(_plugin.htmlElements.movieContent.memoryContainer.memoryContainer.container
                                        .append(_plugin.htmlElements.movieContent.memoryContainer.memoryContainer.input)
                                        .append(_plugin.htmlElements.movieContent.memoryContainer.memoryContainer.title));
                //set movie BG advanced data
                _plugin.htmlElements.movieContent.colorContainer.colorPicker.colorPicker({ selectedcolor: $.data(document, "currentMediaItem")[0].advancedData.movieBgColor, currentColorValue: $.data(document, "currentMediaItem")[0].advancedData.movieBgColor });
                _plugin.htmlElements.movieContent.memoryContainer.memoryContainer.input.attr('checked', $.data(document, "currentMediaItem")[0].advancedData.movieMemoryClear);
                if ($.data(document, "moviePlayerOptions") != undefined) {
                    for (var i = 0; i < $.data(document, "moviePlayerOptions").length; i++) {
                        var op = '<option>' + $.data(document, "moviePlayerOptions")[i].name;
                        _plugin.htmlElements.movieContent.playerOption.select.append(op);
                    }
                }
             
                break;
            case Menutype.FLASH:
                //set flash content html
                rootUI_advancedUI.append(_plugin.htmlElements.flashContent.memoryContainer.container
                    .append(_plugin.htmlElements.flashContent.memoryContainer.input)
                    .append(_plugin.htmlElements.flashContent.memoryContainer.title));
                //set flash advanced data
                _plugin.htmlElements.flashContent.memoryContainer.input.attr('checked', $.data(document, "currentMediaItem")[0].advancedData.flashMemoryClear);

                break;
            case Menutype.INFORMATION:
                //set information content html
                rootUI_advancedUI.append(_plugin.htmlElements.informationContent.fontScale.title)
                    .append(_plugin.htmlElements.informationContent.fontScale.input)
                    .append(_plugin.htmlElements.informationContent.marginScale.title)
                    .append(_plugin.htmlElements.informationContent.marginScale.input);

                //set flash advanced data

                var id = setTimeout(function () {
                    clearTimeout(id);
                    _plugin.htmlElements.informationContent.fontScale.input.val($.data(document, "currentMediaItem")[0].advancedData.fontScale);
                    _plugin.htmlElements.informationContent.marginScale.input.val($.data(document, "currentMediaItem")[0].advancedData.marginScale);
                }, 500);

                break;
            case Menutype.NEWS_FEED:
                //set news feed content html
                rootUI_advancedUI.append(_plugin.htmlElements.newsFeedContent.username.title)
                   .append(_plugin.htmlElements.newsFeedContent.username.input)
                   .append(_plugin.htmlElements.newsFeedContent.password.title)
                   .append(_plugin.htmlElements.newsFeedContent.password.input)
                   .append(_plugin.htmlElements.newsFeedContent.fontScale.title)
                       .append(_plugin.htmlElements.newsFeedContent.fontScale.input)
                       .append(_plugin.htmlElements.newsFeedContent.marginScale.title)
                       .append(_plugin.htmlElements.newsFeedContent.marginScale.input)
                   .append(_plugin.htmlElements.newsFeedContent.maxNoOfItems.title)
                       .append(_plugin.htmlElements.newsFeedContent.maxNoOfItems.input)
                   .append(_plugin.htmlElements.newsFeedContent.noRssFeed.title)
                   .append(_plugin.htmlElements.newsFeedContent.noRssFeed.input);

                //set flash advanced data
                _plugin.htmlElements.newsFeedContent.username.input.val($.data(document, "currentMediaItem")[0].advancedData.username);
                _plugin.htmlElements.newsFeedContent.password.input.val($.data(document, "currentMediaItem")[0].advancedData.password);
                var id = setTimeout(function () {
                    clearTimeout(id);
                    _plugin.htmlElements.newsFeedContent.fontScale.input.val($.data(document, "currentMediaItem")[0].advancedData.fontScale);
                    _plugin.htmlElements.newsFeedContent.marginScale.input.val($.data(document, "currentMediaItem")[0].advancedData.marginScale);
                    _plugin.htmlElements.newsFeedContent.maxNoOfItems.input.val($.data(document, "currentMediaItem")[0].advancedData.maxNoOfItems);
                }, 500);
                _plugin.htmlElements.newsFeedContent.noRssFeed.input.val($.data(document, "currentMediaItem")[0].advancedData.noRss);
                break;
        }

        var fontSpinner = _plugin.htmlElements.newsFeedContent.fontScale.input;
        var marginSpinner = _plugin.htmlElements.newsFeedContent.marginScale.input;
        var noOfItemsSpinner = _plugin.htmlElements.newsFeedContent.maxNoOfItems.input;
        var fontInformationSpinner = _plugin.htmlElements.informationContent.fontScale.input;
        var marginInformationSpinner = _plugin.htmlElements.informationContent.marginScale.input;

        AdvancedUIManager._setSpinner(fontSpinner, marginSpinner, noOfItemsSpinner, fontInformationSpinner, marginInformationSpinner);
    },

    _setSpinner: function (fontSpinner, marginSpinner, noOfItemsSpinner, fontInformationSpinner, marginInformationSpinner) {
        fontSpinner.spinner();
        fontSpinner.spinner("value", 100);
        fontSpinner.spinner("option", "min", 0);
        fontSpinner.spinner("option", "max", 100);

        marginSpinner.spinner();
        marginSpinner.spinner("value", 100);
        marginSpinner.spinner("option", "min", 0);
        marginSpinner.spinner("option", "max", 100);

        noOfItemsSpinner.spinner();
        noOfItemsSpinner.spinner("value", 100);
        noOfItemsSpinner.spinner("option", "min", 0);
        noOfItemsSpinner.spinner("option", "max", 100);

        fontInformationSpinner.spinner();
        fontInformationSpinner.spinner("value", 100);
        fontInformationSpinner.spinner("option", "min", 0);
        fontInformationSpinner.spinner("option", "max", 100);

        marginInformationSpinner.spinner();
        marginInformationSpinner.spinner("value", 100);
        marginInformationSpinner.spinner("option", "min", 0);
        marginInformationSpinner.spinner("option", "max", 100);
    },

    // Destroy this plugin by empty the target root 
    _destroy: function () {
        rootUI_advancedUI.empty();
    },

};

(function ($, undefined) {
    $.widget("insm.advancedUI", AdvancedUIManager);
})(jQuery);