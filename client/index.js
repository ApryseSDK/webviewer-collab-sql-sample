import CollabClient from '@pdftron/collab-client';
import WebViewer from '@pdftron/webviewer';

const url = `http://localhost:3000`;
const subscriptionUrl = `ws://localhost:3000/subscribe`;
const viewerElement = document.getElementById('viewer');
const currentUser = 'John';
const client = new CollabClient({
  url,
  subscriptionUrl,
});

WebViewer(
  {
    path: '/public/webviewer',
  },
  viewerElement
).then(instance => {
  client.setInstance(instance);
  client.loginAnonymously(currentUser).then(() => {
    client.loadDocument(
      'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf',
      {
        documentId: 'abcde',
        filename: 'demo-annotated.pdf',
      }
    );
  });
});
