'use strict'

var modPressedDuringKeydown = false
var letMeHandleTheEvent = true
var timeoutAlreadySet = false
var timeout

let videoSpeedDisplay = document.createElement('output')
videoSpeedDisplay.id = 'video-speed-display'
document.body.appendChild(videoSpeedDisplay)

var style = document.createElement('style')
style.textContent = `
    [hidden] {
        opacity: 0 !important;
    }

    #video-speed-display {
        --duration: 0.2s;

        display: flex;
        z-index: 2147483647;

        position: fixed;
        inset-block-start: 0;
        inset-inline-start: 0;

        margin: 1.5em;
        padding-inline: 1em;
        padding-block: 0.75em;

        font: normal 14px "JetBrains Mono", "Fira Code Retina", monospace;
        color: rgb(60 64 67);
        background: rgb(222 225 229 / 88%);
        backdrop-filter: blur(0.5em);
        border-radius: 0.75em;

        pointer-events: none;

        opacity: 0;
        translate: 0 5vh;
        transition: var(--duration) ease;
    }

    @media (prefers-color-scheme: dark) {
        #video-speed-display {
            color: rgb(255 255 255);
            background-color: rgb(32 33 36 / 88%);
        }
    }
`
document.head.appendChild(style)

/* useCapture prevents websites (e.g. YouTube) from intercepting shortcuts (e.g. the space bar) */
document.addEventListener('keydown', (event) => {
    // Ignore keydown event if typing in an input box
    if (event.target.isContentEditable ||
        event.target.nodeName === 'INPUT' ||
        event.target.nodeName === 'TEXTAREA')
        return

    // Ignore keydown event when a modifier key is being pressed
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
        return

    let video = document.querySelector('video')
    if (!video || !video.readyState)
        return

    (letMeHandleTheEvent) ? event.preventDefault() : letMeHandleTheEvent = true

    video.addEventListener('ratechange', function (event) {
        showVideoSpeedDisplay(event.target)
    }, { once: true, passive: true })

    switch (event.key) {
        case 'v':
            showVideoSpeedDisplay(video)
            break
        case 's':
        case 'S':
            addToSpeed(video, modPressedDuringKeydown ? -1 : -0.1)
            break
        case 'd':
        case 'D':
            addToSpeed(video, modPressedDuringKeydown ? 1 : 0.1)
            break
        case 'z':
        case 'Z':
        case 'ArrowLeft':
        case 'ArrowDown':
            replay(video)
            break
        case 'x':
        case 'X':
        case 'ArrowRight':
        case 'ArrowUp':
            forward(video)
            break
        case 'r':
            video.playbackRate = video.defaultPlaybackRate
            break
        case 'a':
            video.playbackRate = 1.8
            break
        // case ' ':
        //     togglePlay(video)
        //     break
        case 'm':
            toggleMute(video)
            break
        case 'p':
            togglePictureInPicture(video)
            break
        default:
            // Re-dispatch the event if it wasn't handled, so that the website can
            if (event.isTrusted) {
                letMeHandleTheEvent = false
                document.dispatchEvent(new KeyboardEvent('keydown', event))
            }
    }
}, true)

function togglePlay(video) {
    video.paused ? video.play() : video.pause()
}

function toggleMute(video) {
    video.muted = !video.muted
}

function clamp(min, value, max) {
    return Math.min(Math.max(value, min), max)
}

function addToSpeed(video, delta) {
    // Clamp speed between 0.1 and 16 (Chrome range is [0.0625, 16])
    video.playbackRate = clamp(0.1, (video.playbackRate + delta).toFixed(2), 16)
}

function replay(video) {
    video.currentTime -= modPressedDuringKeydown ? 30 : 10
}

function forward(video) {
    video.currentTime += modPressedDuringKeydown ? 30 : 10
}

function togglePictureInPicture(video) {
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture()
    } else {
        video.requestPictureInPicture()
    }
}

function showVideoSpeedDisplay(video) {
    videoSpeedDisplay.textContent = video.playbackRate.toFixed(2)
    videoSpeedDisplay.style.opacity = '1'
    videoSpeedDisplay.style.translate = '0'

    if (timeoutAlreadySet) {
        clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
        // This code is executed after the timeout
        videoSpeedDisplay.style.opacity = '0'
        videoSpeedDisplay.style.translate = '0 5vh'
        timeoutAlreadySet = false
    }, 2200)

    timeoutAlreadySet = true
}
