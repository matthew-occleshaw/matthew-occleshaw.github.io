$(function() {
    $("#navbar-container").load("/html/navbar.html");

    $("#navbar-menu-button").click(function(){
        $("#navbar-container").slideToggle("125");
      });

    console.log("test")
});