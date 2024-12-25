import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs';
import { Typography } from '@mui/material';
import { useEffect } from 'react';
import * as tfvis from '@tensorflow/tfjs-vis'
import { ModelFitArgs, Rank, Sequential, Tensor } from '@tensorflow/tfjs';

type CarDataType = {
  Name: string,
  Miles_per_Gallon:  number,
  Cylinders: number,
  Displacement: number,
  Horsepower: number,
  Weight_in_lbs: number,
  Acceleration: number,
  Year: string,
  Origin: string
}

type FilteredCarDataType = {
  mpg: number,
  horsepower: number
}

type TrainingDataType = {
  inputs: number[],
  labels: number[],
  inputMax: number,
  inputMin: number,
  labelMax: number,
  labelMin: number
}

export default function SuperviserdLearning() {
  /**
   * google api 에서 테스트 데이터 fetch
   */
  async function getData() {
    const carsDataResponse = await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json');
    const carsData: CarDataType[] = await carsDataResponse.json();
    console.log('carsData: ', carsData);

    // json 데이터에서 연비, 마력 만 뽑고, 연비, 마력이 없는 데이터 filtering
    const cleaned = carsData.map((car) => ({
      mpg: car.Miles_per_Gallon, // 연비 (겔런기준)
      horsepower: car.Horsepower, // 마력
    }))
      .filter((car) => (car.mpg != null && car.horsepower != null));

    return cleaned as FilteredCarDataType[];
  }

  /**
   * 모델 생성
   * */
  const createModel = (): Sequential => {
    // 순차 모델 인스턴스화
    const model = tf.sequential();
    // Add a single input layer
    model.add(tf.layers.dense({ inputShape: [1], units: 1, useBias: true }));
    // Add an output layer
    model.add(tf.layers.dense({ units: 1, useBias: true }));

    return model;
  }

  /**
   * Convert the input data to tensors that we can use for machine
   * learning. We will also do the important best practices of _shuffling_
   * the data and _normalizing_ the data
   * MPG on the y-axis.
   */
  function convertToTensor(data: FilteredCarDataType[]) {
    // Wrapping these calculations in a tidy will dispose any
    // intermediate tensors.

    return tf.tidy(() => {
      // Step 1. 데이터 셔플링
      tf.util.shuffle(data);

      // Step 2. 데이터 텐서로 변환
      const inputs = data.map(d => d.horsepower)
      const labels = data.map(d => d.mpg);

      const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
      const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

      //Step 3. 테이터 정규화
      // min-max scaling 을 사용하여 데이터 숫자 범위를 0 - 1 사이로 조정함
      const inputMax = inputTensor.max();
      const inputMin = inputTensor.min();
      const labelMax = labelTensor.max();
      const labelMin = labelTensor.min();

      const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
      const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

      return {
        inputs: normalizedInputs,
        labels: normalizedLabels,
        // Return the min/max bounds so we can use them later.
        inputMax,
        inputMin,
        labelMax,
        labelMin,
      }
    });
  }

  const trainModel = async (model: Sequential, inputs: Tensor<Rank>, labels: Tensor<Rank>) => {
    // Prepare the model for training.
    model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ['mse']
    });

    const batchSize = 32;
    const epochs = 50;
    const args: any = {
      batchSize,
      epochs,
      shuffle: true,
      callbacks: tfvis.show.fitCallbacks(
        { name: 'Training Performance' },
        ['loss', 'mse'],
        { height: 200, callbacks: ['onEpochEnd'] }
      )
    };

    return await model.fit(inputs, labels, args);
  }

  /**
   * tfjs-vis 라이브러리로 데이터 시각화
   * */
  const renderVis = async () => {
    const data = await getData();
    console.log('data: ', data);
    const values = data.map(d => ({
      x: d.horsepower,
      y: d.mpg,
    }));

    // model 생성
    const model:Sequential = createModel();

    tfvis.show.modelSummary({ name: 'Model Summary' }, model);
    tfvis.render.scatterplot(
      {name: 'Horsepower v MPG'},
      {values},
      {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 300
      }
    );
    // 데이터 변환
    const tensorData = convertToTensor(data);
    const { inputs, labels } = tensorData;
    trainModel(model, inputs, labels);
    console.log('Done Training');
  }

  useEffect(() => {
    renderVis();
  }, []);

  return (
    <>
      <Typography variant="body2">HELLO</Typography>
    </>
  );
}
