import express from 'express';
import { setupApp } from './setup-app';
import { SETTINGS } from './core/settings/settings';
import { runDB } from './db/mongo.db';

import { client } from './db/mongo.db';
import { setBlogsCollection, setPostsCollection } from './db/collections';


const bootstrap = async () => {
  const app = express();
  setupApp(app);
  const PORT = SETTINGS.PORT;

  await runDB(SETTINGS.MONGO_URL);
  setBlogsCollection(client.db('my_database').collection('blogs'));
  setPostsCollection(client.db('my_database').collection('posts'));
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });
  return app;
};

bootstrap();
