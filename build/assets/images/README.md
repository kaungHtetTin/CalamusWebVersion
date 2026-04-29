# Certificate assets

Copy these files from the **old PHP app** (`calamus/assets/images/`) into this folder so the Certificate page displays correctly:

- `certificate_background.png` – certificate background image (or `ee_certificate_bg.png` as fallback)
- `ee_certificate_seal.png` – seal for English platform
- `ko_certificate_seal.png` – seal for Korean platform

Copy into `certificate/` subfolder:

- `certificate/feather.svg` – icon shown on error state

The Certificate page loads these from the React app’s `public` folder (same origin) so the seal and background display reliably.
