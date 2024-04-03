// Function to load additional form elements based on the selected technology
function loadAdditionalForm() {
    var technology = document.getElementById('pvTechnology').value;

    // Make an AJAX request to fetch technology-specific form data
    // Update the form elements and technology details based on the retrieved data
    $.get('/get_form_data/' + technology, function(data) {
        updateFormElements(data);
        updateTechnologyDetails(data, technology);
    });
}

// Function to update form elements based on the retrieved data
function updateFormElements(technologyData) {
    var additionalFormContainerOptions = document.getElementById('additionalFormContainerOptions');
    additionalFormContainerOptions.innerHTML = ''; // Clear existing form elements

    // Loop through the layers and options for the selected technology
    for (var layer in technologyData) {
        if (technologyData.hasOwnProperty(layer)) {
            var options = technologyData[layer]['Options'];

            // Always create input elements, regardless of the number of options
            // Create a label for the layer
            var label = document.createElement('label');
            label.innerHTML = layer + ':';
            additionalFormContainerOptions.appendChild(label);

            // Create a select element for the layer options
            var select = document.createElement('select');
            select.name = layer;

            // Populate options for the select element
            for (var i = 0; i < options.length; i++) {
                var option = document.createElement('option');
                option.value = options[i];
                option.text = options[i];
                select.appendChild(option);
            }

            // Append the select element to the form
            additionalFormContainerOptions.appendChild(select);
            
            // Add line break for better formatting
            additionalFormContainerOptions.appendChild(document.createElement('br'));
        }
    }
}

// Function to update technology details in a specified div
function updateTechnologyDetails(technologyData, technology) {
    var technologyDetailsContainer = document.getElementById('technologyDetails');
    technologyDetailsContainer.innerHTML = ''; // Clear existing details

    // Create a header for the technology details
    var header = document.createElement('h3');
    header.innerHTML = 'Technology Details for ' + technology;
    technologyDetailsContainer.appendChild(header);

    // Create a list to store the selected options
    var selectedOptions = {};

    // Loop through the layers and options for the selected technology
    for (var layer in technologyData) {
        if (technologyData.hasOwnProperty(layer)) {
            var options = technologyData[layer]['Options'];

            // Check if the layer has more than one option
            // if (options.length > 1) {
                // If more than one option, display selected option
            var selectedInput = document.querySelector('select[name="' + layer + '"]');
            var selectedOption = options[selectedInput.selectedIndex];
            selectedOptions[layer] = selectedOption;
            // } else {
                // If only one option, include it in the selected options
                // selectedOptions[layer] = options[0];
            // }
        }
    }

    // Create a paragraph element to display the selected options
    var paragraph = document.createElement('p');
    paragraph.innerHTML = JSON.stringify(selectedOptions); // Convert to JSON string
    technologyDetailsContainer.appendChild(paragraph);

    // Send selected data as a POST request to generate_chart route
    $.ajax({
        type: 'POST',
        url: '/generate_chart',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(selectedOptions),
        success: function(chartData) {
            // Handle the chart data if needed
            console.log(chartData);
        },
        error: function(error) {
            console.error('Error:', error);
        }
    });
}

// Initial call to load form elements for the default technology (Monocrystalline)
$(document).ready(function() {
    loadAdditionalForm();
});