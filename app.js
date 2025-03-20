const GOOGLE_SCRIPT_ID = "AKfycbwpU2LJP7jon22iCAK78QBPWNIbnfY1bvbXJTHKbEPh0LS9-uTrzoJh-UNv3Tpyye1h8g";
const variations = {
    depth: {
        Traditional: ["8'", "10'", "12'", "14'", "16'", "18'", "20'", "24'"],
        Modern: ["10'", "12'", "14'", "16'"],
        Elements: ["10'", "12'", "14'", "16'", "20'"],
    },
    width: {
        Traditional: ["8'", "10'", "12'", "14'", "16'", "18'", "20'", "24'", "28'", "32'"],
        Modern: ["10'", "12'", "14'", "16'"],
        Elements: ["10'", "12'", "14'", "16'", "20'", "24'", "28'", "32'"],
    },
    vinyl_shade_level: {
        Traditional: ["90%", "75%", "50%"],
        Modern: ["90%", "75%", "50%", "Rafters Only"],
        Elements: [],
    },
    polycarbonate_sheet_color: {
        Traditional: [],
        Modern: [],
        Elements: ["Glacier White", "Sunset Bronze"],
    },
    hurricane_clips: {
        Traditional: ["No", "Yes"],
        Modern: [],
        Elements: ["No", "Yes"],
    },
    beam_attach_brkts: {
        Traditional: ["No", "Yes"],
        Modern: [],
        Elements: ["No", "Yes"],
    },
};

const postsVariations = {
    Traditional: {
        White: [
            "5in Sqr Post w trim ring x 10'",
            "5in Sqr Post x 10'",
            "7in Sqr Column x 10'",
            "10in Round Column x 10'"
        ],
        Tan: [
            "5in Sqr Post w trim ring x 10'",
            "5in Sqr Post x 10'",
            "7in Sqr Column x 10'"
        ],
        Black: [
            "5in Sqr Post x 10'"
        ]
    },
    Modern: {
        White: [
            "7in Sqr Column x 10'",
            "7in Sqr Column x 10' w/ trim ring"
        ],
        Tan: [
            "7in Sqr Column x 10'",
            "7in Sqr Column x 10' w/ trim ring"
        ],
        Black: [
            "8in Sqr Column x 10'",
            "8in Sqr Column x 10' w/ trim ring"
        ]
    },
    Elements: {
        White: [
            "5in Sqr Post x 10'"
        ],
        Tan: [
            "5in Sqr Post x 10'"
        ],
        Black: [
            "5in Sqr Post x 10'"
        ]
    }
};

const capStyleVariations = {
    Traditional: {
        White: ["Standard Cap (Scroll)", "Flat Cap", "Bevel Cap"],
        Tan: ["Standard Cap (Scroll)", "Flat Cap", "Bevel Cap"],
        Black: ["Standard Cap (Scroll)", "Flat Cap"]
    },
    Modern: "N/A on this model",
    Elements: {
        White: ["Standard Cap (Scroll)", "Flat Cap", "Bevel Cap"],
        Tan: ["Standard Cap (Scroll)", "Flat Cap", "Bevel Cap"],
        Black: ["Standard Cap (Scroll)", "Flat Cap"]
    }
};

const fanMountOptions = {
    White: ["No", "1", "2", "3"],
    Tan: ["No", "1", "2", "3"],
    Black: "N/A on this model"
};


function populateOptions(model) {
    Object.keys(variations).forEach((key) => {
        const container = $(`#${key}`).closest('.form-group');
        const select = $(`#${key}`);
        select.empty(); // Clear previous options

        const options = variations[key][model];
        if (options && options.length) {
            container.show(); // Show container (label + select) if options available
            options.forEach((option) => {
                select.append(new Option(option, option));
            });
        } else {
            container.hide(); // Hide container if no options available
        }
    });
}


function populatePostOptions(model, color) {
    const select = $("#post");
    select.empty(); // Clear previous options

    if (postsVariations[model] && postsVariations[model][color]) {
        const options = postsVariations[model][color];
        if (options.length > 0) {
            // Limit to the first matching value (like ARRAY_CONSTRAIN)
            select.append(new Option(options[0], options[0]));
            select.closest('.form-group').show(); // Show the dropdown
        } else {
            select.closest('.form-group').hide(); // Hide if no options available
        }
    } else {
        select.closest('.form-group').hide(); // Hide if no options available
    }
}

function populateCapStyleOptions(model, color) {
    const container = $("#cap_style_container");
    const select = $("#cap_style");
    select.empty(); // Clear previous options

    if (capStyleVariations[model] === "N/A on this model") {
        container.hide(); // Hide the field if "N/A on this model"
    } else if (capStyleVariations[model] && capStyleVariations[model][color]) {
        const options = capStyleVariations[model][color];

        // Limit to the first 3 options (like ARRAY_CONSTRAIN)
        options.slice(0, 3).forEach(option => {
            select.append(new Option(option, option));
        });

        container.show(); // Show the dropdown
    } else {
        container.hide(); // Hide if no options available
    }
}

function populateFanMountOptions(color) {
    const container = $("#fan_mount_container");
    const select = $("#fan_mount");
    select.empty(); // Clear previous options

    if (fanMountOptions[color] === "N/A on this model") {
        container.hide(); // Hide the field if "N/A on this model"
    } else if (fanMountOptions[color]) {
        const options = fanMountOptions[color];

        // Limit to the first 4 options (like ARRAY_CONSTRAIN)
        options.slice(0, 4).forEach(option => {
            select.append(new Option(option, option));
        });

        container.show(); // Show the dropdown
    } else {
        container.hide(); // Hide if no options available
    }
}

$(document).ready(() => {
    const defaultModel = $("#model").val();
    const defaultColor = $("#color").val();

    populateOptions(defaultModel);
    populatePostOptions(defaultModel, defaultColor);
    populateCapStyleOptions(defaultModel, defaultColor);
    populateFanMountOptions(defaultColor);

    $("#model, #color").on("change", function () {
        const selectedModel = $("#model").val();
        const selectedColor = $("#color").val();

        populateOptions(selectedModel);
        populatePostOptions(selectedModel, selectedColor);
        populateCapStyleOptions(selectedModel, selectedColor);
        populateFanMountOptions(selectedColor);
    });

    $("#pergolaForm").on("submit", (e) => {
        e.preventDefault();

        const params = $("#pergolaForm")
            .find("select:visible, input:visible")
            .serialize();

        console.log("Submitted params:", params);
        fetchPricingSummary(params);
    });
});




const fetchPricingSummary = async (params) => {
    const button = $("#pergolaForm button[type='submit']");
    button.prop('disabled', true).html('Loading... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');

    try {
        const response = await fetch(`https://script.google.com/macros/s/${GOOGLE_SCRIPT_ID}/exec?${params}`);
        const result = await response.json();

        Object.keys(result).forEach(key => {
            //console.log(`${key}: ${result[key]}`);
            const formattedValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(result[key]);
            $(`#${key}`).html(formattedValue);
        });
        button.prop('disabled', false).html('Get Price'); // Re-enable button
    } catch (err) {
        console.log("Error:", err);
        // Optionally retry or handle error here
        fetchPricingSummary(params);
    }
}
