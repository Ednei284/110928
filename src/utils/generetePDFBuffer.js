import puppeteer from "puppeteer";

export async function generatePDFBuffer(posts) {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Meus Posts</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px; 
                    color: #666;
                }
                .post { 
                    margin-bottom: 30px; 
                    border-bottom: 1px solid #ddd; 
                    padding-bottom: 20px; 
                    page-break-inside: avoid; /* Evita quebrar o post no meio da página ao gerar o PDF */
                }
                
                /* Estilização para a grade de fotos */
                .photos-container {
                    display: flex;
                    gap: 10px; /* Espaçamento entre as fotos */
                    margin-top: 10px;
                    flex-wrap: wrap; /* Garante que quebre a linha caso exceda */
                }
                
                .photos-container img {
                    width: calc(33.333% - 7px); /* Divide em 3 colunas iguais subtraindo o gap */
                    max-height: 150px; /* Limita a altura para não estourar o layout */
                    object-fit: cover; /* Mantém a proporção da imagem cortando excessos se necessário */
                    border-radius: 4px;
                    border: 1px solid #eee;
                }
            </style>
        </head>
        <body>
            <h1>Relatório de Posts</h1>
            ${posts.map(post => {
        // 1. Trata com segurança o campo de fotos/urls independentemente do formato
        let photosArray = [];

        // Suponha que o campo no seu banco se chame 'url' ou 'photos'. Ajuste conforme o seu schema!
        const rawPhotos = post.url;

        if (rawPhotos) {
            if (Array.isArray(rawPhotos)) {
                // Se já for um array, apenas usa
                photosArray = rawPhotos;
            } else if (typeof rawPhotos === 'string') {
                // Se for string, limpa e divide por vírgula
                photosArray = rawPhotos
                    .replace(/[\[\]"]/g, '') // Remove colchetes e aspas se houver
                    .split(',')
                    .map(url => url.trim())
                    .filter(url => url);
            }
        }

        return `
        <div class="post">
            <h2>${post.title || 'Sem título'}</h2>
            <p>${post.content || ''}</p>
            
            ${photosArray.length > 0 ? `
                <div class="photos-container">
                    ${photosArray.map(photoUrl => `
                        <img src="${photoUrl}" alt="${post.title}" />
                    `).join('')}
                </div>
            ` : ''}
            
            <br>
            <small>Criado em: ${new Date(post.createdAt).toLocaleDateString('pt-BR')}</small>
        </div>
    `;
    }).join('')}
        </body >
        </html >
  `;

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true
    });

    await browser.close();
    return pdfBuffer;
}