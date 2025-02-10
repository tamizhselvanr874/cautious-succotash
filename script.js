document.addEventListener('DOMContentLoaded', () => {
    const messageDiv = document.getElementById('message');

    async function loadPrompts() {
        try {
            const blobs = await fetchBlobsFromAzure();
            renderSidebar(blobs);
        } catch (error) {
            messageDiv.style.color = 'red';
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

    function renderSidebar(blobs) {
        const categoryList = document.getElementById('prompt-library');
        const contentDisplay = document.getElementById('category-content');

        categoryList.innerHTML = ''; // Clear existing categories

        if (blobs.length === 0) {
            categoryList.innerHTML = '<li>No prompts available.</li>';
            contentDisplay.innerHTML = '<p>No content available.</p>';
            return;
        }

        blobs.forEach((blob) => {
            const listItem = document.createElement('li');
            listItem.textContent = blob.name;
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
        addCategoryItem.innerHTML = '<button id="add-category-button"><i class="fas fa-plus"></i> Add Category</button>';
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
                ${isNew ? '' : '<button id="delete-category" style="background-color: red; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;"><i class="fas fa-triangle-exclamation"></i></button>'}
                <div>
                    <button id="add-prompt" style="background-color: cyan; color: black; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;"><i class="fas fa-plus"></i></button>
                    <button id="save-changes" style="background-color: green; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;"><i class="fas fa-save"></i></button>
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

    loadPrompts();
});
