// import { FileSaver } from 'file-saver';
// import JSZip from 'jszip'

// when page is too small activate the responsive nav menu
// function openResponsive() {
//   var x = document.getElementById("mainNav");
//   if (x.className === "nav-link") {
//     x.className += " responsive";
//   } else {
//     x.className = "nav-link";
//   }
// }

$(function() {
  $('#submit-form').click(function() {
      const configForm = document.getElementById("configuration")
      const downloadBtn = document.getElementById("exec-get-results")
      var form_data = new FormData($('#configuration')[0]);
      
      configForm.querySelector('.loader-container').style.display = 'block';
      $.ajax({
          type: 'POST',
          url: '/morpher',
          data: form_data,
          contentType: false,
          cache: false,
          processData: false,
          success: function() {
            downloadBtn.style.display = "inline";
            const myForm = new FormData(configForm);
            let temp = document.getElementById("temp-output")
            temp.innerText = "---" + "\n"
            for (const [name, value] of myForm) {
              temp.innerText += name + ":" + value + "\n"
            };
            configForm.querySelector('.loader-container').style.display = 'none';
          },
      });
  });
});

function Download() {
  var zip_file_path = "../ssps.jpg"
  var zip_file_name = "s_d.jpg"
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = zip_file_path;
  a.download = zip_file_name;
  a.click();
  document.body.removeChild(a);
}

// TYPEWRITER STUFF
var text = $('.typewriter').text();
var length = text.length;
var timeOut;
var character = 0;

(function typeWriter() {
  timeOut = setTimeout(function () {
    character++;
    var type = text.substring(0, character);
    $('.typewriter').text(type);
    typeWriter();

    if (character == length) {
      clearTimeout(timeOut);
    }

  }, 150);
}());


// RANGE SLIDER STUFF
function getVals(){
  // Get slider values
  var parent = this.parentNode;
  var slides = parent.getElementsByTagName("input");
    var slide1 = parseFloat( slides[0].value );
    var slide2 = parseFloat( slides[1].value );
  // Neither slider will clip the other, so make sure we determine which is larger
  if( slide1 > slide2 ){ var tmp = slide2; slide2 = slide1; slide1 = tmp; }
  
  var displayElement = parent.getElementsByClassName("rangeValues")[0];
      displayElement.innerHTML = slide1 + " - " + slide2;
  
  var hiddenRange = document.getElementById("hidden-baseline-range");
      hiddenRange.value = slide1 + "," + slide2;
  
}

window.onload = function(){
  // Initialize Sliders
  var sliderSections = document.getElementsByClassName("two-val-range-slider");
      for( var x = 0; x < sliderSections.length; x++ ){
        var sliders = sliderSections[x].getElementsByTagName("input");
        for( var y = 0; y < sliders.length; y++ ){
          if( sliders[y].type ==="range" ){
            let slider_vals = getVals
            sliders[y].oninput = slider_vals;
            // Manually trigger event first time to display values
            sliders[y].oninput();
            
          }
        }
      }
}

// DISABLE RANGE SLIDER ON USE-EPW BOX CHECK
function checkBox(chkb) {
  disableSlider(chkb)
  hideSliderText(chkb)

}

function disableSlider(chkb) {
  var divs = document.getElementsByClassName('baseline-slider');
  for( var x = 0; x < divs.length; x++ ){
    let div = divs[x]
    div.disabled = chkb.checked;
    var chl = div.children;
    for(var i=0; i< chl.length; i++)
      {
      chl[i].disabled = chkb.checked;
      }
  }
 }

function hideSliderText(chkb) {
  var div = document.getElementById('baseline-period');
  
  if ( chkb.checked ) {
    div.style.color = 'white'
  } else {
    div.style.color = 'black'
  }
 }