function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Get reference to the select element
const moduleTypeSelect = document.getElementById('moduleType');

const unitDict = {'climate change': 'kg CO2-Eq / sqm.',
        'energy resources: non-renewable, fossil': 'MJ / sqm.',
        'ozone depletion': 'kg CFC-11-Eq / sqm.',
        'acidification: terrestrial': 'kg SO2-Eq / sqm.',
        'photochemical oxidant formation: human health': 'kg NOx-Eq / sqm.',
        'photochemical oxidant formation: terrestrial ecosystems': 'kg NOx-Eq / sqm.',
        'ecotoxicity: freshwater': 'kg 1.4-DCB-Eq / sqm.',
        'particulate matter formation': 'kg PM2.5-Eq / sqm.',
        'eutrophication: freshwater': 'kg P-Eq / sqm.',
        'eutrophication: marine': 'kg N-Eq / sqm.',
        'ionising radiation': 'kg Co-60-Eq / sqm.',
        'human toxicity: non-carcinogenic': '(HTPnc) kg 1.4-DCB-Eq',
        'human toxicity: carcinogenic': '(HTPc) kg 1.4-DCB-Eq',
        'land use': 'sqm. land / sqm.'}

var impactList = ["climate change",
    "energy resources: non-renewable, fossil",
    "ozone depletion",
    "acidification: terrestrial",
    "photochemical oxidant formation: human health",
    "photochemical oxidant formation: terrestrial ecosystems",
    "ecotoxicity: freshwater",
    "particulate matter formation",
    "eutrophication: freshwater",
    "eutrophication: marine",
    "ionising radiation",
    "human toxicity: non-carcinogenic",
    "human toxicity: carcinogenic",
    "land use"];


function createLayerSelections(layers) {
    // Get the selected value from the dropdown
    const container = document.getElementById('layer-selects-container');
    layers.forEach(layer => {
        const layerContainer = document.createElement('div');
        layerContainer.classList.add('layer-container');

        const title = document.createElement('p');
        title.value = layer.title;
        title.textContent = capitalizeFirstLetter(layer.title).replace(/_/g, ' ');
        title.setAttribute("class", "layer-title");
        layerContainer.appendChild(title);

        const selectContainer = document.createElement('div');
        selectContainer.classList.add('select-container');

        const optionSelect = document.createElement('select');
        optionSelect.setAttribute("id", layer.title);
        optionSelect.setAttribute("class", "layer-option-select");

        Object.keys(layer.options).forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option.replace(/_/g, ' ');
            optionSelect.appendChild(optionElement);
        });
        selectContainer.appendChild(optionSelect);

        const regionSelect = document.createElement('select');
        regionSelect.setAttribute("id", "region");
        regionSelect.setAttribute("class", "layer-option-select");
        selectContainer.appendChild(regionSelect); // Initially empty, will be populated based on optionSelect

        // Event listener to update regionSelect based on selected option
        optionSelect.addEventListener('change', function () {
            regionSelect.innerHTML = ''; // Clear existing options
            layer.options[this.value].forEach(region => {
                const regionOption = document.createElement('option');
                regionOption.value = region;
                regionOption.textContent = region;
                regionSelect.appendChild(regionOption);
            });
        });

        // Trigger change event initially to populate regions for the first option
        optionSelect.dispatchEvent(new Event('change'));
        
        optionSelect.addEventListener('change', createImpactCharts)
        regionSelect.addEventListener('change', createImpactCharts)
        
        optionSelect.addEventListener('change', displayData)
        regionSelect.addEventListener('change', displayData)

        layerContainer.appendChild(selectContainer);
        container.appendChild(layerContainer);
    });
    document.getElementById("rear_cover").dispatchEvent(new Event('change'));
};

// var initialLayers = layerJson[moduleTypeSelect]
readJsonData(moduleTypeSelect.value);

function readJsonData(moduleName) {
    try {
        // const response = await fetch(filePath);
        d3.json('static/data/device_layer_data.json').then(function (data) {
            // var newLayers = data
            createLayerSelections(data[moduleName])

        })
            .catch(function (error) {
                console.error('Error loading JSON:', error);
            });
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error; // Re-throw the error to propagate it in the promise chain
    }
};

