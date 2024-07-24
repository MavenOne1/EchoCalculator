// uiHandler.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    const fenceStyleSelect = document.getElementById('fenceStyle');
    const additionalOptionsDiv = document.getElementById('additionalOptions');
    const calculateButton = document.getElementById('calculateButton');
    const resultDiv = document.getElementById('result');
    const materialListDiv = document.getElementById('materialList');
    const form = document.getElementById('fenceForm');
    const loadingSpinner = document.getElementById('loadingSpinner');

    console.log('Form element:', form);
    console.log('Calculate button:', calculateButton);

    // Populate fence styles
    for (const [key, style] of Object.entries(fenceData.styles)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = style.name;
        fenceStyleSelect.appendChild(option);
    }
    console.log('Fence styles populated');

    // Update additional options based on selected fence style
    fenceStyleSelect.addEventListener('change', updateAdditionalOptions);

    function updateAdditionalOptions() {
        console.log('Updating additional options');
        const selectedStyle = fenceData.styles[fenceStyleSelect.value];
        additionalOptionsDiv.innerHTML = ''; // Clear existing options

        if (selectedStyle) {
            console.log('Selected style:', selectedStyle.name);
            // Add trim option if allowed
            if (selectedStyle.allowsTrim) {
                addSelectOption('trim', 'Trim', fenceData.materials.trim);
            }

            // Add cap option if allowed
            if (selectedStyle.allowsCap) {
                addSelectOption('cap', 'Cap', fenceData.materials.caps);
            }

            // Add post top option
            if (selectedStyle.compatiblePostTops && selectedStyle.compatiblePostTops.length > 0) {
                addSelectOption('postTop', 'Post Top', fenceData.materials.postTops, selectedStyle.compatiblePostTops);
            }

            // Add gate options
            addNumberInput('singleGates', 'Single Gates');
            addNumberInput('doubleGates', 'Double Gates');

            // Add latch option
            addSelectOption('latch', 'Latch', fenceData.materials.hardware, ['latch_2way', 'latch_gravity', 'latch_pool']);

            // Add drop pin option
            addNumberInput('dropPins', 'Drop Pins');

            // Add fast set concrete option
            addCheckboxOption('fastSetConcrete', 'Use Fast Set Concrete');
        }
        console.log('Additional options updated');
    }

    function addSelectOption(id, label, options, filterKeys = null) {
        console.log(`Adding select option: ${id}`);
        const selectedStyle = fenceData.styles[fenceStyleSelect.value];
        const div = document.createElement('div');
        div.innerHTML = `
            <label for="${id}">${label}:</label>
            <select id="${id}">
                <option value="">None</option>
                ${Object.entries(options)
                    .filter(([key, _]) => {
                        if (id === 'postTop') {
                            if (selectedStyle.postType.includes('4x4')) {
                                return key.includes('4x4');
                            } else if (selectedStyle.postType.includes('6x6')) {
                                return key.includes('6x6');
                            } else if (selectedStyle.postType.includes('5x5') || selectedStyle.isVinyl) {
                                return key.includes('5x5');
                            } else if (selectedStyle.isAluminum) {
                                return false;
                            }
                        }
                        return !filterKeys || filterKeys.includes(key);
                    })
                    .map(([key, item]) => `<option value="${key}">${item.description}</option>`)
                    .join('')}
            </select>
        `;
        additionalOptionsDiv.appendChild(div);
    }

    function addNumberInput(id, label) {
        console.log(`Adding number input: ${id}`);
        const div = document.createElement('div');
        div.innerHTML = `
            <label for="${id}">${label}:</label>
            <input type="number" id="${id}" min="0" value="0">
        `;
        additionalOptionsDiv.appendChild(div);
    }

    function addCheckboxOption(id, label) {
        console.log(`Adding checkbox option: ${id}`);
        const div = document.createElement('div');
        div.innerHTML = `
            <label for="${id}">
                <input type="checkbox" id="${id}">
                ${label}
            </label>
        `;
        additionalOptionsDiv.appendChild(div);
    }

    function showLoading() {
        console.log('Showing loading spinner');
        loadingSpinner.classList.remove('hidden');
        calculateButton.disabled = true;
    }

    function hideLoading() {
        console.log('Hiding loading spinner');
        loadingSpinner.classList.add('hidden');
        calculateButton.disabled = false;
    }

    console.log('Adding event listeners');

    calculateButton.addEventListener('click', function(event) {
        console.log('Calculate button clicked');
        event.preventDefault(); // Prevent default form submission
        handleCalculation();
    });

    form.addEventListener('submit', function(event) {
        console.log('Form submitted');
        event.preventDefault(); // Prevent default form submission
        handleCalculation();
    });

    function handleCalculation() {
        console.log('Handling calculation');
        if (form.checkValidity()) {
            console.log('Form is valid, calculating...');
            showLoading();
            setTimeout(() => {
                calculateFenceCost();
                hideLoading();
            }, 100); // Simulate a short delay
        } else {
            console.log('Form is invalid');
            form.reportValidity();
        }
    }

    function calculateFenceCost() {
        console.log('Calculating fence cost');
        const style = fenceStyleSelect.value;
        const footage = parseFloat(document.getElementById('footage').value);
        
        console.log(`Style: ${style}, Footage: ${footage}`);

        if (!style || isNaN(footage)) {
            console.error('Invalid style or footage');
            alert('Please select a fence style and enter valid footage.');
            return;
        }

        const options = {
            trim: document.getElementById('trim')?.value || '',
            cap: document.getElementById('cap')?.value || '',
            postTop: document.getElementById('postTop')?.value || '',
            singleGates: parseInt(document.getElementById('singleGates')?.value || '0'),
            doubleGates: parseInt(document.getElementById('doubleGates')?.value || '0'),
            latch: document.getElementById('latch')?.value || '',
            dropPins: parseInt(document.getElementById('dropPins')?.value || '0'),
            fastSetConcrete: document.getElementById('fastSetConcrete')?.checked || false
        };

        console.log('Options:', options);

        try {
            console.log('Calling calculateFenceCost function from fenceCalculator.js');
            if (typeof window.calculateFenceCost !== 'function') {
                throw new Error('calculateFenceCost function not found. Check if fenceCalculator.js is loaded correctly.');
            }
            const result = window.calculateFenceCost(style, footage, options);
            console.log('Calculation result:', result);
            displayResult(result);
        } catch (error) {
            console.error('Error in calculation:', error);
            alert('An error occurred during calculation: ' + error.message);
        }
    }

    function displayResult(result) {
        console.log('Displaying result');
        resultDiv.textContent = `Total Cost: $${result.totalCost.toFixed(2)}`;

        materialListDiv.innerHTML = '<h3>Material List</h3>';
        const table = document.createElement('table');
        table.innerHTML = `
            <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Item Number</th>
            </tr>
            ${result.materials.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice.toFixed(2)}</td>
                    <td>$${item.totalPrice.toFixed(2)}</td>
                    <td>${item.itemNumber}</td>
                </tr>
            `).join('')}
        `;
        materialListDiv.appendChild(table);
        console.log('Result displayed');
    }

    // Initialize additional options
    updateAdditionalOptions();
    console.log('Initial setup complete');
});