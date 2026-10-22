// ==========================================
// SMART COLLEGE NAVIGATION
// Kishkinda University
// ==========================================

const places = [
    {
        name: "Main Entrance",
        category: "Entrance",
        floor: 0,
        location: "Central Wing",
        description: "Main entry point of the college building."
    },
    {
        name: "Main Stairs",
        category: "Stairs",
        floor: 0,
        location: "Central Wing",
        description: "Stairs for moving between floors."
    },
    {
        name: "Left Wing Lift",
        category: "Lift",
        floor: 0,
        location: "Left Wing",
        description: "Lift access in the left wing."
    },
    {
        name: "Central Left Lift",
        category: "Lift",
        floor: 0,
        location: "Central Wing",
        description: "Lift on the left side of the central stairs."
    },
    {
        name: "Central Right Lift",
        category: "Lift",
        floor: 0,
        location: "Central Wing",
        description: "Lift on the right side of the central stairs."
    },
    {
        name: "Right Wing Lift",
        category: "Lift",
        floor: 0,
        location: "Right Wing",
        description: "Lift access in the right wing."
    },
    {
        name: "Admission Counter",
        category: "Admission Counter",
        floor: 0,
        location: "Ground Floor",
        description: "For admission-related enquiries."
    },
    {
        name: "Auditorium",
        category: "Auditorium",
        floor: 0,
        location: "College Building",
        description: "For college events and seminars."
    },
    {
        name: "Classroom C101",
        category: "Classroom",
        floor: 0,
        location: "Left Wing",
        description: "Classroom location."
    },
    {
        name: "Electronics Laboratory",
        category: "Laboratory",
        floor: 1,
        location: "Left Wing",
        description: "Electronics practical laboratory."
    },
    {
        name: "Washroom",
        category: "Washroom",
        floor: 1,
        location: "Corridor",
        description: "Washroom facility."
    },
    {
        name: "Faculty Cabin",
        category: "Faculty Cabin",
        floor: 2,
        location: "Central Wing",
        description: "Faculty consultation area."
    },
    {
        name: "Department Office",
        category: "Department",
        floor: 2,
        location: "Right Wing",
        description: "Department office."
    },
    {
        name: "Library",
        category: "Library",
        floor: 3,
        location: "Right Wing",
        description: "Books and study resources."
    }
];

const floorNames = [
    "Ground Floor",
    "First Floor",
    "Second Floor",
    "Third Floor",
    "Fourth Floor"
];

let currentDestination = null;
let currentDestinationFloor = 0;


// ==========================================
// FLOOR SELECTION
// ==========================================

function selectFloor(floor) {
    floor = Number(floor);

    if (!Number.isInteger(floor) ||
        floor < 0 ||
        floor >= floorNames.length) {
        return;
    }

    const title = document.getElementById("floorTitle");
    const description = document.getElementById("mapDescription");

    if (title) {
        title.textContent = floorNames[floor];
    }

    if (description) {
        description.textContent =
            "Showing the demonstration layout for " +
            floorNames[floor] +
            ". Room positions must be verified against the actual college plan.";
    }

    document.querySelectorAll(".floor-grid button")
        .forEach(function(button, index) {
            button.classList.toggle("active-floor", index === floor);
            button.setAttribute(
                "aria-pressed",
                index === floor ? "true" : "false"
            );
        });

    // Highlight only destinations listed on the selected floor.
    document.querySelectorAll(".room").forEach(function(button) {
        button.classList.remove("selected");
        button.removeAttribute("aria-current");
    });

    if (currentDestinationFloor !== floor) {
        currentDestination = null;

        const routeResult = document.getElementById("routeResult");
        const routePath = document.getElementById("routePath");

        if (routeResult) {
            routeResult.textContent =
                "📍 Select a destination on " + floorNames[floor] + ".";
        }

        if (routePath) {
            routePath.classList.remove("active");
            routePath.textContent =
                "📍 Select a destination to preview your route.";
        }
    }
}


// ==========================================
// FIND DESTINATIONS
// ==========================================

function findPlace(query) {
    const searchText = query.trim().toLowerCase();

    if (!searchText) {
        return null;
    }

    // Exact destination name.
    let match = places.find(function(place) {
        return place.name.toLowerCase() === searchText;
    });

    if (match) {
        return match;
    }

    // Exact category: return the first matching destination.
    match = places.find(function(place) {
        return place.category.toLowerCase() === searchText;
    });

    if (match) {
        return match;
    }

    // Partial destination or location match.
    return places.find(function(place) {
        return place.name.toLowerCase().includes(searchText) ||
               place.category.toLowerCase().includes(searchText) ||
               place.location.toLowerCase().includes(searchText);
    }) || null;
}


// ==========================================
// SEARCH
// ==========================================

function searchPlace() {
    const input = document.getElementById("searchInput");
    const result = document.getElementById("result");

    if (!input || !result) {
        return;
    }

    const query = input.value.trim();

    if (!query) {
        result.textContent = "Please enter a destination.";
        return;
    }

    const place = findPlace(query);

    if (!place) {
        result.textContent =
            "Destination not found. Try Library, Classroom C101, " +
            "Faculty Cabin, Lift or Main Stairs.";
        return;
    }

    selectDestination(place.name, place.floor);

    result.textContent =
        "✅ Found: " + place.name +
        " | " + floorNames[place.floor];
}


// ==========================================
// FACILITY CATEGORY SEARCH
// ==========================================