// Function to update layers selection based on type selection
function updateLayersSelection() {
    // Get the selected value from type selection
    const moduleSelect = moduleTypeSelect.value;

    // Get reference to the div
    const divToUpdate = document.getElementById('layer-selects-container');

    // Clear the existing content of the div
    divToUpdate.innerHTML = "";

    // var newLayers = layerJson[moduleTypeSelect]
    // var storedJsonData = d3.json('layer_data.json');
    readJsonData(moduleSelect)
    // createLayerSelections(newLayers)
};

// Add event listener to moduleType select element to track changes
moduleTypeSelect.addEventListener('change', updateLayersSelection);

function getActiveSelectValues() {
    // Find the container by its ID
    const selectsContainer = document.getElementById('layer-selects-container');

    // Initialize an object to store the results
    const selectResults = {};

    // Iterate through each .layer-container within the container
    selectsContainer.querySelectorAll('.layer-container').forEach(layer => {
        // Find the .layer-title and get its text content
        const title = layer.querySelector('.layer-title').value;

        // Initialize an array to store the select values for this layer
        const selectValues = [];

        // Find all select elements within the .select-container of this layer
        layer.querySelectorAll('.select-container select').forEach(select => {
            // Get the active (selected) value of the select and add it to the array
            selectValues.push(select.value);
        });

        // Store the select values array in the results object, using the title as the key
        selectResults[title] = selectValues;
    });

    // Return the results object
    return selectResults;
};

function extractImpactData(environmentalData, indicator) {
    const impactData = [];

    for (const [layer, data] of Object.entries(environmentalData)) {
        if (indicator in data) {
            const impactValue = data[indicator];
            // Now includes values that are 0
            impactData.push({ layer, value: impactValue });
        }
    }

    return impactData;
}


impactColorDict = {
    "Frame": '#8dd3c7ff',
    "Front Cover": '#ffffb3ff',
    "Cell": '#bebadaff',
    "Encapsulant": '#fb8072ff',
    "Rear Cover": '#80b1d3ff',
    "Junction Box": '#fdb462ff',
    "Mounting System": '#b3de69ff',
    "Electricity For Assembly": '#fccde5ff',
    "Wires": '#d9d9d9ff'
}

function transformDataForStackedBarChart(impactData, category) {
    // Calculate the total value across all layers
    const totalValue = impactData.reduce((acc, curr) => acc + curr.value, 0);

    // Transform each entry into the desired format
    const transformedData = impactData.map(item => {
        return {
            layer: capitalizeFirstLetter(item.layer.replace(/_/g, ' ')), // Capitalize and replace underscores with spaces
            percent: parseFloat((item.value / totalValue * 100).toFixed(2)), // Calculate the percentage and format to 2 decimal places
            category: category

        };
    });

    return transformedData;
}

