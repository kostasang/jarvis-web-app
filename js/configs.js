const config = {
    apiBaseUrl: "http://localhost:5000",
    icons: {
        play: "&#9654",
        stop: "&#9724",
        degreesCelcious: "&#8451",
        id: "&#127380"
    },
    devices: {
        0: {
            category: "environmental",
            icon: "&#127777",
            description: "Temperature Sensor",
            values: 'continuous',
            unit: "&#8451", // degrees celcious
            round: 1
        },
        1: {
            category: "environmental",
            icon: "&#128167",
            description: "Humidity Sensor",
            values: 'continuous',
            unit: "%",
            round: 1
        },
        2: {
            category: "environmental",
            icon: "&#9760",
            description: "Air Quality Sensor",
            values: 'binary',
            valueMap: {
                0: {
                    text: "Non-toxic",
                    color: "blue"
                },
                1: {
                    text: "Toxic",
                    color: "lawngreen"
                }
            }
        },
        3: {
            category: "security",
            icon: "&#128065",
            description: "Infrared Sensor",
            values: 'binary',
            valueMap: {
                0: {
                    text: "No threat",
                    color: "green"
                },
                1: {
                    text: "Threat",
                    color: "red"
                }
            }
        },
        4: {
            category: "control",
            icon: "&#128161",
            description: "Light Control",
            values: 'binary'
        },
        5: {
            category: "security",
            icon: "&#128274",
            description: "Door/Window Status",
            values: 'binary',
            valueMap: {
                0: {
                    text: "Closed",
                    color: "green"
                },
                1: {
                    text: "Open",
                    color: "red"
                }
            }
        },
    },
    refreshTime: 5000 // milliseconds
};