// cpu 사용
import '@tensorflow/tfjs-backend-cpu';
// gpu 사용
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis'
import { Typography } from '@mui/material';
import { useEffect } from 'react';
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

    // tidy 함수는 텐서 생성과 연산 후, 자동으로 메모리를 해제해주는 함수입니다.
    // 이 블록 내부에서 생성된 텐서들은 블록이 끝날때 자동으로 메모리에서 해제 됩니다.
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

      // min-max scaling 정규화 식
      // normalize = x - x_min / x_max - x_min
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

  function testModel(model: Sequential, inputData: FilteredCarDataType[], normalizationData: any) {
    const {inputMax, inputMin, labelMin, labelMax} = normalizationData;

    // Generate predictions for a uniform range of numbers between 0 and 1;
    // We un-normalize the data by doing the inverse of the min-max scaling
    // that we did earlier.
    // xs : 100개 임의 예측 데이터, preds: 예측 결과 값
    const [xs, preds] = tf.tidy(() => {

      // 0 - 1 사이의 균등하게 분포된 100개의 데이터 생성
      const xs = tf.linspace(0, 1, 100);
      // .predict 예측함수, reshape로 xs 데이터 차원을 [100, 1] 로 변환
      const preds: any = model.predict(xs.reshape([100, 1]));

      // 데이터 역정규화
      const unNormXs = xs
        .mul(inputMax.sub(inputMin))
        .add(inputMin);

      const unNormPreds = preds
        .mul(labelMax.sub(labelMin))
        .add(labelMin);

      // dataSync 로 자바스크립트배열로 변환
      return [unNormXs.dataSync(), unNormPreds.dataSync()];
    });

    const predictedPoints = Array.from(xs).map((val, i) => {
      return {x: val, y: preds[i]}
    });

    const originalPoints = inputData.map(d => ({
      x: d.horsepower, y: d.mpg,
    }));

    tfvis.render.scatterplot(
      {name: 'Model Predictions vs Original Data'},
      {values: [originalPoints, predictedPoints], series: ['original', 'predicted']},
      {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 300
      }
    );
  }

  /**
   * 2D 데이터로 예측하기
   * */
  const training2DModel = async () => {
    // 학습 데이터 fetch
    const data = await getData();
    console.log('data: ', data);

    // 그래프 X 축, Y 축 데이터 set
    const values = data.map(d => ({
      x: d.horsepower,
      y: d.mpg
    }));

    // 학습 데이터 그래프 show
    tfvis.render.scatterplot(
      {name: 'Horsepower v MPG'},
      {values},
      {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 300
      }
    );

    // model 생성
    const model:Sequential = createModel();
    tfvis.show.modelSummary({ name: 'Model Summary' }, model);

    // 데이터 변환
    const tensorData = convertToTensor(data);
    const { inputs, labels } = tensorData;
    await trainModel(model, inputs, labels);
    testModel(model, data, tensorData);
    console.log('Done Training');
  }

  useEffect(() => {
    training2DModel();
  }, []);

  return (
    <>
      <Typography variant="body2">2D 데이터에서 예측값 내기</Typography>
    </>
  );
}