// Helper function to capitalize the first letter of each word
function capitalizeFirstLetter(string) {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function createImpactChartLegend(colorDict) {
    const legendContainer = document.getElementById('impact-legends');
    legendContainer.innerHTML = ''; // Clear existing legend entries

    Object.entries(colorDict).forEach(([layer, color]) => {
        // Create a container for each legend entry
        const legendEntry = document.createElement('div');
        legendEntry.classList.add('legend-entry'); // Optional: For styling

        // Create the color box
        const colorBox = document.createElement('div');
        colorBox.style.width = '10px'; // Set width of the color box
        colorBox.style.height = '10px'; // Set height of the color box
        colorBox.style.backgroundColor = color;
        colorBox.style.display = 'inline-block'; // To align with the text
        colorBox.style.marginRight = '2px'; // Space between the color box and the text

        // Create the label
        const label = document.createElement('span');
        label.style.fontSize = "0.5em";
        label.textContent = capitalizeFirstLetter(layer.replace(/_/g, ' ')); // Format the layer name

        // Append the color box and label to the legend entry
        legendEntry.appendChild(colorBox);
        legendEntry.appendChild(label);

        // Append the legend entry to the legend container
        legendContainer.appendChild(legendEntry);
    });
}


function drawStackedBarChart(data, containerId) {
    // Specify the chart’s dimensions.
    var container = document.getElementById(containerId);
    var width = container.offsetWidth;
    var height = container.offsetHeight;

    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 40;

    // Determine the series that need to be stacked
    const series = d3.stack()
        .keys(d3.union(data.map(d => d.layer))) 
        .value(([, group], key) => group.get(key).percent)
      (d3.index(data, d => d.category, d => d.layer));

    // Prepare the scales for positional and color encodings.
    const x = d3.scaleBand()
        .domain(d3.groupSort(data, D => -d3.sum(D, d => d.percent), d => d.category))
        .range([marginLeft, width - marginRight])
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
        .rangeRound([height - marginBottom, marginTop]);

    // A function to format the value in the tooltip.
    const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("id", "stacked-bar-chart")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Append a group for each series, and a rect for each element in the series.
    svg.append("g")
        .selectAll()
        .data(series)
        .join("g")
        .attr("fill", d => impactColorDict[d.key])
        .selectAll("rect")
        .data(D => D.map(d => (d.key = D.key, d)))
        .join("rect")
        .attr("x", d => x(d.data[0]))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth()*0.5)
        .attr("transform", `translate(${x.bandwidth()*0.5},0)`)
        .append("title")
        .text(d => `${d.data[0]} ${d.key}\n${formatValue(d.data[1].get(d.key).percent)}`);
    
        // svg.append("g")
        //         .attr("text-anchor", "middle")
        //         .selectAll()
        //         .data(arcs)
        //         .join("text")
        //         .call(text => text.append("tspan")
        //             .attr("y", "-45%")
        //             .attr("x", "-1em")
        //             .attr("font-size", "8px")
        //             // .attr("font-weight", "regular")
        //             .text(category))
        //         .attr("transform", "rotate(-90)") // Rotates the title by -45 degrees;
    
    // Append the horizontal axis.
    svg.append("g")
        .attr('id', "stacked-x-axis")
        .attr('class', "xAxisStack")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSize(0));
        // .call(g => g.selectAll(".domain").remove());

    var xText = d3.select("#stacked-x-axis").selectAll('text')._groups[0]
    for (const [key, value] of Object.entries(xText)) {
        // value.style.fontWeight = 800
        // value.style.transform = 'rotate(-90deg) translate(55%, -175%)';
        value.setAttribute("id", "text-label-stack-x")
    }

    var adjustX = 0;
    var adjustY = 0;

    var isSafari = window.safari !== undefined;
    if (isSafari) {
        var adjustX = (-height / 2) * 1.15;
        var adjustY = -25;
    }

    // Append the vertical axis.
    svg.append("g")
        .attr('class', "yAxisStack")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(null, "s"))
        // .call(g => g.selectAll(".domain").remove())
        .call(g => g.append("text")
            .attr("id", "yAxisLabel")
            .attr("x", adjustX)
            .attr("y", adjustY)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Percent Contribution"));

    // var yLabel = d3.select("#yAxisLabel")._groups[0][0]
    // yLabel.style.transform = 'rotate(-90deg) translate(-200%, -225%)';
    // yLabel.style.transform = 'rotate(-90deg)';

    d3.selectAll("g.yAxisStack g.tick")
        .append("line")
        .attr("class", "gridline")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width - marginRight - marginLeft)
        .attr("y2", 0)
        .attr("stroke", "#9ca5aecf") // line color
        .attr("stroke-dasharray", "4") // make it dashed;

    // svg.append("g")
    //     .

}


function createStackedBarChart() {
    var activeSelectValues = getActiveSelectValues();
    var deviceSelect = document.getElementById('moduleType');

    try {
        d3.json('static/data/device_impact_data.json').then(function (deviceData) {
            const environmentalData = {};
            var jsonData = deviceData[deviceSelect.value]
            // Iterate through each key-value pair in activeSelectValues
            for (const [key, value] of Object.entries(activeSelectValues)) {
                // Check if jsonData has the key and the subkeys from activeSelectValues
                if (jsonData[key] && jsonData[key][value[0]] && jsonData[key][value[0]][value[1]]) {
                    // Access the relevant part of jsonData using the key and the two values
                    const dataPart = jsonData[key][value[0]][value[1]];

                    // Store the accessed data in the environmentalData object
                    environmentalData[key] = dataPart;
                } else {
                    console.warn(`Data for ${key} with values ${value} not found in JSON.`);
                }
            }

            var stackedBarDataArray = []
            for (var i = 0; i < impactList.length; i++) {
                var category = impactList[i]
                var myImpactData = extractImpactData(environmentalData, category);
                var barImpactData = transformDataForStackedBarChart(myImpactData, category);

                for (const [key, value] of Object.entries(barImpactData)) {
                    stackedBarDataArray.push(value)
                }
            }
            drawStackedBarChart(stackedBarDataArray, "stacked-bar-container")
        })
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error; // Re-throw the error to propagate it in the promise chain
    }


}



