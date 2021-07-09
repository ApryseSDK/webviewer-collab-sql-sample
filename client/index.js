import CollabClient from '@pdftron/collab-client';
import WebViewer from '@pdftron/webviewer';
import faker from 'faker';

const url = `http://localhost:3000`;
const subscriptionUrl = `ws://localhost:3000/subscribe`;
const viewerElement = document.getElementById('viewer');
const currentUser = faker.name.firstName();
let documentId = '1';

WebViewer(
  {
    path: '/public/webviewer'
  },
  viewerElement
).then(async (instance) => {
  const client = new CollabClient({
    instance,
    url,
    subscriptionUrl
  });
  await client.loginAnonymously(currentUser);
  await client.loadDocument('https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf', {
    documentId,
    filename: 'demo-annotated.pdf',
    isPublic: true
  });
  try {
    const canJoinDocument = await client.canJoinDocument(documentId);
    if (canJoinDocument) {
      await client.joinDocument(documentId);
    }
  } catch (error) {
    console.error(error);
  }
});
