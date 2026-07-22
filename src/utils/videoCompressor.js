import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg = null;

/**
 * FFmpeg.wasm 인스턴스를 로드합니다 (최초 1회만 로드).
 * CDN에서 core 파일을 가져오므로 별도 서버 설정이 필요 없습니다.
 */
async function getFFmpeg() {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  // CDN에서 FFmpeg core 파일 로드
  await ffmpeg.load({
    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js',
    wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm',
  });

  return ffmpeg;
}

/**
 * 브라우저에서 영상을 720p로 압축합니다.
 * 서버 부담 없이 유저의 브라우저에서 모든 처리가 이루어집니다.
 * 
 * @param {File} videoFile - 원본 영상 파일
 * @param {function} onProgress - 압축 진행률 콜백 (0~100)
 * @returns {File} - 압축된 영상 파일
 */
export async function compressVideo(videoFile, onProgress = () => {}) {
  const ff = await getFFmpeg();

  // 진행률 콜백 등록
  ff.on('progress', ({ progress }) => {
    // progress는 0~1 사이의 값
    onProgress(Math.round(progress * 100));
  });

  const inputName = 'input' + getExtension(videoFile.name);
  const outputName = 'output.mp4';

  // 1. 원본 영상을 FFmpeg 가상 파일시스템에 쓰기
  await ff.writeFile(inputName, await fetchFile(videoFile));

  // 2. 720p H.264로 압축 실행
  //    -vf scale=-2:720  → 세로 720px, 가로는 비율에 맞춰 자동 (짝수 보장)
  //    -c:v libx264      → H.264 코덱 (호환성 최고)
  //    -crf 28           → 품질 (숫자가 높을수록 압축률↑, 23=기본, 28=용량 절약)
  //    -preset fast      → 인코딩 속도 (fast=빠르고 적당한 압축)
  //    -c:a aac -b:a 128k → 오디오 AAC 128kbps
  //    -movflags +faststart → 웹 스트리밍 최적화
  await ff.exec([
    '-i', inputName,
    '-vf', 'scale=-2:720',
    '-c:v', 'libx264',
    '-crf', '28',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    outputName,
  ]);

  // 3. 압축된 영상을 가상 파일시스템에서 읽기
  const outputData = await ff.readFile(outputName);
  
  // 4. File 객체로 변환하여 반환
  const compressedBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
  const compressedFile = new File(
    [compressedBlob], 
    videoFile.name.replace(/\.[^.]+$/, '') + '_compressed.mp4',
    { type: 'video/mp4' }
  );

  // 5. 가상 파일시스템 정리
  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  return compressedFile;
}

/**
 * 압축이 필요한지 판단합니다.
 * 이미 20MB 이하이고 짧은 영상이라면 굳이 압축하지 않습니다.
 */
export function needsCompression(file) {
  const MAX_SIZE_WITHOUT_COMPRESSION = 20 * 1024 * 1024; // 20MB
  return file.size > MAX_SIZE_WITHOUT_COMPRESSION;
}

function getExtension(filename) {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.substring(idx).toLowerCase() : '.mp4';
}
