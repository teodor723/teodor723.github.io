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
    post: {
        Traditional: [
            "5in Sqr Post w trim ring x 10'",
            "5in Sqr Post x 10'",
            "7in Sqr Column x 10'",
            "10in Round Column x 10'"
        ],
        Modern: [
            "7in Sqr Column x 10'",
            "7in Sqr Column x 10' w/ trim ring",
            "8in Sqr Column x 10'",
            "8in Sqr Column x 10' w/ trim ring",
        ],
        Elements: [
            "5in Sqr Post x 10'"
        ],
    },
    vinyl_shade_level: {
        Traditional: ["90%", "75%", "50%"],
        Modern: ["90%", "75%", "50%", "Rafters Only"],
        Elements: ["N/A on this model"],
    },
    cap_style: {
        Traditional: ["Standard Cap (Scroll)", "Flat Cap", "Bevel Cap"],
        Modern: ["N/A on this model"],
        Elements: ["Standard Cap (Scroll)", "Flat Cap", "Bevel Cap"],
    }
};

const modelMap = {"Modern": "MOD", "Traditional": "TRA", "Elements": "ELE"};

function populateCheckboxes(id, values) {
    const container = $(`#${id}`);
    container.empty();
    values.forEach(value => {
        container.append(`
            <input type="checkbox" name="${id}" value="${value.replace("'", "")}" checked> ${value}
        `);
    });
}

function populateOptions(model) {
    populateCheckboxes('depth-options', variations.depth[model]);
    populateCheckboxes('width-options', variations.width[model]);
    populateCheckboxes('post-options', variations.post[model]);
    populateCheckboxes('vinyl-shade-level-options', variations.vinyl_shade_level[model]);
    populateCheckboxes('cap-style-options', variations.cap_style[model]);
}


function generateCSV() {
    const model = $("input[name='model']:checked").val();
    const attachedTypes = $("input[name='attached_type']:checked").map((_, el) => el.value).get();
    const depths = $("input[name='depth-options']:checked").map((_, el) => el.value).get();
    const widths = $("input[name='width-options']:checked").map((_, el) => el.value).get();

    // Full color for name, shorthand for SKU/slug
    const colors = $("input[name='color']:checked").map((_, el) => ({
        full: el.value,
        short: el.value[0].toUpperCase()
    })).get();

    const fanMounts = $("input[name='fan_mount']:checked").map((_, el) => {
        switch (el.value) {
            case 'No':
                return 'NF';
            case '1':
                return 'F1';
            case '2':
                return 'F2';
            case '3':
                return 'F3';
            default:
                return '';
        }
    }).get();

    let csvContent = "type,sku,name,slug,parent,status,featured,catalog_visibility\n";
    csvContent += `variable,PERG-${modelMap[model]},${model} Pergola Kit | Premium Outdoor Living Space,${model.toLowerCase()}-pergola,,1,0,visible\n`;

    attachedTypes.forEach(attachedType => {
        const attachedTypeCode = attachedType === 'Attached' ? 'A' : 'F';
        depths.forEach(depth => {
            widths.forEach(width => {
                colors.forEach(color => {
                    fanMounts.forEach(fanMount => {
                        // Full color for name, short form for slug and SKU
                        const name = `${depth}' x ${width}' ${model} ${attachedType} Pergola - ${color.full} with ${fanMount === 'NF' ? 'No' : fanMount.replace('F', '')} Mount`;
                        const slug = `${model.toLowerCase()}-${attachedType.toLowerCase()}-pergola-${depth}x${width}-${color.short.toLowerCase()}-${fanMount.toLowerCase()}`;
                        const sku = `PERG-${modelMap[model]}-${attachedTypeCode}-${depth}X${width}-${color.short}-${fanMount}`;

                        csvContent += `variation,${sku},${name},${slug},${model},1,0,visible\n`;
                    });
                });
            });
        });
    });

    // Generate CSV file for download
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${model}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

$(document).ready(() => {
    // Load initial values
    populateOptions("Traditional");

    // Change handlers
    $("input[name='model']").on("change", function () {
        const model = $(this).val();
        populateOptions(model);
    });

    // Generate CSV on button click
    $("#generateCsv").on("click", generateCSV);
});
