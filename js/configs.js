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
            typeDescription: "Temperature Sensor",
        },
        1: {
            category: "environmental",
            icon: "&#128167",
            typeDescription: "Humidity Sensor",
        },
        2: {
            category: "environmental",
            icon: "&#9760",
            typeDescription: "Air Quality Sensor",
        },
        3: {
            category: "security",
            icon: "&#128065",
            typeDescription: "Infrared Sensor",
        },
        4: {
            category: "control",
            icon: "&#128161",
            typeDescription: "Light Control",
        },
        5: {
            category: "security",
            icon: "&#128274",
            typeDescription: "Door/Window Status",
        },
    },
    refreshTime: 5000 // milliseconds
};