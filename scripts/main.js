$(function() {
    $("#navbar-container").load("/html/navbar.html");

    $("#navbar-button").click(function(){
        $("#navbar-container").slideToggle("125");
      });
});