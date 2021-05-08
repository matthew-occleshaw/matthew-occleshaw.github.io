$(function () {
  $('.navbar-hamburger').click(function () {
    $('#navbar-container').slideToggle(250);
    $(this).toggleClass('active');
  });
});
