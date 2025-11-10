import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { Resolutions } from '../../../src/videos/types/video';

describe('Video API', () => {
  const app = express();
  setupApp(app);

  const testVideoData = {
    title: 'My First Video',
    author: 'John Doe',
    availableResolutions: [Resolutions.P144, Resolutions.P360],
  };

  const testUpdateVideoData = {
    title: 'Updated Video Title',
    author: 'Updated Author',
    availableResolutions: [Resolutions.P144, Resolutions.P720],
    canBeDownloaded: true,
    minAgeRestriction: 16,
    publicationDate: new Date('2025-11-09T00:00:00Z').toISOString(),
  };

  beforeAll(async () => {
    await request(app).delete('/testing/all-data').expect(204);
  });

  it('should create video; POST /videos', async () => {
    await request(app).post('/videos').send(testVideoData).expect(201);
  });

  it('should return videos list; GET /videos', async () => {
    await request(app)
      .post('/videos')
      .send({ ...testVideoData, title: 'Video 1' })
      .expect(201);

    await request(app)
      .post('/videos')
      .send({ ...testVideoData, title: 'Video 2' })
      .expect(201);

    const response = await request(app).get('/videos').expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
  });

  it('should return video by id; GET /videos/:id', async () => {
    const createResponse = await request(app)
      .post('/videos')
      .send({ ...testVideoData, title: 'Video 3' })
      .expect(201);

    const getResponse = await request(app)
      .get(`/videos/${createResponse.body.id}`)
      .expect(200);

    expect(getResponse.body.title).toBe('Video 3');
    expect(getResponse.body.canBeDownloaded).toBe(false);
  });

  it('should update video; PUT /videos/:id', async () => {
    const createResponse = await request(app)
      .post('/videos')
      .send(testVideoData)
      .expect(201);

    await request(app)
      .put(`/videos/${createResponse.body.id}`)
      .send(testUpdateVideoData)
      .expect(204);

    const getResponse = await request(app)
      .get(`/videos/${createResponse.body.id}`)
      .expect(200);

    expect(getResponse.body.title).toBe('Updated Video Title');
    expect(getResponse.body.minAgeRestriction).toBe(16);
  });

  it('DELETE /videos/:id and check after NOT FOUND', async () => {
    const createResponse = await request(app)
      .post('/videos')
      .send({ ...testVideoData, title: 'Video 4' })
      .expect(201);

    await request(app).delete(`/videos/${createResponse.body.id}`).expect(204);

    await request(app).get(`/videos/${createResponse.body.id}`).expect(404);
  });
});
