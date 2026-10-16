# Photographic spine reference — Kait's physical library

The grouped photo supplied October 16, 2026 supersedes the provisional ordering and generic color styling. Focus on all spines first; front covers will follow individually. Preserve wear, creases, rounded edges, material texture, actual graphics, and colors. Match relative height and width from the physical group, accounting for perspective: the right-hand books are closer to the camera. Do not treat image pixel height as physical height.

## Left-to-right order in the first group photograph

1. Converted — Neil Hoyne. Yellow spine, black lettering; short/slim.
2. The Coming Wave — Mustafa Suleyman. Silver/holographic-looking jacket with strong rainbow reflections, black title and author. The second view confirms these are reflective surface effects rather than a uniformly purple spine.
3. AI Needs You — Verity Harding. Dark spine, multicolored title.
4. The Creative Act — Rick Rubin. Pale gray woven cloth texture clearly visible in the second view; black lettering.
5. How Great Ideas Happen — George Newman. White spine with reflective, iridescent title panels; black lettering.
6. Empire of AI — Karen Hao. Orange jacket, black lettering, pale lavender edge; existing individual photographs available as prepared assets.
7. If Anyone Builds It, Everyone Dies — Eliezer Yudkowsky & Nate Soares. Black jacket, white/pink lettering; existing prepared assets.
8. Coachable — Ric Bucher. White upper spine, black lower section, red/orange lettering and figure.
9. AI for Good — Josh Tyrangiel. White jacket, black lettering, blue motif; existing prepared assets.
10. The Singularity Is Nearer — Ray Kurzweil. Black jacket, white lettering, gold publisher emblem; strong reflected highlight.
11. The Infinity Machine — Sebastian Mallaby. Orange/red jacket, repeated small pale lettering.
12. AI for Social Good — Surname appears as DODHIA; confirm full author from closer reference. Dark jacket, gold/copper-looking lettering and patterned lower section.
13. Co-Intelligence — Ethan Mollick. Detailed dark-green, cream and gold illustrated artwork, white title/author panels. Match the photographed graphic exactly; do not substitute marble or generic veins. This supersedes the application's orange provisional spine.
14. Supremacy — Parmy Olson. Black and vivid green design; reflective highlight.
15. Crisis Engineering — Martina Nitz, Matthew Weaver & Mikey Dickerson. White spine, black lettering, exposed page edge at top; confirm author spellings from close-up.

Material descriptions above are visual observations, not verified manufacturing finishes. In particular, distinguish printed gradients from metallic foil using closer photographs before assigning metallic material values.

## Delivery requirements

- Use actual supplied spine artwork; avoid inventing lettering or replacing it with generic typography.
- Natural photographic wear is intentional. No blanket cleanup or polishing.
- Use one fixed lighting setup with material-specific roughness; do not apply one glossy finish to every book.
- Keep bottoms on a common shelf plane, with narrow natural seams and no geometry intersections.
- Inspect page heads, both cover joins, hover return, and mobile horizontal navigation before publication.
- Retain existing notes and covers where supplied. Do not fabricate takeaways or front covers for new entries.
- Artificial Intimacy is currently in the application but is not in this group photograph; retain it until the complete set/order is established.

## Reference status

Both opposing group views are now supplied. The second view clearly shows the left-hand spines, their lettering, woven fabric and reflective finishes. Use both views to distinguish perspective from physical proportions; neither is a flat texture scan. Original source photographs are now available locally from the uploaded ZIP. Existing prepared assets are image-tool derivatives; do not describe them as untouched originals.

Second-view observations: Converted has a yellow jacket with natural edge curvature and black lettering; AI Needs You has a dark jacket and multicolored reflective-looking title. Preserve the folded/creased jackets and uneven paper edges visible across the collection. The opposing views establish the same left-to-right sequence; do not reverse the order when referencing the second photo.

