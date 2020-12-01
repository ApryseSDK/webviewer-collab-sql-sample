# WebViewer Real Time Collaboration Sample

[WebViewer](https://www.pdftron.com/documentation/web/) is a powerful JavaScript-based PDF Library that's part of the [PDFTron PDF SDK](https://www.pdftron.com). It allows you to view and annotate PDF files on your web app with a fully customizable UI.

![WebViewer](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This is a WebViewer sample to show how you can construct a real time collaboration service using the [WebViewer Collaboration Modules](https://collaboration.pdftron.com/)

The bulk of the work is setting up the [resolvers](server/resolvers.js) to talk to the SQL database. Documentation about resolvers can be found [here](https://collaboration.pdftron.com/docs/server/resolvers).


## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install

```
git clone https://github.com/PDFTron/webviewer-collab-sql-sample.git
cd webviewer-collab-sql-sample
npm install
```

## Run

Start the server
```
npm run start-server
```

Start the client
```
npm run start-client
```

## How to use

- Open browser window in incognito mode and go to [port 3000](http://localhost:3000/index.html)
- Create annotations with annotations tools in the header
- See the changes being applied in real time in other windows
- You can access the real time server from a different device in the same network via replacing `localhost` in your URL to the server's IP address.

## Contributing

See [contributing](./CONTRIBUTING.md).

## License

See [license](./LICENSE).
![](https://onepixel.pdftron.com/webviewer-realtime-collaboration-sqlite3-sample)
