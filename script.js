document.addEventListener('DOMContentLoaded', () => {
    const messageDiv = document.getElementById('message');

    async function loadPrompts() {
        try {
            const blobs = await fetchBlobsFromAzure();
            renderSidebar(blobs);
        } catch (error) {
            messageDiv.style.color = 'cyan';
            messageDiv.textContent = 'Failed to fetch prompts.';
            console.error('Error fetching prompts:', error);
        }
    }

    async function fetchBlobsFromAzure() {
        const storageAccountName = 'promptfreefinal';
        const containerName = 'prompt-lib';
        const sasToken = 'sv=2022-11-02&ss=b&srt=co&sp=rwdlaciytfx&se=2026-01-16T04:30:29Z&st=2025-01-15T20:30:29Z&spr=https&sig=t8n%2FlbK%2F%2FvmWBUz3xH1ytCqnFqy5wX1RedSWs8SJ5b4%3D';
        const listUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}?restype=container&comp=list&${sasToken}`;

        const response = await fetch(listUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch blob list: ${response.statusText}`);
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");

        const blobs = Array.from(xmlDoc.getElementsByTagName("Blob")).map(blob => ({
            name: blob.getElementsByTagName("Name")[0].textContent,
        }));

        return blobs;
    }

    const azureEndpoint = "https://afs.openai.azure.com/";
    const apiKey = "a9c9ed4ede724626a6bfddff2c717817";
    const apiVersion = "2024-10-01-preview";
    const model = "gpt-4o-mini";

    async function callAzureOpenAI(messages, maxTokens, temperature) {
        const response = await fetch(`${azureEndpoint}/openai/deployments/${model}/chat/completions?api-version=${apiVersion}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: messages,
                max_tokens: maxTokens,
                temperature: temperature
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to call Azure OpenAI: ${response.statusText}`);
        }

        return await response.json();
    }

    async function icon_code_generation(categoryName) {
        const prompt = `Generate a FontAwesome icon class for the category "${categoryName}". If the category name is irrelevant, suggest a more relatable and commonly available icon.`;

        try {
            const response = await callAzureOpenAI([{ role: "user", content: prompt }], 50, 0.5);
            if (response && response.choices && response.choices[0] && response.choices[0].text) {
                const suggestedIcon = response.choices[0].text.trim();
                const validIconFormat = /^fa-solid fa-[\w-]+$/;

                if (validIconFormat.test(suggestedIcon)) {
                    return suggestedIcon;
                }

                const parsedIcon = suggestedIcon.split(/\s+/).find(icon => validIconFormat.test(icon));
                if (parsedIcon) {
                    return parsedIcon;
                }
            }
        } catch (error) {
            console.error('Error during icon generation:', error);
        }

        const derivedIcons = {
            "default": "fa-solid fa-info-circle",
            "address-book": "fa-solid fa-address-book",
            "address-card": "fa-solid fa-address-card",
            "angry": "fa-solid fa-angry",
            "arrow-alt-circle-down": "fa-solid fa-arrow-alt-circle-down",
            "arrow-alt-circle-left": "fa-solid fa-arrow-alt-circle-left",
            "arrow-alt-circle-right": "fa-solid fa-arrow-alt-circle-right",
            "arrow-alt-circle-up": "fa-solid fa-arrow-alt-circle-up",
            "bell": "fa-solid fa-bell",
            "bell-slash": "fa-solid fa-bell-slash",
            "bookmark": "fa-solid fa-bookmark",
            "building": "fa-solid fa-building",
            "calendar": "fa-solid fa-calendar",
            "calendar-alt": "fa-solid fa-calendar-alt",
            "calendar-check": "fa-solid fa-calendar-check",
            "calendar-minus": "fa-solid fa-calendar-minus",
            "calendar-plus": "fa-solid fa-calendar-plus",
            "calendar-times": "fa-solid fa-calendar-times",
            "caret-square-down": "fa-solid fa-caret-square-down",
            "caret-square-left": "fa-solid fa-caret-square-left",
            "caret-square-right": "fa-solid fa-caret-square-right",
            "caret-square-up": "fa-solid fa-caret-square-up",
            "chart-bar": "fa-solid fa-chart-bar",
            "check-circle": "fa-solid fa-check-circle",
            "check-square": "fa-solid fa-check-square",
            "circle": "fa-solid fa-circle",
            "clipboard": "fa-solid fa-clipboard",
            "clock": "fa-solid fa-clock",
            "clone": "fa-solid fa-clone",
            "closed-captioning": "fa-solid fa-closed-captioning",
            "comment": "fa-solid fa-comment",
            "comment-alt": "fa-solid fa-comment-alt",
            "comment-dots": "fa-solid fa-comment-dots",
            "comments": "fa-solid fa-comments",
            "compass": "fa-solid fa-compass",
            "copy": "fa-solid fa-copy",
            "copyright": "fa-solid fa-copyright",
            "credit-card": "fa-solid fa-credit-card",
            "dizzy": "fa-solid fa-dizzy",
            "dot-circle": "fa-solid fa-dot-circle",
            "edit": "fa-solid fa-edit",
            "envelope": "fa-solid fa-envelope",
            "envelope-open": "fa-solid fa-envelope-open",
            "eye": "fa-solid fa-eye",
            "eye-slash": "fa-solid fa-eye-slash",
            "file": "fa-solid fa-file",
            "file-alt": "fa-solid fa-file-alt",
            "file-archive": "fa-solid fa-file-archive",
            "file-audio": "fa-solid fa-file-audio",
            "file-code": "fa-solid fa-file-code",
            "file-excel": "fa-solid fa-file-excel",
            "file-image": "fa-solid fa-file-image",
            "file-pdf": "fa-solid fa-file-pdf",
            "file-powerpoint": "fa-solid fa-file-powerpoint",
            "file-video": "fa-solid fa-file-video",
            "file-word": "fa-solid fa-file-word",
            "flag": "fa-solid fa-flag",
            "flushed": "fa-solid fa-flushed",
            "folder": "fa-solid fa-folder",
            "folder-open": "fa-solid fa-folder-open",
            "frown": "fa-solid fa-frown",
            "frown-open": "fa-solid fa-frown-open",
            "futbol": "fa-solid fa-futbol",
            "gem": "fa-solid fa-gem",
            "grimace": "fa-solid fa-grimace",
            "grin": "fa-solid fa-grin",
            "grin-alt": "fa-solid fa-grin-alt",
            "grin-beam": "fa-solid fa-grin-beam",
            "grin-beam-sweat": "fa-solid fa-grin-beam-sweat",
            "grin-hearts": "fa-solid fa-grin-hearts",
            "grin-squint": "fa-solid fa-grin-squint",
            "grin-squint-tears": "fa-solid fa-grin-squint-tears",
            "grin-stars": "fa-solid fa-grin-stars",
            "grin-tears": "fa-solid fa-grin-tears",
            "grin-tongue": "fa-solid fa-grin-tongue",
            "grin-tongue-squint": "fa-solid fa-grin-tongue-squint",
            "grin-tongue-wink": "fa-solid fa-grin-tongue-wink",
            "grin-wink": "fa-solid fa-grin-wink",
            "hand-lizard": "fa-solid fa-hand-lizard",
            "hand-paper": "fa-solid fa-hand-paper",
            "hand-peace": "fa-solid fa-hand-peace",
            "hand-point-down": "fa-solid fa-hand-point-down",
            "hand-point-left": "fa-solid fa-hand-point-left",
            "hand-point-right": "fa-solid fa-hand-point-right",
            "hand-point-up": "fa-solid fa-hand-point-up",
            "hand-pointer": "fa-solid fa-hand-pointer",
            "hand-rock": "fa-solid fa-hand-rock",
            "hand-scissors": "fa-solid fa-hand-scissors",
            "hand-spock": "fa-solid fa-hand-spock",
            "handshake": "fa-solid fa-handshake",
            "hdd": "fa-solid fa-hdd",
            "heart": "fa-solid fa-heart",
            "hospital": "fa-solid fa-hospital",
            "hourglass": "fa-solid fa-hourglass",
            "id-badge": "fa-solid fa-id-badge",
            "id-card": "fa-solid fa-id-card",
            "image": "fa-solid fa-image",
            "images": "fa-solid fa-images",
            "keyboard": "fa-solid fa-keyboard",
            "kiss": "fa-solid fa-kiss",
            "kiss-beam": "fa-solid fa-kiss-beam",
            "kiss-wink-heart": "fa-solid fa-kiss-wink-heart",
            "laugh": "fa-solid fa-laugh",
            "laugh-beam": "fa-solid fa-laugh-beam",
            "laugh-squint": "fa-solid fa-laugh-squint",
            "laugh-wink": "fa-solid fa-laugh-wink",
            "lemon": "fa-solid fa-lemon",
            "life-ring": "fa-solid fa-life-ring",
            "lightbulb": "fa-solid fa-lightbulb",
            "list-alt": "fa-solid fa-list-alt",
            "map": "fa-solid fa-map",
            "meh": "fa-solid fa-meh",
            "meh-blank": "fa-solid fa-meh-blank",
            "meh-rolling-eyes": "fa-solid fa-meh-rolling-eyes",
            "minus-square": "fa-solid fa-minus-square",
            "money-bill-alt": "fa-solid fa-money-bill-alt",
            "moon": "fa-solid fa-moon",
            "newspaper": "fa-solid fa-newspaper",
            "object-group": "fa-solid fa-object-group",
            "object-ungroup": "fa-solid fa-object-ungroup",
            "paper-plane": "fa-solid fa-paper-plane",
            "pause-circle": "fa-solid fa-pause-circle",
            "play-circle": "fa-solid fa-play-circle",
            "plus-square": "fa-solid fa-plus-square",
            "question-circle": "fa-solid fa-question-circle",
            "registered": "fa-solid fa-registered",
            "sad-cry": "fa-solid fa-sad-cry",
            "sad-tear": "fa-solid fa-sad-tear",
            "save": "fa-solid fa-save",
            "share-square": "fa-solid fa-share-square",
            "smile": "fa-solid fa-smile",
            "smile-beam": "fa-solid fa-smile-beam",
            "smile-wink": "fa-solid fa-smile-wink",
            "snowflake": "fa-solid fa-snowflake",
            "square": "fa-solid fa-square",
            "star": "fa-solid fa-star",
            "star-half": "fa-solid fa-star-half",
            "sticky-note": "fa-solid fa-sticky-note",
            "stop-circle": "fa-solid fa-stop-circle",
            "sun": "fa-solid fa-sun",
            "surprise": "fa-solid fa-surprise",
            "thumbs-down": "fa-solid fa-thumbs-down",
            "thumbs-up": "fa-solid fa-thumbs-up",
            "times-circle": "fa-solid fa-times-circle",
            "tired": "fa-solid fa-tired",
            "trash-alt": "fa-solid fa-trash-alt",
            "user": "fa-solid fa-user",
            "user-circle": "fa-solid fa-user-circle",
            "window-close": "fa-solid fa-window-close",
            "window-maximize": "fa-solid fa-window-maximize",
            "window-minimize": "fa-solid fa-window-minimize",
            "window-restore": "fa-solid fa-window-restore",
            "youtube thumbnails": "fa-solid fa-video",
            "oil paintings": "fa-solid fa-palette",
            "ultra realistic foods": "fa-solid fa-utensils",
            "professional product photography": "fa-solid fa-box-open",
            "realistic human portraits": "fa-solid fa-user-tie",
            "logos and brand mascots": "fa-solid fa-paint-brush",
            "lifestyle stock images of people": "fa-solid fa-users",
            "landscapes": "fa-solid fa-mountain",
            "macro photography": "fa-solid fa-search-plus",
            "architecture": "fa-solid fa-building",
            "car": "fa-solid fa-car",
            "tree": "fa-solid fa-tree",
            "animal": "fa-solid fa-dog",
            "user": "fa-solid fa-user",
            "camera": "fa-solid fa-camera",
            "city": "fa-solid fa-city",
            "heart": "fa-solid fa-heart",
            "search": "fa-solid fa-search",
            "video": "fa-solid fa-video",
            "brush": "fa-solid fa-brush",
            "utensils": "fa-solid fa-utensils",
            "mountain": "fa-solid fa-mountain",
            "home": "fa-solid fa-home",
            "bell": "fa-solid fa-bell",
            "book": "fa-solid fa-book",
            "calendar": "fa-solid fa-calendar",
            "chart": "fa-solid fa-chart-bar",
            "cloud": "fa-solid fa-cloud",
            "code": "fa-solid fa-code",
            "comment": "fa-solid fa-comment",
            "envelope": "fa-solid fa-envelope",
            "flag": "fa-solid fa-flag",
            "folder": "fa-solid fa-folder",
            "gamepad": "fa-solid fa-gamepad",
            "gift": "fa-solid fa-gift",
            "globe": "fa-solid fa-globe",
            "key": "fa-solid fa-key",
            "lock": "fa-solid fa-lock",
            "music": "fa-solid fa-music",
            "phone": "fa-solid fa-phone",
            "shopping-cart": "fa-solid fa-shopping-cart",
            "star": "fa-solid fa-star",
            "sun": "fa-solid fa-sun",
            "thumbs-up": "fa-solid fa-thumbs-up",
            "toolbox": "fa-solid fa-toolbox",
            "trash": "fa-solid fa-trash",
            "user-circle": "fa-solid fa-user-circle",
            "wrench": "fa-solid fa-wrench",
            "wifi": "fa-solid fa-wifi",
            "battery-full": "fa-solid fa-battery-full",
            "bolt": "fa-solid fa-bolt",
            "coffee": "fa-solid fa-coffee",
            "handshake": "fa-solid fa-handshake",
            "laptop": "fa-solid fa-laptop",
            "microphone": "fa-solid fa-microphone",
            "paper-plane": "fa-solid fa-paper-plane",
            "plane": "fa-solid fa-plane",
            "robot": "fa-solid fa-robot",
            "school": "fa-solid fa-school",
            "tools": "fa-solid fa-tools",
            "rocket": "fa-solid fa-rocket",
            "snowflake": "fa-solid fa-snowflake",
            "umbrella": "fa-solid fa-umbrella",
            "wallet": "fa-solid fa-wallet",
            "anchor": "fa-solid fa-anchor",
            "archway": "fa-solid fa-archway",
            "bicycle": "fa-solid fa-bicycle",
            "binoculars": "fa-solid fa-binoculars",
            "crown": "fa-solid fa-crown",
            "diamond": "fa-solid fa-gem",
            "drum": "fa-solid fa-drum",
            "feather": "fa-solid fa-feather",
            "fish": "fa-solid fa-fish",
            "frog": "fa-solid fa-frog",
            "gavel": "fa-solid fa-gavel",
            "hammer": "fa-solid fa-hammer",
            "hospital": "fa-solid fa-hospital",
            "lightbulb": "fa-solid fa-lightbulb",
            "magnet": "fa-solid fa-magnet",
            "map": "fa-solid fa-map",
            "medal": "fa-solid fa-medal",
            "palette": "fa-solid fa-palette",
            "pepper-hot": "fa-solid fa-pepper-hot",
            "piggy-bank": "fa-solid fa-piggy-bank",
            "ring": "fa-solid fa-ring",
            "ship": "fa-solid fa-ship",
            "skull": "fa-solid fa-skull",
            "smile": "fa-solid fa-smile",
            "space-shuttle": "fa-solid fa-space-shuttle",
            "spider": "fa-solid fa-spider",
            "stopwatch": "fa-solid fa-stopwatch",
            "trophy": "fa-solid fa-trophy",
            "truck": "fa-solid fa-truck",
            "volleyball": "fa-solid fa-volleyball-ball",
            "wine-glass": "fa-solid fa-wine-glass",
            "yacht": "fa-solid fa-sailboat",
            "leaf": "fa-solid fa-leaf",
            "apple": "fa-solid fa-apple-alt",
            "rocket-launch": "fa-solid fa-rocket-launch",
            "paint-roller": "fa-solid fa-paint-roller",
            "fire": "fa-solid fa-fire",
            "shield": "fa-solid fa-shield-alt",
            "tag": "fa-solid fa-tag",
            "thermometer": "fa-solid fa-thermometer",
            "puzzle-piece": "fa-solid fa-puzzle-piece",
            "battery-half": "fa-solid fa-battery-half",
            "balance-scale": "fa-solid fa-balance-scale",
            "hourglass": "fa-solid fa-hourglass",
            "clipboard": "fa-solid fa-clipboard",
            "dumbbell": "fa-solid fa-dumbbell",
            "futbol": "fa-solid fa-futbol",
            "hospital-alt": "fa-solid fa-hospital-alt",
            "magic": "fa-solid fa-magic",
            "praying-hands": "fa-solid fa-praying-hands",
            "recycle": "fa-solid fa-recycle",
            "stethoscope": "fa-solid fa-stethoscope",
            "syringe": "fa-solid fa-syringe",
            "walking": "fa-solid fa-walking",
            "weight": "fa-solid fa-weight",
            "yin-yang": "fa-solid fa-yin-yang"
        };

        for (const [key, value] of Object.entries(derivedIcons)) {
            if (categoryName.toLowerCase().includes(key)) {
                return value;
            }
        }

        return "fa-solid fa-info-circle"; // Default icon if no match
    }

    async function fetchBlobData(blobName) {
        const storageAccountName = 'promptfreefinal';
        const containerName = 'prompt-lib';
        const sasToken = 'sv=2022-11-02&ss=b&srt=co&sp=rwdlaciytfx&se=2026-01-16T04:30:29Z&st=2025-01-15T20:30:29Z&spr=https&sig=t8n%2FlbK%2F%2FvmWBUz3xH1ytCqnFqy5wX1RedSWs8SJ5b4%3D';
        const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

        const response = await fetch(blobUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch blob: ${response.statusText}`);
        }
        return await response.json();
    }

    function renderSidebar(blobs) {
        const categoryList = document.getElementById('prompt-library');
        const contentDisplay = document.getElementById('category-content');

        categoryList.innerHTML = ''; // Clear existing categories

        if (blobs.length === 0) {
            categoryList.innerHTML = '<li>No prompts available.</li>';
            contentDisplay.innerHTML = '<p>No content available.</p>';
            return;
        }

        blobs.forEach(async (blob) => {
            const categoryName = blob.name.replace('.json', '');
            const iconClass = await icon_code_generation(categoryName);

            const listItem = document.createElement('li');
            listItem.innerHTML = `<i class="${iconClass}" style="margin-right: 10px;"></i>`;
            listItem.dataset.category = blob.name;

            // Handle category click
            listItem.addEventListener('click', async () => {
                const promptData = await fetchBlobData(blob.name);

                // Highlight the active category
                document.querySelectorAll('#prompt-library li').forEach((li) => li.classList.remove('active'));
                listItem.classList.add('active');

                // Render editable content
                renderEditableCategoryContent(promptData);
            });

            categoryList.appendChild(listItem);
        });

        // Add "Add Category" button
        const addCategoryItem = document.createElement('li');
        addCategoryItem.className = 'add-category';
        addCategoryItem.innerHTML = '<button id="add-category-button"><i class="fas fa-plus"></i></button>';
        categoryList.appendChild(addCategoryItem);

        document.getElementById('add-category-button').addEventListener('click', () => {
            const newCategory = {
                category: '',
                prompts: []
            };
            renderEditableCategoryContent(newCategory, true);
        });
    }

    function renderEditableCategoryContent(promptData, isNew = false) {
        const contentDisplay = document.getElementById('category-content');

        let contentHtml = `
            <h3>${isNew ? 'Add New Category' : `Edit Category: ${promptData.category}`}</h3>
            <label for="edit-category-name">Category Name:</label>
            <input type="text" id="edit-category-name" value="${promptData.category}" style="margin-bottom: 10px;width: 50%;">
            <table id="edit-prompt-table">
                <thead>
                    <tr>
                        <th>Prompt Name</th>
                        <th>Prompt Content</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        promptData.prompts.forEach((prompt, index) => {
            contentHtml += `
                <tr>
                    <td><input type="text" value="${prompt.promptName}" style="width: 90%;"></td>
                    <td><textarea style="width: 90%; height: 40px;">${prompt.content}</textarea></td>
                    <td><button class="delete-prompt"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
        });

        contentHtml += `
                </tbody>
            </table>
            <div style="margin-top: 20px; display: flex; justify-content: space-between;">
                ${isNew ? '' : '<button id="delete-category" style="background-color: cyan; color: black; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;"><i class="fas fa-triangle-exclamation"></i></button>'}
                <div>
                    <button id="add-prompt" style="background-color: cyan; color: black; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;"><i class="fas fa-plus"></i></button>
                    <button id="save-changes" style="background-color: cyan; color: black; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;"><i class="fas fa-save"></i></button>
                </div>
            </div>
        `;

        contentDisplay.innerHTML = contentHtml;

        document.querySelectorAll('.delete-prompt').forEach(button => {
            button.addEventListener('click', (e) => e.target.closest('tr').remove());
        });

        document.getElementById('add-prompt').addEventListener('click', () => {
            const tableBody = contentDisplay.querySelector('tbody');
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><input type="text" placeholder="Prompt Name" style="width: 90%;"></td>
                <td><textarea placeholder="Prompt Content" style="width: 90%; height: 40px;"></textarea></td>
                <td><button class="delete-prompt"><i class="fas fa-trash"></i></button></td>
            `;
            newRow.querySelector('.delete-prompt').addEventListener('click', (e) => e.target.closest('tr').remove());
            tableBody.appendChild(newRow);
        });

        document.getElementById('save-changes').addEventListener('click', async () => {
            const updatedPrompts = Array.from(contentDisplay.querySelectorAll('tbody tr')).map(row => ({
                promptName: row.querySelector('input').value,
                content: row.querySelector('textarea').value,
            }));

            const updatedData = {
                category: document.getElementById('edit-category-name').value,
                prompts: updatedPrompts,
            };

            await savePromptToAzure(updatedData);
            alert('Changes saved successfully!');
            loadPrompts();
        });

        if (!isNew) {
            document.getElementById('delete-category').addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this category?')) {
                    await deleteCategory(promptData.category);
                    loadPrompts();
                }
            });
        }
    }

    async function savePromptToAzure(promptData) {
        const storageAccountName = 'promptfreefinal';
        const containerName = 'prompt-lib';
        const blobName = `${promptData.category}.json`;
        const sasToken = '?sv=2022-11-02&ss=b&srt=co&sp=rwdlaciytfx&se=2026-01-16T04:30:29Z&st=2025-01-15T20:30:29Z&spr=https&sig=t8n%2FlbK%2F%2FvmWBUz3xH1ytCqnFqy5wX1RedSWs8SJ5b4%3D';
        const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName}${sasToken}`;

        const response = await fetch(blobUrl, {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(promptData),
        });
        if (!response.ok) {
            throw new Error(`Failed to save blob: ${response.statusText}`);
        }
    }

    async function deleteCategory(categoryName) {
        const storageAccountName = 'promptfreefinal';
        const containerName = 'prompt-lib';
        const sasToken = 'sv=2022-11-02&ss=b&srt=co&sp=rwdlaciytfx&se=2026-01-16T04:30:29Z&st=2025-01-15T20:30:29Z&spr=https&sig=t8n%2FlbK%2F%2FvmWBUz3xH1ytCqnFqy5wX1RedSWs8SJ5b4%3D';
        const blobName = `${categoryName}.json`;
        const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

        const response = await fetch(blobUrl, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Failed to delete blob: ${response.statusText}`);
        }
        alert('Category deleted successfully.');
    }

    loadPrompts();
});
