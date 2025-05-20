import {createClient} from '@sanity/client';

export const sanityClient = createClient({
  projectId: '3c8olga9',
  dataset: 'production',
  apiVersion: '2023-10-01',
  useCdn: true,
});
