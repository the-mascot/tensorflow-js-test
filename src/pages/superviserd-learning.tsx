import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs';
import { Typography } from '@mui/material';
import { useEffect } from 'react';
import * as tfvis from '@tensorflow/tfjs-vis'

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
  const createModel = () => {
    // 순차 모델 인스턴스화
    const model = tf.sequential();
    // Add a single input layer
    model.add(tf.layers.dense({ inputShape: [1], units: 1, useBias: true }));
    // Add an output layer
    model.add(tf.layers.dense({ units: 1, useBias: true }));

    return model;
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
    const model = createModel();
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
    // More code will be added below
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
      // Step 1. Shuffle the data
      /**
       * 여기서는 학습 알고리즘에 제공할 예시의 순서를 무작위로 지정합니다.
       * 일반적으로 학습하는 동안 데이터 세트는 모델이 학습할 크기가 작은 하위 집합(배치라고 함)으로 분할되기 때문에 셔플이 중요합니다.
       * 셔플은 각 배치에 전체 데이터 분포의 데이터가 다양하게 포함되도록 하는 데 도움이 됩니다.
       * 데이터가 다양하게 포함되도록 하면 모델에 다음과 같은 이점이 있습니다.
       *
       * 제공된 데이터의 순서에만 의존하여 학습하지 않도록 합니다.
       * 하위 그룹의 구조에 민감해지지 않도록 합니다.
       * 예를 들어 학습의 전반부에만 높은 마력의 자동차가 있다면 나머지 데이터 세트에는 적용되지 않는 관계를 학습할 수 있습니다.
       * */
      tf.util.shuffle(data);

      // Step 2. Convert data to Tensor
      const inputs = data.map(d => d.horsepower)
      const labels = data.map(d => d.mpg);

      const inputTensor = tf. (inputs, [inputs.length, 1]);
      const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

      //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
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

  useEffect(() => {
    renderVis();
  }, []);

  return (
    <>
      <Typography variant="body2">HELLO</Typography>
    </>
  );
}
