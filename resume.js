document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');
    const resumeInfo = document.querySelector('.resume-info');
    const resumeControls = document.querySelector('.resume-controls');
    const terminalContainer = document.querySelector('.terminal-container');
    let currentPdf = null;
    let isZoomed = false;
    const baseScale = 1;
    const zoomScale = 1.00;

    async function loadPdf(url) {
      try {
        if (currentPdf) currentPdf.destroy();
        const loadingTask = pdfjsLib.getDocument(url);
        currentPdf = await loadingTask.promise;
        const page = await currentPdf.getPage(1);
        const viewport = page.getViewport({ scale: baseScale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        canvas.style.transform = 'scale(1)';
        canvas.style.position = 'relative';
        canvas.style.cursor = 'zoom-in';
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (error) {
        console.error('PDF loading error:', error);
      }
    }

    canvas.addEventListener('click', () => {
      isZoomed = !isZoomed;

      if (isZoomed) {
        // Zoom in
        canvas.style.position = 'fixed';
        canvas.style.top = '50%';
        canvas.style.left = '50%';
        canvas.style.transform = `translate(-50%, -50%) scale(${zoomScale})`;
        canvas.style.zIndex = '9999';
        canvas.style.cursor = 'zoom-out';
        canvas.style.background = 'white';

        // Hide background stuff
        resumeInfo.style.display = 'none';
        resumeControls.style.display = 'none';
        terminalContainer.style.background = 'transparent';
        terminalContainer.style.boxShadow = 'none';
      } else {
        // Zoom out
        canvas.style.position = 'relative';
        canvas.style.top = '';
        canvas.style.left = '';
        canvas.style.transform = 'scale(1)';
        canvas.style.zIndex = 'auto';
        canvas.style.cursor = 'zoom-in';
        canvas.style.background = 'white';

        // Show everything again
        resumeInfo.style.display = 'block';
        resumeControls.style.display = 'flex';
        terminalContainer.style.background = 'rgba(0, 0, 0, 0.85)';
        terminalContainer.style.boxShadow = '0 0 30px rgba(0, 255, 100, 0.1)';
      }
    });

    // Load the ATS PDF by default
    loadPdf('https://resumeats.dr3w.dev/resume.pdf');
});