function createImpactCharts() {

    // d3.select("stacked-bar-container").selectAll('svg').remove();
    d3.select("#stacked-bar-chart").remove();
    createStackedBarChart()
    createImpactChartLegend(impactColorDict);


}



////////////////////  Carbon Curve

pathLength = (path) => d3.create("svg:path").attr("d", path).node().getTotalLength()

function createLineChart(containerId, rawData, lossFactor) {
    var inputData = rawData[lossFactor.toFixed(2)]
    // const data = Object.keys(obj).map((key) => [key, obj[key]]);

    var container = document.getElementById(containerId);
    var width = container.offsetWidth;
    var height = container.offsetHeight;
    // Declare the chart dimensions and margins.
    const marginAll = 50;
    const marginTop = marginAll / 2;
    const marginRight = marginAll * 0.5;
    const marginBottom = marginAll * 1.1;
    const marginLeft = marginAll * .75;

    // Declare the positional encodings.
    const x = d3.scaleLinear()
        .domain([0, 1000]).nice()
        .range([marginLeft, width - marginRight]);

    const y = d3.scaleLinear()
        .domain([0, 2]).nice()
        .range([height - marginBottom, marginTop]);

    const curveType = d3.curveCardinal

    const line = d3.line()
        .curve(curveType)
        .x(d => x(d.Irradiance))
        .y(d => y(d.Impact));

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // create the clip
    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("y", marginTop)
        .attr("width", width - marginRight)
        .attr("height", height - marginTop);


    // Create the axes.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(width / 50))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", width)
            .attr("y", marginBottom - (0.25 * marginBottom))
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .attr("font-weight", "bold")
            .text("Annual irradiance (kWh/sqm/a) →"));

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(height / 25))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", marginTop / 2)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("↑ Device intensity (kgCO2e/kWh)"));

    // Add grid
    svg.append("g")
        .attr("class", "xAxis")
        .call(d3.axisBottom(x))
        .attr("transform", `translate(0,${height - marginBottom})`);

    d3.selectAll("g.xAxis g.tick")
        .append("line")
        .attr("class", "gridline")
        .attr("x1", 0)
        .attr("y1", -1 * (height - marginBottom - marginTop))
        .attr("x2", 0)
        .attr("y2", 0)
        .attr("stroke", "#9ca5aecf") // line color
        .attr("stroke-dasharray", "4") // make it dashed;

    svg.append("g")
        .attr("class", "yAxis")
        .call(d3.axisLeft(y))
        .attr("transform", `translate(${marginLeft},0)`);

    d3.selectAll("g.yAxis g.tick")
        .append("line")
        .attr("class", "gridline")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width - marginRight - marginLeft)
        .attr("y2", 0)
        .attr("stroke", "#9ca5aecf") // line color
        .attr("stroke-dasharray", "4") // make it dashed;

    // create the uncertainty fill
    var arrayKeys = Object.keys(inputData)
    var firstKey = arrayKeys[0]
    var lastKey = arrayKeys[arrayKeys.length - 1]
    // Find the common set of indices based on the shorter curve
    var commonIndices = d3.range(Math.min(inputData[firstKey].Irradiance.length, inputData[lastKey].Irradiance.length));

    // Create linear interpolators for both curves
    var interpolateX0 = d3.scaleLinear().domain([0, commonIndices.length - 1]).range([0, inputData[firstKey].Irradiance.length - 1]);
    var interpolateX1 = d3.scaleLinear().domain([0, commonIndices.length - 1]).range([0, inputData[lastKey].Irradiance.length - 1]);
    var interpolateY0 = d3.scaleLinear().domain([0, commonIndices.length - 1]).range([0, inputData[firstKey].Impact.length - 1]);
    var interpolateY1 = d3.scaleLinear().domain([0, commonIndices.length - 1]).range([0, inputData[lastKey].Impact.length - 1]);

    var area = d3.area()
        .x0(function (d) { return x(inputData[firstKey].Irradiance[Math.round(interpolateX0(d))]); })
        .x1(function (d) { return x(inputData[lastKey].Irradiance[Math.round(interpolateX1(d))]); })
        .y0(function (d) { return y(inputData[firstKey].Impact[Math.round(interpolateY0(d))]); })
        .y1(function (d) { return y(inputData[lastKey].Impact[Math.round(interpolateY1(d))]); });

    svg.append('path')
        .datum(commonIndices)
        // .attr('class', 'area')
        .attr('fill', '#E6AB1F')
        .attr('d', area)
        // .transition()
        // .duration(3500)
        // .ease(d3.easePoly)
        .attr("fill-opacity", 0.5)
        .attr("stroke-width", 2.5)
        .attr("stroke", "#E6AB1F")
        .attr("clip-path", "url(#clip)")
        .attr('class', "areaFill");

    var selfConsValue = [parseFloat(document.getElementById("curve-slider-self-consumption").value).toFixed(2)]
    var i = inputData[selfConsValue]
    var data = i.Impact.map((impact, index) => ({
        Impact: impact,
        Irradiance: i.Irradiance[index]
    }));
    var l = pathLength(line(data));
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("clip-path", "url(#clip)")
        .attr("stroke", "#000000")
        .attr("stroke-width", 2.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("opacity", 1)
        // .attr("-webkit-opacity", 0)
        .attr("d", line)
        .attr('class', 'setCurve');  // Assigning a class for easy selection
        // .transition()
        // .duration(5000)
        // .ease(d3.easePoly)
        // .attr("opacity", 1);
        // .attr("-webkit-opacity", 1)


    var range = (start, stop, step = 1) => {
        const length = Math.ceil((stop - start) / step);
        return Array.from({ length }, (_, i) => (i * step) + start);
    }
    var xVals = range(0, 1001)
    var gridMixVal = parseFloat(document.getElementById("curve-slider-grid-mix").value)
    // draw the grid mix line
    var gridMix = xVals.map((index) => ({
        Impact: gridMixVal,
        Irradiance: index
    }));
    svg.append('path')
        .datum(gridMix)
        .style("stroke", "black")
        .style("stroke-width", 2)
        .attr("d", line)
        .attr("class", "gridMixLine")
        .attr("opacity", 1);
        // .transition()
        // .duration(5000)
        // .ease(d3.easePoly)
        // .attr("opacity", 1);

}

