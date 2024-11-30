async function showHistory(event, clicked_button) {
    event.stopPropagation();
    const device = clicked_button.closest('.device');
    const deviceId = device.id;
    const deviceType = device.getAttribute('data-type');
    const timeWindow = document.getElementById("time-window").value || 1;
    getDeviceHistory(deviceId, timeWindow)
    .then((deviceHistory) => {
        // Prepare Data for Plotting
        const times = deviceHistory.history.map(entry => new Date(entry.time));
        const values = deviceHistory.history.map(entry => entry.device_data);
    // Plot the Data
    renderHistoryPlot(deviceId, deviceType, times, values);
    })
    .catch((error) => {
        console.log(error);
    });
}

async function updateHistoryPlot(slider) {
    const timeWindow = slider.value;
    document.getElementById('time-window-value').innerText = slider.value;
    const deviceId = document.getElementById('history-plot').data[0].name.split(': ')[1];

    // Get Device History
    getDeviceHistory(deviceId, timeWindow)
    .then((deviceHistory) => {
        // Update Plot Data
        const updatedTimes = deviceHistory.history.map(entry => new Date(entry.time));
        const updatedValues = deviceHistory.history.map(entry => entry.device_data);

        Plotly.update('history-plot', {
            x: [updatedTimes],
            y: [updatedValues]
        });
        Plotly.Plots.resize('history-plot'); // Recalculate plot size
    });
}

function renderHistoryPlot(deviceId, deviceType, times, values) {

    if (config.devices[deviceType].values === 'continuous') {
        mode = 'lines+markers';
        yaxisTitle = `Value (${config.devices[deviceType].unit})`;
        yaxis = {
            title: yaxisTitle
        }
    }
    else if (config.devices[deviceType].values === 'binary') {
        mode = 'markers';
        yaxisTitle = 'Value';
        yaxis = {
            title: yaxisTitle,
            range: [-0.1, 1.1],
            tickvals: [0, 1],
            ticktext: [config.devices[deviceType].valueMap[0].text, config.devices[deviceType].valueMap[1].text],
            tickmode: 'array',
            tickcolor: 'black',
            tickfont: {
                color: 'black'
            },
            tickangle: -30
        }
    }

    const plotData = [{
        x: times,
        y: values,
        mode: mode,
        marker: {
            color: '#333'
        },
        line: {
            color: '#333'
        },
        name: `Device: ${deviceId}`
    }];

    const layout = {
        title: `Device History`, // No title on small screens
        xaxis: {
            title: screen.width > 768 ? 'Time' : '',
            automargin: true
        },
        yaxis: yaxis,
        margin: {
            l: 55, // Left margin
            r: 5, // Right margin
            t: 50, // Top margin
            b: 50, // Bottom margin
        },
        autosize: true,
        responsive: true
    };

    // Determine whether to show the toolbar
    const plotConfig = {
        responsive: true,
        displayModeBar: window.innerWidth > 768, // Show toolbar only if screen width > 768px
    };
    
    Plotly.newPlot('history-plot', plotData, layout, plotConfig);
    Plotly.Plots.resize('history-plot'); // Recalculate plot size

    window.addEventListener('resize', () => {
        Plotly.Plots.resize('history-plot'); // Recalculate plot size
    });

    // Show Modal
    document.getElementById('history-modal').style.display = 'block';
}

function closeHistoryModal() {
    document.getElementById("time-window").value = 1;
    document.getElementById('history-modal').style.display = 'none';
}