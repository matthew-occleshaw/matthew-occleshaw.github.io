$(function() {
    $("#navbar-container").load("/html/navbar.html");

    $("#navbar-menu-button").click(function(){
        $("#navbar-container").slideToggle("125");
        /*let i = 0;
        if (i == 0) {
          i++;
        }*/
        $("#navbar-menu-button:before").css({"transform": "translateY(12px) rotate(135deg)"})
        $("#navbar-menu-button:after").css({"transform": "translateY(-12px) rotate(-135deg)"})
        $("#navbar-menu-button div").css({"transform": "scale(0)"})
      });
});

/*        #navbar-menu-button:before {
            transform: translateY(12px) rotate(135deg);
        }
        #navbar-menu-button:after {
            transform: translateY(-12px) rotate(-135deg);
        }
        #navbar-menu-button div {
            transform: scale(0);
        }
*/