const GOOGLE_SCRIPT_ID = "AKfycby_iaAP1QANbMCwFMvv5ryRsL7ia5f09edqTy9P0OIL7tnXYn6fYa_l9-0rp9Akk3UGcA";
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

$(document).ready(() => {
    const defaultModel = $("#model").val();
    populateOptions(defaultModel);

    $("#model").on("change", function () {
        const selectedModel = $(this).val();
        populateOptions(selectedModel);
    });

    $("#pergolaForm").on("submit", (e) => {
        e.preventDefault();

        // Only serialize visible and enabled fields
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
            console.log(`${key}: ${result[key]}`);
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
