var PopupForPreview = {

    options: {
    },
    /*
    Description:Startup function for plugin
    Parameters:none
    Return:none
    */
    _init: function () {
        rootUI_PopupForPreview = this.element;
        ContextObject_PopupForPreview = this;
        var strHTML = "<div class='insm-playlistmanager-previewpopup-backdrop'></div><div class='insm-playlistmanager-previewpopup-box'></div>";
        rootUI_PopupForPreview.html(strHTML);
    },
    /*
    Description:Rendering function for plugin
    Parameters:
    Return:
    */
    _create: function () {
    },
    /*
    Description:Invoke dialog for images
    Parameters:Url of images
    Return:none
    */
    invokeDialogForImages: function (url) {
        //ContextObject_PopupForPreview._init();
        
        var getscalevalue = $.data(document, "currentMediaItem");
        $('.insm-playlistmanager-previewpopup-backdrop, .insm-playlistmanager-previewpopup-box').animate({ 'opacity': '.50' }, 300, 'linear');
        $('.insm-playlistmanager-previewpopup-box').animate({ 'opacity': '1.00' }, 300, 'linear', function () {
        $('.insm-playlistmanager-previewpopup-box').css("background-image", "url(" + url + ")");
        
        if (getscalevalue == undefined) {
            $('.insm-playlistmanager-previewpopup-box').css("background-size", "contain");
        } else {
            // Media type is image then set image as per selected scalling mode 
            switch (getscalevalue[0].contentData.imageScalling) {
                case '1':// SCALE TO FIT
                    $('.insm-playlistmanager-previewpopup-box').removeClass('insm-thumbnail-strech');
                    $('.insm-playlistmanager-previewpopup-box').removeClass('insm-thumbnail-fillancrop');
                    $('.insm-playlistmanager-previewpopup-box').addClass('insm-thumbnail-scaletofit');
                    break;
                case '2': // STRECH
                    $('.insm-playlistmanager-previewpopup-box').removeClass('insm-thumbnail-fillancrop');
                    $('.insm-playlistmanager-previewpopup-box').removeClass('insm-thumbnail-scaletofit');
                    $('.insm-playlistmanager-previewpopup-box').addClass('insm-thumbnail-strech');
                    break;
                case '3':// FILL AND CROP
                    $('.insm-playlistmanager-previewpopup-box').removeClass('insm-thumbnail-strech');
                    $('.insm-playlistmanager-previewpopup-box').removeClass('insm-thumbnail-scaletofit');
                    $('.insm-playlistmanager-previewpopup-box').addClass('insm-thumbnail-fillancrop');
                    break;
                default:
                    // If Media type is other than image then set background size default-contain
                    $('.insm-playlistmanager-previewpopup-box').css("background-size", "contain");
            }
        }

        });
        
        $('.insm-playlistmanager-previewpopup-backdrop').css('display', 'block');
        $('.insm-playlistmanager-previewpopup-box').css("display", "flex");

        $('.insm-playlistmanager-previewpopup-backdrop').click(function () {
            $('.insm-playlistmanager-previewpopup-backdrop, .insm-playlistmanager-previewpopup-box').animate({ 'opacity': '0' }, 300, 'linear', function () {
                $('.insm-playlistmanager-previewpopup-backdrop, .insm-playlistmanager-previewpopup-box').css('display', 'none');
                ContextObject_PopupForPreview._destroy();
            });
        });
    },
    /*
    Description:Invoke dialog for Audio
    Parameters:Url of Audio
    Return:none
    */
    invokeDialogForAudio: function (url) {
        ContextObject_PopupForPreview._init();
        audioHandler = $("<audio />");
        sliderHandler = $("<div />").addClass("insm-playlistmanager-previewpopup-controller-common");
        controllerHandler = $("<div />").addClass("insm-playlistmanager-previewpopup-controller-common");

        

        $('.insm-playlistmanager-previewpopup-backdrop, .insm-playlistmanager-previewpopup-box').animate({ 'opacity': '.50' }, 300, 'linear');
        $('.insm-playlistmanager-previewpopup-box').animate({ 'opacity': '1.00' }, 300, 'linear', function () {

            $('.insm-playlistmanager-previewpopup-box').append(audioHandler);
            $('.insm-playlistmanager-previewpopup-box').append(sliderHandler);
            $('.insm-playlistmanager-previewpopup-box').append(controllerHandler);

            $('.insm-playlistmanager-previewpopup-box').css("background-color", "black");
            $(".insm-playlistmanager-previewpopup-controller-common").css("display", "none");

            var playpause = $("<div>").addClass('insm-playlistmanager-previewpopup-controller-button insm-playlistmanager-previewpopup-controller-pause-button');
            var stop = $("<div>").addClass('insm-playlistmanager-previewpopup-controller-button insm-playlistmanager-previewpopup-controller-stop-button');
            var playstat = true;
            controllerHandler.append(playpause);
            controllerHandler.append(stop);

            audioHandler.attr("src", url);
            audioHandler.get(0).load();
            audioHandler.get(0).onloadeddata = function () {
                audioHandler.get(0).play();

                sliderHandler.insmSlider({
                    minvalue: 0,
                    maxvalue: 1000,
                    onChange: function (e, position) {
                        console.log(position);
                    },
                    onEnd: function () {
                        clearTimeout(id);
                    }
                });

                $('.insm-playlist-manager-slider-container').removeClass("insm-playlist-manager-slider-container").addClass('insm-playlist-manager-slider-container-preivewPopup');
            };

            stop.on("click", function () {
                audioHandler.get(0).currentTime = 0;
                playstat = false;
                playpause.removeClass("insm-playlistmanager-previewpopup-controller-pause-button");
                playpause.addClass("insm-playlistmanager-previewpopup-controller-playbutton");
                audioHandler.get(0).pause();
            });

            playpause.on("click", function () {
                if (playstat) {
                    playstat = false;
                    playpause.removeClass("insm-playlistmanager-previewpopup-controller-pause-button");
                    playpause.addClass("insm-playlistmanager-previewpopup-controller-playbutton");
                    audioHandler.get(0).pause();
                } else {
                    playstat = true;
                    playpause.removeClass("insm-playlistmanager-previewpopup-controller-playbutton");
                    playpause.addClass("insm-playlistmanager-previewpopup-controller-pause-button");
                    audioHandler.get(0).play();
                }
            });

        });
        $('.insm-playlistmanager-previewpopup-backdrop').css('display', 'block');
        $('.insm-playlistmanager-previewpopup-box').css("display", "flex");

        $('.insm-playlistmanager-previewpopup-backdrop').click(function () {
            $('.insm-playlistmanager-previewpopup-backdrop, .insm-playlistmanager-previewpopup-box').animate({ 'opacity': '0' }, 300, 'linear', function () {
                $('.insm-playlistmanager-previewpopup-backdrop, .insm-playlistmanager-previewpopup-box').css('display', 'none');
                ContextObject_PopupForPreview._destroy();
            });
        });
    },

    /*
    Description:Invoke dialog for Video
    Parameters:Url of Video
    Return:none
    */
    invokeDialogForVideo: function (url) {
        ContextObject_PopupForPreview._init();
        videoHandler = $("<video />").addClass("insm-playlistmanager-previewpopup-videoUI");
        sliderHandler = $("<div />").addClass("insm-playlistmanager-previewpopup-controller-common");
        controllerHandler = $("<div />").addClass("insm-playlistmanager-previewpopup-controller-common");
        //        console.log($(document).height(), $(document).width())
        $('.insm-playlistmanager-previewpopup-backdrop, .insm-playlistmanager-previewpopup-box').animate({ 'opacity': '.50' }, 300, 'linear');
        $('.insm-playlistmanager-previewpopup-box').animate({ 'opacity': '1.00' }, 300, 'linear', function () {

            $('.insm-playlistmanager-previewpopup-box').append(videoHandler);
            $('.insm-playlistmanager-previewpopup-box').append(sliderHandler);
            $('.insm-playlistmanager-previewpopup-box').append(controllerHandler);


            var playpause = $("<div/>").addClass('insm-playlistmanager-previewpopup-controller-button insm-playlistmanager-previewpopup-controller-pause-button');
            var stop = $("<div/>").addClass('insm-playlistmanager-previewpopup-controller-button insm-playlistmanager-previewpopup-controller-stop-button');
            var timerdata = $("<span/>");
            var playstat = true;
            controllerHandler.append(playpause);
            controllerHandler.append(stop);
            controllerHandler.append(timerdata);

            videoHandler.attr("src", url);
            videoHandler.get(0).load();

            videoHandler.get(0).ontimeupdate = function (e) {
                try {
                    playdata = {
                        current: contextObjectPreview._convertSecondsInTotalDuration(videoHandler.get(0).currentTime),
                        currentforslider: videoHandler.get(0).currentTime
                    };
                    //console.log(playdata.currentforslider);
                    sliderHandler.insmSlider('setHeaderPosition', playdata.currentforslider);
                    timerdata.text("" + playdata.current + "/" + playdatatotal.total + "");
                } catch (e) {
                    console.log("Here");
                }
            }


            videoHandler.get(0).onloadeddata = function () {
                videoHandler.get(0).play();

                playdatatotal = {
                    total: contextObjectPreview._convertSecondsInTotalDuration(videoHandler.get(0).duration),
                    totalforslider: videoHandler.get(0).duration
                };

                sliderHandler.insmSlider({
                    minvalue: 0,
                    maxvalue: playdatatotal.totalforslider,
                    onChange: function (e, position) {
                        console.log(position);
                    },
                    onEnd: function () {
                        clearTimeout(id);
                    }
                });

                $('.insm-playlist-manager-slider-container').removeClass("insm-playlist-manager-slider-container").addClass('insm-playlist-manager-slider-container-preivewPopup');
                $(".insm-playlist-manager-slider-container-preivewPopup").css("background-size", "110% 2px");
            };

            stop.on("click", function () {
                videoHandler.get(0).currentTime = 0;
                playstat = false;
                playpause.removeClass("insm-playlistmanager-previewpopup-controller-pause-button");
                playpause.addClass("insm-playlistmanager-previewpopup-controller-playbutton");
                videoHandler.get(0).pause();
            });

            playpause.on("click", function () {
                if (playstat) {
                    playstat = false;
                    playpause.removeClass("insm-playlistmanager-previewpopup-controller-pause-button");
                    playpause.addClass("insm-playlistmanager-previewpopup-controller-playbutton");
                    videoHandler.get(0).pause();
                } else {
                    playstat = true;
                    playpause.removeClass("insm-playlistmanager-previewpopup-controller-playbutton");
                    playpause.addClass("insm-playlistmanager-previewpopup-controller-pause-button");
                    videoHandler.get(0).play();
                }

            });
        });
        $('.insm-playlistmanager-previewpopup-backdrop').css('display', 'block');
        $('.insm-playlistmanager-previewpopup-box').css("display", "flex");

        $('.insm-playlistmanager-previewpopup-backdrop').click(function () {
            $('.insm-playlistmanager-previewpopup-backdrop, .insm-playlistmanager-previewpopup-box').animate({ 'opacity': '0' }, 300, 'linear', function () {
                $('.insm-playlistmanager-previewpopup-backdrop, .insm-playlistmanager-previewpopup-box').css('display', 'none');
                ContextObject_PopupForPreview._destroy();
            });
        });
    },

    /*
    Description:Destructor for plugin
    Parameters:
    Return:
    */
    _destroy: function () {
        rootUI_PopupForPreview.empty();
    },

    //Convert second in perticular format
    _convertSecondsInTotalDuration: function (timeInSeconds) {
        var sec_num = parseInt(timeInSeconds, 10);
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }

        var totalDurationTime = minutes + ':' + seconds;
        return totalDurationTime;
    },
};

(function ($, undefiend) {
    var rootUI_PopupForPreview, ContextObject_PopupForPreview;
    var videoHandler, audioHandler, sliderHandler, controllerHandler,playdatatotal, playdata;
    $.widget("insm.PopupForPreview", PopupForPreview);
})(jQuery);