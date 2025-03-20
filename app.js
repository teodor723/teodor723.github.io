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
        Elements: ["N/A on this model"],
    },
    polycarbonate_sheet_color: {
        Traditional: ["N/A on this model"],
        Modern: ["N/A on this model"],
        Elements: ["Glacier White", "Sunset Bronze"],
    },
    hurricane_clips: {
        Traditional: ["No", "Yes"],
        Modern: ["N/A on this model"],
        Elements: ["No", "Yes"],
    },
    beam_attach_brkts: {
        Traditional: ["No", "Yes"],
        Modern: ["N/A on this model"],
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
    Modern: {
        White: ["N/A on this model"],
        Tan: ["N/A on this model"],
        Black: ["N/A on this model"],
    },
    Elements: {
        White: ["Standard Cap (Scroll)", "Flat Cap", "Bevel Cap"],
        Tan: ["Standard Cap (Scroll)", "Flat Cap", "Bevel Cap"],
        Black: ["Standard Cap (Scroll)", "Flat Cap"]
    }
};

const fanMountOptions = {
    White: ["No", "1", "2", "3"],
    Tan: ["No", "1", "2", "3"],
    Black: ["N/A on this model"],
};


function populateSelect(select, options) {
    select.empty();

    options.forEach(option => select.append(new Option(option, option)));

    // Cross solution for all selects
    select.prop('disabled', options.length === 1 && options[0] === "N/A on this model");
}

function populateOptions(model) {
    Object.keys(variations).forEach((key) => {
        populateSelect($(`#${key}`), variations[key][model]);
    });
}

function populatePostOptions(model, color) {
    populateSelect($("#post"), postsVariations[model][color]);
}

function populateCapStyleOptions(model, color) {
    populateSelect($("#cap_style"), capStyleVariations[model][color]);
}

function populateFanMountOptions(color) {
    populateSelect($("#fan_mount"), fanMountOptions[color]);
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
            .find("select:enabled, input:enabled")
            .serialize();

        console.log("Submitted params:", params);
        fetchPricingSummary(params);
    });
});

// Create overlay and loader (centered in viewport)
const loader = $('<div class="loader-overlay"><div class="spinner-border text-primary" role="status"></div></div>');
const content = $(".container"); // Target only the content to blur

const fetchPricingSummary = async (params) => {
    // Blur the content
    content.css({
        'filter': 'blur(4px)',
        'pointer-events': 'none'
    });

    $('body').append(loader);

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
        // Remove blur and loader
        content.css({
            'filter': 'none',
            'pointer-events': 'auto'
        });
        loader.remove();
    } catch (err) {
        console.log("Error:", err);
        // Optionally retry or handle error here
        fetchPricingSummary(params);
    }
}
