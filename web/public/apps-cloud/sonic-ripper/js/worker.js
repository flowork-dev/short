//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\public\apps-cloud\sonic-ripper\js\worker.js total lines 112 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * SONIC RIPPER WORKER v3.1 (MULTI-FORMAT SPLIT)
 */

const workerLocation = self.location.href;
const APP_ROOT = workerLocation.substring(0, workerLocation.lastIndexOf('/') + 1).replace('js/', '');
const LIB_PATH = APP_ROOT + 'libs/';

if (typeof window === 'undefined') self.window = self;

if (typeof document === 'undefined') {
    self.document = {
        createElement: () => ({ src: '', type: '', appendChild: () => {} }),
        getElementsByTagName: () => [{ appendChild: () => {} }],
        head: { appendChild: () => {} },
        body: { appendChild: () => {} },
        currentScript: { src: LIB_PATH + 'ffmpeg.min.js' }
    };
}

try { importScripts(LIB_PATH + 'ffmpeg.min.js'); } catch (e) {}

let ffmpeg = null;

async function initFFmpeg() {
    if (ffmpeg) return;
    const { createFFmpeg } = FFmpeg;
    ffmpeg = createFFmpeg({
        corePath: LIB_PATH + 'ffmpeg-core.js',
        log: false,
        mainName: 'main'
    });
    await ffmpeg.load();
}

self.onmessage = async (e) => {
    const { type, data } = e.data;

    if (type === 'PROCESS' || type === 'SPLIT_CHUNK') {
        try {
            await initFFmpeg();
            await processMedia(data, type);
        } catch (err) {
            self.postMessage({ type: 'ERROR', msg: err.message });
        }
    }
};

async function processMedia({ file, mode, outputMode, start, end, index }, type) {
    const { fetchFile } = FFmpeg;
    const inputName = 'source_video';
    let outputName = "";
    let args = [];

    try {
        try {
            ffmpeg.FS('stat', inputName);
        } catch(e) {
            ffmpeg.FS('writeFile', inputName, await fetchFile(file));
        }

        if (type === 'SPLIT_CHUNK') {

            if (outputMode === 'audio') {
                outputName = `chunk_${index}.mp3`;
                args = ['-ss', start, '-to', end, '-i', inputName, '-vn', '-acodec', 'libmp3lame', '-q:a', '2', outputName];
            }
            else if (outputMode === 'video_muted') {
                outputName = `chunk_${index}.mp4`;
                args = ['-ss', start, '-to', end, '-i', inputName, '-c', 'copy', '-an', outputName];
            }
            else {
                outputName = `chunk_${index}.mp4`;
                args = ['-ss', start, '-to', end, '-i', inputName, '-c', 'copy', outputName];
            }
        }
        else {
            if (mode === 'extract') {
                outputName = 'audio.mp3';
                args = ['-i', inputName, '-vn', '-acodec', 'libmp3lame', '-q:a', '2', outputName];
            } else {
                outputName = 'muted_video.mp4';
                args = ['-i', inputName, '-c', 'copy', '-an', outputName];
            }
        }

        await ffmpeg.run(...args);

        const fileData = ffmpeg.FS('readFile', outputName);

        self.postMessage({
            type: 'DONE',
            buffer: fileData.buffer,
            name: outputName,
            index: index
        }, [fileData.buffer]);

        try { ffmpeg.FS('unlink', outputName); } catch(e){}

    } catch (err) {
        if (err.message && err.message.includes('exit(0)')) {
        } else {
            throw err;
        }
    }
}
