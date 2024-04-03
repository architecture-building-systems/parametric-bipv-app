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
}

// var pieData = [
//     { name: 'Cell', value: 40 },
//     { name: 'Frame', value: 10 },
//     { name: 'Junction Box', value: 2 },
//     { name: 'Inverter', value: 10 },
//     { name: 'Wires', value: 3 },
//     { name: 'Front Cover', value: 5 },
//     { name: 'Rear Cover', value: 5 },
//     { name: 'Encapsulant', value: 5 },
//     { name: 'Mounting System', value: 10 },
//     { name: 'Assembly', value: 10 },
// ];

async function JSONtoPieChart(filePath, chartID, category) {
    try {
        // const response = await fetch(filePath);
        d3.json(filePath).then(function (d) {
            createPieChart(chartID, d[category], category);
        })
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error; // Re-throw the error to propagate it in the promise chain
    }
}

var pieDataFile = "sample_pies.json"

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

// for ([chartID, category] of pieInfo) {
for (var i = 0; i < pieInfo.length; i++) {
    var chartID = pieInfo[i][0]
    var category = pieInfo[i][1]
    JSONtoPieChart(pieDataFile, chartID, category)
}

length = (path) => d3.create("svg:path").attr("d", path).node().getTotalLength()

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
    console.log(iterateKeys)
    for (const key of iterateKeys) {
        var i = inputData[key]
        var data = i.Impact.map((impact, index) => ({
            Impact: impact,
            Irradiance: i.Irradiance[index]
        }));
        var l = length(line(data));
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

    var iterateKeys = [arrayKeys[10]]
    for (const key of iterateKeys) {
        var i = inputData[key]
        var data = i.Impact.map((impact, index) => ({
            Impact: impact,
            Irradiance: i.Irradiance[index]
        }));
        var l = length(line(data));
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#000000")
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


}

async function JSONtoLineChart(filePath) {
    try {
        // const response = await fetch(filePath);
        d3.json(filePath).then(function (d) {
            createLineChart('pv-curve', d);
        })
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error; // Re-throw the error to propagate it in the promise chain
    }
}

JSONtoLineChart("sample_curves.json")

// Get reference to the select element
const moduleTypeSelect = document.getElementById('moduleType');

function createLayerSelections(layers) {
    // Get the selected value from the dropdown
    const container = document.getElementById('layer-selects-container');
    layers.forEach(layer => {
        const layerContainer = document.createElement('div');
        layerContainer.classList.add('layer-container');

        const title = document.createElement('p');
        title.textContent = layer.title;
        layerContainer.appendChild(title);

        const selectContainer = document.createElement('div');
        selectContainer.classList.add('select-container');

        const optionSelect = document.createElement('select');
        Object.keys(layer.options).forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            optionSelect.appendChild(optionElement);
        });
        selectContainer.appendChild(optionSelect);

        const regionSelect = document.createElement('select');
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
}

// var initialLayers = layerJson[moduleTypeSelect]
readJsonData(moduleTypeSelect.value);

function readJsonData(moduleName) {
    try {
        // const response = await fetch(filePath);
        d3.json('layer_data.json').then(function (data) {
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
}

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
}


// Add event listener to moduleType select element to track changes
moduleTypeSelect.addEventListener('change', updateLayersSelection);



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
    "test_model.json",
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
slider.addEventListener('input', function() {
  output.textContent = this.value;
});