async function JSONtoLineChart() {
    const lineChartArea = document.getElementById("pv-curve");
    lineChartArea.innerHTML = '';
    var deviceTypeSelect = document.getElementById('moduleType');
    var lossFactor = parseFloat([1 - parseFloat(document.getElementById("curve-slider-performance-ratio").value)]);
    try {
        // const response = await fetch(filePath);
        d3.json("static/data/static_curve_data.json").then(function (d) {
            createLineChart('pv-curve', d[deviceTypeSelect.value], lossFactor);
        })
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error; // Re-throw the error to propagate it in the promise chain
    }
}

JSONtoLineChart()

// when module type is shifted rerun
moduleTypeSelect.addEventListener('change', JSONtoLineChart);

// When Self consumption is shift move the black line
document.getElementById('curve-slider-self-consumption').addEventListener('change', function () {
    d3.json("static/data/static_curve_data.json").then(function (d) {
        var deviceTypeSelect = document.getElementById('moduleType');
        var curveData = d[deviceTypeSelect.value]

        var lossFactor = parseFloat([1 - parseFloat(document.getElementById("curve-slider-performance-ratio").value)])
        var selfConsValue = parseFloat([parseFloat(document.getElementById("curve-slider-self-consumption").value)])

        var i = curveData[lossFactor.toFixed(2)][selfConsValue.toFixed(2)]

        var data = i.Impact.map((impact, index) => ({
            Impact: impact,
            Irradiance: i.Irradiance[index]
        }));

        var carbonCurveContainer = document.getElementById('pv-curve');
        var carbonCurveContainerWidth = carbonCurveContainer.offsetWidth;
        var carbonCurveContainerHeight = carbonCurveContainer.offsetHeight;
        // Declare the chart dimensions and margins.
        const marginAll = 50;
        const marginTop = marginAll / 2;
        const marginRight = marginAll * 0.5;
        const marginBottom = marginAll * 1.1;
        const marginLeft = marginAll * .75;

        // Declare the positional encodings.
        const x = d3.scaleLinear()
            .domain([0, 1000]).nice()
            .range([marginLeft, carbonCurveContainerWidth - marginRight]);
        const y = d3.scaleLinear()
            .domain([0, 2]).nice()
            .range([carbonCurveContainerHeight - marginBottom, marginTop]);

        const curveType = d3.curveCardinal

        const line = d3.line()
            .curve(curveType)
            .x(d => x(d.Irradiance))
            .y(d => y(d.Impact));

        var l = pathLength(line(data));

        const path = d3.select('.setCurve');

        // Update the path's data and the 'd' attribute
        path.datum(data)
            .transition()
            .duration(250)
            .ease(d3.easePoly)
            .attr('d', line);
            // .attr("stroke-dasharray", `${l},${l}`);
    });
});

