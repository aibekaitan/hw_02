import { Request, Response, Router } from 'express';
import { DriverInput } from '../../drivers/dto/driver.input';
import { updateVideoInputValidation } from '../validation/UpdateVideoInputDtoValidation';
import { createVideoInputValidation } from '../validation/CreateVideoInputDtoValidation';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/error.utils';
import { Video } from '../types/video';
import { db } from '../../db/in-memory.db';
import { UpdateVideoInputModel } from '../dto/video-update.input';
import { VideoListOutput } from '../dto/video-list.output';
import { CreateVideoInputModel } from '../dto/video-create.input';

export const videosRouter = Router({});

// videos.router.ts
videosRouter
  .get('', (req: Request, res: Response<Video[]>) => {
    res.status(200).send(db.videos);
  })

  .get('/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const video = db.videos.find((d) => d.id === id);

    if (!video) {
      res
        .status(404)
        .send(
          createErrorMessages([{ field: 'id', message: 'video not found' }]),
        );
      return;
    }
    res.status(200).send(video);
  })

  .post('', (req: Request<{}, {}, CreateVideoInputModel>, res: Response) => {
    const errors = createVideoInputValidation(req.body);
    console.log('🔵 Validation errors count:', errors.length);
    console.log('🔵 Validation errors:', errors);
    if (errors.length > 0) {
      console.log(' Sending 400 Bad Request');
      res.status(400).send(createErrorMessages(errors));
      return;
    }
    console.log(' Creating new video...');
    const createdAt = new Date();
    const publicationDate = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    const newVideo: Video = {
      id: new Date().getTime(),
      title: req.body.title,
      author: req.body.author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: createdAt.toISOString(),
      publicationDate: publicationDate.toISOString(),
      availableResolutions: req.body.availableResolutions,
    };

    db.videos.push(newVideo);
    res.status(201).send(newVideo);
  })

  .put(
    '/:id',
    (
      req: Request<{ id: string }, {}, UpdateVideoInputModel>,
      res: Response,
    ) => {
      const id = parseInt(req.params.id);
      const video = db.videos.find((v) => v.id === id);

      if (!video) {
        res
          .status(404)
          .send(
            createErrorMessages([{ field: 'id', message: 'Video not found' }]),
          );
        return;
      }

      const errors = updateVideoInputValidation(req.body);

      if (errors.length > 0) {
        res.status(400).send(createErrorMessages(errors));
        return;
      }

      video.title = req.body.title;
      video.author = req.body.author;
      video.availableResolutions = req.body.availableResolutions;
      video.canBeDownloaded = req.body.canBeDownloaded;
      video.minAgeRestriction = req.body.minAgeRestriction;
      video.publicationDate = req.body.publicationDate;

      res.sendStatus(204);
    },
  )

  .delete('/:id', (req: Request<{ id: string }>, res: Response) => {
    const id = parseInt(req.params.id);
    const index = db.videos.findIndex((v) => v.id === id);

    if (index === -1) {
      res
        .status(404)
        .send(
          createErrorMessages([{ field: 'id', message: 'Video not found' }]),
        );
      return;
    }

    db.videos.splice(index, 1);
    res.sendStatus(204);
  });
