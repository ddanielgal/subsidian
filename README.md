# Subsidian

Substack Archive to Obsidian Downloader

Downloads all the posts from a Substack blog and saves them as markdown files in a folder. Switches all internal links to Obsidian links.

## Usage

Requires Node 18.

```
cp .env.template .env
```

(optional) Insert your `connect.sid` cookie value from your browser, as a value of the `CONNECT_SID` environment variable. This is needed for the script to access paywalled posts.

```
npm run build
```

```
npm run start -- url
```

### Example

```
npm run start -- https://newsletter.pragmaticengineer.com
```
