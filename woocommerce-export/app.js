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
        Traditional: ["90% Shade", "75% Shade", "50% Shade"],
        Modern: ["90% Shade", "75% Shade", "50% Shade", "Rafters Only"],
        Elements: ["N/A on this model"],
    },
    cap_style: {
        Traditional: ["Standard Cap (Scroll)", "Flat Cap", "Bevel Cap"],
        Modern: ["N/A on this model"],
        Elements: ["Standard Cap (Scroll)", "Flat Cap", "Bevel Cap"],
    }
};

const modelMap = { "Modern": "MOD", "Traditional": "TRA", "Elements": "ELE" };

function populateCheckboxes(id, values) {
    const container = $(`#${id}`);
    container.empty();

    if (values.includes("N/A on this model")) {
        container.append(`
            <input type="checkbox" name="${id}" value="N/A on this model" disabled> N/A on this model
        `);
    } else {
        values.forEach(value => {
            container.append(`
                <input type="checkbox" name="${id}" value="${value}" checked> ${value}
            `);
        });
    }
}

function populateOptions(model) {
    populateCheckboxes('depth-options', variations.depth[model]);
    populateCheckboxes('width-options', variations.width[model]);
    populateCheckboxes('post-options', variations.post[model]);

    if (variations.vinyl_shade_level[model].includes("N/A on this model")) {
        $('#vinyl-shade-level-options').html('<input type="checkbox" disabled checked> N/A on this model');
    } else {
        populateCheckboxes('vinyl-shade-level-options', variations.vinyl_shade_level[model]);
    }

    if (variations.cap_style[model].includes("N/A on this model")) {
        $('#cap-style-options').html('<input type="checkbox" disabled checked> N/A on this model');
    } else {
        populateCheckboxes('cap-style-options', variations.cap_style[model]);
    }
}

function generateCSV() {
    const generateBtn = $("#generateCsv");

    // Disable the button and add loader
    generateBtn.prop("disabled", true);
    generateBtn.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...');

    setTimeout(() => {
        const model = $("input[name='model']:checked").val();
        const attachedTypes = $("input[name='attached_type']:checked").map((_, el) => el.value).get();
        const depths = $("input[name='depth-options']:checked").map((_, el) => el.value).get();
        const widths = $("input[name='width-options']:checked").map((_, el) => el.value).get();
        const posts = $("input[name='post-options']:checked").map((_, el) => el.value).get();

        const shadeLevels = variations.vinyl_shade_level[model].includes("N/A on this model")
            ? [null]
            : $("input[name='vinyl-shade-level-options']:checked").map((_, el) => el.value).get();

        const capStyles = variations.cap_style[model].includes("N/A on this model")
            ? [null]
            : $("input[name='cap-style-options']:checked").map((_, el) => el.value).get();

        const colors = $("input[name='color']:checked").map((_, el) => ({
            full: el.value,
            short: el.value[0].toUpperCase()
        })).get();

        const fanMounts = $("input[name='fan_mount']:checked").map((_, el) => {
            switch (el.value) {
                case 'No': return 'No Fan Mounts';
                case '1': return '1 Fan Mount';
                case '2': return '2 Fan Mounts';
                case '3': return '3 Fan Mounts';
                default: return '';
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
                            posts.forEach(post => {
                                shadeLevels.forEach(shadeLevel => {
                                    capStyles.forEach(capStyle => {
                                        const nameParts = [
                                            `${depth} x ${width} ${model} ${attachedType} Pergola`,
                                            color.full,
                                            fanMount,
                                            post,
                                            shadeLevel || "",
                                            capStyle || ""
                                        ].filter(Boolean).join(' - ');

                                        const cleanDepth = depth.replace(/'/g, "");
                                        const cleanWidth = width.replace(/'/g, "");
                                        const cleanPost = post.replace(/'/g, "");

                                        const slugParts = [
                                            `${model.toLowerCase()}-${attachedType.toLowerCase()}-pergola`,
                                            `${cleanDepth}x${cleanWidth}`,
                                            color.short.toLowerCase(),
                                            fanMount.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
                                            cleanPost.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
                                            shadeLevel ? shadeLevel.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : '',
                                            capStyle ? capStyle.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : ''
                                        ].filter(Boolean).join('-');

                                        const skuParts = [
                                            `PERG-${modelMap[model]}`,
                                            attachedTypeCode,
                                            `${cleanDepth}X${cleanWidth}`,
                                            color.short,
                                            fanMount.replace(/[^a-zA-Z0-9]/g, ''),
                                            cleanPost.replace(/[^a-zA-Z0-9]/g, ''),
                                            shadeLevel ? shadeLevel.replace(/[^a-zA-Z0-9]/g, '') : '',
                                            capStyle ? capStyle.replace(/[^a-zA-Z0-9]/g, '') : ''
                                        ].filter(Boolean).join('-');

                                        csvContent += `variation,${skuParts},${nameParts},${slugParts},${model},1,0,visible\n`;
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `${model}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // ✅ Re-enable button and remove loader after generation
        generateBtn.prop("disabled", false);
        generateBtn.html('Generate CSV');
    }, 500); // Delay to simulate loading state (optional)
}

$(document).ready(() => {
    populateOptions("Traditional");
    $("input[name='model']").on("change", function () {
        populateOptions($(this).val());
    });
    $("#generateCsv").on("click", generateCSV);
});

