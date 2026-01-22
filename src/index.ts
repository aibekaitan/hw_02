import express from 'express';
import { setupApp } from './setup-app';
import { SETTINGS } from './core/settings/settings';
import { runDB } from './db/mongo.db';

import { client } from './db/mongo.db';
import { runDb } from './db/db';

const bootstrap = async () => {
  const app = express();
  setupApp(app);
  const PORT = SETTINGS.PORT;
  app.set('trust proxy', true);
  await runDb();
  // setBlogsCollection(client.db('my_database').collection('blogs'));
  // setPostsCollection(client.db('my_database').collection('posts'));
  // setUsersCollection(client.db('my_database').collection('users'));
  // setCommentsCollection(client.db('my_database').collection('comments'));
  // setRequestLogsCollection(client.db('my_database').collection('requestLogs'));
  // setSecurityDevicesCollection(
  //   client.db('my_database').collection('security-devices'),
  // );
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });
  return app;
};

bootstrap();