// When performance ratio is adjuste move the black line and the fill
document.getElementById('curve-slider-performance-ratio').addEventListener('change', function () {
    d3.json("static/data/static_curve_data.json").then(function (d) {
        var deviceTypeSelect = document.getElementById('moduleType');
        var curveData = d[deviceTypeSelect.value]

        var lossFactor = parseFloat([1 - parseFloat(document.getElementById("curve-slider-performance-ratio").value)])
        var selfConsValue = parseFloat([parseFloat(document.getElementById("curve-slider-self-consumption").value)])

        var inputData = curveData[lossFactor.toFixed(2)]
        var i = inputData[selfConsValue.toFixed(2)]

        var data = i.Impact.map((impact, index) => ({
            Impact: impact,
            Irradiance: i.Irradiance[index]
        }));

        var carbonCurveContainer = document.getElementById('pv-curve');
        var carbonCurveContainerWidth = carbonCurveContainer.offsetWidth;
        var carbonCurveContainerHeight = carbonCurveContainer.offsetHeight;
        // Declare the chart dimensions and margins.
        const marginAll = 50;
        const marginTop = marginAll / 2;
        const marginRight = marginAll * 0.5;
        const marginBottom = marginAll * 1.1;
        const marginLeft = marginAll * .75;

        // Declare the positional encodings.
        const x = d3.scaleLinear()
            .domain([0, 1000]).nice()
            .range([marginLeft, carbonCurveContainerWidth - marginRight]);
        const y = d3.scaleLinear()
            .domain([0, 2]).nice()
            .range([carbonCurveContainerHeight - marginBottom, marginTop]);

        const curveType = d3.curveCardinal
        const line = d3.line()
            .curve(curveType)
            .x(d => x(d.Irradiance))
            .y(d => y(d.Impact));

        var l = pathLength(line(data));
        const path = d3.select('.setCurve');
        // Update the path's data and the 'd' attribute
        path.datum(data)
            .transition()
            .duration(250)
            .ease(d3.easePoly)
            .attr('d', line);
            // .attr("stroke-dasharray", `${l},${l}`);

        var arrayKeys = Object.keys(inputData)
        var firstKey = arrayKeys[0]
        var lastKey = arrayKeys[arrayKeys.length - 1]
        // Find the common set of indices based on the shorter curve
        var commonIndices = d3.range(Math.min(inputData[firstKey].Irradiance.length, inputData[lastKey].Irradiance.length));

        // Create linear interpolators for both curves
        var interpolateX0 = d3.scaleLinear().domain([0, commonIndices.length - 1]).range([0, inputData[firstKey].Irradiance.length - 1]);
        var interpolateX1 = d3.scaleLinear().domain([0, commonIndices.length - 1]).range([0, inputData[lastKey].Irradiance.length - 1]);
        var interpolateY0 = d3.scaleLinear().domain([0, commonIndices.length - 1]).range([0, inputData[firstKey].Impact.length - 1]);
        var interpolateY1 = d3.scaleLinear().domain([0, commonIndices.length - 1]).range([0, inputData[lastKey].Impact.length - 1]);

        var area = d3.area()
            .x0(function (d) { return x(inputData[firstKey].Irradiance[Math.round(interpolateX0(d))]); })
            .x1(function (d) { return x(inputData[lastKey].Irradiance[Math.round(interpolateX1(d))]); })
            .y0(function (d) { return y(inputData[firstKey].Impact[Math.round(interpolateY0(d))]); })
            .y1(function (d) { return y(inputData[lastKey].Impact[Math.round(interpolateY1(d))]); });

        const areaShape = d3.select('.areaFill')
        areaShape.datum(commonIndices)
            .transition()
            .duration(250)
            .ease(d3.easePoly)
            .attr('d', area)
            .attr('fill', '#E6AB1F')
            .attr("fill-opacity", 0.5);
            

    });
});

