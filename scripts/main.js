$(function() {
    setActivePage();
});

function setActivePage() {
    var page_title_id;
    page_title_id = $(document).find("title").text()
    if (page_title_id == "Home") {
        $("#home-button").addClass("active");
        $("p").css("color", "red")
        console.log("Home test");
    } else if (page_title_id == "Resume") {
        $("#resume-button").addClass("active");
        $("p").css("color", "yellow")
        console.log("Resume test");
    }
}