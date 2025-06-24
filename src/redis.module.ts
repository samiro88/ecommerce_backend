// import { Module } from '@nestjs/common';
// import * as redis from 'redis';

// @Module({
//   providers: [
//     {
//       provide: 'REDIS_CLIENT',
//       useFactory: () => {
//         return redis.createClient({
//           socket: {
//             host: 'localhost',
//             port: 6379,
//           },
//         });
//       },
//     },
//   ],
//   exports: ['REDIS_CLIENT'],
// })
// export class RedisModule {}

// ==========================
// RedisModule is commented out temporarily.
// TODO: Uncomment when Redis is configured in the production environment.
// ==========================
