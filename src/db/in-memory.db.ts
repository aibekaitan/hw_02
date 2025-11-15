import { Driver, VehicleFeature } from '../drivers/types/driver';
import { Video, Resolutions } from '../videos/types/video';
import { Blog } from '../blogs/types/blog';
import { Post } from '../posts/types/post';

export const db = {
  drivers: <Driver[]>[
    {
      id: 1,
      name: 'Tom Rider',
      phoneNumber: '123-456-7890',
      email: 'tom.rider@example.com',
      vehicleMake: 'BMW',
      vehicleModel: 'Cabrio',
      vehicleYear: 2020,
      vehicleLicensePlate: 'ABC-32145',
      vehicleDescription: null,
      vehicleFeatures: [],
      createdAt: new Date(),
    },
    {
      id: 2,
      name: 'Tom Rider',
      phoneNumber: '123-456-7890',
      email: 'tom.rider@example.com',
      vehicleMake: 'Ford',
      vehicleModel: 'Mustang Shelby GT',
      vehicleYear: 2019,
      vehicleLicensePlate: 'XYZ-21342',
      vehicleDescription: null,
      vehicleFeatures: [VehicleFeature.WiFi, VehicleFeature.ChildSeat],
      createdAt: new Date(),
    },
    {
      id: 3,
      name: 'Tom Rider',
      phoneNumber: '123-456-7890',
      email: 'tom.rider@example.com',
      vehicleMake: 'BMW',
      vehicleModel: '18',
      vehicleYear: 2021,
      vehicleLicensePlate: 'LMN-31234',
      vehicleDescription: null,
      vehicleFeatures: [],
      createdAt: new Date(),
    },
  ],
  videos: <Video[]>[
    {
      id: 1,
      title: 'My First Video',
      author: 'Tom Rider',
      availableResolutions: ['P144', 'P360'],
      canBeDownloaded: true,
      minAgeRestriction: null,
      publicationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Second Video',
      author: 'Tom Rider',
      availableResolutions: ['P720', 'P1080'],
      canBeDownloaded: false,
      minAgeRestriction: 18,
      publicationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ],
  blogs: <Blog[]>[
    {
      id: '1',
      name: 'First Blog',
      description: 'Description 1',
      websiteUrl: 'https://example.com',
    },
    {
      id: '2',
      name: 'Second Blog',
      description: 'Description 2',
      websiteUrl: 'https://example2.com',
    },
  ],
  posts: <Post[]>[
    {
      id: '1',
      title: 'Introduction to TypeScript',
      shortDescription: 'Learn the basics of TypeScript and its key features',
      content:
        'TypeScript is a strongly typed programming language that builds on JavaScript...',
      blogId: 'blog-1',
      blogName: 'Tech Insights',
    },
    {
      id: '2',
      title: 'Traditional Kazakh Beshbarmak',
      shortDescription: 'Step-by-step recipe for making authentic Beshbarmak',
      content:
        'Beshbarmak is a traditional Kazakh dish made with boiled meat and noodles...',
      blogId: 'blog-2',
      blogName: 'Culinary Journey',
    },
  ],
};
