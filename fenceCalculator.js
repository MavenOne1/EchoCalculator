// fenceCalculator.js

const MATERIAL_TYPES = {
    POSTS: 'posts',
    CONCRETE: 'concrete',
    RAILS: 'rails',
    PANELS: 'panels',
    PICKETS: 'pickets',
    TRIM: 'trim',
    CAPS: 'caps',
    POST_TOPS: 'postTops',
    GATES: 'gates',
    HARDWARE: 'hardware',
    FASTENERS: 'fasteners'
};

function calculateFenceCost(style, footage, options = {}) {
    if (footage <= 0) {
        throw new Error('Footage must be greater than zero');
    }

    const fenceStyle = fenceData.styles[style];
    if (!fenceStyle) {
        throw new Error('Invalid fence style');
    }

    let totalCost = 0;
    let materials = [];

    // Calculate post count
    const postCount = Math.ceil(footage / fenceStyle.postSpacing) + 1;

    // Function to add material to the list and calculate cost
    function addMaterial(type, id, quantity) {
        const material = fenceData.materials[type][id];
        if (!material) {
            console.warn(`Material not found: ${type} ${id}`);
            return;
        }
        const cost = material.price * quantity;
        totalCost += cost;
        materials.push({
            description: material.description,
            quantity: quantity,
            unitPrice: material.price,
            totalPrice: cost,
            itemNumber: material.itemNumber
        });
    }

    // Add posts
    addMaterial(MATERIAL_TYPES.POSTS, fenceStyle.postType, postCount);

    // Add concrete
    const concreteCount = postCount * fenceStyle.concretePerPost;
    addMaterial(MATERIAL_TYPES.CONCRETE, options.fastSetConcrete ? 'concrete_50lb_fast' : 'concrete_50lb', concreteCount);

    if (fenceStyle.isRail) {
        // Calculate rails for rail fences
        const railCount = Math.ceil(footage / 16) * fenceStyle.railCount;
        addMaterial(MATERIAL_TYPES.RAILS, fenceStyle.railType, railCount);
    } else if (fenceStyle.panelType) {
        // Calculate panels for panel fences
        const panelCount = Math.ceil(footage / fenceData.materials.panels[fenceStyle.panelType].coverage);
        addMaterial(MATERIAL_TYPES.PANELS, fenceStyle.panelType, panelCount);
    } else {
        // Calculate pickets and rails for picket fences
        const railCount = Math.ceil(footage / 16) * fenceStyle.railCount;
        addMaterial(MATERIAL_TYPES.RAILS, fenceStyle.railType, railCount);

        const picketCount = Math.ceil(footage / (fenceData.materials.pickets[fenceStyle.picketType].coverage + fenceStyle.picketSpacing));
        addMaterial(MATERIAL_TYPES.PICKETS, fenceStyle.picketType, picketCount * (fenceStyle.isDouble ? 2 : 1));
    }

    // Add included trim if applicable
    if (fenceStyle.includedTrim) {
        addMaterial(MATERIAL_TYPES.TRIM, fenceStyle.includedTrim, footage);
    }

    // Add optional trim
    if (fenceStyle.allowsTrim && options.trim) {
        addMaterial(MATERIAL_TYPES.TRIM, options.trim, footage);
    }

    // Add optional cap
    if (fenceStyle.allowsCap && options.cap) {
        addMaterial(MATERIAL_TYPES.CAPS, options.cap, footage);
    }

    // Add post tops
    if (options.postTop) {
        addMaterial(MATERIAL_TYPES.POST_TOPS, options.postTop, postCount);
    }

    // Add gates
    if (options.singleGates) {
        addMaterial(MATERIAL_TYPES.GATES, `gate_${fenceStyle.height}_${fenceStyle.isVinyl ? 'vinyl' : 'aluminum'}`, options.singleGates);
        addMaterial(MATERIAL_TYPES.HARDWARE, 'hinge_strap', options.singleGates * 2);
    }
    if (options.doubleGates) {
        addMaterial(MATERIAL_TYPES.GATES, `gate_${fenceStyle.height}_${fenceStyle.isVinyl ? 'vinyl' : 'aluminum'}`, options.doubleGates * 2);
        addMaterial(MATERIAL_TYPES.HARDWARE, 'hinge_strap', options.doubleGates * 4);
    }

    // Add gate hardware
    if (options.latch) {
        addMaterial(MATERIAL_TYPES.HARDWARE, options.latch, options.singleGates + options.doubleGates);
    }
    if (options.dropPins) {
        addMaterial(MATERIAL_TYPES.HARDWARE, 'drop_pin', options.dropPins);
    }

    // Calculate fasteners
    const fastenerFootage = footage + (options.singleGates * 4) + (options.doubleGates * 8);
    const nails2inchCount = Math.ceil(fastenerFootage / 100);
    const nails3inchCount = Math.ceil(fastenerFootage / 300);
    addMaterial(MATERIAL_TYPES.FASTENERS, 'nails_2inch', nails2inchCount);
    addMaterial(MATERIAL_TYPES.FASTENERS, 'nails_3inch', nails3inchCount);

    return { totalCost, materials };
}

// Export the function for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateFenceCost };
}