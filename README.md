# Subsidian

Visualize a Substack Archive in Obsidian Graph View.

Substack Archive to Obsidian Downloader.

Downloads all the posts from a Substack blog and saves them as markdown files in a folder. Switches all internal links to Obsidian links.

## Result

![image](https://github.com/ddanielgal/subsidian/assets/30264881/9914ea4c-8cb1-426c-9685-f3efb5b2974b)

Newsletter: [The Pragmatic Engineer](https://newsletter.pragmaticengineer.com).

## Usage

Requires Node 18.

```
cp .env.template .env
```

(optional) Insert your `connect.sid` cookie value from your browser, as a value of the `CONNECT_SID` environment variable. This is needed for the script to access paywalled posts. Note: Each substack has its own connect.sid cookie value.

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
