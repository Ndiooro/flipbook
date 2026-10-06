import React, { useEffect, useRef, useState, forwardRef } from 'react';
import HTMLFlipBook from '@gullabs/react-flipbook';
import { addIcons } from 'ionicons';
import { arrowBackOutline, arrowForwardOutline, downloadOutline } from 'ionicons/icons';
import { defineCustomElement as defineIonIcon } from 'ionicons/components/ion-icon.js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import flipbookCoreSource from '@flipbook-core-source?raw';
import flipbookCoreStyles from '@flipbook-core-styles?raw';
import './Flipbook.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
defineIonIcon();
addIcons({ arrowBackOutline, arrowForwardOutline, downloadOutline });

const imageToDataUrl = async (imageUrl) => {
  if (!imageUrl || imageUrl.startsWith('data:')) return imageUrl;

  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error('Le logo est indisponible.');

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Le logo ne peut pas être intégré.'));
    reader.readAsDataURL(blob);
  });
};

const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const standaloneFlipbookCore = flipbookCoreSource.replace(
  /export\{[\s\S]*\};\/\/# sourceMappingURL=.*$/,
  'window.PageFlip = xt;'
);

const previousIcon = '<svg viewBox="0 0 512 512" aria-hidden="true"><path d="M244 400 100 256l144-144M120 256h292" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48"></path></svg>';
const nextIcon = '<svg viewBox="0 0 512 512" aria-hidden="true"><path d="m268 112 144 144-144 144M392 256H100" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48"></path></svg>';

const Page = forwardRef((props, ref) => {
  return (
    <div className="page" ref={ref} data-density={props.density || 'soft'}>
      <div className="page-content">
        <img src={props.image} alt={props.alt} className="pdf-page-image" />
      </div>
    </div>
  );
});

Page.displayName = 'Page';