// When Grid mix is shifted move the line
document.getElementById('curve-slider-grid-mix').addEventListener('change', function () {
    d3.json("static/data/static_curve_data.json").then(function (d) {
        var deviceTypeSelect = document.getElementById('moduleType');
        var curveData = d[deviceTypeSelect.value]

        var lossFactor = parseFloat([1 - parseFloat(document.getElementById("curve-slider-performance-ratio").value)])
        var selfConsValue = parseFloat([parseFloat(document.getElementById("curve-slider-self-consumption").value)])

        var i = curveData[lossFactor.toFixed(2)][selfConsValue.toFixed(2)]

        // var data = i.Impact.map((impact, index) => ({
        //     Impact: impact,
        //     Irradiance: i.Irradiance[index]
        // }));

        var carbonCurveContainer = document.getElementById('pv-curve');
        var carbonCurveContainerWidth = carbonCurveContainer.offsetWidth;
        var carbonCurveContainerHeight = carbonCurveContainer.offsetHeight;
        // Declare the chart dimensions and margins.
        const marginAll = 50;
        const marginTop = marginAll / 2;
        const marginRight = marginAll * 0.5;
        const marginBottom = marginAll * 1.1;
        const marginLeft = marginAll * .75;

        // Declare the positional encodings.
        const x = d3.scaleLinear()
            .domain([0, 1000]).nice()
            .range([marginLeft, carbonCurveContainerWidth - marginRight]);
        const y = d3.scaleLinear()
            .domain([0, 2]).nice()
            .range([carbonCurveContainerHeight - marginBottom, marginTop]);

        const curveType = d3.curveCardinal

        const line = d3.line()
            .curve(curveType)
            .x(d => x(d.Irradiance))
            .y(d => y(d.Impact));

        var range = (start, stop, step = 1) => {
            const length = Math.ceil((stop - start) / step);
            return Array.from({ length }, (_, i) => (i * step) + start);
        }
        var xVals = range(0, 1001)
        var gridMixVal = parseFloat(document.getElementById("curve-slider-grid-mix").value)
        // draw the grid mix line
        var gridMix = xVals.map((index) => ({
            Impact: gridMixVal,
            Irradiance: index
        }));

        const path = d3.select('.gridMixLine');

        // Update the path's data and the 'd' attribute
        path.datum(gridMix)
            .transition()
            .duration(250)
            .ease(d3.easePoly)
            .attr('d', line);
        // .attr("stroke-dasharray", `${l},${l}`);
    });
});


function downloadCSV(inputData) {
    var arrayOfArrays = Object.keys(inputData).map((key) => [key, inputData[key]]);
    var deviceName = document.getElementById("moduleType").value
    // Extract unique keys for columns
    const keys = new Set();
    arrayOfArrays.forEach(arr => {
        arr[1].forEach(kv => keys.add(kv.layer));
    });

    // Convert keys set to array and sort if needed
    const columns = Array.from(keys).sort();
    
    // Create CSV header, prepend with a column for the row indices (outer keys)
    const csvRows = ['indicator (unit),' + columns.join(',')];

    // Map data to columns, including the outer key as the first column in each row
    arrayOfArrays.forEach(arr => {
        const row = [arr[0].replace(",","-") + " " + "(" + unitDict[arr[0]] + ")"]; // Start with the outer key as the first column
        row.push(...columns.map(column => {
            const found = arr[1].find(kv => kv.layer === column); // Find the value for each column
            return found ? found.value : ''; // If found, add the value, otherwise add an empty string
        }));
        csvRows.push(row.join(',')); // Join each row's values with commas and add to the rows array
    });

    // Convert rows to CSV string
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const tempLink = document.createElement('a');
    tempLink.href = URL.createObjectURL(blob);
    tempLink.setAttribute('download', deviceName+'_impact_data.csv');
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
}

function downloadData() {
    var activeSelectValues = getActiveSelectValues();
    var deviceSelect = document.getElementById('moduleType');

    try {
        d3.json('static/data/device_impact_data.json').then(function (deviceData) {
            const environmentalData = {};
            var jsonData = deviceData[deviceSelect.value]
            // Iterate through each key-value pair in activeSelectValues
            for (const [key, value] of Object.entries(activeSelectValues)) {
                // Check if jsonData has the key and the subkeys from activeSelectValues
                if (jsonData[key] && jsonData[key][value[0]] && jsonData[key][value[0]][value[1]]) {
                    // Access the relevant part of jsonData using the key and the two values
                    const dataPart = jsonData[key][value[0]][value[1]];

                    // Store the accessed data in the environmentalData object
                    environmentalData[key] = dataPart;
                } else {
                    console.warn(`Data for ${key} with values ${value} not found in JSON.`);
                }
            }

            var downloadData = {}
            for (var i = 0; i < impactList.length; i++) {
                var category = impactList[i]
                var myImpactData = extractImpactData(environmentalData, category);
                downloadData[category] = myImpactData
                // var barImpactData = transformDataForStackedBarChart(myImpactData, category);

                // for (const [key, value] of Object.entries(barImpactData)) {
                //     stackedBarDataArray.push(value)
                // }
            }
            // console.log(downloadData)
            downloadCSV(downloadData)

        })
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error; // Re-throw the error to propagate it in the promise chain
    }
}

