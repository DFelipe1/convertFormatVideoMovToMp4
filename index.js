const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

// Configura o caminho do FFmpeg para usar o binário do ffmpeg-static
ffmpeg.setFfmpegPath(ffmpegPath);

// Função para converter um vídeo .mov para .mp4
function convertVideo(inputPath) {
    // Verifica se o arquivo de entrada existe
    if (!fs.existsSync(inputPath)) {
        console.log(`Arquivo não encontrado: ${inputPath}`);
        return;
    }

    // Verifica se o arquivo de entrada é um .mov
    if (path.extname(inputPath).toLowerCase() !== '.mov') {
        console.log("Por favor, forneça um arquivo com extensão .mov");
        return;
    }

    // Define o caminho de saída com extensão .mp4
    const outputPath = path.join(path.dirname(inputPath), `${path.basename(inputPath, '.mov')}.mp4`);

    // Executa a conversão com o FFmpeg
    ffmpeg(inputPath)
        .output(outputPath)
        .on('progress', (progress) => {
            // Mostra o progresso da conversão
            const percentComplete = Math.round(progress.percent);
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Convertendo: ${percentComplete}% concluído`);
        })
        .on('end', () => {
            console.log(`\nConversão concluída: ${outputPath}`);
        })
        .on('error', (err) => {
            console.error(`Erro durante a conversão: ${err.message}`);
        })
        .run();
}

// Obtém o caminho do arquivo de entrada a partir dos argumentos da linha de comando
const inputPath = process.argv[2];

if (!inputPath) {
    console.log("Uso: node convert.js <caminho_do_arquivo.mov>");
} else {
    convertVideo(inputPath);
}
