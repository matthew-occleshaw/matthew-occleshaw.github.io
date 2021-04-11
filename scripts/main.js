$(function() {
    $("#navbar-container").load("/html/navbar.html", () => {
      $(`#${document.title.toLowerCase()}-navbar-button`).addClass("active");
    });

    $("#footer").load("/html/footer.html");

    $(".navbar-hamburger").click(function() {
        $("#navbar-container").slideToggle(250);
        $(this).toggleClass("active");
      });
});