function displaySums(inputData) {
    var arrayOfArrays = Object.keys(inputData).map((key) => [key, inputData[key]]);
    return arrayOfArrays.map(arr => {
        const key = arr[0].replace(",","-") + " " + "(" + unitDict[arr[0]] + ")"; // The outer key (e.g., "Key1")
        const keyValuePairs = arr[1]; // The array of key-value pairs

        // Sum the numerical values within the key-value pairs
        const sum = keyValuePairs.reduce((acc, kv) => {
            return acc + (Number(kv.value) || 0); // Ensure the value is numeric, defaulting to 0 if not
        }, 0);

        // Return an array with the key and its sum
        return [key, sum.toFixed(6)];
    });
}

function populateTableWithD3(data, targetID) {
    // Select the div where the table will be created
    const div = d3.select(`#${targetID}`);
    document.getElementById(targetID).innerHTML = "";

    // Create a table and append it to the div
    const table = div.append('table');

    // Create a header row
    const thead = table.append('thead');
    thead.append('tr')
         .selectAll('th')
         .data(['Indicator', 'Value']) // Column headers
         .enter()
         .append('th')
         .text(d => d);

    // Create rows for each element in the data array
    const tbody = table.append('tbody');
    const rows = tbody.selectAll('tr')
                      .data(data)
                      .enter()
                      .append('tr');

    // Create cells for each row
    rows.selectAll('td')
        .data(d => d) // Assuming d is an array [key, sum]
        .enter()
        .append('td')
        .text(d => d);
}

function displayData() {
    // resultContainer = document.getElementById("configured-device-results")

    var activeSelectValues = getActiveSelectValues();
    var deviceSelect = document.getElementById('moduleType');

    try {
        d3.json('static/data/device_impact_data.json').then(function (deviceData) {
            const environmentalData = {};
            var jsonData = deviceData[deviceSelect.value]
            // Iterate through each key-value pair in activeSelectValues
            for (const [key, value] of Object.entries(activeSelectValues)) {
                // Check if jsonData has the key and the subkeys from activeSelectValues
                if (jsonData[key] && jsonData[key][value[0]] && jsonData[key][value[0]][value[1]]) {
                    // Access the relevant part of jsonData using the key and the two values
                    const dataPart = jsonData[key][value[0]][value[1]];

                    // Store the accessed data in the environmentalData object
                    environmentalData[key] = dataPart;
                } else {
                    console.warn(`Data for ${key} with values ${value} not found in JSON.`);
                }
            }

            var displayData = {}
            for (var i = 0; i < impactList.length; i++) {
                var category = impactList[i]
                var myImpactData = extractImpactData(environmentalData, category);
                displayData[category] = myImpactData
                // var barImpactData = transformDataForStackedBarChart(myImpactData, category);

                // for (const [key, value] of Object.entries(barImpactData)) {
                //     stackedBarDataArray.push(value)
                // }
            }
            var sumData = displaySums(displayData)
            // console.log(sumData)
            // resultContainer.innerHTML = sumData
            populateTableWithD3(sumData, "configured-device-results-inner")
            

        })
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error; // Re-throw the error to propagate it in the promise chain
    }
}


// Get the slider and output elements
document.addEventListener('DOMContentLoaded', function () {
    // const slider = document.getElementById('curve-slider-performance-ratio');
    // const output = document.getElementById('curve-slider-performance-ratio-value');
    for (const [x, y] of [
        ['curve-slider-self-consumption', 'curve-slider-self-consumption-value'],
        ['curve-slider-performance-ratio', 'curve-slider-performance-ratio-value'],
        ['curve-slider-grid-mix', 'curve-slider-grid-mix-value']]) {
        const slider = document.getElementById(x)
        const output = document.getElementById(y)
        slider.addEventListener('input', function () {
            output.value = parseFloat(this.value).toFixed(2);
        });
    }
});
