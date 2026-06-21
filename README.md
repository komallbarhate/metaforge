# ⚡ MetaForge — Free Meta Tag Generator

A free, beautiful, and fully functional meta tag generator built for developers and marketers.

**Live Tool:** [https://metaforge-rose.vercel.app/](https://metaforge-rose.vercel.app/)  
**Built by:** Komal Barhate — barhate.komal12@gmail.com  
**Built for:** [Digital Heroes](https://digitalheroesco.com)

---

## 🚀 Features

- **Custom Authentication** — Secure frontend-only authentication system using `localStorage`.
- **OTP Password Reset** — Built-in "Forgot Password" functionality powered by EmailJS to send real 6-digit OTP codes.
- **Basic SEO Tags** — Title, description, keywords, author, canonical URL, robots directives, viewport
- **Open Graph Tags** — Full OG support including article-specific fields (published time, section, etc.)
- **Twitter / X Cards** — All card types with site & creator handles
- **Advanced Tags** — Geo targeting, Google/Bing verification, theme color, Apple web app title, cache control
- **Live SERP Preview** — See exactly how your page appears in Google search results
- **Social Share Preview** — Facebook/LinkedIn link preview with OG image support
- **SEO Score** — Instant 0–100 health score with actionable checklist
- **Copy & Download** — One-click copy to clipboard or download as HTML file
- **Save to Projects** — Save your generated meta tags to local storage and load them later via the "My Projects" dashboard.
- **Character Counters** — Real-time progress bars for title (60 chars) and description (160 chars)

---

## 🛠️ Tech Stack

- **HTML5** — Semantic, accessible markup
- **CSS3** — Custom properties, clean UI, animations, responsive design
- **Vanilla JavaScript** — Zero dependencies, pure DOM manipulation
- **EmailJS** — For secure OTP email delivery
- **Google Fonts** — Inter + JetBrains Mono

---

## 📁 Project Structure

```
meta-tag/
├── index.html      # Main HTML page & Modals
├── style.css       # All styles (theme, animations, layout)
├── app.js          # Generator logic and live previews
├── auth.js         # Authentication, Session management & EmailJS logic
├── vercel.json     # Vercel deployment config
└── README.md       # This file
```

---

## 🌐 Deploy to Vercel

1. Push this repo to GitHub (make it public)
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Select this repository
4. Framework Preset: **Other** (static)
5. Click **Deploy**

That's it. Free forever on Vercel's Hobby plan.

---

## 📋 Mandatory Requirements Checklist

- [x] Tool works and gives correct output
- [x] Button labelled "Built for Digital Heroes" → links to https://digitalheroesco.com
- [x] Full name (Komal Barhate) and email (barhate.komal12@gmail.com) visible on page
- [x] Deployed on Vercel free plan
- [x] Public GitHub repo
- [x] ₹0 spent

---

## 💡 Why I Built This

Every time I launch a project, I waste 20+ minutes writing meta tags from scratch — looking up the right `property` vs `name` attributes, double-checking OG image dimensions, copy-pasting from old projects. I wanted one clean, free tool that generates everything correctly the first time, with a live preview so I know it actually looks right before I publish.

---

*Made with ❤️ by Komal Barhate for Digital Heroes*