Graphics fidelity check: two generated atlas attempts were inspected and NOT approved for publication. Fine lettering and publisher marks were changed, and Co-Intelligence artwork was not sufficiently faithful. Do not use these as verified photographic textures. Obtain accessible original image files and extract/rectify the actual source pixels rather than regenerate the designs. Existing live artwork was left unchanged.

## Original-source implementation

The uploaded ZIP supplied IMG_7650.jpeg and IMG_7651.jpeg at 5712×4284. All fifteen reference spines now use perspective-rectified crops of these originals, with no image generation or graphic replacement. See spine-sources.json for source hashes, crop coordinates, assets and approximate relative model dimensions. scripts/extract-spines.py reproduces the extracts using Pillow and NumPy. Originals remain outside the published repository to avoid publishing the surrounding room; provide their directory as the script argument.

The extracted pixels retain reflections, surface wear, typography and logos. Perspective correction interpolates pixels; it cannot recover details obscured by glare or hidden around a curved edge. Relative model measurements are visual estimates, not publisher-verified physical dimensions. Individual straight-on source files can refine these later. Existing supplied front covers remain; books without front covers open to their original spine. Artificial Intimacy remains after the fifteen reference books pending its own source photo.

## Individual photos — ZIP 2 and ZIP 3 (October 16)

The user rejected the group-photo replacements for the previously approved three books. Individual original photographs take precedence. Do not redraw typography, polish the jackets, remove ordinary wear, or invent graphics. Paper tops may be omitted explicitly at the user's request to avoid artificial binding gaps.

ZIP 2: Converted cover IMG_7665, spine IMG_7666, detail checks IMG_7667/7668. If Anyone Builds It, Everyone Dies cover IMG_7669, spine IMG_7670, detail checks IMG_7671/7672.
ZIP 3: The Creative Act cover IMG_7653, spine IMG_7654, detail checks IMG_7655/7656.

`scripts/extract-individual-photos.py --zip2 <extracted-folder> --zip3 <extracted-folder> --zip4 <extracted-folder>` creates transparent photographic cutouts from original pixels using manually traced masks and perspective correction. It retains shading, color, wear and woven cloth. No image generation, smoothing or recoloring is involved. Ten `*-individual-*.webp` assets are the outputs.

`photoPresentation` renders these photographic faces directly, without synthetic boards, collars or page tops. Shelf motion moves the photographic spine forward on hover; the reader shows the actual cover photograph with its aspect ratio. The existing photo contains the material shading; additional scene lighting must not bleach it. This is a photographic plane presentation, not a newly reconstructed 3D binding.

AI for Good and Empire of AI use their earlier accepted image assets and crops again, pending individual originals. These earlier assets are derivatives, not newly extracted originals. Other group-photo books remain provisional until their individual photos arrive. Preserve the current order and relative sizes while replacing faces.

ZIP 4: AI Needs You cover IMG_7657, spine IMG_7658, details IMG_7659/7660. The Coming Wave cover IMG_7661, spine IMG_7662, details IMG_7663/7664. Preserve photographed foil highlights; the hand and background are excluded from the spine cutout.

ZIP 5: How Great Ideas Happen cover IMG_7677, complete spine IMG_7678, detail references IMG_7679 and IMG_7680 (the latter also duplicated as IMG_7680 (1)). Empire of AI cover IMG_7673 replaces the earlier derivative cover. IMG_7675 and IMG_7676 show separate spine sections but omit part of the title between them; retain the existing Empire spine pending a complete image. Do not reconstruct missing lettering or stitch a false complete spine. Pass `--zip5 <extracted-folder>` to the extraction script to reproduce these three assets. Relative book dimensions and shelf order are unchanged.

## Shelf alignment refinement

