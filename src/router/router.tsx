import { createBrowserRouter } from 'react-router-dom';
import Mobilenet from '../pages/mobilenet';
import Layout from 'src/components/Layout';
import SuperviserdLearning from 'src/pages/superviserd-learning';
import CnnImageTraining from 'src/pages/cnn-image-training';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Mobilenet />
      </Layout>
    )
  },
  {
    path: '/supervised',
    element: (
      <Layout>
        <SuperviserdLearning />
      </Layout>
    )
  },
  {
    path: '/cnn/image',
    element: (
      <Layout>
        <CnnImageTraining />
      </Layout>
    )
  }
]);
