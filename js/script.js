$(document).ready(function () {
    $("#typed").typed({
        strings: ["I'm a pharmacist.", "^500I'm a computer nerd.", "^2000I'm Joel :)", "^1000I'm the techie pharmacist.^2000", ""],
        typeSpeed: 30,
        callback: function () {
            $(".typed-cursor").addClass('blinking-cursor');
        }
    });
});