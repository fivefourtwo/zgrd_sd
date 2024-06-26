document.getElementById('generate-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const prompt = document.getElementById('prompt').value;
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultDiv = document.getElementById('result');
    const imageElement = document.getElementById('generated-image');
    const downloadButton = document.getElementById('download-button');
    const generationTimeElement = document.getElementById('generation-time');

    resultDiv.style.display = 'none';
    imageElement.style.display = 'none';
    downloadButton.style.display = 'none';
    loadingSpinner.style.display = 'block';

    const response = await fetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'prompt': prompt
        })
    });

    loadingSpinner.style.display = 'none';

    if (response.ok) {
        const data = await response.json();
        imageElement.src = data.image_url;
        imageElement.style.display = 'block';
        downloadButton.dataset.url = data.image_url;
        downloadButton.style.display = 'inline-block';
        generationTimeElement.textContent = `Time taken: ${data.generation_time}`;
        resultDiv.style.display = 'flex';
    } else {
        const error = await response.json();
        alert('Error: ' + error.error);
    }
});

document.getElementById('download-button').addEventListener('click', function () {
    const url = this.dataset.url;
    const link = document.createElement('a');
    link.href = url;
    link.download = url.substring(url.lastIndexOf('/') + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
