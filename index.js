const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const path = require('path');
const fs = require('fs');

// Configura o caminho do FFmpeg para usar o binário do ffmpeg-static
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Função para obter a duração do vídeo
function getVideoDuration(inputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) return reject(`Erro ao obter duração: ${err.message}`);
            resolve(metadata.format.duration);
        });
    });
}

// Função para converter um vídeo .mov para .mp4
async function convertVideo(inputPath) {
    // Verifica se o arquivo de entrada existe e é .mov
    if (!fs.existsSync(inputPath)) {
        console.log(`Arquivo não encontrado: ${inputPath}`);
        return;
    }
    if (path.extname(inputPath).toLowerCase() !== '.mov') {
        console.log("Por favor, forneça um arquivo com extensão .mov");
        return;
    }

    const outputPath = path.join(path.dirname(inputPath), `${path.basename(inputPath, '.mov')}.mp4`);
    let duration;

    try {
        // Obtenha a duração antes da conversão
        duration = await getVideoDuration(inputPath);
    } catch (err) {
        console.error(err);
        return;
    }

    // Inicia a conversão com monitoramento do progresso
    ffmpeg(inputPath)
        .output(outputPath)
        .on('progress', (progress) => {
            const timeParts = progress.timemark.split(':').map(Number);
            const elapsedSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
            const percentComplete = Math.min(Math.round((elapsedSeconds / duration) * 100), 100);

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
