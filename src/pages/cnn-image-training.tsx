import { Box, CircularProgress, Typography } from '@mui/material';
import { run } from 'src/scripts/scripts';
import { useEffect, useState } from 'react';

export default function CnnImageTraining() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    run()
    setIsLoading(false);
  }, []);

  return (
    <>
      {isLoading === true && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center', // 수평 가운데 정렬
          alignItems: 'center', // 수직 가운데 정렬
          position: 'fixed', // 화면 고정
          top: 0,
          left: 0,
          width: '100%', // 화면 전체 너비
          height: '100vh', // 화면 전체 높이
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 어두운 배경
          zIndex: 1300, // MUI의 기본 모달 zIndex보다 높은 값 설정
        }}>
          <CircularProgress color="warning" />
        </Box>
      )}
      <Typography variant="body2">CNN을 활용한 필기 입력 숫자 인식</Typography>
    </>
  );
}
