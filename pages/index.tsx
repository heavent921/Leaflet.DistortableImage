import Head from 'next/head';
import DistortableMap from '../components/DistortableMap';

export default function Home() {
  return (
    <>
      <Head>
        <title>Distortable Image Map Demo</title>
        <meta name="description" content="Interactive map with distortable image overlays" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ height: '100vh', width: '100vw', position: 'relative' }}>
        <div className="instructions">
          <p>Drag & drop an image file onto the map or use the file input in top-left corner.</p>
          <p>Use corner handles to distort, rotate, and scale the image.</p>
        </div>
        <DistortableMap />
      </main>
    </>
  );
}