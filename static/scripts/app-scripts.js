
//////////////////// CREATE PIE CHARTS

// Get reference to the select element
const moduleTypeSelect = document.getElementById('moduleType');

var pieInfo = [["chart1-1", "climate change"],
["chart1-2", "energy resources: non-renewable, fossil"],
["chart1-3", "ozone depletion"],
["chart1-4", "acidification: terrestrial"],
["chart1-5", "photochemical oxidant formation: human health"],
["chart1-6", "photochemical oxidant formation: terrestrial ecosystems"],
["chart1-7", "ecotoxicity: freshwater"],
["chart2-1", "particulate matter formation"],
["chart2-2", "eutrophication: freshwater"],
["chart2-3", "eutrophication: marine"],
["chart2-4", "ionising radiation"],
["chart2-5", "human toxicity: non-carcinogenic"],
["chart2-6", "human toxicity: carcinogenic"],
["chart2-7", "land use"]];

function createLayerSelections(layers) {
    // Get the selected value from the dropdown
    const container = document.getElementById('layer-selects-container');
    layers.forEach(layer => {
        const layerContainer = document.createElement('div');
        layerContainer.classList.add('layer-container');

        const title = document.createElement('p');
        title.textContent = layer.title;
        title.setAttribute("class", "layer-title");
        layerContainer.appendChild(title);

        const selectContainer = document.createElement('div');
        selectContainer.classList.add('select-container');

        const optionSelect = document.createElement('select');
        optionSelect.setAttribute("id", layer.title);
        // optionSelect.addEventListener('change', function () {
        //     // logSelect(this);
        // });
        Object.keys(layer.options).forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            optionSelect.appendChild(optionElement);
        });
        selectContainer.appendChild(optionSelect);

        const regionSelect = document.createElement('select');
        regionSelect.setAttribute("id", "region");
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

        layerContainer.appendChild(selectContainer);
        container.appendChild(layerContainer);
    });
};

// var initialLayers = layerJson[moduleTypeSelect]
readJsonData(moduleTypeSelect.value);

