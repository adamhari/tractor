var links = [];
var xhrList = [];
var downloading = false;

$(function () {

    var downloadButton = document.getElementById('download');

    var progressbar = $('#progressbar');

    //$('#stopdownload-icon').hide();
    $('#stopdownload-icon').css('opacity', '0');

    $("#extension_select, #delay").on('change', loseFocus);

    function loseFocus() {
        this.blur();
    };

    $('#download').button();

    $(document).tooltip({
        position: {
            my: "center bottom-10",
            at: "center top",
            using: function (position, feedback) {
                $(this).css(position);
                $("<div>")
                  .addClass("arrow")
                  .addClass(feedback.vertical)
                  .addClass(feedback.horizontal)
                  .appendTo(this);
            }
        }
        ,
        show: {
            effect: "fade",
            delay: 750,
            duration: 250,
            easing: "swing"
        }
    });

    //minimum value on min/max/delay inputs
    $('#min_size').on("change", function () {
        if ($("#min_size").val() < 0 || document.getElementById('min_size').value == "" || isNaN($('#min_size').val())) {
            $("#min_size").val("0");
        }
    });

    $('#max_size').on("change", function () {
        if ($("#max_size").val() < 0 || document.getElementById('max_size').value == "" || isNaN($('#max_size').val())) {
            $("#max_size").val("1");
        }
    });

    $("#delay").on("change", function () {
        if ($("#delay").val() < 0 || document.getElementById('delay').value == "" || isNaN($('#delay').val())) {
            $("#delay").val("0.5");
        }
    });

    //kill tooltip on form click
    $("input").on("click", function () {
        $('.ui-tooltip').hide();
    });

    //cancel button
    $('#download').click(function () {
        if (downloading) {
            window.location.reload();
        }
    });

    //empty input text on click so the select list will show
    $('input[name=extension_select]').click(function () {
        $('input[name=extension_select]').val('');
    });

    function startMessage() {
        $('#progressbar, #status_message').finish();

        $('#progressbar, #status_message').animate({
            opacity: 1
        }, 250);
    }

    function endMessage() {
        $('#progressbar, #status_message').finish();

        $('#progressbar, #status_message').animate({
            opacity: 0
        }, 2500, 'easeInOutQuart', function () {
            $('#status_message').innerHTML = "";

        });
    }

    //prepares interface for downloading
    function startDownloads() {
        downloading = true;


        //$('#download-icon').hide();
        //$('#stopdownload-icon').show();

        $('#download-icon').animate({
            opacity: 0
        }, 25, function () {
            $(this).css('z-index', '-1');
        });
        $('#stopdownload-icon').animate({
            opacity: 0.75
        }, 25, function () {
            $(this).css('z-index', '1');
        });

        $('#download').addClass('progress-bar progress-bar-striped active');
        $('body').addClass('download-background');
    }

    //resets interface once downloads finish
    function endDownloads() {
        downloading = false;


        $('#download-icon').animate({
            opacity: 0.75
        }, 25, function () {
            $(this).css('z-index', '1');
        });
        $('#stopdownload-icon').animate({
            opacity: 0
        }, 25, function () {
            $(this).css('z-index', '-1');
        });

        $('#download').removeClass('progress-bar progress-bar-striped active');
        $('body').removeClass('download-background');
    }










    function buildDownloadList(links, urlList, keyword, fileType) {
        //build list of URLs for valid downloads
        for (i = 0; i < links.length; i++) {

            var link = links[i];

            //if no keyword is specified or if it contains keyword
            if (keyword == "" || link.toUpperCase().indexOf(keyword.toUpperCase()) >= 0) {

                //if it matches the desired extension
                if (link.substring(link.length - (fileType.length + 1), link.length) == "." + fileType) {
                    urlList.push(link);
                }
                    //no extension specified
                else if (fileType == "" || fileType == "any") {
                    var extension = link.substring(link.length - (4), link.length);

                    if (extension == ".wav" || extension == ".mp3" || extension == ".rx2" || extension == ".aac" || extension == ".ogg") {
                        urlList.push(link);
                    }
                }
            }
        }
    }















    function processDownloads(urlList,includeUrl,fileType,min_size,max_size,downloaded,delay){
        //error handling
        if (urlList.length == 0) {
            document.getElementById('status_message').innerHTML = "No links match the given parameters";

            endDownloads();
            endMessage();
        }
            //download process
        else {
            startDownloads();

            document.getElementById('status_message').innerHTML = 1 + "/" + urlList.length;


            progressbar.progressbar({
                max: urlList.length,
                value: 0
            });


            //download from each URL in the list
            urlList.forEach(function (url, index) {
                xhrList[index] = new XMLHttpRequest();
                xhrList[index].open('GET', url, true);
                xhrList[index].responseType = "blob";

                xhrList[index].onreadystatechange = function (e) {

                    if (this.readyState == 4 && this.status == 200) {

                        setTimeout(function () {

                            var filename;

                            if (includeUrl) {
                                filename = url;
                            }
                            else {
                                //BUG: if extension has a slash, it will only include the text after the slash
                                filename = url.split("/").pop();
                            }

                            var blob;

                            if (fileType == "wav") {
                                blob = new Blob([xhrList[index].response], { type: "audio/wav" });
                            }
                            else if (fileType == "rx2") {
                                blob = new Blob([xhrList[index].response], { type: "audio" });
                            }
                            else if (fileType == "mp3") {
                                blob = new Blob([xhrList[index].response], { type: "audio/mpeg" });
                            }
                            else {
                                blob = new Blob([xhrList[index].response], { type: "audio" });
                            }

                            try {
                                //if the size is valid, or if size hasn't been set
                                if ((blob.size > +min_size && blob.size <= max_size) ||
                                    (min_size == 0 && max_size == 0) ||
                                    (blob.size > +min_size && max_size == 0) ||
                                    (min_size == 0 && blob.size <= max_size)) {
                                    saveAs(blob, filename);
                                }
                            }
                            catch (ex) {
                                document.getElementById('status_message').innerHTML = ex;
                                endDownloads();
                                endMessage();
                                return;
                            }




                            downloaded++;
                            document.getElementById('status_message').innerHTML = downloaded + "/" + urlList.length;

                            progressbar.progressbar("value", downloaded);

                            if (downloaded == urlList.length) {
                                document.getElementById('status_message').innerHTML = "All files have finished downloading";
                                setTimeout(function () {
                                    endDownloads();
                                    endMessage();

                                }, 1000);

                            }

                        }, (delay * index)); //wait between each download
                    }
                };

                xhrList[index].send();
            });
        }
    }














    downloadButton.addEventListener('click', function () {

        if (!downloading) {
            startMessage();

            var includeUrl = document.getElementById("include_url").checked;
            var fileSelect = document.getElementById("extension_select");
            var fileType = fileSelect.value;
            var delaySelect = document.getElementById("delay");
            var keyword = document.getElementById("keyword").value;
            var min_size = document.getElementById("min_size").value * 1000000; //convert to bytes
            var max_size = document.getElementById("max_size").value * 1000000;
            var urlList = [];
            var downloaded = 0;
            var delay;

            if (delaySelect.value == "") {      //if no delay time is input, the default is one second
                delay = 1000;
            }
            else {
                delay = document.getElementById("delay").value * 1000;
            }


            buildDownloadList(links, urlList, keyword, fileType);

            processDownloads(urlList,includeUrl,fileType,min_size,max_size,downloaded,delay);

            let b = baffle('#status_message').start();
            b.reveal(250);
        }

    }, false);

});



chrome.extension.onRequest.addListener(function (links_list) {
    links = links_list;

});



function onWindowLoad() {

    chrome.tabs.executeScript(null, {
        file: "get_links.js"
    }, function () {
        if (chrome.runtime.lastError) {
            //window.alert('There was an error injecting script : \n' + chrome.runtime.lastError.message);
        }
    });

}

window.onload = onWindowLoad;

