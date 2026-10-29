# Sorry, Suzan 🐘

A cute, pastel, fully responsive "sorry" website starring **Mota Hathi**, a tiny elephant with a big heart.
It opens with an animated **envelope** ("You've got a letter, Suzan" → tap *Open it*), then a five-page story:

1. **Sorry** – sad Mota Hathi (drooping ears, a little tear) says "I'm sorry, Suzan 🥺" while pet names rotate underneath
   (mera hathi · teddy bear · bubu · babu · baby). **Forgive & hug** plays the elephant hug and cheers Mota Hathi up;
   "Nahi, abhi gussa hoon 😤" opens a "Pretty please, baby? 🥺" popup. Boop Mota Hathi to make her smile for a moment.
2. **Dil se sorry** – a sorry letter on lined paper, with a sad Mota Hathi on top.
3. **Our song & little joys** – Taylor Swift's **"Lover"** (official Spotify / YouTube embeds) and a polaroid board
   (rasmalai dates, teddy bear cuddles, gulab jamun nights, you) where you can add your own photos.
4. **Thank you** – "Thank you for forgiving me, baby!" Mota Hathi dances; the surprise button fires confetti.
5. **For You, Suzan** – Mota Hathi holds balloons above six promise cards.

Footer: *Made with rasmalai, gulab jamun & love.*

## Features

- **Hug animation** – Mota Hathi walks up, opens her arms wide, then wraps you in a squishy hug: happy eyes, a beating heart, a pink glow and a burst of hearts (plus a short vibration on supported phones). A hug counter is saved in `localStorage`. The floating **Hug** button is available on every page.
- **Boop** – tap Mota Hathi on the first page and her trunk sprays hearts.
- **Music, legally** – no audio files are included. "Lover" plays only through the official Spotify embed or the official YouTube music video (`youtube-nocookie.com`). Nothing third-party loads until the visitor taps "Load", and there are always "Open on Spotify / Watch on YouTube" links as fallbacks.
- **Responsive** – works from 320px phones to wide desktops. Includes swipe navigation on touch screens.
- **Accessible** – semantic HTML, native `<dialog>` modals (focus trapping + Esc to close), a skip link, keyboard navigation (← / → between pages, arrow keys inside the player tabs), visible focus rings, ARIA labels on the pager dots, and screen-reader announcements via a live region. Text colours meet WCAG AA contrast.
- **Calm mode** – turns animations down. It's on automatically when the OS asks for reduced motion (`prefers-reduced-motion`), and it can be toggled from the header (the choice is remembered).
- **No build step, no dependencies** – plain HTML, CSS and JavaScript. Mota Hathi is an inline SVG, so there are no image assets to download.

## Project structure

```
elephant-hug/
├── index.html        # markup, the 5 scenes, dialogs, Mota Hathi's SVG <template>
├── css/styles.css    # pastel theme, layout, all animations
├── js/main.js        # navigation, hug choreography, embeds, confetti, photos
├── assets/favicon.svg
└── README.md
```

## Running it

Serve the folder with any static web server, then open the printed URL:

```bash
cd elephant-hug

# Option A – Python 3 (preinstalled on macOS/Linux)
python3 -m http.server 8080
# open http://localhost:8080

# Option B – Node.js
npx serve .
```

You can also just double-click `index.html`. Everything works except the **YouTube** embed: YouTube refuses to play inside pages opened from `file://`. The site detects this and shows a note. Spotify and the "Watch on YouTube" link still work.

## Deploying

Upload the folder as-is to any static host, for example:

- **Netlify Drop** – drag the folder onto https://app.netlify.com/drop
- **GitHub Pages** – push to a repo, then *Settings → Pages → Deploy from branch*
- **Vercel / Cloudflare Pages** – import the repo; no build command; output directory `/`

## Customising

| What | Where |
| --- | --- |
| Colours (pastels, Mota Hathi's skin & ear colours) | CSS variables at the top of `css/styles.css` (`--pink`, `--lilac`, `--el-skin`, `--el-ear`, …) |
| Name ("Suzan") | Search & replace `Suzan` in `index.html` and `js/main.js` |
| Pet names | `nicknames` array in `js/main.js` (+ the screen-reader line next to `#nickname` in `index.html`) |
| Letter, promises, captions | Plain text in `index.html` |
| Hug messages | `hugLines` array in `js/main.js` |
| Song | `data-src` attributes and links in the "Our song" section of `index.html`. Use the **Share → Embed** code from Spotify or YouTube for any track |
| Fonts | Google Fonts link in `<head>` (Fredoka, Nunito, Caveat). System fonts are used as fallbacks if you're offline |

## Credits & notes

- All illustrations (Mota Hathi, balloons, decorations) are original inline SVG/CSS made for this project.
- "Lover" © Taylor Swift. It's streamed only through the official embeds of the respective platforms; this project doesn't host, copy or redistribute any audio.
- Uploaded photos never leave the visitor's device: they're shown with a temporary object URL and disappear on reload.
