document.addEventListener('DOMContentLoaded', () => {  
    const chatWindow = document.getElementById('chat-window');  
    const userInput = document.getElementById('user-input');  
    const sendButton = document.getElementById('send-button');  
    const messageDiv = document.getElementById('message');  
  
    let currentStep = 0;  
    let categoryName = '';  
    let numPrompts = 0;  
    const prompts = [];  
    let currentPromptIndex = 0;  
    let isAskingForContent = false;  
  
    const steps = [  
        { question: "What's the category name?", handler: handleCategoryName },  
        { question: "How many prompts would you like to add?", handler: handleNumPrompts },  
    ];  
  
    sendButton.addEventListener('click', handleSend);  
    userInput.addEventListener('keypress', (event) => {  
        if (event.key === 'Enter') {  
            handleSend();  
        }  
    });  
  
    function handleSend() {  
        const userText = userInput.value.trim();  
        if (!userText) return;  
  
        addMessageToChat(userText, 'user-message');  
        userInput.value = '';  
  
        if (currentStep < steps.length) {  
            steps[currentStep].handler(userText);  
        } else {  
            handlePromptDetails(userText);  
        }  
    }  
  
    function handleCategoryName(input) {  
        categoryName = input;  
        currentStep++;  
        askNextQuestion();  
    }  
  
    function handleNumPrompts(input) {  
        numPrompts = parseInt(input, 10);  
        if (isNaN(numPrompts) || numPrompts < 1) {  
            addMessageToChat("Please enter a valid number.", 'assistant-message');  
        } else {  
            currentStep++;  
            askNextQuestion();  
        }  
    }  
  
    function handlePromptDetails(input) {  
        if (!isAskingForContent) {  
            // Add prompt name  
            prompts.push({ promptName: input, content: "" });  
            addMessageToChat(`Enter content for prompt "${input}":`, 'assistant-message');  
            isAskingForContent = true;  
        } else {  
            // Add prompt content  
            prompts[currentPromptIndex].content = input;  
            currentPromptIndex++;  
            isAskingForContent = false;  
            if (currentPromptIndex < numPrompts) {  
                addMessageToChat(`Enter name for prompt ${currentPromptIndex + 1}:`, 'assistant-message');  
            } else {  
                submitPrompts();  
            }  
        }  
    }  
  
    function askNextQuestion() {  
        if (currentStep < steps.length) {  
            addMessageToChat(steps[currentStep].question, 'assistant-message');  
        } else if (currentPromptIndex < numPrompts) {  
            addMessageToChat(`Enter name for prompt 1:`, 'assistant-message');  
        }  
    }  
  
    function addMessageToChat(text, className) {  
        const messageElement = document.createElement('div');  
        messageElement.className = `message ${className}`;  
        messageElement.innerHTML = `<div class="message-content">${text}</div>`;  
        chatWindow.appendChild(messageElement);  
        chatWindow.scrollTop = chatWindow.scrollHeight;  
    }  
  
    function submitPrompts() {  
        const promptData = { category: categoryName, prompts };  
        savePromptToAzure(promptData);  
        addMessageToChat('Prompts saved successfully!', 'assistant-message');  
        loadPrompts();  
        resetForm();  
    }  
  
    function resetForm() {  
        currentStep = 0;  
        categoryName = '';  
        numPrompts = 0;  
        prompts.length = 0;  
        currentPromptIndex = 0;  
        isAskingForContent = false;  
        askNextQuestion();  
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
    }  
  
    function renderEditableCategoryContent(promptData) {  
        const contentDisplay = document.getElementById('category-content');  
  
        let contentHtml = `  
            <h3>Edit Category: ${promptData.category}</h3>  
            <label for="edit-category-name">Category Name:</label>  
            <input type="text" id="edit-category-name" value="${promptData.category}" style="margin-bottom: 10px; width: 100%;">  
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
                    <td><button class="delete-prompt">Delete</button></td>  
                </tr>  
            `;  
        });  
  
        contentHtml += `  
                </tbody>  
            </table>  
            <div style="margin-top: 20px; display: flex; justify-content: space-between;">  
                <button id="delete-category" style="background-color: red; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Delete Category</button>  
                <div>  
                    <button id="add-prompt" style="background-color: cyan; color: black; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Add Prompt</button>  
                    <button id="save-changes" style="background-color: green; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Save Changes</button>  
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
                <td><button class="delete-prompt">Delete</button></td>  
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
  
        document.getElementById('delete-category').addEventListener('click', async () => {  
            if (confirm('Are you sure you want to delete this category?')) {  
                await deleteCategory(promptData.category);  
                loadPrompts();  
            }  
        });  
    }  
  
    async function deleteCategory(categoryName) {  
        const storageAccountName = 'promptfreefinal';  
        const containerName = 'prompt-lib';  
        const sasToken = 'sv=2022-11-02&ss=b&srt=co&sp=rwdlaciytfx&se=2026-01-16T04:30:29Z&st=2025-01-15T20:30:29Z&spr=https&sig=t8n%2FlbK%2F%2FvmWBUz3xH1ytCqnFqy5wX1RedSWs8SJ5b4%3D';  
        const blobName = `${categoryName}.json`;  
        const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;  
  
        const response = await fetch(blobUrl, { method: 'DELETE' });  
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
    askNextQuestion();  
});  
