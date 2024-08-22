//  controls info
// document.addEventListener("DOMContentLoaded", function() {
//     var parentDiv = document.getElementById('configuration-controls');
//     var circle = document.getElementById('configuration-controls-info');

//     // Get the bounding box of the parent div
//     var parentRect = parentDiv.getBoundingClientRect();

//     // Get the circle's width and height
//     var circleWidth = circle.offsetWidth;

//     // Calculate the position for the circle using its center point
//     // var topPosition = circleHeight;
//     var position = (-circleWidth) + parentRect.width;

//     // Set the position of the circle
//     // circle.style.top = `${topPosition}px`;
//     circle.style.left = `${position}px`;
    
// });

// document.addEventListener("DOMContentLoaded", function() {
//     var parentDiv = document.getElementById('configuration-controls');
//     var circle = document.getElementById('configuration-controls-info');
//     var popupBox = document.getElementById('configuration-controls-popup');

//     var parentRect = parentDiv.getBoundingClientRect();
//     // Get the bounding box of the circle
//     var circleRect = circle.getBoundingClientRect();

//     // Calculate the position for the popup box (below the circle)
//     // var topPosition = circleRect.top + window.scrollY + circle.offsetHeight;
//     var topPosition = circleRect.height; 
//     var leftPosition = parentRect.width - circleRect.width;
    
//     // Set the position of the popup box
//     popupBox.style.top = `${topPosition}px`;
//     popupBox.style.left = `${leftPosition}px`;

//     // Optionally update the position dynamically on hover
//     // circle.addEventListener('mouseenter', function() {
//     //     // Recalculate position if needed
//     //     topPosition = circleRect.top + window.scrollY + circle.offsetHeight;
//     //     leftPosition = circleRect.left + window.scrollX - (popupBox.offsetWidth / 2) + (circle.offsetWidth / 2);
        
//     //     popupBox.style.top = `${topPosition}px`;
//     //     popupBox.style.left = `${leftPosition}px`;
//     // });
// });
