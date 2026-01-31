const videos = document.querySelectorAll('video');

        // Function to pause all videos except the current one
        function pauseOtherVideos(current) {
            videos.forEach(v => {
                if (v !== current) v.pause();
            });
        }

        // Hover for desktop
        videos.forEach(video => {
            video.addEventListener('mouseenter', () => video.play());
            video.addEventListener('mouseleave', () => video.pause());
        });

        // Tap to play on mobile (do NOT pause same video)
        videos.forEach(video => {
            video.addEventListener('click', (e) => {
                if (!document.fullscreenElement) {
                    pauseOtherVideos(video);
                    if (video.paused) video.play();
                }
            });
        });

        // Tap outside video to stop any playing videos (mobile)
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.video-item')) {
                videos.forEach(v => v.pause());
            }
        });

        // Fullscreen button logic
        document.querySelectorAll('.fullscreen-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const video = btn.closest('.video-item').querySelector('video');

                pauseOtherVideos(video);
                video.controls = true;
                video.style.objectFit = 'contain'; // full video visible
                video.play();

                if (video.requestFullscreen) video.requestFullscreen();
                else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
                else if (video.msRequestFullscreen) video.msRequestFullscreen();
            });
        });

        // Handle exit fullscreen
        document.addEventListener('fullscreenchange', () => {
            const fsVideo = document.querySelector('video:fullscreen');

            if (!fsVideo) {
                videos.forEach(v => {
                    v.controls = false;
                    v.style.objectFit = 'cover';
                    v.muted = true;
                });
            }
        });

        // Video timestamps
        videos.forEach(video => {
            const ts = video.nextElementSibling;
            video.onloadedmetadata = () => {
                const minutes = Math.floor(video.duration / 60);
                const seconds = Math.floor(video.duration % 60).toString().padStart(2, '0');
                ts.textContent = `${minutes}:${seconds}`;
            };
        });
