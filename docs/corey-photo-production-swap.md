# Corey Brady photo — production swap for remaxpeaks.com

## Status

New headshots are uploaded into the RE/MAX Peaks HighLevel / filesafe media library.

The live brokerage site (`remaxpeaks.com`) is a **Grid / gogrid static build**. Agent photos are hardcoded CDN URLs in the HTML. Updating production requires regenerating those pages with the new URLs (or a find/replace in the Grid source) and redeploying.

HighLevel media APIs can upload/rename/delete files, but **cannot overwrite bytes at an existing CDN path**. The old URL will keep serving the old image until the site HTML points at a new file.

## Exact find/replace

```
OLD (still live everywhere):
https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/690e0dac43570073eea0756f.jpg

NEW — portrait / agent bio / OG:
https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/50fa7f71-67aa-4587-8e5a-a97e82bbe574.jpg

NEW — square / team marquee cards:
https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/ddf2fe7f-59b6-4c75-aabc-e58e6b6a6799.jpg

NEW — full landscape crop:
https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/d71f4067-69b3-43db-923d-0f1d99e659b8.jpg
```

Media library notes:

| Media ID | Name | Role |
|----------|------|------|
| `690e0dac43570073eea0756f` | Corey Brady OLD headshot (swap needed) | Still referenced by live HTML |
| `6ae4a85b36aa4a07e874b06d` | Corey Brady Portrait CDN | New portrait |
| `6ae4a85d9dc70f82b6219f39` | Corey Brady Square CDN | New square |
| `6ae4a85f64f4028be3c22054` | Corey Brady Full CDN | New landscape |

## Pages to update on remaxpeaks.com

- `/corey-brady/` — `.agent-photo` + `og:image` / `twitter:image`
- `/agent-list/` — roster card
- `/` — homepage team marquee cards linking to Corey
- Any other pages embedding the OLD URL above

## Recommended Grid action

1. In the Grid source / agent content for Corey, replace the OLD URL with the **portrait** URL on bio/detail + OG tags.
2. Use the **square** URL for team cards / marquee crops.
3. Redeploy `remaxpeaks.com`.
4. Spot-check homepage marquee, `/agent-list/`, and `/corey-brady/`.

## Pilot microsite (this repo)

The Next.js pilot at `/corey-brady/` already uses the new portrait CDN URL in a photo-first hero (headshot at the top of the first viewport, Peaks dark atmosphere, dual CTAs). Local mirrors also live under `/public/agents/`.
