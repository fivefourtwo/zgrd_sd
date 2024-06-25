document.getElementById('generate-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const prompt = document.getElementById('prompt').value;
    const progressBar = document.getElementById('progress-bar');
    const resultDiv = document.getElementById('result');
    const imageElement = document.getElementById('generated-image');
    const downloadLink = document.getElementById('download-link');
    const generationTimeElement = document.getElementById('generation-time');

    resultDiv.style.display = 'none';
    progressBar.style.width = '0%';

    const interval = setInterval(() => {
        const width = parseInt(progressBar.style.width);
        if (width < 100) {
            progressBar.style.width = (width + 1) + '%';
        }
    }, 100);

    const response = await fetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'prompt': prompt
        })
    });

    clearInterval(interval);
    progressBar.style.width = '100%';

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
