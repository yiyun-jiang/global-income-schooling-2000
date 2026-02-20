// assign the access token
mapboxgl.accessToken =
    'pk.eyJ1IjoieWowNTA1IiwiYSI6ImNtaGVhZm13NzBiZHAyaXBwNnVia3kyY3YifQ.JDOB2t61C-q1Qo7WLT7DDw';

// declare the map object
let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 1.2, // starting zoom
    minZoom: 1,
    center: [0, 20] // starting center
});

// declare the coordinated chart as well as other variables.
let chart = null;
    activeLayer = "income";
    worldData = null;

// create a few constant variables.
const incomeBreaks = [0, 2000, 5000, 10000, 20000, 40000];
const incomeColors = ['#f2f0f7','#cbc9e2','#9e9ac8','#756bb1','#54278f','#3f007d'];

const schoolingBreaks = [0, 3, 6, 9, 12];
const schoolingColors = ['#edf8fb','#b2e2e2','#66c2a4','#2ca25f','#006d2c'];


// create the legend object and anchor it to the html element with id legend.
const legend = document.getElementById('legend');

function updateLegend(type) {
    let breaks = type === "income" ? incomeBreaks : schoolingBreaks;
    let colors = type === "income" ? incomeColors : schoolingColors;

    let labels = [`<strong>${type === "income" ? "Avg Yearly Income (USD)" : "Avg Years Schooling"}</strong>`];

    for (let i = 0; i < breaks.length - 1; i++) {
        labels.push(`
            <p class="break">
                <span class="dot" style="background:${colors[i]}; width:18px; height:18px;"></span>
                <span class="dot-label">${breaks[i]} – ${breaks[i+1]}</span>
            </p>
        `);
    }

    legend.innerHTML = labels.join('');
}

function clean(v) {
    return v === -1 ? null : v;
}

async function loadData() {
    let response = await fetch("assets/combined_2000.geojson");
    worldData = await response.json();

    map.on("load", () => {

        map.addSource("world", {
            type: "geojson",
            data: worldData
        });

        // Income choropleth
        map.addLayer({
            id: "income-layer",
            type: "fill",
            source: "world",
            paint: {
            "fill-color": [
                "case",
                ["==", ["get", "INCOME"], -1], '#999999',
                [
                    "step",
                    ["get", "INCOME"],
                    incomeColors[0], incomeBreaks[1],
                    incomeColors[1], incomeBreaks[2],
                    incomeColors[2], incomeBreaks[3],
                    incomeColors[3], incomeBreaks[4],
                    incomeColors[4], incomeBreaks[5],
                    incomeColors[5]
                ]
            ],
                "fill-opacity": 0.8,
                "fill-outline-color": "#222"
            }
        });


        
        // Schooling choropleth
        map.addLayer({
            id: "schooling-layer",
            type: "fill",
            source: "world",
            layout: { visibility: "none" },
            paint: {
            "fill-color": [
                "case",
                ["==", ["get", "AVG_YR_SCH"], -1], "#999999",

                [
                    "step",
                    ["get", "AVG_YR_SCH"],
                    schoolingColors[0], schoolingBreaks[1],
                    schoolingColors[1], schoolingBreaks[2],
                    schoolingColors[2], schoolingBreaks[3],
                    schoolingColors[3], schoolingBreaks[4],
                    schoolingColors[4]
                ]
            ],
                "fill-opacity": 0.8,
                "fill-outline-color": "#222"
            }
        });

        updateLegend("income");
    });
}

loadData();

document.getElementById("btn-income").addEventListener("click", () => {
    activeLayer = "income";
    map.setLayoutProperty("income-layer", "visibility", "visible");
    map.setLayoutProperty("schooling-layer", "visibility", "none");
    updateLegend("income");
});

document.getElementById("btn-schooling").addEventListener("click", () => {
    activeLayer = "schooling";
    map.setLayoutProperty("income-layer", "visibility", "none");
    map.setLayoutProperty("schooling-layer", "visibility", "visible");
    updateLegend("schooling");
});

map.on("click", (event) => {
    let features = map.queryRenderedFeatures(event.point, {
        layers: ["income-layer", "schooling-layer"]
    });

    if (!features.length) return;

    let props = features[0].properties;

    let income = clean(parseFloat(props.INCOME));
    let schooling = clean(parseFloat(props.AVG_YR_SCH));

    document.getElementById("country-name").innerHTML = props.COUNTRY;
    document.getElementById("income").innerHTML = income === null ? "No Data" : income.toLocaleString();
    document.getElementById("schooling").innerHTML = schooling === null ? "No Data" : schooling;

    generateChart(income, schooling);
});

map.on("click", (e) => {
    let features = map.queryRenderedFeatures(e.point, {
        layers: ["income-layer", "schooling-layer"]
    });

    if (!features.length) return;

    let props = features[0].properties;

    let income = clean(parseFloat(props.INCOME));
    let schooling = clean(parseFloat(props.AVG_YR_SCH));

    document.getElementById("country-name").innerHTML = props.COUNTRY;
    document.getElementById("income").innerHTML = income === null ? "No Data" : income.toLocaleString();
    document.getElementById("schooling").innerHTML = schooling === null ? "No Data" : schooling;

    generateChart(income, schooling);

    // Popup at clicked point
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
            <strong>${props.COUNTRY}</strong><br>
            Income: ${income === null ? "No Data" : income.toLocaleString()}<br>
            Schooling: ${schooling === null ? "No Data" : schooling}
        `)
        .addTo(map);
});



function generateChart(income, schooling) {

    if (chart) chart.destroy();

    chart = c3.generate({
        bindto: "#chart",
        data: {
            columns: [
                ["Income", income || 0],
                ["Schooling", schooling || 0]
            ],
            type: "bar",
            colors: {
                Income: "#54278f",
                Schooling: "#2ca25f"
            }
        },
        tooltip: {
            format: {
                value: function (value) {
                    return value === 0 ? "No Data" : value;
                }
            }
        },
        axis: {
            x: { type: "category", categories: [""] }
        }
    });
}

document.getElementById("reset").addEventListener("click", () => {
    map.flyTo({ zoom: 1.2, center: [0, 20] });
});