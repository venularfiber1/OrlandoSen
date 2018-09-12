$(document).ready(function() {

    $('#scrape').on("click", scrapeLoad);
    $('.save').on("click", saveArt);
    $('.commentBtn').on("click", shownote);
    $('#add-note').on("click", addnote);
    $("#close-note").on("click", () => {
        $("#addnote").fadeOut(300);
    });


    function scrapeLoad() {
        $.get("/scraped", () => {
            console.log("got");
        }).done(() => {
            window.location.reload();
        });
    };

    function shownote(event) {
        const id = $(this).attr("value");
        $("#addnote").fadeIn(300).css("display", "flex");
        $("#add-note").attr("value", id);

        $.get("/" + id, function(data) {
            $("#headline").text(data.headline);

            $.get("/comment/" + id, (data) => {

                console.log(data);

                if (data) {
                    $("#note-title").val(data.title);
                    $("#note-body").val(data.body);
                }
            });

        });

    }

    function addnote() {
        const id = $(this).attr("value");
        const obj = {
            title: $("#note-title").val().trim(),
            body: $("#note-body").val().trim()
        };
        $.post("/comment/" + id, obj, (data) => {
            console.log("made it");
            window.location.href = "/";
        });
    }

    function saveArt() {
        const id= $(this).attr("value");
        const saved = ($(this).data("saved"));

        $.post(`/saved/${id}`, (data) => {
            console.log("saved");

            if (saved === false) {
                window.location.href = "/saved"; 
           } else {
                window.location.href = "/";
           }
        });
    }

});