function readJsonData(moduleName) {
    try {
        // const response = await fetch(filePath);
        d3.json('static/data/layer_data2.json').then(function (data) {
            // var newLayers = data
            createLayerSelections(data[moduleName])
            // console.log(data[moduleName])

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

    // Update layers selection based on the selected type
    console.log('Selected Module Type:', moduleSelect);

    // Get reference to the div
    const divToUpdate = document.getElementById('layer-selects-container');

    // Clear the existing content of the div
    divToUpdate.innerHTML = "";

    // var newLayers = layerJson[moduleTypeSelect]
    // var storedJsonData = d3.json('layer_data.json');
    // console.log(storedJsonData);
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
        const title = layer.querySelector('.layer-title').textContent;

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


pieColorDict = {
    "frame": '#8dd3c7ff',
    "front_cover": '#ffffb3ff',
    "cell": '#bebadaff',
    "encapsulant": '#fb8072ff',
    "rear_cover": '#80b1d3ff',
    "junction_box": '#fdb462ff',
    "mounting_system": '#b3de69ff',
    "electricity_for_assembly": '#fccde5ff',
    "wires": '#d9d9d9ff'
}

function transformDataForPieChart(impactData) {
    // Calculate the total value across all layers
    const totalValue = impactData.reduce((acc, curr) => acc + curr.value, 0);
    console.log(totalValue)

    // Transform each entry into the desired format
    const transformedData = impactData.map(item => {
        return {
            name: capitalizeFirstLetter(item.layer.replace(/_/g, ' ')), // Capitalize and replace underscores with spaces
            value: parseFloat((item.value / totalValue * 100).toFixed(2)), // Calculate the percentage and format to 2 decimal places
            // color: `#${Math.floor(Math.random() * 16777215).toString(16)}` // Generate a random color
            color: pieColorDict[item.layer]
        };
    });

    return transformedData;
}

// Helper function to capitalize the first letter of each word
function capitalizeFirstLetter(string) {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


function createPieChart(containerId, data, category) {
    var container = document.getElementById(containerId);
    var width = container.offsetWidth;

    var height = container.offsetHeight;

    // const color = d3.scaleOrdinal()
    //     .domain(data.map(d => d.name))
    //     .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse())

    const pie = d3.pie()
        .sort(null)
        .padAngle(0.005)
        .value(d => d.value);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height) / 2 - 1);

    const labelRadius = arc.outerRadius()() * 0.8;

    const arcLabel = d3.arc()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

    const arcs = pie(data);

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    svg.append("g")
        .attr("stroke", "white")
        .attr("stroke-width", 0.25)
        .selectAll()
        .data(arcs)
        .join("path")
        .attr("fill", function (d) { return d.data.color; })
        .attr("d", arc)
        .append("title")
        .text(d => `${d.data.name}: ${d.data.value.toLocaleString("en-US")}`);

    svg.append("g")
        .attr("text-anchor", "middle")
        .selectAll()
        .data(arcs)
        .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        // .call(text => text.append("tspan")
        //     .attr("y", "-0.4em")
        //     .attr("font-weight", "bold")
        //     .text(d => d.data.name))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.value.toLocaleString("en-US")));

    svg.append("g")
        .attr("text-anchor", "middle")
        .selectAll()
        .data(arcs)
        .join("text")
        .call(text => text.append("tspan")
            .attr("y", "-50%")
            .attr("x", "-4em")
            .attr("font-weight", "bold")
            .text(category))
        .attr("transform", "rotate(-90)") // Rotates the title by -45 degrees;
};

// async function JSONtoPieChart(filePath, chartID, category) {
//     try {
//         // const response = await fetch(filePath);
//         d3.json(filePath).then(function (d) {
//             createPieChart(chartID, d[category], category);
//         })
//     } catch (error) {
//         console.error('Error reading JSON file:', error);
//         throw error; // Re-throw the error to propagate it in the promise chain
//     }
// }

function createPieChartLegend(pieColorDict) {
    // Assuming the div for the legend has an ID of 'pie-legends'
    const legendContainer = document.getElementById('pie-legends');
    legendContainer.innerHTML = ''; // Clear existing legend entries

    Object.entries(pieColorDict).forEach(([layer, color]) => {
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


function getEnvironmentalDataFromJsonFile(chartID, category) {
    var activeSelectValues = getActiveSelectValues();
    var deviceSelect = document.getElementById('moduleType');

    // Use d3.json to load the JSON data from the file
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

            // Now you can use environmentalData here within this callback
            var myImpactData = extractImpactData(environmentalData, category);
            console.log(category)
            var pieImpactData = transformDataForPieChart(myImpactData);
            createPieChart(chartID, pieImpactData, category)
        })
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error; // Re-throw the error to propagate it in the promise chain
    }
};




function createPieCharts() {

    for (var i = 0; i < pieInfo.length; i++) {
        var chartID = pieInfo[i][0]
        var category = pieInfo[i][1]
        // d3.select(chartID).selectAll('svg').remove();

        const pieChartArea = document.getElementById(chartID);
        // Clear the content of the div
        pieChartArea.innerHTML = '';
        getEnvironmentalDataFromJsonFile(chartID, category)
    }
    // Call the function to create the legend
    createPieChartLegend(pieColorDict);


}


// var pieDataFile = "static/data/sample_pies.json"


// // for ([chartID, category] of pieInfo) {
// for (var i = 0; i < pieInfo.length; i++) {
//     var chartID = pieInfo[i][0]
//     var category = pieInfo[i][1]
//     JSONtoPieChart(pieDataFile, chartID, category)
// }


////////////////////  Carbon Curve

pathLength = (path) => d3.create("svg:path").attr("d", path).node().getTotalLength()

function createLineChart(containerId, inputData) {
    // const data = Object.keys(obj).map((key) => [key, obj[key]]);
    // console.log(data)
    // console.log(line(data))
    var container = document.getElementById(containerId);
    // console.log(container)
    var width = container.offsetWidth;
    var height = container.offsetHeight;
    // Declare the chart dimensions and margins.
    const marginTop = 40;
    const marginRight = 40;
    const marginBottom = 40;
    const marginLeft = 40;

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
            .text("kWh/sqm/a →"));

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
            .text("↑ kgCO2e/kWh"));

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
        .attr('class', 'area')
        .attr('fill', '#E6AB1F')
        .attr('d', area)
        .transition()
        .duration(3500)
        .ease(d3.easePoly)
        .attr("fill-opacity", 0.5);


    // create the lines
    var iterateKeys = [arrayKeys[0], arrayKeys[arrayKeys.length - 1]]
    for (const key of iterateKeys) {
        var i = inputData[key]
        var data = i.Impact.map((impact, index) => ({
            Impact: impact,
            Irradiance: i.Irradiance[index]
        }));
        var l = pathLength(line(data));
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#E6AB1F")
            .attr("stroke-width", 2.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-dasharray", `0,${l}`)
            .attr("d", line)
            .transition()
            .duration(2500)
            .ease(d3.easePoly)
            .attr("stroke-dasharray", `${l},${l}`);
    }

    // var iterateKeys = [arrayKeys[10]]
    var iterateKeys = [parseFloat(document.getElementById("curve-slider").value)]
    for (const key of iterateKeys) {
        var i = inputData[key]
        var data = i.Impact.map((impact, index) => ({
            Impact: impact,
            Irradiance: i.Irradiance[index]
        }));
        var l = pathLength(line(data));
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#000000")
            .attr("stroke-width", 2.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-dasharray", `0,${l}`)
            .attr("d", line)
            .attr('class', 'setCurve')  // Assigning a class for easy selection
            .transition()
            .duration(2500)
            .ease(d3.easePoly)
            .attr("stroke-dasharray", `${l},${l}`);
    }
}

async function JSONtoLineChart() {
    const lineChartArea = document.getElementById("pv-curve");
    lineChartArea.innerHTML = '';
    var deviceTypeSelect = document.getElementById('moduleType');
    console.log(deviceTypeSelect.value)
    try {
        // const response = await fetch(filePath);
        d3.json("static/data/sample_curves_all.json").then(function (d) {
            createLineChart('pv-curve', d[deviceTypeSelect.value]);
        })
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error; // Re-throw the error to propagate it in the promise chain
    }
}

JSONtoLineChart()
moduleTypeSelect.addEventListener('change', JSONtoLineChart);

document.getElementById('curve-slider').addEventListener('change', function () {
    d3.json("static/data/sample_curves_all.json").then(function (d) {
        var deviceTypeSelect = document.getElementById('moduleType');
        var curveData = d[deviceTypeSelect.value]
        console.log(curveData)
        var iterateKeys = [parseFloat(document.getElementById("curve-slider").value)]
        console.log(iterateKeys)
        for (const key of iterateKeys) {
            var i = curveData[key]
            var data = i.Impact.map((impact, index) => ({
                Impact: impact,
                Irradiance: i.Irradiance[index]
            }));

            var container = document.getElementById('pv-curve');
            // console.log(container)
            var width = container.offsetWidth;
            var height = container.offsetHeight;
            // Declare the chart dimensions and margins.
            const marginTop = 40;
            const marginRight = 40;
            const marginBottom = 40;
            const marginLeft = 40;

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

            var l = pathLength(line(data));

            const path = d3.select('.setCurve');

            // Update the path's data and the 'd' attribute
            path.datum(data)
                .transition()
                .duration(250)
                .ease(d3.easePoly)
                .attr('d', line)
                .attr("stroke-dasharray", `${l},${l}`);
        }
    });
});


////////////////////////////// THREEJS MODEL STUFF

const container = document.getElementById('solar-panel-model');
const width = container.offsetWidth;
const height = container.offsetHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Set the background color to white

const frustumSize = 10;
const aspect = width / height;
const camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 1000);
camera.position.set(200, 200, -200); // Positioning the camera from the Southeast
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0xcccccc, 1.0);
scene.add(ambientLight);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
// directionalLight.position.set(-10, -10, 10.5).normalize();
// scene.add(directionalLight);


// Load .glb model
// const loader = new THREE.GLTFLoader();
// loader.load(
//     'test_model.gltf', // Adjust the path to your .glb file
//     function (gltf) {
//         scene.add(gltf.scene);

//         // Optional: adjust the model position, scale, etc. as needed
//         // gltf.scene.position.set(x, y, z);
//         // gltf.scene.scale.set(scaleX, scaleY, scaleZ);
//     },
//     undefined, // We can omit the progress function
//     function (error) {
//         console.error('An error happened', error);
//     }
// );


// standard loader
const loader = new THREE.ObjectLoader();
loader.load(
    "static/data/test_model.json",
    // onLoad callback
    // Here the loaded data is assumed to be an object
    function (object) {
        // Add the loaded object to the scene
        // Traverse the object and its children
        object.traverse(function (child) {
            // For each mesh, set the depthWrite property of its material to false
            if (child.isMesh) {
                // But only if the opacity of material is already transparent
                if (child.material.opacity < 1) {
                    child.material.depthWrite = false;
                }
            }
        });
        scene.add(object);
    },

    // onProgress callback
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },

    // onError callback
    // function ( err ) {
    //     console.log(err)
    // 	console.error( 'An error happened' );
    // }
)

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});


// Get the slider and output elements
const slider = document.getElementById('curve-slider');
const output = document.getElementById('curve-slider-value');

// Update the output value when the slider value changes
slider.addEventListener('input', function () {
    output.textContent = this.value;
});

function logSelect(input) {
    console.log(input)
    // var technology = document.getElementById('pvTechnology').value;

    // // Make an AJAX request to fetch technology-specific form data
    // // Update the form elements and technology details based on the retrieved data
    // $.get('/get_form_data/' + technology, function(data) {
    //     updateFormElements(data);
    //     updateTechnologyDetails(data, technology);
}
