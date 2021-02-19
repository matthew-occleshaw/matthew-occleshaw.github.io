$(function() {
    $("#navbar-container").load("/html/navbar.html");
    $("#footer").load("/html/footer.html");

    $(".navbar-menu-button").click(function(){
        $("#navbar-container").slideToggle(250)
        $(this).toggleClass("active")
      });
});