const Flipbook = ({ pdfFile, logoUrl }) => {
  const [pages, setPages] = useState([]);
  const [pageSize, setPageSize] = useState({ width: 380, height: 532 });
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const flipBookRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      if (!pdfFile) return;

      try {
        setIsLoading(true);
        setError(null);
        setPages([]);

        const pdf = await pdfjsLib.getDocument(pdfFile).promise;
        if (cancelled) return;

        // Calcul du ratio réel du PDF
        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1 });
        const ratio = viewport.height / viewport.width;

        // Dimension de base pour l'affichage
        const baseWidth = 380;
        const baseHeight = Math.round(baseWidth * ratio);
        setPageSize({ width: baseWidth, height: baseHeight });

        // Rendu des pages haute définition
        const renderedPages = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const pageViewport = page.getViewport({ scale: 2.5 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d', { alpha: false });

          canvas.width = pageViewport.width;
          canvas.height = pageViewport.height;

          await page.render({
            canvasContext: context,
            viewport: pageViewport,
          }).promise;

          renderedPages.push(canvas.toDataURL('image/png'));
          if (cancelled) return;
        }

        setPages(renderedPages);
      } catch (err) {
        console.error('Erreur lors du chargement du PDF :', err);
        if (!cancelled) {
          setError('Impossible de charger le catalogue.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [pdfFile]);


  const nextPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.flipNext();
    }
  };

  const previousPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.flipPrev();
    }
  };

  const downloadFlipbookHTML = async () => {
    try {
      const embeddedLogo = await imageToDataUrl(logoUrl);
      const pageMarkup = pages.map((page, index) => `
        <article class="page${index === 0 ? ' active' : ''}" data-page="${index}">
          <div class="page-content">
            <img src="${page}" alt="Page ${index + 1}">
          </div>
        </article>`).join('');
      const logoMarkup = embeddedLogo
        ? `<img src="${escapeHtml(embeddedLogo)}" alt="Logo" class="external-logo">`
        : '';

      const htmlContent = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Catalogue interactif</title>
  <style>
    ${flipbookCoreStyles}
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    html, body { width: 100%; height: 100%; margin: 0; padding: 0; background: #00202d !important; font-family: system-ui, sans-serif; }
    body { min-height: 100vh; min-height: 100dvh; overflow: hidden; }
    .flipbook-wrapper { width: 100vw; height: 100vh; height: 100dvh; min-height: 100vh; min-height: 100dvh; display: grid; place-items: center; position: relative; overflow: hidden; padding: 24px 20px 84px; background: #00202d; }
    #flipbook, #flipbook .stf__parent, #flipbook .stf__wrapper, #flipbook .stf__block { background: transparent !important; box-shadow: none !important; }
    #flipbook { width: min(90vw, 900px); max-width: calc(100vw - 40px); height: min(76vh, 620px); max-height: calc(100dvh - 108px); position: relative; }
    #flipbook .page { background: #fff; overflow: hidden; }
    #flipbook .page-content { position: relative; width: 100%; height: 100%; background: #fff; overflow: hidden; }
    #flipbook .page-content::after { content: ""; position: absolute; top: 0; bottom: 0; width: 45px; pointer-events: none; z-index: 10; }
    #flipbook .page.--left .page-content::after { right: 0; background: linear-gradient(to left, rgba(0,0,0,.30) 0%, rgba(0,0,0,.12) 30%, rgba(0,0,0,0) 100%); }
    #flipbook .page.--right .page-content::after { left: 0; background: linear-gradient(to right, rgba(0,0,0,.30) 0%, rgba(0,0,0,.12) 30%, rgba(0,0,0,0) 100%); }
    #flipbook .page-content, #flipbook .page-content::after { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
    #flipbook .page img { display: block; width: 100%; height: 100%; object-fit: fill; user-select: none; pointer-events: none; }
    .external-logo { position: fixed; left: 24px; bottom: 20px; width: 100px; max-height: 52px; object-fit: contain; }
    .flipbook-controls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 16px; padding: 6px 20px; border-radius: 30px; background: rgba(255,255,255,.95); box-shadow: 0 8px 25px rgba(0,0,0,.3); opacity: 1; transition: opacity .25s ease, transform .25s ease; z-index: 20; }
    .flipbook-wrapper.is-interacting .flipbook-controls { opacity: .16; pointer-events: none; }
    button { width: 38px; height: 38px; border: 0; border-radius: 50%; color: #fff; background: #23272d; cursor: pointer; font-size: 20px; display: inline-flex; align-items: center; justify-content: center; }
    button svg { width: 22px; height: 22px; display: block; }
    button:hover:not(:disabled) { background: #0088ff; } button:disabled { opacity: .25; cursor: not-allowed; }
    .page-counter { min-width: 60px; color: #23272d; text-align: center; font-size: 15px; font-weight: 600; }
    .orientation-hint { display: none; }
    @media (max-width: 600px) and (orientation: portrait) {
      .flipbook-wrapper { padding: 12px 8px 70px; }
      #flipbook { width: min(92vw, 420px); height: min(calc(100svh - 150px), 560px); min-height: 260px; }
      #flipbook, #flipbook .stf__parent, #flipbook .stf__wrapper, #flipbook .stf__block { background: transparent !important; box-shadow: none !important; }
      .orientation-hint { position: fixed; inset: 50% auto auto 50%; z-index: 30; display: flex; flex-direction: column; align-items: center; gap: 10px; width: min(82vw, 310px); padding: 16px 18px; transform: translate(-50%, -50%); border: 1px solid rgba(255,255,255,.28); border-radius: 14px; background: rgba(0,32,45,.88); color: #fff; text-align: center; pointer-events: none; box-shadow: 0 12px 30px rgba(0,0,0,.32); }
      .orientation-hint svg { width: 88px; height: 66px; animation: orientation-pulse 2.2s ease-in-out infinite; }
      .orientation-hint p { margin: 0; font-size: 14px; line-height: 1.35; }
    }
    @media (max-width: 600px) and (orientation: landscape) {
      .flipbook-wrapper { padding: 8px 8px 56px; }
      #flipbook { width: min(92vw, 1000px); height: calc(100svh - 72px); min-height: 180px; max-height: 760px; }
      #flipbook, #flipbook .stf__parent, #flipbook .stf__wrapper, #flipbook .stf__block { background: transparent !important; box-shadow: none !important; }
      .external-logo { left: 10px; bottom: 10px; width: 64px; max-height: 34px; }
      .flipbook-controls { bottom: 8px; gap: 6px; padding: 3px 8px; border-radius: 22px; }
      button { width: 30px; height: 30px; font-size: 16px; }
      .page-counter { min-width: 45px; font-size: 12px; }
    }
    @media (max-width: 600px) and (orientation: portrait) {
      .external-logo { left: 10px; bottom: 10px; width: 64px; max-height: 36px; }
      .flipbook-controls { bottom: 10px; gap: 6px; padding: 3px 8px; border-radius: 22px; }
      button { width: 30px; height: 30px; font-size: 16px; }
      .page-counter { min-width: 45px; font-size: 12px; }
    }
    @keyframes orientation-pulse { 0%, 100% { transform: rotate(0deg) scale(1); opacity: .82; } 50% { transform: rotate(90deg) scale(1.04); opacity: 1; } }
  </style>
</head>
<body>
  <main class="flipbook-wrapper">
    <section id="flipbook" aria-label="Catalogue interactif">${pageMarkup}</section>
    <aside class="orientation-hint" aria-label="Conseil d’orientation">
      <svg viewBox="0 0 120 88" role="img" aria-hidden="true">
        <rect x="39" y="20" width="42" height="48" rx="6" fill="none" stroke="currentColor" stroke-width="3"></rect>
        <circle cx="60" cy="61" r="2" fill="currentColor"></circle>
        <path d="M18 45V30a12 12 0 0 1 12-12h10M102 43v15a12 12 0 0 1-12 12H78" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
        <path d="m31 10 9 8-9 8M89 78l-11-8 11-8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
      <p>Tournez votre téléphone en mode paysage pour une meilleure expérience.</p>
    </aside>
    ${logoMarkup}
    <nav class="flipbook-controls" aria-label="Navigation du catalogue">
      <button id="previous" type="button" aria-label="Page précédente">${previousIcon}</button>
      <div class="page-counter"><strong id="current-page">1</strong> / ${pages.length}</div>
      <button id="next" type="button" aria-label="Page suivante">${nextIcon}</button>
    </nav>
  </main>
  <script>
    ${standaloneFlipbookCore}
    (() => {
      const pageElements = [...document.querySelectorAll('.page')];
      const previousButton = document.getElementById('previous');
      const nextButton = document.getElementById('next');
      const currentPage = document.getElementById('current-page');
      const pageFlip = new window.PageFlip(document.getElementById('flipbook'), {
        width: ${pageSize.width},
        height: ${pageSize.height},
        sizing: 'responsive',
        minWidth: 180,
        maxWidth: 1000,
        minHeight: 180,
        maxHeight: 760,
        maxShadowOpacity: 0.8,
        flippingTime: 800,
        hardCovers: true,
        usePortrait: false,
        initialPage: 0,
        drawShadow: true,
        respectInteractiveContent: true,
        injectStyles: false
      });
      pageFlip.on('flip', ({ data }) => {
        currentPage.textContent = data.page + 1;
        previousButton.disabled = data.page === 0;
        nextButton.disabled = data.page >= data.pageCount - 1;
      });
      pageFlip.loadFromHTML(pageElements);
      previousButton.addEventListener('click', () => pageFlip.flipPrev());
      nextButton.addEventListener('click', () => pageFlip.flipNext());
      const wrapper = document.querySelector('.flipbook-wrapper');
      let interactionTimer;
      const softenControls = () => {
        wrapper.classList.add('is-interacting');
        window.clearTimeout(interactionTimer);
        interactionTimer = window.setTimeout(() => wrapper.classList.remove('is-interacting'), 1100);
      };
      const bookElement = document.getElementById('flipbook');
      bookElement.addEventListener('pointerdown', softenControls, { passive: true });
      bookElement.addEventListener('touchstart', softenControls, { passive: true });
      previousButton.disabled = true;
      nextButton.disabled = pageElements.length < 2;
    })();
  </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'catalogue-interactif.html';
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (downloadError) {
      console.error('Erreur lors de la génération du catalogue HTML :', downloadError);
      setError('Impossible de générer le catalogue HTML.');
    }
  };

  if (isLoading) {
    return (
      <div className="flipbook-state">
        <div className="loader"></div>
        <p>Chargement du catalogue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flipbook-state error-state">
        <p>{error}</p>
      </div>
    );
  }

  if (!pages.length) {
    return (
      <div className="flipbook-state">
        <p>Aucune page disponible.</p>
      </div>
    );
  }
  const getCenteringClass = () => {
    if (currentPage === 0) return 'is-cover-front';
    if (currentPage === pages.length - 1) return 'is-cover-back';
    return 'is-open';
  };

  return (
    <div className="flipbook-wrapper">
      <div className={`flipbook-container ${getCenteringClass()}`}>
        
        <HTMLFlipBook
          width={pageSize.width}
          height={pageSize.height}
          sizing="responsive"
          minWidth={300}
          maxWidth={1000}
          minHeight={350}
          maxHeight={760}
          maxShadowOpacity={0.8}
          flippingTime={800}
          hardCovers={true}
          usePortrait={false}
          initialPage={0}
          onPageChange={(snapshot) => setCurrentPage(snapshot.page)}
          ref={flipBookRef}
          controls="none"
          respectInteractiveContent={true}
        >
          {pages.map((pageImg, index) => (
            <Page
              key={index}
              image={pageImg}
              alt={`Page ${index + 1}`}
              density="soft"
            />
          ))}
        </HTMLFlipBook>
      </div>

        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo Sénégal"
            className="external-logo"
          />
        )}

      <div className="flipbook-controls">
        <button
          className="flip-button"
          onClick={previousPage}
          disabled={currentPage === 0}
          aria-label="Page précédente"
        >
          <ion-icon name="arrow-back-outline" aria-hidden="true"></ion-icon>
        </button>

        <div className="page-counter">
          <strong>{currentPage + 1}</strong> / {pages.length}
        </div>

        <button
          className="flip-button"
          onClick={nextPage}
          disabled={currentPage >= pages.length - 1}
          aria-label="Page suivante"
        >
          <ion-icon name="arrow-forward-outline" aria-hidden="true"></ion-icon>
        </button>

        <button
          className="download-button"
          onClick={downloadFlipbookHTML}
          aria-label="Télécharger le catalogue interactif"
          title="Télécharger le catalogue interactif"
        >
          <ion-icon name="download-outline" aria-hidden="true"></ion-icon>
        </button>
      </div>
    </div>
  );
};

export default Flipbook;