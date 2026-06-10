import {createClient} from '@sanity/client';

export const sanityClient = createClient({
  projectId: '3c8olga9',
  dataset: 'dev',
  apiVersion: '2023-10-01',
  useCdn: true,
});
