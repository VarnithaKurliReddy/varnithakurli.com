Everything that changes when the site's content changes lives in this folder,
laid out the same way as the site's tabs. Text is written in markdown (.md) and
turned into HTML in the browser by marked.js when the page loads.

content/
  hero.jpg                  wide banner photo behind the top of every page (about 2400 x 1200)

  home/
    bio.md                  the bio on the Home tab
    portrait.jpg            your photo next to the bio (square, about 900 x 900)

  projects/
    projects.json           the list of tiles on the Projects tab, in display order
    <name>.md               one file per project: the text shown when its tile is opened
    thumbnails/<name>.jpg   tile images (cropped to 4:3, about 1200 x 900 is plenty)

  art/
    kurli.md                intro above the photographs from Kurli
    kurli/kurli-01.jpg ...  the photographs; shown at their own shape, full image when clicked
    paintings.md            intro above the paintings
    paintings/art-01.jpg .. the paintings; larger scans (1200px+) will look sharper

  resume/
    resume.md               the line above the resume
    Kurli_Resume.pdf        the file visitors download
    Kurli_Resume-1.png, -2.png   page images shown on the Resume tab


Markdown in 30 seconds
----------------------
A blank line starts a new paragraph. **bold**, *italic*, [link text](https://example.com).
Links to other websites open in a new tab automatically.
Reference: https://www.markdownguide.org/cheat-sheet/


Projects
--------
Each entry in projects/projects.json is one tile:

    "Two-Child Policies in India": {                    tile title
      "thumbnail": "thumbnails/two-child-policies.jpg", tile image
      "description": "Policy shocks and fertility",     line under the title
      "tags": ["research"],                             research, tools and/or applied
      "details": "two-child-policies.md",               text shown when the tile is opened
      "tint": "#f6dcc8"                                 colour behind the image while it loads
    }

Tags drive the filter buttons (Research, Tools) and the small label on the tile
("applied" is labelled "Project"). Entries are separated by commas; the last one has
no comma after its closing brace.

The project's .md file can have these parts, all optional:

    ---
    status: Preprint forthcoming              small label above the title
    by: with Jane Menken · *SocArXiv*, 2026   byline; put the venue in *italics*
    ---

    # Two-child policies in India             title shown in the dialog

    One or two summary paragraphs.

    ## Abstract                               each "##" heading becomes a fold-out section

    Paragraphs of the abstract.

    - **Data** NFHS                           a bullet list at the very end of the file
    - **Link** [Journal article](https://...) becomes the row of facts under the text

To add a project: add its image to projects/thumbnails/, write projects/<name>.md,
and add an entry to projects.json.


Art
---
The galleries themselves are still in index.html. To add a photograph or painting, put
the image in art/kurli/ or art/paintings/ and copy a <figure class="shot"> block in
index.html; the caption is its <figcaption>.


Resume
------
After replacing the PDF, regenerate the page images (from the content/resume folder):
    pdftoppm -png -r 160 Kurli_Resume.pdf Kurli_Resume
(pdftoppm is in poppler-utils / `brew install poppler`.) If the page count changes,
add or remove <img> lines in the Resume section of index.html.
