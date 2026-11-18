# Readme

## Content
Site copy is written in markdown and rendered in the browser at page load by [marked](https://marked.js.org) (loaded from cdnjs). `html/content/` mirrors the site's tabs:

```
html/
  index.html                page skeleton, galleries, contact block
  style.css
  components/
    markdown.js             fills every <div data-md="path.md"> with the rendered file
    projects.js             builds the Projects tiles and dialogs
  content/
    hero.jpg
    home/                   bio.md, portrait.jpg
    projects/               projects.json, <name>.md, thumbnails/<name>.jpg
    art/                    kurli.md, kurli/, paintings.md, paintings/
    resume/                 resume.md, Kurli_Resume.pdf, page images
```

`html/content/README.txt` documents the `projects.json` entries and the layout of a project's markdown file. The content is loaded with `fetch`, so the site has to be viewed through a web server (the container below), not opened as a `file://` page.

## Local development
While the website contents are built into the container, the local development directory may be mounted into the container directly for more rapid iteration:

`docker build -t varnithakurli.com:dev .`

`docker run -d --name varnithakurli-dev --restart unless-stopped -p 127.0.0.1:8001:80 -v {project dir}/html:/usr/share/nginx/html:ro varnithakurli.com:dev`

## Releases
A Github Action will trigger a container build upon creation of a new tag at the remote:

`git tag {version}`

`git push --tags`

## Deployment
The container is available at `ghcr.io/varnithakurli/varnithakurli.com:latest` or a specific tag. This has been configured within `docker-compose.yml`:

```yml
services:

  varnithakurli:
    image: ghcr.io/varnithakurli/varnithakurli.com:latest
    container_name: varnithakurli-nginx
    restart: unless-stopped
    ports:
      - "127.0.0.1:8001:80"
```

The only commands required to pull the latest version are:

`docker compose down`

`docker compose up`