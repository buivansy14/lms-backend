import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import errorMiddlware from './src/middlewares/error.middleware.js';
import courseRoutes from './src/routes/course.Routes.js';
import miscRoutes from './src/routes/miscellanous.routes.js';
import userRoutes from './src/routes/user.Routes.js';
import transactionRoutes from './src/routes/transaction.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import userCourseProgressRoutes from './src/routes/userCourseProgress.route.js';
import paymentRoutes from './src/routes/payment.routes.js';

const allowedOrigins = [
  'https://hoclaptrinh.tokyo',
  'https://www.hoclaptrinh.tokyo',
];

config();

const app = express();

app.use(express.json({ limit: '99mb' }));

app.use(express.urlencoded({ limit: '99mb', extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(morgan('dev'));

app.use('/ping', function (_req, res) {
  res.send('Pongs');
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/transaction', transactionRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/userProgress', userCourseProgressRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1', miscRoutes);
app.all('*', (_req, res) => {
  res.status(404).send('OOPS!!  404 page not found ');
});
app.use(errorMiddlware);

export default app;