All available photographic spines now share a straight-on shelf view. The renderer measures the cropped photo's alpha silhouette, uses the central 70% of rows to estimate the binding centerline and median width, removes only linear lean, and anchors the visible bottom to the shelf. This retains irregular jacket edges and original pixels rather than squaring or repainting them. Explicit layout spacing is zero. Narrow recessed contact shadows behind the joins prevent tiny irregular edge differences from reading as white gaps. Hover lifts a book slightly; resting books remain upright. Books without source photos retain the existing placeholder. Front-cover photographs are unaffected by spine fitting.

## ZIP 7: targeted spine perspective and proportion corrections

ZIP 7 repeats the How Great Ideas Happen complete spine and detail images plus the two partial Empire of AI spine details from ZIP 5. How Great Ideas Happen was too narrow at .43 world units; adjusted to .49. Empire was too wide at .78; adjusted to .70, still wider than the neighboring books. These are visual estimates from the references, not verified publisher measurements. Heights remain 4.02 and 4.08 respectively.

Only these two spines enable `spinePerspectiveFit`: five broad alpha-edge samples across the central body correct taper and lateral curvature left in the photographed viewpoint. The sampled fit is held beyond the central body so the real head/foot curves and creases are retained. This modifies projection geometry, not image graphics or surface texture. Empire still uses its existing complete image because the supplied detail shots omit part of the title. Covers are untouched.

## ZIP 8 — complete Empire spine and two additional books

IMG_7674 supplies the complete original Empire of AI spine, superseding the generated derivative and the missing-full-spine limitation above. Its transparent cutout retains the thin lavender edge, orange shading and creases. The user explicitly found .70 too narrow; width is now .82 with the existing 4.08 height. Perspective fitting keeps the binding upright.

Coachable: full spine IMG_7686, cover IMG_7685; IMG_7687/7688 are detail references. Crisis Engineering: full spine IMG_7690, cover IMG_7689; IMG_7692 is a detail reference. Spine masks exclude hands, backgrounds and the adjacent front-cover planes. Both use original pixels with the same spine perspective correction. Their existing relative dimensions and shelf positions in the reading order are retained. Reproduce with `--zip8 <extracted-folder> --only empire-of-ai coachable crisis-engineering` (omit --zip5 to retain the already-extracted Empire cover).

## ZIP 9 — Supremacy and Co-Intelligence

Supremacy uses IMG_7694 for the full spine and IMG_7693 for the cover, checked against IMG_7695/7696 details. Preserve its original neon-green artwork and photographed gloss. Co-Intelligence uses the more frontal full-spine view IMG_7698 and cover IMG_7697; IMG_7699 is an alternate spine angle and IMG_7700/7701 are detail references. Retain its actual botanical/painted artwork, cream areas, publisher mark and worn jacket edges; do not synthesize a marble pattern. Both receive transparent photographic cutouts, spine perspective correction, and front-cover views. Hands/backgrounds are masked out. Existing heights, widths and order are unchanged. Reproduce with `--zip9 <extracted-folder> --only supremacy co-intelligence`.

## ZIP 11 — The Infinity Machine and The Singularity Is Nearer

The Infinity Machine uses IMG_7707 for its full spine, IMG_7706 for its front cover, and IMG_7708/7709 as detail references. Its width is .82, matching Empire of AI exactly as the user requested; its existing height remains unchanged. Preserve orange shading, repeated lettering, natural edges and the cover's photographed finish.

The Singularity Is Nearer uses IMG_7711 for the complete spine and IMG_7710 for the cover. Preserve the crumpled jacket head, glossy highlights, original graphics and publisher mark. Both use original-pixel transparent cutouts and the established upright spine fit. No additional top/page construction. Reproduce with `--zip11 <extracted-folder> --only the-infinity-machine the-singularity-is-nearer`.

## Reading-list edit

The user requested removal of Converted and Supremacy. Both entries are removed from the active `books` array, which also updates shelf packing, the reading list, and reader pagination. Their photographic assets and extraction recipes are retained so this editorial choice is reversible. No other titles are removed; additional trimming recommendations require a user decision.
