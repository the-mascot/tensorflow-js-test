import { useEffect, useRef } from 'react';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as mobilenet from '@tensorflow-models/mobilenet';

export default function Mobilenet() {
  const loadModel = async () => {
    const version = 2;
    const alpha = 0.5;
    const img:HTMLElement | null = document.getElementById('img');
    // Load the model.
    const model = await mobilenet.load({ version, alpha });
    // Classify the image.
    const predictions = await model.classify(img as HTMLImageElement);
    console.log('Predictions: ');
    console.log(predictions);
  };

  useEffect(() => {
    loadModel();
  }, []);


  return (
    <>
      <img id="img" alt="고영희씨" src="/images/cat.jpg" />
    </>
  )
}
