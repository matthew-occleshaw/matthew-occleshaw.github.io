$(function() {

  $.get("/html/header.html", (data) => {

    $("header").html(data.replace("{{TITLE}}", document.title));
    $(`#${document.title.toLowerCase()}-navbar-button`).addClass("active");

    $(".navbar-hamburger").click(function() {
      $("#navbar-container").slideToggle(250);
      $(this).toggleClass("active");
    });
    
  });

  $("#footer").load("/html/footer.html");

});