import { getPort } from '@common/utils/envConfig';
import { CONNECT_DB } from '@src/config/db-connect';
import { app, logger } from '@src/server';

const START_SERVER = () => {
  const port = getPort();

  const server = app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });

  const onCloseSignal = () => {
    logger.info('sigint received, shutting down');
    server.close(() => {
      logger.info('server closed');
      process.exit();
    });
    setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
  };

  process.on('SIGINT', onCloseSignal);
  process.on('SIGTERM', onCloseSignal);
};
//connect to db and start server
CONNECT_DB()
  .then(() => {
    console.log('connect to database successfully!');
  })
  .then(() => {
    START_SERVER();
  })
  .catch((error) => {
    console.log('error', error);
    process.exit(0);
  });
