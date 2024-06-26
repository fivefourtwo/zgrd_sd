document.getElementById('generate-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const prompt = document.getElementById('prompt').value;
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultDiv = document.getElementById('result');
    const imagePlaceholder = document.getElementById('image-placeholder');
    const imageElement = document.getElementById('generated-image');
    const downloadLink = document.getElementById('download-link');
    const generationTimeElement = document.getElementById('generation-time');

    resultDiv.style.display = 'none';
    imageElement.style.display = 'none';
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
        downloadLink.href = data.image_url;
        downloadLink.style.display = 'block';
        generationTimeElement.textContent = `Time taken: ${data.generation_time}`;
        resultDiv.style.display = 'block';
    } else {
        const error = await response.json();
        alert('Error: ' + error.error);
    }
});
