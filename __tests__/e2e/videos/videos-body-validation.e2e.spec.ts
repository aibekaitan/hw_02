import request from 'supertest';
import { setupApp } from '../../../src/setup-app';
import express from 'express';
import { Resolutions } from '../../../src/videos/types/video';
import { HttpStatus } from '../../../src/core/types/http-statuses';

describe('Video API body validation check', () => {
  const app = express();
  setupApp(app);

  const correctTestVideoData = {
    title: 'My Video',
    author: 'Valentin',
    availableResolutions: [Resolutions.P144],
  };

  beforeAll(async () => {
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);
  });

  it(`should not create video when incorrect body passed; POST /videos`, async () => {
    const invalidDataSet1 = await request(app)
      .post('/videos')
      .send({
        title: '   ',
        author: '',
        availableResolutions: [Resolutions.P144],
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet1.body.errorsMessages).toHaveLength(2);

    const invalidDataSet2 = await request(app)
      .post('/videos')
      .send({
        title: 'My Video',
        author: 'Valentin',
        availableResolutions: ['INVALID' as Resolutions],
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet2.body.errorsMessages).toHaveLength(1);

    const invalidDataSet3 = await request(app)
      .post('/videos')
      .send({
        title: 'A',
        author: 'Valentin',
        availableResolutions: [Resolutions.P144],
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet3.body.errorsMessages).toHaveLength(1);

    const videoListResponse = await request(app).get('/videos');
    expect(videoListResponse.body).toHaveLength(0);
  });

  it('should not update video when incorrect data passed; PUT /videos/:id', async () => {
    const createdVideo = await request(app)
      .post('/videos')
      .send(correctTestVideoData)
      .expect(HttpStatus.Created);

    const invalidDataSet1 = await request(app)
      .put(`/videos/${createdVideo.body.id}`)
      .send({
        title: '   ',
        author: '',
        availableResolutions: [Resolutions.P144],
        canBeDownloaded: false,
        minAgeRestriction: null,
        publicationDate: new Date().toISOString(),
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet1.body.errorsMessages).toHaveLength(2);

    const invalidDataSet2 = await request(app)
      .put(`/videos/${createdVideo.body.id}`)
      .send({
        title: 'My Video',
        author: 'Valentin',
        availableResolutions: ['INVALID' as Resolutions],
        canBeDownloaded: false,
        minAgeRestriction: null,
        publicationDate: new Date().toISOString(),
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet2.body.errorsMessages).toHaveLength(1);

    const invalidDataSet3 = await request(app)
      .put(`/videos/${createdVideo.body.id}`)
      .send({
        title: 'A',
        author: 'Valentin',
        availableResolutions: [Resolutions.P144],
        canBeDownloaded: false,
        minAgeRestriction: null,
        publicationDate: new Date().toISOString(),
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet3.body.errorsMessages).toHaveLength(1);

    const videoResponse = await request(app).get(
      `/videos/${createdVideo.body.id}`,
    );

    expect(videoResponse.body.title).toBe(correctTestVideoData.title);
    expect(videoResponse.body.author).toBe(correctTestVideoData.author);
  });

  it('should not update video when incorrect resolutions passed; PUT /videos/:id', async () => {
    const createdVideo = await request(app)
      .post('/videos')
      .send(correctTestVideoData)
      .expect(HttpStatus.Created);

    await request(app)
      .put(`/videos/${createdVideo.body.id}`)
      .send({
        title: 'My Video',
        author: 'Valentin',
        availableResolutions: [Resolutions.P144, 'INVALID' as Resolutions],
        canBeDownloaded: false,
        minAgeRestriction: null,
        publicationDate: new Date().toISOString(),
      })
      .expect(HttpStatus.BadRequest);

    const videoResponse = await request(app).get(
      `/videos/${createdVideo.body.id}`,
    );

    expect(videoResponse.body.availableResolutions).toEqual([Resolutions.P144]);
  });
});
