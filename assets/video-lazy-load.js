document.addEventListener('DOMContentLoaded', () => {
  const injectScriptsAfterScrollOrClick = () => {
    clearTimeout(injectAfter);

    const videoList = document.querySelectorAll('[data-video-src]');
    videoList.forEach((video) => {
      const src = video.dataset.videoSrc;
      video.innerHTML = `<source type="video/mp4" src='${src}'>`;
    });

    if (window.initProductVideos4) {
      window.initProductVideos4();
    }
    document.removeEventListener('click', injectScriptsAfterScrollOrClick);
    document.removeEventListener('scroll', injectScriptsAfterScrollOrClick);
  };

  const injectAfter = setTimeout(injectScriptsAfterScrollOrClick, 9000);

  document.addEventListener('click', injectScriptsAfterScrollOrClick);
  document.addEventListener('scroll', injectScriptsAfterScrollOrClick);
});