function searchCategory(category) {
    const matches = places.filter(function(place) {
        return place.category.toLowerCase() ===
               category.toLowerCase();
    });

    const result = document.getElementById("result");

    if (!matches.length) {
        if (result) {
            result.textContent =
                "No destination is currently listed under " +
                category + ".";
        }
        return;
    }

    const place = matches[0];

    const input = document.getElementById("searchInput");

    if (input) {
        input.value = place.name;
    }

    selectDestination(place.name, place.floor);

    if (result) {
        result.textContent =
            "✅ " + category + ": " + place.name +
            " | " + floorNames[place.floor];
    }
}


// ==========================================
// VOICE SEARCH
// ==========================================

function voiceSearch() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const result = document.getElementById("result");

    if (!SpeechRecognition) {
        if (result) {
            result.textContent =
                "Voice search is not supported in this browser. Please type.";
        }
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function(event) {
        const input = document.getElementById("searchInput");

        if (input) {
            input.value = event.results[0][0].transcript;
            searchPlace();
        }
    };

    recognition.onerror = function() {
        if (result) {
            result.textContent =
                "Voice search failed. Please try again or type your search.";
        }
    };

    recognition.start();
}


// ==========================================
// SELECT DESTINATION
// ==========================================

function selectDestination(destination, floor) {
    floor = Number(floor);

    if (!Number.isInteger(floor) ||
        floor < 0 ||
        floor >= floorNames.length) {
        return;
    }

    const place = places.find(function(item) {
        return item.name.toLowerCase() ===
               destination.toLowerCase() &&
               item.floor === floor;
    });

    if (!place) {
        const result = document.getElementById("result");

        if (result) {
            result.textContent =
                "This destination is not yet listed in the campus directory.";
        }
        return;
    }

    currentDestination = place.name;
    currentDestinationFloor = floor;

    selectFloor(floor);

    // Highlight matching map button, if one exists.
    document.querySelectorAll(".room").forEach(function(button) {
        const buttonName = button.textContent
            .replace(/^[^\w]+/, "")
            .trim()
            .toLowerCase();

        if (buttonName === place.name.toLowerCase()) {
            button.classList.add("selected");
            button.setAttribute("aria-current", "location");
        }
    });

    const input = document.getElementById("searchInput");

    if (input) {
        input.value = place.name;
    }

    const routeResult = document.getElementById("routeResult");

    if (routeResult) {
        routeResult.textContent =
            "🎯 Destination: " + place.name +
            " | Floor: " + floorNames[floor];
    }

    showDemoRoute(place.name, floor);

    const mapCard = document.querySelector(".map-card");

    if (mapCard) {
        mapCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}


// ==========================================
// DEMONSTRATION ROUTE
// ==========================================

function showDemoRoute(destination, floor) {
    const startSelect = document.getElementById("startPoint");
    const routePath = document.getElementById("routePath");

    if (!startSelect || !routePath) {
        return;
    }

    const start = startSelect.value;

    routePath.replaceChildren();
    routePath.classList.add("active");

    const heading = document.createElement("strong");
    heading.textContent = "📍 Navigation Preview";
    routePath.appendChild(heading);

    if (start === destination && floor === 0) {
        const message = document.createElement("p");
        message.textContent =
            "You selected your current starting point: " + destination + ".";
        routePath.appendChild(message);
        return;
    }

    const details = document.createElement("p");
    details.textContent =
        "From: " + start +
        " → To: " + destination +
        " (" + floorNames[floor] + ")";
    routePath.appendChild(details);

    const steps = document.createElement("div");
    steps.className = "route-steps";

    const stepLabels = [
        "📍 " + start,
        floor === 0 ? "➡️ Follow the corridor" : "🛗 Lift / 🪜 Stairs",
        "🎯 " + destination
    ];

    stepLabels.forEach(function(label, index) {
        const step = document.createElement("span");
        step.className = "route-step";
        step.textContent = label;
        steps.appendChild(step);

        if (index < stepLabels.length - 1) {
            const arrow = document.createElement("span");
            arrow.className = "route-arrow";
            arrow.textContent = "➜";
            steps.appendChild(arrow);
        }
    });

    routePath.appendChild(steps);

    const note = document.createElement("small");
    note.textContent =
        "Demo route only. Exact corridors, distances and room positions have not been verified.";
    routePath.appendChild(note);
}


// ==========================================
// UPDATE ROUTE WHEN STARTING POINT CHANGES
// ==========================================

function updateRoute() {
    if (currentDestination !== null) {
        showDemoRoute(
            currentDestination,
            currentDestinationFloor
        );
    }
}


// ==========================================
// CAMPUS ASSISTANT
// ==========================================

function askAssistant() {
    const input = document.getElementById("chatInput");
    const answer = document.getElementById("chatAnswer");

    if (!input || !answer) return;

    const question = input.value.trim().toLowerCase();

    if (!question) {
        answer.textContent = "Please enter a question.";
        return;
    }

    const place = places.find(p =>
        question.includes(p.name.toLowerCase()) ||
        question.includes(p.category.toLowerCase())
    );

    if (place) {
        answer.textContent =
            "📍 " + place.name +
            " is listed on the " + floorNames[place.floor] +
            ". " + place.description +
            " Please note: the route is currently a demonstration.";
    } else {
        answer.textContent =
            "I can help you find college facilities. Try asking: Where is the library? Where is the classroom? Where is the lift? Where is the faculty cabin?";
    }
}
// ==========================================
// INITIAL SETUP
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    const startSelect = document.getElementById("startPoint");

    if (startSelect) {
        startSelect.addEventListener("change", updateRoute);
    }

    selectFloor(0);
});