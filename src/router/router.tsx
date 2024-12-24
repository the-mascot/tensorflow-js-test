import { createBrowserRouter } from 'react-router-dom';
import Mobilenet from '../pages/mobilenet';
import Layout from 'src/components/Layout';
import SuperviserdLearning from 'src/pages/superviserd-learning';

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
    path: '/lemonade',
    element: (
      <Layout>
        <SuperviserdLearning />
      </Layout>
    )
  }
]);
