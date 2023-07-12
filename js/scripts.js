/*!
    * Start Bootstrap - Resume v6.0.1 (https://startbootstrap.com/template-overviews/resume)
    * Copyright 2013-2020 Start Bootstrap
    * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
    */
(function ($) {
    "use strict"; // Start of use strict

    // Smooth scrolling using jQuery easing
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
        if (
            location.pathname.replace(/^\//, "") ==
                this.pathname.replace(/^\//, "") &&
            location.hostname == this.hostname
        ) {
            var target = $(this.hash);
            target = target.length
                ? target
                : $("[name=" + this.hash.slice(1) + "]");
            if (target.length) {
                $("html, body").animate(
                    {
                        scrollTop: target.offset().top,
                    },
                    1000,
                    "easeInOutExpo"
                );
                return false;
            }
        }
    });

    // Closes responsive menu when a scroll trigger link is clicked
    $(".js-scroll-trigger").click(function () {
        $(".navbar-collapse").collapse("hide");
    });

    // Activate scrollspy to add active class to navbar items on scroll
    $("body").scrollspy({
        target: "#sideNav",
    });
})(jQuery); // End of use strict

// segment display mappings
const segmentMap = {
    0: [1, 1, 1, 1, 1, 1, 0],
    1: [0, 1, 1, 0, 0, 0, 0],
    2: [1, 1, 0, 1, 1, 0, 1],
    3: [1, 1, 1, 1, 0, 0, 1],
    4: [0, 1, 1, 0, 0, 1, 1],
    5: [1, 0, 1, 1, 0, 1, 1],
    6: [1, 0, 1, 1, 1, 1, 1],
    7: [1, 1, 1, 0, 0, 0, 0],
    8: [1, 1, 1, 1, 1, 1, 1],
    9: [1, 1, 1, 1, 0, 1, 1]
};

// document.addEventListener("DOMContentLoaded", function(event) { 
//     let count = 0;
//     if (localStorage.getItem('visitCount')) {
//         count = Number(localStorage.getItem('visitCount')) + 1;
//     } else {
//         count = 1;
//     }
//     localStorage.setItem('visitCount', count);
    
//     // generate SVG for the visitor count
//     let counterSVG = '';
//     const digits = count.toString().padStart(7, "0").split('');
//     digits.forEach(digit => {
//         counterSVG += generateDigitSVG(segmentMap[digit]);
//     });
//     document.getElementById('visitorCount').innerHTML = counterSVG;
// });

// function generateDigitSVG(segments) {
//     return `
//         <svg width="30" height="60" style="margin: 0 5px;">
//             <rect x="5" y="0" width="20" height="5" style="fill: ${segments[0] ? '#39ff14' : '#333'}" />
//             <rect x="25" y="5" width="5" height="20" style="fill: ${segments[1] ? '#39ff14' : '#333'}" />
//             <rect x="25" y="30" width="5" height="20" style="fill: ${segments[2] ? '#39ff14' : '#333'}" />
//             <rect x="5" y="50" width="20" height="5" style="fill: ${segments[3] ? '#39ff14' : '#333'}" />
//             <rect x="0" y="30" width="5" height="20" style="fill: ${segments[4] ? '#39ff14' : '#333'}" />
//             <rect x="0" y="5" width="5" height="20" style="fill: ${segments[5] ? '#39ff14' : '#333'}" />
//             <rect x="5" y="25" width="20" height="5" style="fill: ${segments[6] ? '#39ff14' : '#333'}" />
//         </svg>
//     `;
// }