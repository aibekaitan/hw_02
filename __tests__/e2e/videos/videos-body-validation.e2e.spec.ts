import request from 'supertest';
import { setupApp } from '../../../src/setup-app';
import express from 'express';
import { VideoInput } from '../../../src/videos/dto/video.input';
import { Resolutions } from '../../../src/videos/types/video';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { ResourceType } from '../../../src/core/types/resource-type';

describe('Video API body validation check', () => {
  const app = express();
  setupApp(app);

  const correctTestVideoData: VideoInput = {
    type: ResourceType.Videos,
    attributes: {
      title: 'My Video',
      author: 'Valentin',
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: new Date(),
      publicationDate: new Date(),
      availableResolutions: [Resolutions.P144],
    },
  };

  beforeAll(async () => {
    await request(app)
      .delete('/api/testing/all-data')
      .expect(HttpStatus.NoContent);
  });

  it(`should not create video when incorrect body passed; POST /api/videos`, async () => {
    const invalidDataSet1 = await request(app)
      .post('/api/videos')
      .send({
        data: {
          ...correctTestVideoData,
          attributes: {
            ...correctTestVideoData.attributes,
            title: '   ',
            author: '',
          },
        },
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet1.body.errorMessages).toHaveLength(2);

    const invalidDataSet2 = await request(app)
      .post('/api/videos')
      .send({
        data: {
          ...correctTestVideoData,
          attributes: {
            ...correctTestVideoData.attributes,
            availableResolutions: ['INVALID' as Resolutions],
          },
        },
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet2.body.errorMessages).toHaveLength(1);

    const invalidDataSet3 = await request(app)
      .post('/api/videos')
      .send({
        data: {
          ...correctTestVideoData,
          attributes: {
            ...correctTestVideoData.attributes,
            title: 'A', // too short
          },
        },
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet3.body.errorMessages).toHaveLength(1);

    // check что никто не создался
    const videoListResponse = await request(app).get('/api/videos');
    expect(videoListResponse.body.data).toHaveLength(0);
  });

  it('should not update video when incorrect data passed; PUT /api/videos/:id', async () => {
    const createdVideo = await request(app)
      .post('/api/videos')
      .send({ data: correctTestVideoData })
      .expect(HttpStatus.Created);

    const invalidDataSet1 = await request(app)
      .put(`/api/videos/${createdVideo.body.id}`)
      .send({
        data: {
          ...correctTestVideoData,
          attributes: {
            ...correctTestVideoData.attributes,
            title: '   ',
            author: '',
          },
        },
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet1.body.errorMessages).toHaveLength(2);

    const invalidDataSet2 = await request(app)
      .put(`/api/videos/${createdVideo.body.id}`)
      .send({
        data: {
          ...correctTestVideoData,
          attributes: {
            ...correctTestVideoData.attributes,
            availableResolutions: ['INVALID' as Resolutions],
          },
        },
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet2.body.errorMessages).toHaveLength(1);

    const invalidDataSet3 = await request(app)
      .put(`/api/videos/${createdVideo.body.id}`)
      .send({
        data: {
          ...correctTestVideoData,
          attributes: {
            ...correctTestVideoData.attributes,
            title: 'A', // too short
          },
        },
      })
      .expect(HttpStatus.BadRequest);

    expect(invalidDataSet3.body.errorMessages).toHaveLength(1);

    const videoResponse = await request(app).get(
      `/api/videos/${createdVideo.body.id}`,
    );

    expect(videoResponse.body).toMatchObject({
      ...correctTestVideoData,
      id: createdVideo.body.id,
    });
  });

  it('should not update video when incorrect resolutions passed; PUT /api/videos/:id', async () => {
    const {
      body: { id: createdVideoId },
    } = await request(app)
      .post('/api/videos')
      .send({ data: correctTestVideoData })
      .expect(HttpStatus.Created);

    await request(app)
      .put(`/api/videos/${createdVideoId}`)
      .send({
        data: {
          ...correctTestVideoData,
          attributes: {
            ...correctTestVideoData.attributes,
            availableResolutions: [Resolutions.P144, 'INVALID' as Resolutions],
          },
        },
      })
      .expect(HttpStatus.BadRequest);

    const videoResponse = await request(app).get(
      `/api/videos/${createdVideoId}`,
    );

    expect(videoResponse.body).toMatchObject({
      ...correctTestVideoData,
      id: createdVideoId.body.id,
      createdAt: expect.any(String),
      publicationDate: expect.any(String),
    });
  });
});
