![Version](https://img.shields.io/badge/version-1.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![CDN](https://img.shields.io/badge/CDN-jsDelivr-orange)

# ✨ TTAS.js ~ Text Typing Animation Screen (on Scroll)

TTAS.js is a lightweight, dependency-free JavaScript library that animates text with a typewriter effect as it enters the viewport. It supports mobile/desktop speed settings, custom trigger offsets, accessibility hooks, and runs only once per element.

---

## 🚀 Features

- ✍️ Typewriter-style text animation  
- 📱 Separate typing speed for mobile & desktop  
- 🎯 Custom offset trigger (px or font-height fallback)  
- 🔁 One-time animation per element (no repeats)  
- 🧠 Rich text support via `innerHTML`  
- 🧩 Zero dependencies, pure vanilla JS  
- 🛠️ Cleanup API to destroy observers and restore DOM  

---


## 📦 CDN Usage: Include the CDN

Place this before `</body>` in your HTML:

```html
<script src="https://cdn.jsdelivr.net/gh/AsadullahAlMunib/TTAS@v1.2.0/ttas.js"></script>
```
---

## 🛠️ How to Use: Mark up Your Elements

Add the `data-ttas` attribute to any element you want to animate. The attribute’s value accepts speed and offset configurations:

> **Value format breakdown:**
> 
>- data-ttas="`mobileSpeed`,`desktopSpeed` ; `mobileOffset`,`desktopOffset`" 
>- Speeds in milliseconds; offsets in pixels.  
>- If you omit `desktopSpeed`, it defaults to `mobileSpeed`=`desktopSpeed`.  
>- If you omit `desktopOffset`, it defaults to `mobileOffset`=`desktopOffset`.  
>- If no offset is specified (`;…`), TTAS uses the element’s computed font-height as the trigger point.
>
>  *You can understood by seeing the **Example bellow**:*



- **Basic: 3000ms total duration**
```html
<div data-ttas="3000">
    Simple typewriter effect
</div>
```

- **Mobile/Desktop speeds: 2500ms on mobile, 4000ms on desktop**
```html
<div data-ttas="2500,4000">
 	Fast on mobile, slow on desktop
</div>
```

- **Speed with offset: 3000ms duration; 100px trigger offset**
```html
<div data-ttas="3000;100">
	Offset trigger at 100px
</div>
```

- **Full config: mobile/desktop speed; mobile/desktop offset**
```html
<div data-ttas="2500,4000;50,150">
	Mobile: 2.5s/50px, Desktop: 4s/150px
</div>
```

---

## ⚙️ TTAS Attribute Configuration Guide

Here's a comprehensive guide to TTAS attribute configuration with various test cases:

**Attribute Configuration Syntax:**

```
data-ttas="[speed];[offset]"
```

> Where:
>- `speed:` Animation duration in milliseconds (single value or mobile,desktop)
>- `offset:` Trigger point adjustment in pixels (single value or mobile,desktop)


**Test Cases Table:**

| Case | Configuration | Behavior | Use Case |
|------|---------------|----------|----------|
| 1 | `data-ttas=""` | Shows text immediately without animation | Static text fallback |
| 2 | `data-ttas="3000"` | Animates over 3 seconds on all devices | Simple consistent animation |
| 3 | `data-ttas="2000,4000"` | 2s on mobile, 4s on desktop | Different speeds per device |
| 4 | `data-ttas="2500;100"` | 2.5s animation, triggers 100px early | Precise scroll triggering |
| 5 | `data-ttas="1500,3000;100"` | 1.5s/mobile, 3s/desktop with 100px offset | Different speeds with Offset |
| 6 | `data-ttas="1500;100,300"` | 1.5s with 100px/mobile 300px/desktop offset | Speed with different Offset |
| 7 | `data-ttas="1500,3000;50,100"` | 1.5s/mobile, 3s/desktop with different offsets | Full device-specific control |

---

## 🔗 Repository

Project source, release notes & contribution guide:  
[GitHub ~ AsadullahAlMunib/TTAS](https://github.com/AsadullahAlMunib/TTAS)
